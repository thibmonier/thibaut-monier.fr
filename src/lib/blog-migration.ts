import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import { slugify } from './blog.ts';

// Migration des articles d'Agentic Agency (US-009, T-009-08/09) : transformations pures du Markdown source
// vers le format de la collection `blog`, plus `migrateFiles` (seule fonction qui touche au disque).
// Idempotence : un second passage sur un article migré ne change rien. La source n'est jamais écrite.

export const ORIGINAL_ORIGIN = 'https://agentic-agency.fr';
const ASSETS_PREFIX = '../../../assets/blog/';
const SOURCE_ARTICLES = 'src/content/blog';
const SOURCE_IMAGES = 'public/blog';
const DEST_ARTICLES = 'src/content/blog/fr';
const DEST_IMAGES = 'src/assets/blog';

/** Pages de l'ancien site non migrées (E10) : liens réécrits vers l'URL absolue de l'ancien site. */
const UNMIGRATED_PREFIXES = ['/services', '/methode', '/boite-a-outils'];
const RESERVED_BLOG_SEGMENTS = new Set(['page', 'categorie', 'tag', 'serie']);

/** Synonymes normalisés avant migration (T-011-01, décision du 2026-10-15). */
export const TAG_ALIASES: Record<string, string> = {
  Méthodologie: 'Méthode',
  'Management de projet': 'Gestion de projet',
  Rentabilité: 'ROI',
};

/** Ordre de lecture des 6 séries (T-011-01, E6) : déduit des pieds d'article « Prochain article : … ». */
export const SERIES_ORDER: Record<string, { series: string; order: number }> = (() => {
  const series: Record<string, string[]> = {
    "L'agence digitale augmentée": [
      'le-vrai-developpeur-augmente-c-est-le-chef',
      'la-spec-est-le-nouveau-code',
      'le-junior-n-est-pas-le-probleme-le',
      'agence-digitale-le-binome-augmente-remplace-t-il',
      'ce-que-l-ia-ne-fera-jamais-a-votre-place',
    ],
    "Les métiers à l'ère agentic": [
      'amorcer-un-projet-agentic-coding-le-role-amoa',
      'chiffrer-et-rassurer-autour-de-l-agentic-coding',
      'piloter-un-projet-agentic-les-nouveaux-indicateurs',
      'mesurer-le-gain-reel-de-l-agentic-coding',
      'securite-agentic-rassurer-le-client-et-prouver-la-qualite',
    ],
    "Transformer l'agence": [
      'comment-mesurer-le-roi-reel-d-un-workflow',
      'recruter-et-evaluer-un-developpeur-a-l-ere-de-l-ia',
      'la-gestion-de-projet-ia-est-une-discipline',
      'ce-que-le-client-doit-savoir-sur-l',
      'esn-agence-freelance-augmente-qui-survit-a-l-ia',
    ],
    'La boîte à outils agentic': [
      'outils-agentic-engineering-qui-meritent-un-essai',
      'reduire-la-facture-token-caveman-codegraph',
      'donner-a-lire-a-un-agent-markitdown-et-mq',
      'sortir-du-rendu-generique-hallmark-designmd-modern-web-guidance',
    ],
    'Les nouveaux risques projet': [
      'la-dette-de-contexte-le-nouveau-risque-cache',
      'shadow-it-agentique-perdre-la-trace-de-ses-agents',
      'le-cout-cache-de-la-supervision-agentique',
      'l-ia-vous-accelere-t-elle-ou-vous-precipite-t-elle',
    ],
    'Software-Driven Development': [
      'cycle-en-v-agile-sdd-comparaison-timelines',
      'projet-classique-vs-sdd-ia-quelles-equipes-humaines',
      'du-vibe-coding-a-l-agentic-engineering',
    ],
  };
  return Object.fromEntries(
    Object.entries(series).flatMap(([name, slugs]) =>
      slugs.map((slug, index) => [slug, { series: name, order: index + 1 }] as const),
    ),
  );
})();

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function splitArticle(source: string): { header: string; body: string } {
  const match = FRONT_MATTER.exec(source);
  if (!match) throw new Error('Frontmatter absent');
  return { header: match[1] ?? '', body: match[2] ?? '' };
}

/** Une chaîne entre guillemets est ouverte quand sa valeur commence par `"` sans guillemet fermant. */
function opensQuote(line: string): boolean {
  const value = /^[A-Za-z][\w-]*:\s*(".*)$/.exec(line)?.[1];
  return value !== undefined && !/^".*[^\\]"\s*$|^""\s*$/.test(value);
}

/** (1) Titre ou description coupé sur deux lignes sans indentation : une seule ligne. */
export function unwrapFrontmatter(header: string): string {
  const out: string[] = [];
  let open = false;
  for (const line of header.split('\n')) {
    if (open) {
      out[out.length - 1] += ` ${line.trim()}`;
      open = opensQuote(out[out.length - 1] as string);
    } else {
      out.push(line);
      open = opensQuote(line);
    }
  }
  return out.join('\n');
}

/** (2) `/blog/x.webp` devient `../../../assets/blog/x.webp` (relatif à `src/content/blog/fr/`). */
export function relocateImage(header: string): string {
  return header.replace(
    /^(image:\s*)(["']?)\/blog\/([^"'\s]+)\2\s*$/m,
    (_, key: string, quote: string, file: string) =>
      `${key}${quote}${ASSETS_PREFIX}${file}${quote}`,
  );
}

/** (3) Origine de l'article : forme sans barre finale (E15), date d'origine = `pubDate`. */
export function addOrigin(header: string, slug: string): string {
  const pubDate = /^pubDate:\s*(\S+)\s*$/m.exec(header)?.[1];
  if (pubDate === undefined) throw new Error(`pubDate absent (article ${slug})`);
  const lines = [header];
  if (!/^originalUrl:/m.test(header)) lines.push(`originalUrl: ${ORIGINAL_ORIGIN}/blog/${slug}`);
  if (!/^originalPublishedAt:/m.test(header)) lines.push(`originalPublishedAt: ${pubDate}`);
  return lines.join('\n');
}

export function normalizeTags(header: string): string {
  return header.replace(/^tags:\s*(\[.*\])\s*$/m, (_, flow: string) => {
    const tags = (parse(flow) as string[]).map((tag) => TAG_ALIASES[tag] ?? tag);
    return `tags: [${[...new Set(tags)].map((tag) => JSON.stringify(tag)).join(', ')}]`;
  });
}

/** Ajoute `seriesOrder` après `series` pour les 26 articles en série ; vérifie le nom de la série. */
export function seriesOrderLine(header: string, slug: string): string {
  const expected = SERIES_ORDER[slug];
  if (expected === undefined || /^seriesOrder:/m.test(header)) return header;
  const line = /^series:\s*"?([^"\n]*)"?\s*$/m.exec(header);
  if (line?.[1] !== expected.series) {
    throw new Error(
      `Nom de série incohérent pour ${slug} : « ${line?.[1] ?? 'aucune'} » au lieu de « ${expected.series} »`,
    );
  }
  return header.replace(line[0], `${line[0]}\nseriesOrder: ${expected.order}`);
}

/** Ce qui reste à faire à la main après la migration (le script l'affiche, l'article n'est pas publiable tel quel). */
export function todoFor(header: string): string[] {
  let data: Record<string, unknown>;
  try {
    data = (parse(header) ?? {}) as Record<string, unknown>;
  } catch {
    return ['frontmatter illisible'];
  }
  const todo: string[] = [];
  const description = typeof data.description === 'string' ? data.description.length : 0;
  if (description < 50 || description > 160) {
    todo.push(
      `description : ${description} caractères (50 à 160 attendus), à réécrire sans tronquer`,
    );
  }
  const title = typeof data.title === 'string' ? data.title.length : 0;
  if (title > 60 && data.seoTitle === undefined) {
    todo.push(`seoTitle : titre de ${title} caractères, titre SEO de 20 à 60 à rédiger`);
  }
  if (data.image !== undefined && data.imageAlt === undefined) {
    todo.push('imageAlt : texte alternatif à rédiger en regardant l’image');
  }
  return todo;
}

type Chunk = { fence: boolean; text: string };

/** Découpe un corps Markdown en blocs de code (```/~~~) et en texte courant. */
function chunks(body: string): Chunk[] {
  const result: Chunk[] = [];
  let fence: string | null = null;
  for (const line of body.split('\n')) {
    const marker = /^\s*(```|~~~)/.exec(line)?.[1];
    const closes = fence !== null && marker === fence;
    const isFence = fence !== null || marker !== undefined;
    const last = result[result.length - 1];
    if (last && last.fence === isFence) last.text += `\n${line}`;
    else result.push({ fence: isFence, text: line });
    if (fence === null && marker !== undefined) fence = marker;
    else if (closes) fence = null;
  }
  return result;
}

/** Applique `transform` au texte courant, jamais aux blocs de code. */
function outsideFences(body: string, transform: (text: string) => string): string {
  return chunks(body)
    .map((chunk) => (chunk.fence ? chunk.text : transform(chunk.text)))
    .join('\n');
}

function rewriteTarget(target: string): string {
  const [path = '', ...rest] = target.split('#');
  const anchor = rest.length > 0 ? `#${rest.join('#')}` : '';
  const category = /^\/blog\/category\/([^/]+)\/?$/.exec(path)?.[1];
  if (category !== undefined) {
    return `/blog/categorie/${slugify(decodeURIComponent(category))}/${anchor}`;
  }
  const article = /^\/blog\/([a-z0-9-]+)$/.exec(path)?.[1];
  if (article !== undefined && !RESERVED_BLOG_SEGMENTS.has(article)) return `${path}/${anchor}`;
  if (UNMIGRATED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return `${ORIGINAL_ORIGIN}${target}`;
  }
  return target;
}

/** (4) Liens internes au format cible (barre finale, `/blog/categorie/…`), pages non migrées vers l'ancien site. */
export function rewriteLinks(body: string): string {
  return outsideFences(body, (text) =>
    text.replace(/\]\((\/[^)\s]*)\)/g, (_, target: string) => `](${rewriteTarget(target)})`),
  );
}

const OLD_THEME_FRAME =
  '<div class="not-prose my-8 rounded-xl overflow-hidden border border-border bg-card p-4">';
const SVG_DECLARATIONS: Record<string, (value: string) => string> = {
  width: (value) => (value === '100%' ? 'class:w-full' : ''),
  height: (value) => (value === 'auto' ? 'class:h-auto' : ''),
  'font-family': (value) => `attr:font-family="${value}"`,
};

function convertStyle(openTag: string): string {
  const style = /\sstyle="([^"]*)"/.exec(openTag);
  if (!style) return openTag;
  const classes: string[] = [];
  const attributes: string[] = [];
  for (const declaration of (style[1] ?? '').split(';').filter((item) => item.trim() !== '')) {
    const [property = '', ...rest] = declaration.split(':');
    const value = rest.join(':').trim();
    const converted = SVG_DECLARATIONS[property.trim()]?.(value);
    if (!converted) {
      throw new Error(`Déclaration CSS inconnue dans un SVG : ${property.trim()}:${value}`);
    }
    const [kind, payload = ''] = converted.split(/:(.*)/s);
    (kind === 'class' ? classes : attributes).push(payload);
  }
  const extra = [classes.length > 0 ? `class="${classes.join(' ')}"` : '', ...attributes];
  return openTag.replace(style[0], ` ${extra.filter(Boolean).join(' ')}`);
}

function convertOneSvg(svg: string): string {
  const open = /^<svg\b[^>]*>/.exec(svg)?.[0] as string;
  let tag = convertStyle(open);
  if (!/\srole=/.test(tag)) tag = tag.replace(/>$/, ' role="img">');
  let inner = svg.slice(open.length);
  if (!/<title\b/.test(inner)) {
    const caption = /<text\b[^>]*>([^<]+)<\/text>/.exec(inner)?.[1]?.trim();
    if (!caption) throw new Error('SVG sans titre : ni <title> ni texte pour en tirer un');
    inner = `<title>${caption}</title>${inner}`;
  }
  const converted = `${tag}${inner}`;
  if (/\sstyle=/.test(converted)) throw new Error('Attribut style restant dans un SVG');
  return converted;
}

/** (5) SVG sans `style` en ligne (CSP, E9), nommé et décrit ; conteneur de l'ancien thème remplacé. */
export function convertSvg(body: string): string {
  return outsideFences(body, (text) =>
    text
      .replaceAll(OLD_THEME_FRAME, '<div class="diagram-frame">')
      .replace(/<svg\b[\s\S]*?<\/svg>/g, convertOneSvg),
  );
}

const BIO_SENTENCE =
  "Thibaut est Operations Director avec 25 ans d'expérience dont 10 ans d'expertise Symfony.";

/** (6) Pied biographique retiré (E11) ; le reste du pied (« Prochain article… ») est conservé. */
export function removeBioFooter(body: string): string {
  const out: string[] = [];
  for (const line of body.split('\n')) {
    const match = /^_(.*)_\s*$/.exec(line);
    const inner = match?.[1];
    if (inner === undefined || !inner.startsWith(BIO_SENTENCE)) {
      out.push(line);
      continue;
    }
    const rest = inner.slice(BIO_SENTENCE.length).trim();
    if (rest !== '') out.push(`_${rest}_`);
    else if (out[out.length - 1] === '') out.pop();
  }
  return out.join('\n');
}

export interface Migration {
  content: string;
  /** Fichiers image référencés (sans dossier). */
  images: string[];
  changes: string[];
  todo: string[];
}

export function migrateArticle(source: string, slug: string): Migration {
  const { header: original, body: originalBody } = splitArticle(source);
  const steps: [string, (header: string) => string][] = [
    ['titre et description sur une ligne', unwrapFrontmatter],
    ['image déplacée vers src/assets/blog', relocateImage],
    ["origine de l'article ajoutée", (header) => addOrigin(header, slug)],
    ['tags normalisés', normalizeTags],
    ['ordre de série ajouté', (header) => seriesOrderLine(header, slug)],
  ];
  const bodySteps: [string, (body: string) => string][] = [
    ['pied biographique retiré', removeBioFooter],
    ['liens réécrits', rewriteLinks],
    ['SVG converti (sans style en ligne)', convertSvg],
  ];
  const changes: string[] = [];
  let header = original;
  for (const [label, step] of steps) {
    const next = step(header);
    if (next !== header) changes.push(label);
    header = next;
  }
  let body = originalBody;
  for (const [label, step] of bodySteps) {
    const next = step(body);
    if (next !== body) changes.push(label);
    body = next;
  }
  const image = /^image:\s*["']?(?:\/blog\/|\.\.\/\.\.\/\.\.\/assets\/blog\/)([^"'\s]+)/m.exec(
    original,
  )?.[1];
  return {
    content: `---\n${header}\n---\n${body}`,
    images: image === undefined ? [] : [image],
    changes,
    todo: todoFor(header),
  };
}

export interface MigrateOptions {
  /** Racine du dépôt source (contient `src/content/blog/` et `public/blog/`), lue seulement. */
  sourceDir: string;
  /** Racine de ce dépôt. */
  root: string;
  slugs?: string[];
  /** Réécrit un article déjà migré (efface les relectures : à éviter). */
  force?: boolean;
}

export interface MigrationReport extends Migration {
  slug: string;
  status: 'migré' | 'ignoré';
}

async function exists(path: string): Promise<boolean> {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

export async function migrateFiles({
  sourceDir,
  root,
  slugs,
  force = false,
}: MigrateOptions): Promise<MigrationReport[]> {
  const available = (await readdir(join(sourceDir, SOURCE_ARTICLES)))
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.slice(0, -'.md'.length))
    .sort();
  const wanted = slugs ?? available;
  for (const slug of wanted) {
    if (!available.includes(slug)) throw new Error(`Article introuvable dans la source : ${slug}`);
  }
  const reports: MigrationReport[] = [];
  for (const slug of wanted) {
    const target = join(root, DEST_ARTICLES, `${slug}.md`);
    const source = await readFile(join(sourceDir, SOURCE_ARTICLES, `${slug}.md`), 'utf8');
    const migration = migrateArticle(source, slug);
    if (!force && (await exists(target))) {
      reports.push({ ...migration, slug, status: 'ignoré' });
      continue;
    }
    for (const image of migration.images) {
      const from = join(sourceDir, SOURCE_IMAGES, image);
      if (!(await exists(from))) {
        throw new Error(`Image introuvable dans la source : ${from} (article ${slug})`);
      }
      await mkdir(join(root, DEST_IMAGES), { recursive: true });
      await copyFile(from, join(root, DEST_IMAGES, image));
    }
    await mkdir(join(root, DEST_ARTICLES), { recursive: true });
    await writeFile(target, migration.content, 'utf8');
    reports.push({ ...migration, slug, status: 'migré' });
  }
  return reports;
}
