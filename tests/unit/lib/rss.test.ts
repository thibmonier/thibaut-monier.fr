import { describe, expect, it } from 'vitest';
import type { BlogEntry } from '../../../src/lib/blog.ts';
import { buildRssItems, buildRssXml } from '../../../src/lib/rss.ts';

const SITE = 'https://thibaut-monier.fr';
const NOW = new Date('2026-10-15T06:00:00Z');

function entry(slug: string, date: string, extra: Partial<BlogEntry['data']> = {}): BlogEntry {
  return {
    id: `fr/${slug}`,
    data: {
      title: `Titre ${slug}`,
      description: `Description de ${slug}`,
      pubDate: new Date(date),
      author: 'Thibaut Monier',
      tags: [],
      category: 'Méthode',
      draft: false,
      validated: true,
      ...extra,
    } as BlogEntry['data'],
  };
}

describe('buildRssItems', () => {
  it('trie par date décroissante et limite à 20 articles', () => {
    const entries = Array.from({ length: 25 }, (_, i) =>
      entry(`a${String(i).padStart(2, '0')}`, `2026-09-${String(i + 1).padStart(2, '0')}`),
    );
    const items = buildRssItems(entries, NOW, SITE);
    expect(items).toHaveLength(20);
    expect(items[0]?.link).toBe('https://thibaut-monier.fr/blog/a24/');
    expect(items[19]?.link).toBe('https://thibaut-monier.fr/blog/a05/');
  });

  it('exclut les brouillons et les articles datés du futur (même filtre que la liste du blog)', () => {
    const items = buildRssItems(
      [
        entry('publie', '2026-09-01'),
        entry('brouillon', '2026-09-02', { draft: true }),
        entry('futur', '2026-12-01'),
      ],
      NOW,
      SITE,
    );
    expect(items.map((i) => i.link)).toEqual(['https://thibaut-monier.fr/blog/publie/']);
  });

  it('utilise l’extrait quand il existe, sinon la description, avec la catégorie', () => {
    const [a, b] = buildRssItems(
      [entry('a', '2026-09-02', { excerpt: 'Extrait A' }), entry('b', '2026-09-01')],
      NOW,
      SITE,
    );
    expect(a?.description).toBe('Extrait A');
    expect(b?.description).toBe('Description de b');
    expect(a?.categories).toEqual(['Méthode']);
    expect(a?.title).toBe('Titre a');
  });

  it('échoue en citant le slug si extrait et description manquent', () => {
    expect(() =>
      buildRssItems([entry('vide', '2026-09-01', { description: '' })], NOW, SITE),
    ).toThrow('Flux RSS : description manquante pour vide');
  });
});

describe('buildRssXml', () => {
  const xml = (entries: BlogEntry[]) => buildRssXml(entries, NOW, SITE);

  it('déclare le canal : titre, lien, langue française, date de build', async () => {
    const out = await xml([entry('a', '2026-09-01')]);
    expect(out).toContain('<rss version="2.0">');
    expect(out).toContain('<language>fr</language>');
    expect(out).toContain('<lastBuildDate>Thu, 15 Oct 2026 06:00:00 GMT</lastBuildDate>');
    expect(out).toContain('<link>https://thibaut-monier.fr/</link>');
    expect(out).toContain('<guid isPermaLink="true">https://thibaut-monier.fr/blog/a/</guid>');
    expect(out).toContain('<pubDate>Tue, 01 Sep 2026 00:00:00 GMT</pubDate>');
  });

  it('échappe &, < et les guillemets dans le XML produit', async () => {
    const out = await xml([entry('a', '2026-09-01', { title: 'R&D <b> "agile" & co' })]);
    expect(out).toContain('R&amp;D &lt;b&gt;');
    expect(out).not.toMatch(/<title>[^<]*<b>/);
    expect(out).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
  });

  it('produit un flux valide sans article', async () => {
    const out = await xml([]);
    expect(out).toContain('<channel>');
    expect(out).not.toContain('<item>');
  });
});
