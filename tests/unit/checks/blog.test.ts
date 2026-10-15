import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  EXPECTED_ARTICLES,
  MAX_IMAGE_BYTES,
  checkBlog,
  findCollectionReaders,
  riffChunks,
} from '../../../scripts/checks/lib/blog.ts';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

/** WebP minimal : en-tête RIFF + chunk VP8X ; `extra` ajoute des chunks (EXIF) ; `padding` alourdit le fichier. */
function webp(extra: string[] = [], padding = 0): Buffer {
  const chunk = (id: string, size: number) => {
    const head = Buffer.alloc(8);
    head.write(id, 0, 'ascii');
    head.writeUInt32LE(size, 4);
    return Buffer.concat([head, Buffer.alloc(size + (size % 2))]);
  };
  const payload = Buffer.concat([
    Buffer.from('WEBP', 'ascii'),
    chunk('VP8X', 10),
    ...extra.map((id) => chunk(id, 4)),
    ...(padding > 0 ? [chunk('JUNK', padding)] : []),
  ]);
  const riff = Buffer.alloc(8);
  riff.write('RIFF', 0, 'ascii');
  riff.writeUInt32LE(payload.length, 4);
  return Buffer.concat([riff, payload]);
}

const DESCRIPTION =
  'Une description de plus de cinquante caractères, sans aucune troncature en fin de phrase.';

function article(
  overrides: Record<string, string | null> = {},
  body = '## Un titre\n\nTexte.\n',
): string {
  const fields: Record<string, string | null> = {
    title: '"Un titre court"',
    description: `"${DESCRIPTION}"`,
    pubDate: '2026-03-17',
    category: '"Méthode"',
    image: '"../../../assets/blog/a.webp"',
    imageAlt: '"Un texte alternatif"',
    ...overrides,
  };
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => `${key}: ${value}`);
  return ['---', ...lines, '---', '', body].join('\n');
}

interface Tree {
  articles?: Record<string, string>;
  images?: Record<string, Buffer>;
  sources?: Record<string, string>;
}

async function rootWith({ articles = {}, images = { 'a.webp': webp() }, sources = {} }: Tree) {
  const root = await mkdtemp(join(tmpdir(), 'blog-check-'));
  roots.push(root);
  const files: [string, string | Buffer][] = [
    ...Object.entries(articles).map(([name, text]): [string, string] => [
      `src/content/blog/fr/${name}`,
      text,
    ]),
    ...Object.entries(images).map(([name, data]): [string, Buffer] => [
      `src/assets/blog/${name}`,
      data,
    ]),
    ...Object.entries(sources).map(([name, text]): [string, string] => [name, text]),
  ];
  for (const [path, data] of files) {
    await mkdir(join(root, dirname(path)), { recursive: true });
    await writeFile(join(root, path), data);
  }
  return root;
}

const run = async (tree: Tree, options: Parameters<typeof checkBlog>[1] = { expected: 1 }) =>
  checkBlog(await rootWith(tree), options);

describe('décompte', () => {
  it('attend 28 articles par défaut', () => {
    expect(EXPECTED_ARTICLES).toBe(28);
  });

  it('échoue avec le message exact quand le décompte diffère', async () => {
    const { errors } = await run({ articles: { 'un.md': article() } }, { expected: 28 });
    expect(errors).toContain('Blog : 1 articles trouvés, 28 attendus');
  });

  it('ne compte ni les brouillons ni les articles futurs, mais les signale', async () => {
    const now = new Date('2026-06-01T00:00:00Z');
    const report = await run(
      {
        articles: {
          'un.md': article(),
          'brouillon.md': article({ draft: 'true' }),
          'futur.md': article({ pubDate: '2026-12-01' }),
        },
      },
      { expected: 1, now },
    );
    expect(report.errors).toEqual([]);
    expect(report.skipped).toEqual([
      'Article ignoré (brouillon) : brouillon',
      'Article ignoré (date future) : futur',
    ]);
  });
});

describe('frontmatter', () => {
  it('accepte un article valide', async () => {
    expect((await run({ articles: { 'un.md': article() } })).errors).toEqual([]);
  });

  it('cite le fichier et le champ d’une catégorie hors énumération', async () => {
    const { errors } = await run({ articles: { 'un.md': article({ category: '"Autre"' }) } });
    expect(errors.some((e) => e.startsWith('blog/un.md : category :'))).toBe(true);
  });

  it('exige un titre SEO quand le titre dépasse 60 caractères', async () => {
    const title = `"${'T'.repeat(61)}"`;
    const { errors } = await run({ articles: { 'un.md': article({ title }) } });
    expect(errors.join('\n')).toContain('blog/un.md : seoTitle : seoTitle requis');
  });

  it('refuse un frontmatter absent ou illisible', async () => {
    const absent = await run({ articles: { 'un.md': 'Texte seul' } });
    expect(absent.errors.join('\n')).toContain('blog/un.md : front matter YAML absent');
    const broken = await run({ articles: { 'un.md': '---\ntitle: "a\n---\n' } });
    expect(broken.errors.join('\n')).toContain('blog/un.md : YAML illisible');
  });

  it('refuse un nom de fichier qui n’est pas un slug', async () => {
    const { errors } = await run({ articles: { 'Un Titre.md': article() } });
    expect(errors.join('\n')).toContain('nom de fichier invalide');
  });

  it('refuse deux articles qui partagent le même slug (md et mdx)', async () => {
    const { errors } = await run(
      { articles: { 'un.md': article(), 'un.mdx': article() } },
      { expected: 2 },
    );
    expect(errors.join('\n')).toContain('Slug en double : un');
  });

  it('refuse un ordre de série en double', async () => {
    const series = { series: '"S"', seriesOrder: '1' };
    const { errors } = await run(
      { articles: { 'a.md': article(series), 'b.md': article(series) } },
      { expected: 2 },
    );
    expect(errors.join('\n')).toContain('Ordre de série en double : « S » n° 1 (a, b)');
  });

  it('refuse une mention interdite par la décision E11', async () => {
    const { errors } = await run({
      articles: { 'un.md': article({}, 'Je suis Operations Director dans une agence.\n') },
    });
    expect(errors.join('\n')).toContain('mention interdite « Operations Director »');
  });
});

describe('images', () => {
  it('signale une image introuvable avec le message exact', async () => {
    const { errors } = await run({
      articles: { 'un.md': article({ image: '"../../../assets/blog/absente.webp"' }) },
    });
    expect(errors).toContain('Image introuvable : src/assets/blog/absente.webp (article un)');
  });

  it('refuse une image de plus de 250 Ko', async () => {
    const { errors } = await run({
      articles: { 'un.md': article() },
      images: { 'a.webp': webp([], MAX_IMAGE_BYTES) },
    });
    expect(errors.join('\n')).toContain('Image trop lourde : src/assets/blog/a.webp');
  });

  it('refuse un bloc EXIF dans un WebP', async () => {
    const { errors } = await run({
      articles: { 'un.md': article() },
      images: { 'a.webp': webp(['EXIF']) },
    });
    expect(errors.join('\n')).toContain('Bloc EXIF dans l’image : src/assets/blog/a.webp');
  });

  it('lit les chunks d’un WebP', () => {
    expect(riffChunks(webp(['EXIF']))).toEqual(['VP8X', 'EXIF']);
    expect(riffChunks(Buffer.from('pas un webp'))).toEqual([]);
  });
});

describe('corps', () => {
  const body = (text: string) => ({ articles: { 'un.md': article({}, text) } });

  it('refuse un attribut style et une balise script', async () => {
    const style = await run(body('<svg style="width:100%"></svg>\n'));
    expect(style.errors.join('\n')).toContain(
      'blog/un.md : attribut style interdit dans le corps (CSP)',
    );
    const script = await run(body('<script>alert(1)</script>\n'));
    expect(script.errors.join('\n')).toContain(
      'blog/un.md : balise script interdite dans le corps',
    );
  });

  it('ignore ce qui est dans un bloc de code', async () => {
    const text = '## Titre\n\n```html\n<svg style="width:100%"></svg>\n<script></script>\n```\n';
    expect((await run(body(text))).errors).toEqual([]);
  });

  it('refuse un titre de niveau 1 dans le corps', async () => {
    const { errors } = await run(body('# Titre\n'));
    expect(errors.join('\n')).toContain(
      'blog/un.md : titre de niveau 1 dans le corps (le h1 est le titre)',
    );
  });

  it('refuse un saut de niveau de titre', async () => {
    const { errors } = await run(body('## Un\n\n#### Quatre\n'));
    expect(errors.join('\n')).toContain('blog/un.md : saut de niveau de titre (h2 vers h4)');
  });

  it('accepte une descente progressive et un retour en arrière', async () => {
    expect((await run(body('## A\n\n### B\n\n#### C\n\n## D\n'))).errors).toEqual([]);
  });

  it('exige des liens internes au format cible', async () => {
    const { errors } = await run(
      body(
        '[a](/blog/x) [b](/blog/category/outils/) [c](/blog/tags/ia/) [d](/blog/x/) [e](/rss.xml)\n',
      ),
    );
    const text = errors.join('\n');
    expect(text).toContain('lien interne sans barre finale : /blog/x');
    expect(text).toContain('lien interne à l’ancien format : /blog/category/outils/');
    expect(text).toContain('lien interne à l’ancien format : /blog/tags/ia/');
    expect(text).not.toContain('/blog/x/ ');
    expect(text).not.toContain('/rss.xml');
  });

  it('refuse les données personnelles', async () => {
    const { errors } = await run(body('Appelez le 06 12 34 56 78\n'));
    expect(errors).toContain('Donnée personnelle interdite détectée dans un.md : telephone');
  });
});

describe('validation par le PO', () => {
  const tree = {
    articles: { 'a.md': article({ validated: 'true' }), 'b.md': article() },
  };

  it('compte les articles validés sans échouer par défaut', async () => {
    const report = await run(tree, { expected: 2 });
    expect(report.validated).toBe(1);
    expect(report.total).toBe(2);
    expect(report.errors).toEqual([]);
  });

  it('échoue seulement quand la validation est exigée', async () => {
    const report = await run(tree, { expected: 2, requireValidated: true });
    expect(report.errors).toContain('Articles non validés par le PO : 1/2 validés (b)');
  });
});

describe('lecteur unique de la collection', () => {
  it("détecte un appel à getCollection('blog') hors de blog-source.ts", async () => {
    const root = await rootWith({
      articles: { 'un.md': article() },
      sources: {
        'src/lib/blog-source.ts': "await getCollection('blog');",
        'src/pages/autre.astro': '---\nconst posts = await getCollection("blog");\n---\n',
        'src/lib/ok.ts': "await getCollection('projects');",
      },
    });
    expect(await findCollectionReaders(root)).toEqual(['src/pages/autre.astro']);
    const { errors } = await checkBlog(root, { expected: 1 });
    expect(errors).toContain(
      "src/pages/autre.astro : appel à getCollection('blog') interdit, passer par getPublishedPosts() de src/lib/blog-source.ts",
    );
  });
});
