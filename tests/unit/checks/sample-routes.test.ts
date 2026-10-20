import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  loadSampleRules,
  parseSampleRules,
  sampleRoutes,
} from '../../../scripts/checks/lib/sample-routes.ts';

const UNIQUE = ['/', '/parcours/', '/contact/', '/blog/', '/recherche/', '/blog/page/2/'];
const TAGS = ['/blog/tag/a/', '/blog/tag/b/', '/blog/tag/c/', '/blog/tag/d/'];
const SERIES = ['/blog/serie/s1/', '/blog/serie/s2/', '/blog/serie/s3/'];
const CATEGORIES = [
  '/blog/categorie/business/',
  '/blog/categorie/methode/',
  '/blog/categorie/outils/',
];
const ARTICLES = ['/blog/un/', '/blog/deux/', '/blog/trois/', '/blog/quatre/'];
const PLUGINS = ['/plugins/p1/', '/plugins/p2/', '/plugins/p3/'];
const ALL = [...UNIQUE, ...TAGS, ...SERIES, ...CATEGORIES, ...ARTICLES, ...PLUGINS].sort();

const rules = parseSampleRules({
  families: [{ prefix: '/blog/tag/' }, { prefix: '/blog/serie/' }, { prefix: '/blog/page/' }],
  articles: [],
  include: [],
});

describe('sampleRoutes', () => {
  it('garde les pages uniques intactes', () => {
    const sampled = sampleRoutes(ALL, rules);
    for (const route of [...UNIQUE, ...PLUGINS, ...CATEGORIES]) expect(sampled).toContain(route);
  });

  it('réduit une famille répétée à 2 pages par défaut', () => {
    const sampled = sampleRoutes(ALL, rules);
    expect(sampled.filter((r) => r.startsWith('/blog/tag/'))).toEqual([
      '/blog/tag/a/',
      '/blog/tag/b/',
    ]);
    expect(sampled.filter((r) => r.startsWith('/blog/serie/'))).toHaveLength(2);
  });

  it('respecte un maximum propre à la famille', () => {
    const custom = parseSampleRules({
      families: [{ prefix: '/blog/tag/', max: 3 }],
      articles: [],
      include: [],
    });
    expect(sampleRoutes(ALL, custom).filter((r) => r.startsWith('/blog/tag/'))).toHaveLength(3);
  });

  it('conserve une inclusion explicite hors échantillon', () => {
    const withInclude = parseSampleRules({ ...rules, include: ['/blog/tag/d/'] });
    expect(sampleRoutes(ALL, withInclude)).toContain('/blog/tag/d/');
  });

  it('une inclusion absente de dist/ est une erreur (pas d’échantillon silencieusement vide)', () => {
    const missing = parseSampleRules({ ...rules, include: ['/blog/tag/inconnu/'] });
    expect(() => sampleRoutes(ALL, missing)).toThrow('/blog/tag/inconnu/');
  });

  it('liste d’articles vide : tous les articles sont testés', () => {
    const sampled = sampleRoutes(ALL, rules);
    for (const article of ARTICLES) expect(sampled).toContain(article);
  });

  it('liste d’articles renseignée : seuls ces articles sont testés, hors segments réservés', () => {
    const picked = parseSampleRules({ ...rules, articles: ['/blog/deux/', '/blog/quatre/'] });
    const sampled = sampleRoutes(ALL, picked);
    expect(sampled.filter((r) => ARTICLES.includes(r))).toEqual(['/blog/deux/', '/blog/quatre/']);
    expect(sampled).toContain('/blog/page/2/');
    expect(sampled).toContain('/blog/categorie/methode/');
  });

  it('un article listé mais absent de dist/ est une erreur', () => {
    const picked = parseSampleRules({ ...rules, articles: ['/blog/fantome/'] });
    expect(() => sampleRoutes(ALL, picked)).toThrow('/blog/fantome/');
  });

  it('un article listé qui est un segment réservé est refusé', () => {
    expect(() => parseSampleRules({ ...rules, articles: ['/blog/page/'] })).toThrow('réservé');
  });

  it('sur le site actuel (aucune famille du blog), toutes les pages restent testées', () => {
    const current = ['/', '/parcours/', ...PLUGINS, '/contact/'];
    expect(sampleRoutes(current, rules)).toEqual([...current].sort());
  });

  it('renvoie une liste triée sans doublon', () => {
    const withInclude = parseSampleRules({ ...rules, include: ['/blog/tag/a/'] });
    const sampled = sampleRoutes(ALL, withInclude);
    expect(sampled).toEqual([...new Set(sampled)].sort());
  });
});

describe('parseSampleRules', () => {
  it.each([
    [{ families: [], articles: [], include: [], extra: 1 }, 'champ inconnu'],
    [{ families: [{ prefix: '/blog/tag/', foo: 1 }], articles: [], include: [] }, 'champ inconnu'],
    [{ families: [{ prefix: 'blog/tag/' }], articles: [], include: [] }, 'préfixe'],
    [{ families: [{ prefix: '/blog/tag/', max: 0 }], articles: [], include: [] }, 'max'],
    [{ families: 'x', articles: [], include: [] }, 'families'],
    [{ families: [], articles: ['blog/x'], include: [] }, 'articles'],
    [null, 'objet'],
  ])('refuse une règle invalide (%#)', (input, message) => {
    expect(() => parseSampleRules(input)).toThrow(message);
  });
});

describe('loadSampleRules', () => {
  it('lit et valide un fichier JSON', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'sample-'));
    try {
      const file = join(dir, 'rules.json');
      await writeFile(file, JSON.stringify({ families: [], articles: [], include: [] }));
      expect(loadSampleRules(file)).toEqual({ families: [], articles: [], include: [] });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('règles du dépôt (tests/e2e/sample-routes.json)', () => {
  // Les 24 fiches plugins et les catégories partagent un gabarit : sans plafond, Lighthouse (3 passes par page)
  // dépasse le délai du job e2e en CI (sprint 3, run 38690417091).
  it.each([
    ['/open-source/sylius/', 3],
    ['/blog/categorie/', 2],
  ])('plafonne la famille %s à %i pages', (prefix, max) => {
    const rules = loadSampleRules(join(process.cwd(), 'tests/e2e/sample-routes.json'));
    expect(rules.families).toContainEqual({ prefix, max });
  });
});
