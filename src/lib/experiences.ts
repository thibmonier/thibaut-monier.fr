// Frise du parcours (US-005) : tri, fenêtre des 10 dernières années (règle V7) et format de période.

export interface ExperienceLike {
  id: string;
  start: string; // AAAA-MM
  end: string | null; // null = poste en cours
  featured: boolean;
  order?: number | undefined;
}

const WINDOW_YEARS = 10;
const OPEN_ENDED = '9999-12';

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

// Du plus récent au plus ancien : poste en cours, fin décroissante, début décroissant, puis `order` croissant.
function compare(a: ExperienceLike, b: ExperienceLike): number {
  return (
    (b.end ?? OPEN_ENDED).localeCompare(a.end ?? OPEN_ENDED) ||
    b.start.localeCompare(a.start) ||
    (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
  );
}

export function sortExperiences<T extends ExperienceLike>(items: readonly T[]): T[] {
  return [...items].sort(compare);
}

// Année limite : une expérience terminée strictement après elle est dans la fenêtre des 10 dernières années.
export function recentThreshold(now: Date): number {
  return now.getUTCFullYear() - WINDOW_YEARS;
}

const isRecent = (item: ExperienceLike, now: Date): boolean =>
  item.end === null || Number(item.end.slice(0, 4)) > recentThreshold(now);

export function splitFeatured<T extends ExperienceLike>(
  items: readonly T[],
): { featured: T[]; earlier: T[] } {
  const sorted = sortExperiences(items);
  return {
    featured: sorted.filter((item) => item.featured),
    earlier: sorted.filter((item) => !item.featured),
  };
}

// Règle V7 : toute expérience de la fenêtre des 10 ans doit être `featured`.
export function findRecentNotFeatured<T extends ExperienceLike>(
  items: readonly T[],
  now: Date,
): T[] {
  return items.filter((item) => isRecent(item, now) && !item.featured);
}

function monthYear(value: string): string {
  const [year, month] = value.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatPeriod(start: string, end: string | null): string {
  return `${monthYear(start)} – ${end === null ? 'aujourd’hui' : monthYear(end)}`;
}
