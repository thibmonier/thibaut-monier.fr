import { ossMetricSchema, type OssMetric } from '../content/schemas/oss-metrics.ts';

export const STALE_AFTER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export const isoDay = (date: Date): string => date.toISOString().slice(0, 10);

export function isStale(fetchedAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - fetchedAt.getTime() > STALE_AFTER_DAYS * DAY_MS;
}

export interface LiveStatItem {
  id: string;
  label: string;
  value: string;
}

export interface LiveStats {
  asOf: string; // AAAA-MM-JJ
  items: LiveStatItem[];
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' });
const numberFormat = new Intl.NumberFormat('fr-FR');
const formatNumber = (n: number): string => numberFormat.format(n).replace(/\u202f/g, ' ');
const bare = (version: string): string => version.replace(/^v/, '');

function versionStats({ github, packagist }: OssMetric): LiveStatItem[] {
  const release = github?.latestRelease ?? null;
  const version = packagist?.latestVersion ?? release?.tag ?? null;
  const items: LiveStatItem[] = [];
  if (version) items.push({ id: 'version', label: 'Dernière version', value: `v${bare(version)}` });
  // La date n'est celle de la version affichée que si la release GitHub porte ce tag.
  if (release && version && bare(release.tag) === bare(version))
    items.push({
      id: 'release',
      label: 'Date de release',
      value: dateFormat.format(release.publishedAt),
    });
  return items;
}

function countStats({ github, packagist }: OssMetric): LiveStatItem[] {
  const counts: [string, string, number | undefined][] = [
    ['stars', 'Étoiles GitHub', github?.stars],
    ['downloads-monthly', 'Téléchargements Packagist (mois)', packagist?.downloadsMonthly],
    ['downloads-total', 'Téléchargements Packagist (total)', packagist?.downloadsTotal],
  ];
  return counts.flatMap(([id, label, n]) =>
    n === undefined ? [] : [{ id, label, value: formatNumber(n) }],
  );
}

/** Lit une entrée du format oss-metrics (schéma partagé avec la collecte) ; null si absente ou invalide. */
export function getLiveStats(source: unknown, key: string): LiveStats | null {
  const entries = (source as { entries?: Record<string, unknown> } | null)?.entries;
  if (typeof entries !== 'object' || entries === null || !Object.hasOwn(entries, key)) return null;
  const parsed = ossMetricSchema.safeParse(entries[key]);
  if (!parsed.success) return null;
  const items = [...versionStats(parsed.data), ...countStats(parsed.data)];
  return items.length > 0 ? { asOf: isoDay(parsed.data.fetchedAt), items } : null;
}
