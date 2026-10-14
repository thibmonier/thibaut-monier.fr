// Règles de fraîcheur du JSON de métriques (V10). L'affichage (libellés, formats) est dans
// `live-stats.ts` et `LiveStats.astro` (lot 2) : un seul lecteur côté page.
export const STALE_AFTER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export const isoDay = (date: Date): string => date.toISOString().slice(0, 10);

export function isStale(fetchedAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - fetchedAt.getTime() > STALE_AFTER_DAYS * DAY_MS;
}
