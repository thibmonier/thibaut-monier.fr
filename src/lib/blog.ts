import type { BlogData } from '../content/schemas/blog.ts';
import { countWords } from './text.ts';

// Contrat C3 : fonctions pures du blog (aucun import d'`astro:content`, donc testables).
// `getPublishedPosts` (lib/blog-source.ts) est le seul module à lire la collection.

export interface BlogEntry {
  /** Identifiant d'entrée de la collection : `fr/<slug>`. */
  id: string;
  data: BlogData;
  body?: string | undefined;
}

export const WORDS_PER_MINUTE = 230;
export const PAGE_SIZE = 12;
export const MIN_TAG_ARTICLES = 2;

/** `'fr/la-spec'` devient `'la-spec'` : le seul convertisseur d'identifiant. */
export function slugOf(id: string): string {
  return id.slice(id.indexOf('/') + 1);
}

/** Publié = pas un brouillon et daté au plus tard de l'instant du build (minuit UTC pour une date sans heure). */
export function isPublished(data: Pick<BlogData, 'draft' | 'pubDate'>, now: Date): boolean {
  return !data.draft && data.pubDate.getTime() <= now.getTime();
}

/** Plus récent d'abord ; l'égalité est départagée par slug pour un ordre stable. */
export function sortByDateDesc<T extends BlogEntry>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) =>
      b.data.pubDate.getTime() - a.data.pubDate.getTime() ||
      slugOf(a.id).localeCompare(slugOf(b.id)),
  );
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.ceil(countWords(body) / WORDS_PER_MINUTE));
}

/** Accents retirés, séparateurs repliés : « L'agence digitale augmentée » -> `l-agence-digitale-augmentee`. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const postPath = (slug: string): string => `/blog/${slug}/`;
export const categoryPath = (slug: string): string => `/blog/categorie/${slug}/`;
export const tagPath = (slug: string): string => `/blog/tag/${slug}/`;
export const seriesPath = (slug: string): string => `/blog/serie/${slug}/`;
/** La page 1 de la liste est `/blog/` ; `/blog/page/1/` n'existe pas. */
export const pagePath = (n: number): string => (n <= 1 ? '/blog/' : `/blog/page/${n}/`);

export interface Page<T> {
  items: T[];
  page: number;
  pages: number;
}

/** `null` hors des bornes. Une liste vide reste une page 1 vide. */
export function paginate<T>(items: T[], page: number, size = PAGE_SIZE): Page<T> | null {
  const pages = Math.max(1, Math.ceil(items.length / size));
  if (!Number.isInteger(page) || page < 1 || page > pages) return null;
  return { items: items.slice((page - 1) * size, page * size), page, pages };
}

export interface SeriesNeighbors {
  name: string;
  /** Position dans la série, à partir de 0. */
  index: number;
  total: number;
  previous?: BlogEntry;
  next?: BlogEntry;
}

/** Voisins d'un article dans sa série, par `seriesOrder` ; `null` hors série ou slug inconnu. */
export function seriesNeighbors(entries: BlogEntry[], slug: string): SeriesNeighbors | null {
  const current = entries.find((entry) => slugOf(entry.id) === slug);
  const name = current?.data.series;
  if (!current || name === undefined) return null;
  const members = entries
    .filter((entry) => entry.data.series === name)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
  const index = members.indexOf(current);
  const result: SeriesNeighbors = { name, index, total: members.length };
  const previous = members[index - 1];
  const next = members[index + 1];
  if (previous) result.previous = previous;
  if (next) result.next = next;
  return result;
}

/** Libellés des tags portés par `min` articles ou plus (les autres restent du texte non lié, E7), triés par slug. */
export function tagsWithPages(entries: BlogEntry[], min = MIN_TAG_ARTICLES): string[] {
  const labels = new Map<string, string>(); // slug -> libellé
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const slug of new Set(entry.data.tags.map(slugify)))
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    for (const label of entry.data.tags) {
      const slug = slugify(label);
      const known = labels.get(slug);
      if (known !== undefined && known !== label) {
        throw new Error(
          `Collision de tags : « ${known} » et « ${label} » donnent le même slug « ${slug} »`,
        );
      }
      labels.set(slug, label);
    }
  }
  return [...counts]
    .filter(([, count]) => count >= min)
    .map(([slug]) => labels.get(slug) as string)
    .sort((a, b) => slugify(a).localeCompare(slugify(b)));
}
