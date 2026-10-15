import { describe, expect, it } from 'vitest';
import type { BlogData } from '../../../src/content/schemas/blog.ts';
import { slugOf, type BlogEntry } from '../../../src/lib/blog.ts';
import {
  MAX_TAXONOMY_ARTICLES,
  articlesOfCategory,
  articlesOfSeries,
  articlesOfTag,
  categories,
  categoryTitle,
  paginationItems,
  seriesList,
  seriesPosition,
  tagPages,
} from '../../../src/lib/blog-taxonomy.ts';

function entry(slug: string, data: Partial<BlogData> = {}): BlogEntry {
  return {
    id: `fr/${slug}`,
    data: {
      title: slug,
      description: 'd'.repeat(60),
      pubDate: new Date('2026-09-01T00:00:00Z'),
      author: 'Thibaut Monier',
      tags: [],
      category: 'Méthode',
      draft: false,
      validated: false,
      ...data,
    } as BlogData,
  };
}
const slugs = (list: BlogEntry[]) => list.map((e) => slugOf(e.id));

describe('categories', () => {
  it('compte les articles par catégorie, par ordre alphabétique français', () => {
    const list = [
      entry('a', { category: 'Pilotage' }),
      entry('b', { category: 'Méthode' }),
      entry('c', { category: 'Métiers' }),
      entry('d', { category: 'Méthode' }),
      entry('e', { category: 'Business' }),
    ];
    expect(categories(list)).toEqual([
      { name: 'Business', slug: 'business', count: 1 },
      { name: 'Méthode', slug: 'methode', count: 2 },
      { name: 'Métiers', slug: 'metiers', count: 1 },
      { name: 'Pilotage', slug: 'pilotage', count: 1 },
    ]);
  });

  it('ne produit aucune page pour une catégorie du schéma sans article publié', () => {
    expect(categories([entry('a', { category: 'Outils' })]).map((c) => c.name)).toEqual(['Outils']);
    expect(categories([])).toEqual([]);
  });
});

describe('categoryTitle', () => {
  it('accorde « article » au pluriel et au singulier', () => {
    expect(categoryTitle('Méthode', 5)).toBe('Méthode (5 articles)');
    expect(categoryTitle('Outils', 1)).toBe('Outils (1 article)');
  });
});

describe('tagPages', () => {
  it('ne garde que les tags à 2 articles ou plus, avec leur slug et leur compte', () => {
    const list = [
      entry('a', { tags: ['IA générative', 'Seul'] }),
      entry('b', { tags: ['IA générative', 'SDD'] }),
      entry('c', { tags: ['SDD'] }),
    ];
    expect(tagPages(list)).toEqual([
      { label: 'IA générative', slug: 'ia-generative', count: 2 },
      { label: 'SDD', slug: 'sdd', count: 2 },
    ]);
  });

  it('échoue quand deux libellés donnent le même slug', () => {
    const list = [entry('a', { tags: ['Méthode'] }), entry('b', { tags: ['Methode'] })];
    expect(() => tagPages(list)).toThrow('Collision de tags');
  });
});

describe('seriesList et articlesOfSeries', () => {
  const list = [
    entry('trois', { series: "L'agence", seriesOrder: 3 }),
    entry('un', { series: "L'agence", seriesOrder: 1 }),
    entry('deux', { series: "L'agence", seriesOrder: 2 }),
    entry('autre', { series: 'Autre série', seriesOrder: 1 }),
    entry('hors-serie'),
  ];

  it('liste les séries avec leur slug et leur compte', () => {
    expect(seriesList(list)).toEqual([
      { name: 'Autre série', slug: 'autre-serie', count: 1 },
      { name: "L'agence", slug: 'l-agence', count: 3 },
    ]);
  });

  it('ordonne les articles d’une série par seriesOrder', () => {
    expect(slugs(articlesOfSeries(list, 'l-agence'))).toEqual(['un', 'deux', 'trois']);
    expect(articlesOfSeries(list, 'inconnue')).toEqual([]);
  });
});

describe('seriesPosition', () => {
  const list = [
    entry('un', { series: 'S', seriesOrder: 1 }),
    entry('deux', { series: 'S', seriesOrder: 2 }),
    entry('trois', { series: 'S', seriesOrder: 3 }),
  ];

  it('donne la position à partir de 1 avec précédent et suivant', () => {
    const position = seriesPosition(list, 'deux');
    expect(position).toMatchObject({ name: 'S', slug: 's', position: 2, total: 3 });
    expect(slugOf(position?.previous?.id ?? '')).toBe('un');
    expect(slugOf(position?.next?.id ?? '')).toBe('trois');
  });

  it('le premier n’a pas de précédent, le dernier pas de suivant', () => {
    expect(seriesPosition(list, 'un')?.previous).toBeUndefined();
    expect(seriesPosition(list, 'trois')?.next).toBeUndefined();
  });

  it('renvoie null hors série', () => {
    expect(seriesPosition([entry('seul')], 'seul')).toBeNull();
  });
});

describe('articlesOfCategory et articlesOfTag', () => {
  const list = [
    entry('ancien', { pubDate: new Date('2026-01-01T00:00:00Z'), tags: ['SDD', 'Agile'] }),
    entry('recent', { pubDate: new Date('2026-05-01T00:00:00Z'), tags: ['SDD'] }),
    entry('autre', { category: 'Outils', tags: ['Agile'] }),
  ];

  it('filtre une catégorie, du plus récent au plus ancien', () => {
    expect(slugs(articlesOfCategory(list, 'methode'))).toEqual(['recent', 'ancien']);
    expect(articlesOfCategory(list, 'business')).toEqual([]);
  });

  it('filtre un tag par son slug', () => {
    expect(slugs(articlesOfTag(list, 'sdd'))).toEqual(['recent', 'ancien']);
    expect(slugs(articlesOfTag(list, 'agile'))).toEqual(['autre', 'ancien']);
  });

  it('échoue plutôt que de tronquer une taxonomie trop grande', () => {
    const many = Array.from({ length: MAX_TAXONOMY_ARTICLES + 1 }, (_, i) =>
      entry(`a-${i}`, { tags: ['SDD'] }),
    );
    expect(() => articlesOfTag(many, 'sdd')).toThrow('pagination de taxonomie non prévue');
    expect(() => articlesOfCategory(many, 'methode')).toThrow('pagination de taxonomie non prévue');
  });
});

describe('paginationItems', () => {
  it('libellé « Page n sur N », précédent et suivant explicites', () => {
    const items = paginationItems(2, 3);
    expect(items.label).toBe('Page 2 sur 3');
    expect(items.previous).toBe('/blog/');
    expect(items.next).toBe('/blog/page/3/');
    expect(items.pages).toEqual([
      { number: 1, href: '/blog/', current: false },
      { number: 2, href: '/blog/page/2/', current: true },
      { number: 3, href: '/blog/page/3/', current: false },
    ]);
  });

  it('première et dernière page : un seul sens', () => {
    expect(paginationItems(1, 3)).toMatchObject({ label: 'Page 1 sur 3', next: '/blog/page/2/' });
    expect(paginationItems(1, 3).previous).toBeUndefined();
    expect(paginationItems(3, 3).next).toBeUndefined();
  });
});
