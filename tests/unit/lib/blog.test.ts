import { describe, expect, it } from 'vitest';
import type { BlogData } from '../../../src/content/schemas/blog.ts';
import {
  categoryPath,
  isPublished,
  pagePath,
  paginate,
  postPath,
  readingMinutes,
  seriesNeighbors,
  seriesPath,
  slugify,
  slugOf,
  sortByDateDesc,
  tagPath,
  tagsWithPages,
  type BlogEntry,
} from '../../../src/lib/blog.ts';

function entry(slug: string, data: Partial<BlogData> = {}, body = ''): BlogEntry {
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
    body,
  };
}
const slugs = (list: BlogEntry[]) => list.map((e) => slugOf(e.id));

describe('slugOf', () => {
  it('retire le préfixe de langue de l’identifiant d’entrée', () => {
    expect(slugOf('fr/la-spec')).toBe('la-spec');
  });
  it('laisse un identifiant sans préfixe inchangé', () => {
    expect(slugOf('la-spec')).toBe('la-spec');
  });
});

describe('isPublished', () => {
  const now = new Date('2026-10-14T06:00:00Z');
  it('publie un article non brouillon daté du passé', () => {
    expect(isPublished({ draft: false, pubDate: new Date('2026-09-22') }, now)).toBe(true);
  });
  it('exclut un brouillon', () => {
    expect(isPublished({ draft: true, pubDate: new Date('2026-09-22') }, now)).toBe(false);
  });
  it('exclut un article futur (publication programmée)', () => {
    expect(isPublished({ draft: false, pubDate: new Date('2026-10-15') }, now)).toBe(false);
  });
  it('un article du jour, à minuit UTC, est publié au build de 06:00', () => {
    expect(isPublished({ draft: false, pubDate: new Date('2026-10-14') }, now)).toBe(true);
  });
  it('la comparaison est inclusive à l’instant exact', () => {
    const pubDate = new Date('2026-10-14T00:00:00Z');
    expect(isPublished({ draft: false, pubDate }, pubDate)).toBe(true);
    expect(isPublished({ draft: false, pubDate }, new Date(pubDate.getTime() - 1))).toBe(false);
  });
});

describe('sortByDateDesc', () => {
  it('trie du plus récent au plus ancien', () => {
    const list = [
      entry('a', { pubDate: new Date('2026-01-01') }),
      entry('b', { pubDate: new Date('2026-03-01') }),
      entry('c', { pubDate: new Date('2026-02-01') }),
    ];
    expect(slugs(sortByDateDesc(list))).toEqual(['b', 'c', 'a']);
  });
  it('départage l’égalité par slug (ordre stable)', () => {
    const same = new Date('2026-05-01');
    const list = [
      entry('z', { pubDate: same }),
      entry('a', { pubDate: same }),
      entry('m', { pubDate: same }),
    ];
    expect(slugs(sortByDateDesc(list))).toEqual(['a', 'm', 'z']);
    expect(slugs(sortByDateDesc([...list].reverse()))).toEqual(['a', 'm', 'z']);
  });
  it('ne modifie pas la liste d’origine', () => {
    const list = [
      entry('a', { pubDate: new Date('2026-01-01') }),
      entry('b', { pubDate: new Date('2026-02-01') }),
    ];
    sortByDateDesc(list);
    expect(slugs(list)).toEqual(['a', 'b']);
  });
});

describe('readingMinutes', () => {
  const words = (n: number) => Array.from({ length: n }, () => 'mot').join(' ');
  it('compte 230 mots par minute, arrondi supérieur', () => {
    expect(readingMinutes(words(230))).toBe(1);
    expect(readingMinutes(words(231))).toBe(2);
    expect(readingMinutes(words(2424))).toBe(11);
  });
  it('vaut au moins 1 minute, même sans texte', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes(words(3))).toBe(1);
  });
  it('ne compte pas la ponctuation seule', () => {
    expect(readingMinutes(`${words(230)} — — …`)).toBe(1);
  });
});

describe('slugify', () => {
  it('retire les accents et normalise', () => {
    expect(slugify('L’agence digitale augmentée')).toBe('l-agence-digitale-augmentee');
    expect(slugify("L'agence")).toBe('l-agence');
    expect(slugify('Méthode')).toBe('methode');
    expect(slugify('IA générative')).toBe('ia-generative');
  });
  it('replie les séparateurs multiples et supprime les bords', () => {
    expect(slugify('  Gestion  de projet !  ')).toBe('gestion-de-projet');
    expect(slugify('Spec-driven / SDD')).toBe('spec-driven-sdd');
  });
});

describe('chemins (convention C10)', () => {
  it('construit les URL avec barre finale', () => {
    expect(postPath('la-spec')).toBe('/blog/la-spec/');
    expect(categoryPath('methode')).toBe('/blog/categorie/methode/');
    expect(tagPath('ia-generative')).toBe('/blog/tag/ia-generative/');
    expect(seriesPath('agentic')).toBe('/blog/serie/agentic/');
  });
  it('la page 1 de la liste est /blog/, les suivantes /blog/page/<n>/', () => {
    expect(pagePath(1)).toBe('/blog/');
    expect(pagePath(2)).toBe('/blog/page/2/');
    expect(pagePath(3)).toBe('/blog/page/3/');
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 28 }, (_, i) => i + 1);
  it('découpe 28 éléments en 3 pages de 12 (par défaut)', () => {
    expect(paginate(items, 1)).toEqual({ items: items.slice(0, 12), page: 1, pages: 3 });
    expect(paginate(items, 3)).toEqual({ items: items.slice(24), page: 3, pages: 3 });
  });
  it('accepte une taille de page explicite', () => {
    expect(paginate(items, 2, 10)?.items).toHaveLength(10);
  });
  it('renvoie null hors des bornes ou pour un numéro invalide', () => {
    expect(paginate(items, 0)).toBeNull();
    expect(paginate(items, 4)).toBeNull();
    expect(paginate(items, 1.5)).toBeNull();
    expect(paginate(items, Number.NaN)).toBeNull();
  });
  it('une liste vide reste une page 1 vide', () => {
    expect(paginate([], 1)).toEqual({ items: [], page: 1, pages: 1 });
    expect(paginate([], 2)).toBeNull();
  });
});

describe('seriesNeighbors', () => {
  const list = [
    entry('trois', { series: 'Agentic', seriesOrder: 3 }),
    entry('un', { series: 'Agentic', seriesOrder: 1 }),
    entry('deux', { series: 'Agentic', seriesOrder: 2 }),
    entry('autre', { series: 'Autre', seriesOrder: 1 }),
    entry('seul'),
  ];
  it('donne le nom, la position (index à partir de 0), le total et les voisins par seriesOrder', () => {
    const result = seriesNeighbors(list, 'deux');
    expect(result?.name).toBe('Agentic');
    expect(result?.index).toBe(1);
    expect(result?.total).toBe(3);
    expect(result?.previous && slugOf(result.previous.id)).toBe('un');
    expect(result?.next && slugOf(result.next.id)).toBe('trois');
  });
  it('n’a pas de précédent au début ni de suivant à la fin', () => {
    expect(seriesNeighbors(list, 'un')?.previous).toBeUndefined();
    expect(seriesNeighbors(list, 'trois')?.next).toBeUndefined();
  });
  it('renvoie null pour un article hors série ou inconnu', () => {
    expect(seriesNeighbors(list, 'seul')).toBeNull();
    expect(seriesNeighbors(list, 'inconnu')).toBeNull();
  });
});

describe('tagsWithPages', () => {
  it('ne retient que les tags portés par au moins 2 articles (E7)', () => {
    const list = [
      entry('a', { tags: ['IA générative', 'Solo'] }),
      entry('b', { tags: ['IA générative', 'Méthode'] }),
      entry('c', { tags: ['Méthode'] }),
    ];
    expect(tagsWithPages(list)).toEqual(['IA générative', 'Méthode']);
  });
  it('le seuil est paramétrable', () => {
    const list = [
      entry('a', { tags: ['X'] }),
      entry('b', { tags: ['X'] }),
      entry('c', { tags: ['X'] }),
    ];
    expect(tagsWithPages(list, 3)).toEqual(['X']);
    expect(tagsWithPages(list, 4)).toEqual([]);
  });
  it('un tag répété dans un même article ne compte qu’une fois', () => {
    expect(tagsWithPages([entry('a', { tags: ['X', 'X'] })])).toEqual([]);
  });
  it('échoue en citant les deux libellés quand deux tags donnent le même slug', () => {
    const list = [entry('a', { tags: ['IA générative'] }), entry('b', { tags: ['IA generative'] })];
    expect(() => tagsWithPages(list)).toThrow(/« IA générative » et « IA generative »/);
  });
});
