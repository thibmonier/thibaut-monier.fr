import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ORIGINAL_ORIGIN,
  SERIES_ORDER,
  addOrigin,
  convertSvg,
  migrateArticle,
  migrateFiles,
  normalizeTags,
  relocateImage,
  removeBioFooter,
  rewriteLinks,
  seriesOrderLine,
  splitArticle,
  todoFor,
  unwrapFrontmatter,
} from '../../../src/lib/blog-migration.ts';

const FIXTURES = join(import.meta.dirname, '../../fixtures/blog-source');
const read = (slug: string) => readFile(join(FIXTURES, 'src/content/blog', `${slug}.md`), 'utf8');

describe('splitArticle', () => {
  it('sépare le frontmatter du corps', () => {
    expect(splitArticle('---\na: 1\n---\n\nCorps\n')).toEqual({
      header: 'a: 1',
      body: '\nCorps\n',
    });
  });

  it('refuse un fichier sans frontmatter', () => {
    expect(() => splitArticle('Corps seul')).toThrow('Frontmatter absent');
  });
});

describe('(1) unwrapFrontmatter : titre ou description sur deux lignes', () => {
  it('ramène une chaîne coupée sans indentation sur une seule ligne', () => {
    const header = [
      'title: "Le vrai développeur augmenté,',
      'c\'est le chef de projet"',
      'tags: ["A"]',
    ];
    expect(unwrapFrontmatter(header.join('\n'))).toBe(
      ['title: "Le vrai développeur augmenté, c\'est le chef de projet"', 'tags: ["A"]'].join('\n'),
    );
  });

  it('laisse intactes les lignes déjà valides, listes et commentaires compris', () => {
    const header = 'title: "Un"\nfaq:\n  - question: "Q"\n    answer: "R"\n# note\ndraft: false';
    expect(unwrapFrontmatter(header)).toBe(header);
  });
});

describe('(2) relocateImage', () => {
  it('pointe vers src/assets/blog, relatif au dossier du contenu', () => {
    expect(relocateImage('image: "/blog/x.webp"\nimageAlt: "Un"')).toBe(
      'image: "../../../assets/blog/x.webp"\nimageAlt: "Un"',
    );
  });

  it('est sans effet sur un chemin déjà migré et sur un article sans image', () => {
    const done = 'image: "../../../assets/blog/x.webp"';
    expect(relocateImage(done)).toBe(done);
    expect(relocateImage('title: "A"')).toBe('title: "A"');
  });
});

describe('(3) addOrigin', () => {
  it('ajoute originalUrl (forme sans barre finale, E15) et originalPublishedAt égale à pubDate', () => {
    const header = 'title: "A"\npubDate: 2026-03-17';
    expect(addOrigin(header, 'la-spec')).toBe(
      `${header}\noriginalUrl: ${ORIGINAL_ORIGIN}/blog/la-spec\noriginalPublishedAt: 2026-03-17`,
    );
  });

  it('ne duplique pas un champ déjà présent', () => {
    const header = `pubDate: 2026-03-17\noriginalUrl: ${ORIGINAL_ORIGIN}/blog/x\noriginalPublishedAt: 2026-03-17`;
    expect(addOrigin(header, 'x')).toBe(header);
  });

  it('échoue sans pubDate', () => {
    expect(() => addOrigin('title: "A"', 'x')).toThrow('pubDate absent');
  });
});

describe('(4) rewriteLinks', () => {
  it('ajoute la barre finale aux liens vers un article', () => {
    expect(rewriteLinks('[a](/blog/cycle-en-v-agile-sdd-comparaison-timelines)')).toBe(
      '[a](/blog/cycle-en-v-agile-sdd-comparaison-timelines/)',
    );
  });

  it('traduit les catégories vers /blog/categorie/<slug>/', () => {
    expect(rewriteLinks('[a](/blog/category/outils)')).toBe('[a](/blog/categorie/outils/)');
    expect(rewriteLinks('[a](/blog/category/méthode/)')).toBe('[a](/blog/categorie/methode/)');
  });

  it('pointe les pages non migrées vers l’ancien site (E10)', () => {
    expect(rewriteLinks('[a](/services/sites-ia) [b](/methode) [c](/boite-a-outils/zsh)')).toBe(
      `[a](${ORIGINAL_ORIGIN}/services/sites-ia) [b](${ORIGINAL_ORIGIN}/methode) [c](${ORIGINAL_ORIGIN}/boite-a-outils/zsh)`,
    );
  });

  it('laisse intacts liens externes, ancres et liens déjà au format cible', () => {
    const body = '[x](https://github.com/a/b) [y](#ancre) [z](/blog/a/) [w](/parcours/)';
    expect(rewriteLinks(body)).toBe(body);
  });

  it('ne touche pas aux blocs de code', () => {
    const body = '```md\n[a](/blog/x)\n```';
    expect(rewriteLinks(body)).toBe(body);
  });
});

describe('(5) convertSvg', () => {
  const styled =
    '<svg viewBox="0 0 10 10" role="img" style="width:100%;height:auto;font-family:ui-sans-serif,system-ui,sans-serif"><title id="t">Titre</title></svg>';

  it('remplace le style en ligne par des classes et un attribut font-family', () => {
    const out = convertSvg(styled);
    expect(out).not.toContain('style=');
    expect(out).toContain('class="w-full h-auto"');
    expect(out).toContain('font-family="ui-sans-serif,system-ui,sans-serif"');
  });

  it('échoue explicitement sur une déclaration CSS inconnue', () => {
    expect(() => convertSvg('<svg style="width:100%;color:red"></svg>')).toThrow(
      'Déclaration CSS inconnue dans un SVG : color:red',
    );
  });

  it('ajoute role="img" et un titre tiré du premier texte quand ils manquent', () => {
    const out = convertSvg(
      '<svg width="100%" viewBox="0 0 1 1"><text x="1">Timeline type</text></svg>',
    );
    expect(out).toContain('role="img"');
    expect(out).toContain('<title>Timeline type</title>');
  });

  it('échoue quand un SVG sans titre n’a aucun texte pour en fabriquer un', () => {
    expect(() => convertSvg('<svg viewBox="0 0 1 1"><rect/></svg>')).toThrow('SVG sans titre');
  });

  it('remplace le conteneur aux classes de l’ancien thème par diagram-frame', () => {
    const out = convertSvg(
      '<div class="not-prose my-8 rounded-xl overflow-hidden border border-border bg-card p-4">\n<svg viewBox="0 0 1 1"><title>T</title></svg>\n</div>',
    );
    expect(out).toContain('<div class="diagram-frame">');
    expect(out).not.toContain('not-prose');
  });

  it('ne touche pas aux blocs de code', () => {
    const body = '```html\n<svg style="width:100%;color:red"></svg>\n```';
    expect(convertSvg(body)).toBe(body);
  });
});

describe('(6) removeBioFooter', () => {
  it('retire la phrase biographique et garde le reste du pied (E11)', () => {
    const body =
      "texte\n\n_Thibaut est Operations Director avec 25 ans d'expérience dont 10 ans d'expertise Symfony. Prochain article : « La spec »._\n";
    expect(removeBioFooter(body)).toBe('texte\n\n_Prochain article : « La spec »._\n');
  });

  it('supprime la ligne quand elle ne contient que la phrase biographique', () => {
    const body =
      "texte\n\n_Thibaut est Operations Director avec 25 ans d'expérience dont 10 ans d'expertise Symfony._\n";
    expect(removeBioFooter(body)).toBe('texte\n');
  });

  it('laisse le corps sans pied biographique inchangé', () => {
    expect(removeBioFooter('texte\n\n_Prochain article : « X »._\n')).toBe(
      'texte\n\n_Prochain article : « X »._\n',
    );
  });
});

describe('normalizeTags', () => {
  it('remplace les synonymes et supprime les doublons en gardant l’ordre', () => {
    expect(normalizeTags('tags: ["Gestion de projet", "IA générative", "Méthodologie"]')).toBe(
      'tags: ["Gestion de projet", "IA générative", "Méthode"]',
    );
    expect(normalizeTags('tags: ["ROI", "Rentabilité", "Agentic engineering"]')).toBe(
      'tags: ["ROI", "Agentic engineering"]',
    );
    expect(normalizeTags('tags: ["Management de projet"]')).toBe('tags: ["Gestion de projet"]');
  });

  it('est sans effet sans tags', () => {
    expect(normalizeTags('title: "A"')).toBe('title: "A"');
  });
});

describe('seriesOrderLine', () => {
  it('couvre les 26 articles en série, 6 séries, sans trou ni doublon', () => {
    expect(Object.keys(SERIES_ORDER)).toHaveLength(26);
    const bySeries = new Map<string, number[]>();
    for (const { series, order } of Object.values(SERIES_ORDER)) {
      bySeries.set(series, [...(bySeries.get(series) ?? []), order]);
    }
    expect(bySeries.size).toBe(6);
    for (const orders of bySeries.values()) {
      expect([...orders].sort((a, b) => a - b)).toEqual(orders.map((_, i) => i + 1));
    }
  });

  it('ajoute seriesOrder à la suite de la série et vérifie le nom', () => {
    const header = 'series: "Transformer l\'agence"\ncategory: "Business"';
    expect(seriesOrderLine(header, 'ce-que-le-client-doit-savoir-sur-l')).toBe(
      'series: "Transformer l\'agence"\nseriesOrder: 4\ncategory: "Business"',
    );
    expect(() => seriesOrderLine('series: "Autre"', 'ce-que-le-client-doit-savoir-sur-l')).toThrow(
      'série',
    );
  });

  it('ne touche pas un article hors série', () => {
    expect(seriesOrderLine('title: "A"', 'la-boite-a-outils-du-poweruser')).toBe('title: "A"');
  });
});

describe('todoFor', () => {
  it('liste ce qui reste à faire à la main', () => {
    const header = [
      `title: "${'t'.repeat(61)}"`,
      `description: "${'d'.repeat(161)}"`,
      'image: "../../../assets/blog/x.webp"',
      'tags: ["A"]',
    ].join('\n');
    const todo = todoFor(header);
    expect(todo.join('|')).toContain('description');
    expect(todo.join('|')).toContain('seoTitle');
    expect(todo.join('|')).toContain('imageAlt');
  });

  it('ne signale rien pour un frontmatter complet', () => {
    const header = [
      'title: "Court"',
      `description: "${'d'.repeat(80)}"`,
      'image: "../../../assets/blog/x.webp"',
      'imageAlt: "Un texte"',
    ].join('\n');
    expect(todoFor(header)).toEqual([]);
  });
});

describe('migrateArticle sur des extraits réels', () => {
  it('migre un article simple et collecte son image', async () => {
    const result = migrateArticle(
      await read('la-spec-est-le-nouveau-code'),
      'la-spec-est-le-nouveau-code',
    );
    expect(result.content).toContain(
      'image: "../../../assets/blog/blog_post_2_1768848698871.webp"',
    );
    expect(result.content).toContain('seriesOrder: 2');
    expect(result.content).toContain(
      `originalUrl: ${ORIGINAL_ORIGIN}/blog/la-spec-est-le-nouveau-code`,
    );
    expect(result.content).toContain('originalPublishedAt: 2026-03-17');
    expect(result.images).toEqual(['blog_post_2_1768848698871.webp']);
    expect(result.changes.length).toBeGreaterThan(0);
  });

  it('normalise titre sur deux lignes, tag synonyme et pied biographique', async () => {
    const slug = 'le-vrai-developpeur-augmente-c-est-le-chef';
    const { content } = migrateArticle(await read(slug), slug);
    expect(content).toContain('title: "Le vrai développeur augmenté, c\'est le chef de projet"');
    expect(content).toContain('"Gestion de projet"');
    expect(content).not.toContain('Management de projet');
    expect(content).toContain('_Prochain article : « La spec est le nouveau code »._');
    expect(content).not.toContain('_Thibaut est Operations Director avec 25 ans');
    // La phrase narrative du corps est une décision éditoriale, jamais automatique.
    expect(content).toContain('depuis plusieurs années, Operations Director');
  });

  it('convertit le SVG sans titre, les liens vers pages non migrées et le conteneur', async () => {
    const slug = 'cycle-en-v-agile-sdd-comparaison-timelines';
    const { content } = migrateArticle(await read(slug), slug);
    expect(content).toContain('<div class="diagram-frame">');
    expect(content).toContain('role="img"');
    expect(content).toContain(`](${ORIGINAL_ORIGIN}/services/sites-ia)`);
    expect(content).toContain(`](${ORIGINAL_ORIGIN}/methode)`);
    expect(content).toContain('| Agile   | 3 à 4 semaines |');
  });

  it('migre le SVG à style en ligne sans toucher le bloc de code', async () => {
    const slug = 'reduire-la-facture-token-caveman-codegraph';
    const { content } = migrateArticle(await read(slug), slug);
    const [beforeCode] = content.split('```html');
    expect(beforeCode).not.toContain('style=');
    expect(content).toContain(
      '<svg style="width:100%;height:auto;font-family:ui-sans-serif,system-ui,sans-serif"></svg>',
    );
  });

  it('réécrit les liens de catégorie et d’article', async () => {
    const slug = 'la-boite-a-outils-du-poweruser';
    const { content } = migrateArticle(await read(slug), slug);
    expect(content).toContain('](/blog/categorie/outils/)');
    expect(content).toContain('](/blog/cycle-en-v-agile-sdd-comparaison-timelines/)');
    expect(content).toContain(`](${ORIGINAL_ORIGIN}/boite-a-outils/zsh)`);
  });

  it.each([
    'la-spec-est-le-nouveau-code',
    'le-vrai-developpeur-augmente-c-est-le-chef',
    'cycle-en-v-agile-sdd-comparaison-timelines',
    'reduire-la-facture-token-caveman-codegraph',
    'la-boite-a-outils-du-poweruser',
  ])('(7) est idempotent : un second passage ne change rien (%s)', async (slug) => {
    const once = migrateArticle(await read(slug), slug).content;
    expect(migrateArticle(once, slug).content).toBe(once);
  });
});

describe('migrateFiles', () => {
  const roots: string[] = [];
  afterEach(async () => {
    await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
  });
  async function tempRoot(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'blog-migration-'));
    roots.push(root);
    return root;
  }

  it('écrit l’article et copie l’image sans toucher à la source', async () => {
    const root = await tempRoot();
    const report = await migrateFiles({
      sourceDir: FIXTURES,
      root,
      slugs: ['la-spec-est-le-nouveau-code'],
    });
    const article = await readFile(
      join(root, 'src/content/blog/fr/la-spec-est-le-nouveau-code.md'),
      'utf8',
    );
    expect(article).toContain('originalUrl');
    const image = await readFile(
      join(root, 'src/assets/blog/blog_post_2_1768848698871.webp'),
      'utf8',
    );
    expect(image).toBe('webp:blog_post_2_1768848698871');
    expect(report[0]?.status).toBe('migré');
  });

  it('ne réécrit pas un article déjà migré sans --force (protège les relectures)', async () => {
    const root = await tempRoot();
    const slugs = ['la-spec-est-le-nouveau-code'];
    await migrateFiles({ sourceDir: FIXTURES, root, slugs });
    const file = join(root, 'src/content/blog/fr/la-spec-est-le-nouveau-code.md');
    await writeFile(file, 'relu à la main', 'utf8');
    const report = await migrateFiles({ sourceDir: FIXTURES, root, slugs });
    expect(report[0]?.status).toBe('ignoré');
    expect(await readFile(file, 'utf8')).toBe('relu à la main');
    const forced = await migrateFiles({ sourceDir: FIXTURES, root, slugs, force: true });
    expect(forced[0]?.status).toBe('migré');
  });

  it('échoue sur un slug inconnu et sur une image absente de la source', async () => {
    const root = await tempRoot();
    await expect(migrateFiles({ sourceDir: FIXTURES, root, slugs: ['inconnu'] })).rejects.toThrow(
      'Article introuvable dans la source : inconnu',
    );
    const source = await tempRoot();
    await mkdir(join(source, 'src/content/blog'), { recursive: true });
    const text = (await read('la-spec-est-le-nouveau-code')).replace('blog_post_2', 'absente');
    await writeFile(join(source, 'src/content/blog/la-spec-est-le-nouveau-code.md'), text);
    await expect(
      migrateFiles({ sourceDir: source, root, slugs: ['la-spec-est-le-nouveau-code'] }),
    ).rejects.toThrow('Image introuvable dans la source');
  });

  it('migre tous les articles quand aucun slug n’est donné', async () => {
    const root = await tempRoot();
    const report = await migrateFiles({ sourceDir: FIXTURES, root });
    expect(report.map((r) => r.slug)).toHaveLength(5);
  });
});
