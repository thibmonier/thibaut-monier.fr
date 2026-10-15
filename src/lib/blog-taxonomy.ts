import {
  pagePath,
  seriesNeighbors,
  slugify,
  sortByDateDesc,
  tagsWithPages,
  type BlogEntry,
} from './blog.ts';

// Taxonomies du blog (US-011) : fonctions pures sur les entrées publiées, sans `astro:content`.
// Elles s'appuient sur `slugify`, `tagsWithPages`, `seriesNeighbors` et `pagePath` de `blog.ts` (aucun second slugify).

/** Une page de catégorie, de tag ou de série n'est pas paginée : au-delà, le build échoue plutôt que de tronquer. */
export const MAX_TAXONOMY_ARTICLES = 24;

export interface Facet {
  name: string;
  slug: string;
  count: number;
}

const byName = (a: Facet, b: Facet): number => a.name.localeCompare(b.name, 'fr');

function countBy(entries: BlogEntry[], names: (entry: BlogEntry) => string[]): Facet[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const name of new Set(names(entry))) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => ({ name, slug: slugify(name), count })).sort(byName);
}

/** Catégories ayant au moins un article publié, par ordre alphabétique français. */
export function categories(entries: BlogEntry[]): Facet[] {
  return countBy(entries, (entry) => [entry.data.category]);
}

export function seriesList(entries: BlogEntry[]): Facet[] {
  return countBy(entries, (entry) => (entry.data.series === undefined ? [] : [entry.data.series]));
}

/** Tags à 2 articles ou plus : les autres restent du texte non lié (E7). */
export function tagPages(entries: BlogEntry[]): { label: string; slug: string; count: number }[] {
  return tagsWithPages(entries).map((label) => {
    const slug = slugify(label);
    const count = entries.filter((entry) => entry.data.tags.some((tag) => slugify(tag) === slug));
    return { label, slug, count: count.length };
  });
}

/** « Méthode (5 articles) », « Outils (1 article) ». */
export function categoryTitle(name: string, count: number): string {
  return `${name} (${count} ${count > 1 ? 'articles' : 'article'})`;
}

function assertSize(name: string, entries: BlogEntry[]): BlogEntry[] {
  if (entries.length > MAX_TAXONOMY_ARTICLES) {
    throw new Error(
      `pagination de taxonomie non prévue : « ${name} » compte ${entries.length} articles (maximum ${MAX_TAXONOMY_ARTICLES})`,
    );
  }
  return entries;
}

export function articlesOfCategory(entries: BlogEntry[], slug: string): BlogEntry[] {
  const found = entries.filter((entry) => slugify(entry.data.category) === slug);
  return assertSize(slug, sortByDateDesc(found));
}

export function articlesOfTag(entries: BlogEntry[], slug: string): BlogEntry[] {
  const found = entries.filter((entry) => entry.data.tags.some((tag) => slugify(tag) === slug));
  return assertSize(slug, sortByDateDesc(found));
}

/** Articles d'une série dans l'ordre de lecture (`seriesOrder`). */
export function articlesOfSeries(entries: BlogEntry[], slug: string): BlogEntry[] {
  const found = entries
    .filter((entry) => entry.data.series !== undefined && slugify(entry.data.series) === slug)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
  return assertSize(slug, found);
}

export interface SeriesPosition {
  name: string;
  slug: string;
  /** Rang dans la série, à partir de 1. */
  position: number;
  total: number;
  previous?: BlogEntry;
  next?: BlogEntry;
}

export function seriesPosition(entries: BlogEntry[], slug: string): SeriesPosition | null {
  const neighbors = seriesNeighbors(entries, slug);
  if (neighbors === null) return null;
  const result: SeriesPosition = {
    name: neighbors.name,
    slug: slugify(neighbors.name),
    position: neighbors.index + 1,
    total: neighbors.total,
  };
  if (neighbors.previous) result.previous = neighbors.previous;
  if (neighbors.next) result.next = neighbors.next;
  return result;
}

export interface PaginationItems {
  label: string;
  previous?: string;
  next?: string;
  pages: { number: number; href: string; current: boolean }[];
}

export function paginationItems(page: number, total: number): PaginationItems {
  const result: PaginationItems = {
    label: `Page ${page} sur ${total}`,
    pages: Array.from({ length: total }, (_, index) => ({
      number: index + 1,
      href: pagePath(index + 1),
      current: index + 1 === page,
    })),
  };
  if (page > 1) result.previous = pagePath(page - 1);
  if (page < total) result.next = pagePath(page + 1);
  return result;
}
