import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  coverage,
  loadRedirects,
  parseRedirects,
  redirectsSchema,
  toNginx,
  type Redirect,
} from '../../../src/lib/redirects.ts';

const ORIGIN = 'https://thibaut-monier.fr';
const article = (slug: string): Redirect => ({
  from: `/blog/${slug}`,
  to: `/blog/${slug}/`,
  kind: 'article',
});

const messages = (input: unknown) =>
  redirectsSchema
    .safeParse(input)
    .error?.issues.map((i) => i.message)
    .join(' | ') ?? '';

describe('redirectsSchema', () => {
  it('accepte les six sortes d’entrées du contrat C6', () => {
    const table = [
      article('la-spec-est-le-nouveau-code'),
      { from: '/blog', to: '/blog/', kind: 'index' },
      { from: '/blog/category/methode', to: '/blog/categorie/methode/', kind: 'categorie' },
      { from: '/blog/tags/IA générative', to: '/blog/tag/ia-generative/', kind: 'tag' },
      { from: '/blog/3', to: '/blog/page/2/', kind: 'page' },
      { from: '/rss.xml', to: '/rss.xml', kind: 'flux' },
    ];
    expect(redirectsSchema.safeParse(table).success).toBe(true);
  });

  it('accepte une table vide', () => {
    expect(redirectsSchema.parse([])).toEqual([]);
  });

  it('refuse une sorte inconnue et les champs inconnus (strict)', () => {
    expect(redirectsSchema.safeParse([{ ...article('a'), kind: 'autre' }]).success).toBe(false);
    expect(redirectsSchema.safeParse([{ ...article('a'), note: 'x' }]).success).toBe(false);
  });

  it.each([
    ['https://agentic-agency.fr/blog/a', 'chemin'],
    ['//agentic-agency.fr/blog/a', 'chemin'],
    ['blog/a', 'chemin'],
    ['/blog/a/', 'barre finale'],
    ['/blog/a?x=1', 'requête'],
    ['/blog/a#b', 'fragment'],
    ['/blog/a\nreturn 200', 'contrôle'],
    ['/blog/"a"', 'interdit'],
    ['/blog/a;', 'interdit'],
  ])('refuse un from invalide : %j', (from, message) => {
    expect(messages([{ ...article('a'), from }])).toContain(message);
  });

  it('accepte la racine « / » comme from', () => {
    expect(redirectsSchema.safeParse([{ from: '/', to: '/blog/', kind: 'index' }]).success).toBe(
      true,
    );
  });

  it.each([
    ['https://thibaut-monier.fr/blog/a/', 'chemin'],
    ['/blog/a', 'barre finale'],
    ['/blog/a/\nreturn 200', 'contrôle'],
    ['/blog/$host/', 'interdit'],
    ['/blog/a b/', 'interdit'],
  ])('refuse un to invalide : %j', (to, message) => {
    expect(messages([{ ...article('a'), to }])).toContain(message);
  });

  it('accepte un fichier comme cible sans barre finale', () => {
    expect(
      redirectsSchema.safeParse([{ from: '/rss.xml', to: '/rss.xml', kind: 'flux' }]).success,
    ).toBe(true);
  });

  it('refuse les doublons de from, accents ou encodage compris', () => {
    expect(messages([article('a'), article('a')])).toContain('Doublon');
    const tag = (from: string): Redirect => ({ from, to: '/blog/tag/x/', kind: 'tag' });
    expect(
      messages([tag('/blog/tags/IA générative'), tag('/blog/tags/IA%20g%C3%A9n%C3%A9rative')]),
    ).toContain('Doublon');
  });
});

describe('parseRedirects', () => {
  it('lit le YAML du contrat C6 (chemins avec accents entre guillemets)', () => {
    const yaml = [
      '# chemins seulement',
      '- { from: /blog/la-spec, to: /blog/la-spec/, kind: article }',
      "- { from: '/blog/tags/IA générative', to: /blog/tag/ia-generative/, kind: tag }",
    ].join('\n');
    expect(parseRedirects(yaml)).toEqual([
      { from: '/blog/la-spec', to: '/blog/la-spec/', kind: 'article' },
      { from: '/blog/tags/IA générative', to: '/blog/tag/ia-generative/', kind: 'tag' },
    ]);
  });

  it('un fichier vide ou ne contenant que des commentaires est une table vide', () => {
    expect(parseRedirects('')).toEqual([]);
    expect(parseRedirects('# rien pour le moment\n[]\n')).toEqual([]);
    expect(parseRedirects('# rien\n')).toEqual([]);
  });

  it('échoue avec un message lisible sur une entrée invalide', () => {
    expect(() => parseRedirects('- { from: /blog/a/, to: /blog/a/, kind: article }')).toThrow(
      /redirects\.yaml/,
    );
  });

  it('échoue sur un YAML qui n’est pas une liste', () => {
    expect(() => parseRedirects('from: /a')).toThrow(/redirects\.yaml/);
  });
});

describe('coverage', () => {
  const slugs = ['a', 'b', 'c'];

  it('est complète quand chaque article a une entrée', () => {
    const result = coverage(slugs, slugs.map(article));
    expect(result).toEqual({ covered: 3, total: 3, errors: [] });
  });

  it('signale chaque article manquant avec le message exact', () => {
    const result = coverage(slugs, [article('a'), article('c')]);
    expect(result.covered).toBe(2);
    expect(result.errors).toEqual(['Correspondance manquante : b (couverture 2/3)']);
  });

  it('une entrée d’une autre sorte ne couvre pas un article', () => {
    const wrong: Redirect = { from: '/blog/a', to: '/blog/a/', kind: 'tag' };
    expect(coverage(['a'], [wrong]).errors).toEqual([
      'Correspondance manquante : a (couverture 0/1)',
    ]);
  });

  it('reprend le message du contrat pour 28 articles', () => {
    const all = Array.from({ length: 28 }, (_, i) => `art-${i}`);
    const result = coverage(all, all.slice(1).map(article));
    expect(result.errors).toEqual(['Correspondance manquante : art-0 (couverture 27/28)']);
  });
});

describe('toNginx', () => {
  it('émet un bloc location par entrée avec l’origine injectée', () => {
    const out = toNginx([{ from: '/rss.xml', to: '/rss.xml', kind: 'flux' }], ORIGIN);
    expect(out).toBe(`location = "/rss.xml" { return 301 ${ORIGIN}/rss.xml; }\n`);
  });

  it('émet les deux formes (avec et sans barre finale) pour un article', () => {
    const lines = toNginx([article('la-spec')], ORIGIN)
      .trim()
      .split('\n');
    expect(lines).toEqual([
      `location = "/blog/la-spec" { return 301 ${ORIGIN}/blog/la-spec/; }`,
      `location = "/blog/la-spec/" { return 301 ${ORIGIN}/blog/la-spec/; }`,
    ]);
  });

  it('décode les accents UTF-8 d’un tag (brut ou encodé en pourcentage)', () => {
    const raw: Redirect = {
      from: '/blog/tags/IA générative',
      to: '/blog/tag/ia-generative/',
      kind: 'tag',
    };
    const encoded: Redirect = { ...raw, from: '/blog/tags/IA%20g%C3%A9n%C3%A9rative' };
    for (const entry of [raw, encoded]) {
      expect(toNginx([entry], ORIGIN)).toContain('location = "/blog/tags/IA générative" {');
    }
  });

  it('utilise l’origine fournie (E23 : domaine provisoire) et la normalise', () => {
    const out = toNginx([article('a')], 'https://exemple.up.railway.app/ignore');
    expect(out).toContain('return 301 https://exemple.up.railway.app/blog/a/;');
    expect(out).not.toContain('ignore');
  });

  it('refuse une origine invalide', () => {
    expect(() => toNginx([article('a')], 'pas une origine')).toThrow(/origine/i);
  });

  it('ne laisse passer aucun caractère de contrôle, même encodé en pourcentage', () => {
    const evil = { from: '/blog/a%0Areturn%20200', to: '/blog/a/', kind: 'article' } as Redirect;
    expect(() => toNginx([evil], ORIGIN)).toThrow(/contrôle/);
  });

  it('refuse un guillemet ou une accolade qui sortirait du bloc, même encodé', () => {
    const quote = { from: '/blog/a%22%20%7B', to: '/blog/a/', kind: 'article' } as Redirect;
    expect(() => toNginx([quote], ORIGIN)).toThrow(/interdit/);
  });

  it('l’ordre de la table est conservé', () => {
    const out = toNginx([article('b'), article('a')], ORIGIN).split('\n');
    expect(out[0]).toContain('/blog/b"');
  });
});

describe('loadRedirects', () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'redirects-'));
    await mkdir(join(root, 'src/data'), { recursive: true });
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('lit src/data/redirects.yaml sous la racine donnée', async () => {
    await writeFile(
      join(root, 'src/data/redirects.yaml'),
      '- { from: /blog/a, to: /blog/a/, kind: article }\n',
    );
    expect(await loadRedirects(root)).toEqual([article('a')]);
  });

  it('échoue si le fichier est absent', async () => {
    await expect(loadRedirects(join(root, 'vide'))).rejects.toThrow();
  });
});
