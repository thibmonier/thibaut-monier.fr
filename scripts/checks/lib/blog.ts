import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, posix, relative, sep } from 'node:path';
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { createBlogSchema } from '../../../src/content/schemas/blog.ts';
import { isPublished } from '../../../src/lib/blog.ts';
import { detectPii, formatPiiError } from '../../../src/lib/privacy.ts';
import { walk } from './fs.ts';

// Contrôle de contenu du blog (US-009, T-009-10/11) : avant `astro build`, donc sans `astro:content`.
// Le décompte est la source de vérité unique de content-model.md (V8).
export const EXPECTED_ARTICLES = 28;
export const MAX_IMAGE_BYTES = 250 * 1024;

const ARTICLES_DIR = 'src/content/blog/fr';
const COLLECTION_READER = 'src/lib/blog-source.ts';
const FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx?$/;
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const READER_CALL = /getCollection\(\s*['"]blog['"]/;
const FORBIDDEN_MENTIONS = [{ pattern: /Operations Director/, label: 'Operations Director' }];
const schema = createBlogSchema(z.string());

export interface BlogOptions {
  expected?: number;
  now?: Date;
  /** Exige que tous les articles publiés soient validés par le PO (`REQUIRE_VALIDATED_CONTENT=1`, E22). */
  requireValidated?: boolean;
}

export interface BlogReport {
  errors: string[];
  /** Articles exclus du décompte (brouillon, date future) : signalés, pas bloquants. */
  skipped: string[];
  validated: number;
  total: number;
}

/** Identifiants des chunks d'un fichier RIFF (WebP) ; vide si ce n'en est pas un. */
export function riffChunks(data: Buffer): string[] {
  if (data.length < 12 || data.toString('ascii', 0, 4) !== 'RIFF') return [];
  const ids: string[] = [];
  let offset = 12;
  while (offset + 8 <= data.length) {
    ids.push(data.toString('ascii', offset, offset + 4));
    const size = data.readUInt32LE(offset + 4);
    offset += 8 + size + (size % 2);
  }
  return ids;
}

/** Corps sans les blocs de code, ligne à ligne (les numéros ne sont pas utilisés). */
function proseLines(body: string): string[] {
  const lines: string[] = [];
  let fence: string | null = null;
  for (const line of body.split('\n')) {
    const marker = /^\s*(```|~~~)/.exec(line)?.[1];
    if (fence === null && marker !== undefined) fence = marker;
    else if (fence !== null && marker === fence) fence = null;
    else if (fence === null) lines.push(line);
  }
  return lines;
}

function bodyErrors(prefix: string, body: string): string[] {
  const errors: string[] = [];
  const lines = proseLines(body);
  const text = lines.join('\n');
  if (/\sstyle\s*=/.test(text))
    errors.push(`${prefix} : attribut style interdit dans le corps (CSP)`);
  if (/<script\b/i.test(text)) errors.push(`${prefix} : balise script interdite dans le corps`);

  let previous = 1;
  for (const line of lines) {
    const level = /^(#{1,6})\s/.exec(line)?.[1]?.length;
    if (level === undefined) continue;
    if (level === 1)
      errors.push(`${prefix} : titre de niveau 1 dans le corps (le h1 est le titre)`);
    else if (level > previous + 1) {
      errors.push(`${prefix} : saut de niveau de titre (h${previous} vers h${level})`);
    }
    previous = level;
  }

  for (const match of text.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const path = (match[1] as string).split(/[#?]/)[0] as string;
    if (/^\/blog\/(?:category|tags)(?:\/|$)/.test(path)) {
      errors.push(`${prefix} : lien interne à l’ancien format : ${path}`);
    } else if (!path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) {
      errors.push(`${prefix} : lien interne sans barre finale : ${path}`);
    }
  }
  return errors;
}

async function imageErrors(root: string, images: Map<string, string>): Promise<string[]> {
  const errors: string[] = [];
  for (const [path, slug] of [...images].sort()) {
    let data: Buffer;
    try {
      data = await readFile(join(root, path));
    } catch {
      errors.push(`Image introuvable : ${path} (article ${slug})`);
      continue;
    }
    if (data.length > MAX_IMAGE_BYTES) {
      const kilobytes = Math.ceil(data.length / 1024);
      errors.push(`Image trop lourde : ${path} (${kilobytes} Ko, 250 Ko maximum)`);
    }
    if (riffChunks(data).includes('EXIF')) errors.push(`Bloc EXIF dans l’image : ${path}`);
  }
  return errors;
}

/** Les seuls appels à `getCollection('blog')` autorisés sont ceux de `src/lib/blog-source.ts` (contrat C3). */
export async function findCollectionReaders(root: string): Promise<string[]> {
  const files = await walk(join(root, 'src'));
  const readers: string[] = [];
  for (const file of files.filter((name) => /\.(?:ts|js|mjs|astro|mdx?)$/.test(name))) {
    const path = relative(root, file).split(sep).join('/');
    if (path !== COLLECTION_READER && READER_CALL.test(await readFile(file, 'utf8'))) {
      readers.push(path);
    }
  }
  return readers.sort();
}

interface Parsed {
  slug: string;
  data?: z.infer<typeof schema>;
  published: boolean;
  image?: string;
}

/** Lit un article : erreurs de forme, de schéma et de corps ; `data` seulement si le frontmatter est valide. */
async function readArticle(
  root: string,
  name: string,
  now: Date,
): Promise<{ errors: string[]; skipped?: string; parsed: Parsed }> {
  const prefix = `blog/${name}`;
  const slug = name.replace(/\.mdx?$/, '');
  const errors: string[] = [];
  if (!FILE_NAME.test(name)) {
    errors.push(`${prefix} : nom de fichier invalide (slug en kebab-case attendu)`);
  }
  const raw = await readFile(join(root, ARTICLES_DIR, name), 'utf8');
  for (const type of detectPii(raw)) errors.push(formatPiiError(name, type));
  for (const { pattern, label } of FORBIDDEN_MENTIONS) {
    if (pattern.test(raw)) errors.push(`${prefix} : mention interdite « ${label} » (décision E11)`);
  }
  const invalid = (message: string) => ({
    errors: [...errors, message],
    parsed: { slug, published: true },
  });
  const match = FRONT_MATTER.exec(raw);
  if (!match) return invalid(`${prefix} : front matter YAML absent`);
  const [, header = '', body = ''] = match;
  let data: unknown;
  try {
    data = parse(header);
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return invalid(`${prefix} : YAML illisible (${reason})`);
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${prefix} : ${issue.path.join('.') || 'racine'} : ${issue.message}`,
    );
    return { errors: [...errors, ...issues], parsed: { slug, published: true } };
  }
  const published = isPublished(result.data, now);
  const image =
    typeof result.data.image === 'string'
      ? posix.normalize(posix.join(ARTICLES_DIR, result.data.image))
      : undefined;
  return {
    errors: [...errors, ...bodyErrors(prefix, body)],
    ...(published
      ? {}
      : {
          skipped: `Article ignoré (${result.data.draft ? 'brouillon' : 'date future'}) : ${slug}`,
        }),
    parsed: { slug, data: result.data, published, ...(image ? { image } : {}) },
  };
}

function duplicateErrors(parsed: Parsed[]): string[] {
  const errors: string[] = [];
  const bySlug = new Set<string>();
  const orders = new Map<string, string[]>();
  for (const { slug, data } of parsed) {
    if (bySlug.has(slug)) errors.push(`Slug en double : ${slug}`);
    bySlug.add(slug);
    if (data?.series === undefined || data.seriesOrder === undefined) continue;
    const key = `${data.series}\u0000${data.seriesOrder}`;
    orders.set(key, [...(orders.get(key) ?? []), slug]);
  }
  for (const [key, members] of orders) {
    const [series, order] = key.split('\u0000');
    if (members.length > 1) {
      errors.push(`Ordre de série en double : « ${series} » n° ${order} (${members.join(', ')})`);
    }
  }
  return errors;
}

export async function checkBlog(
  root: string,
  {
    expected = EXPECTED_ARTICLES,
    now = new Date(),
    requireValidated = process.env.REQUIRE_VALIDATED_CONTENT === '1',
  }: BlogOptions = {},
): Promise<BlogReport> {
  const names = (await readdir(join(root, ARTICLES_DIR)))
    .filter((name) => /\.mdx?$/.test(name))
    .sort();
  const articles = await Promise.all(names.map((name) => readArticle(root, name, now)));
  const parsed = articles.map((article) => article.parsed);
  const published = parsed.filter((article) => article.published);
  const errors = [
    ...articles.flatMap((article) => article.errors),
    ...(published.length === expected
      ? []
      : [`Blog : ${published.length} articles trouvés, ${expected} attendus`]),
    ...duplicateErrors(parsed),
    ...(await imageErrors(
      root,
      new Map(parsed.flatMap(({ slug, image }) => (image ? [[image, slug] as const] : []))),
    )),
    ...(await findCollectionReaders(root)).map(
      (file) =>
        `${file} : appel à getCollection('blog') interdit, passer par getPublishedPosts() de ${COLLECTION_READER}`,
    ),
  ];
  const validated = published.filter((article) => article.data?.validated === true);
  if (requireValidated && validated.length < published.length) {
    const missing = published.filter((article) => article.data?.validated !== true);
    errors.push(
      `Articles non validés par le PO : ${validated.length}/${published.length} validés (${missing.map((a) => a.slug).join(', ')})`,
    );
  }
  return {
    errors,
    skipped: articles.flatMap((article) => (article.skipped ? [article.skipped] : [])),
    validated: validated.length,
    total: published.length,
  };
}

export interface ArticleStatuses {
  /** Slugs des articles publiés à `now`, par ordre alphabétique. */
  published: string[];
  unpublished: { slug: string; reason: 'brouillon' | 'date future' }[];
}

/** Statut de publication relu dans les sources (sans schéma : le contrôle précède `astro build`). */
export async function articleStatuses(root: string, now = new Date()): Promise<ArticleStatuses> {
  const names = (await readdir(join(root, ARTICLES_DIR)))
    .filter((name) => /\.mdx?$/.test(name))
    .sort();
  const result: ArticleStatuses = { published: [], unpublished: [] };
  for (const name of names) {
    const slug = name.replace(/\.mdx?$/, '');
    const header =
      FRONT_MATTER.exec(await readFile(join(root, ARTICLES_DIR, name), 'utf8'))?.[1] ?? '';
    const data = (parse(header) ?? {}) as { draft?: boolean; pubDate?: string | Date };
    const draft = data.draft === true;
    const pubDate = new Date(String(data.pubDate));
    if (isPublished({ draft, pubDate }, now)) result.published.push(slug);
    else result.unpublished.push({ slug, reason: draft ? 'brouillon' : 'date future' });
  }
  return result;
}

async function readIfPresent(path: string): Promise<string> {
  return existsSync(path) ? readFile(path, 'utf8') : '';
}

/**
 * Publication programmée (US-009) : `dist/` ne contient ni page, ni entrée de sitemap, ni entrée de flux
 * pour un article non publié. Le redéploiement quotidien de 06:00 UTC publie les articles datés.
 */
export async function checkSchedule(
  root: string,
  distDir: string,
  now = new Date(),
): Promise<string[]> {
  const { unpublished } = await articleStatuses(root, now);
  const sitemaps = (await readdir(distDir)).filter((name) => /^sitemap.*\.xml$/.test(name)).sort();
  const sitemap = (
    await Promise.all(sitemaps.map((name) => readIfPresent(join(distDir, name))))
  ).join('\n');
  const feed = await readIfPresent(join(distDir, 'rss.xml'));
  const errors: string[] = [];
  for (const { slug, reason } of unpublished) {
    const path = `/blog/${slug}/`;
    if (existsSync(join(distDir, 'blog', slug, 'index.html'))) {
      errors.push(`Article non publié présent dans dist/ : ${slug} (${reason})`);
    }
    if (sitemap.includes(path))
      errors.push(`Article non publié dans le sitemap : ${slug} (${reason})`);
    if (feed.includes(path)) errors.push(`Article non publié dans le flux : ${slug} (${reason})`);
  }
  return errors;
}
