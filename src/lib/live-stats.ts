// Métriques vivantes d'une fiche (US-021, affichage). Lecture tolérante de src/data/oss-metrics.json :
// le build ne peut jamais échouer à cause d'une métrique, chaque métrique manquante est masquée seule.
export interface LiveStatItem {
  id: string;
  label: string;
  value: string;
}

export interface LiveStats {
  asOf: string; // AAAA-MM-JJ
  items: LiveStatItem[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const count = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
const text = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;
const day = (value: unknown): Date | null => {
  const date = typeof value === 'string' ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' });
const numberFormat = new Intl.NumberFormat('fr-FR');
const formatNumber = (n: number): string => numberFormat.format(n).replace(/\u202f/g, ' ');

function collect(entry: Record<string, unknown>): LiveStatItem[] {
  const github = isRecord(entry.github) ? entry.github : {};
  const packagist = isRecord(entry.packagist) ? entry.packagist : {};
  const release = isRecord(github.latestRelease) ? github.latestRelease : {};
  const version = text(packagist.latestVersion) ?? text(release.tag)?.replace(/^v/, '') ?? null;
  const released = day(release.publishedAt);
  const stars = count(github.stars);
  const monthly = count(packagist.downloadsMonthly);
  const total = count(packagist.downloadsTotal);
  const items: (LiveStatItem | null)[] = [
    version ? { id: 'version', label: 'Dernière version', value: version } : null,
    released
      ? { id: 'release', label: 'Date de release', value: dateFormat.format(released) }
      : null,
    stars === null ? null : { id: 'stars', label: 'Étoiles GitHub', value: formatNumber(stars) },
    monthly === null
      ? null
      : {
          id: 'downloads-monthly',
          label: 'Téléchargements Packagist (mois)',
          value: formatNumber(monthly),
        },
    total === null
      ? null
      : {
          id: 'downloads-total',
          label: 'Téléchargements Packagist (total)',
          value: formatNumber(total),
        },
  ];
  return items.filter((item): item is LiveStatItem => item !== null);
}

export function getLiveStats(source: unknown, key: string): LiveStats | null {
  if (!isRecord(source) || !isRecord(source.entries)) return null;
  const entry = source.entries[key];
  if (!isRecord(entry)) return null;
  const fetchedAt = day(entry.fetchedAt);
  const items = collect(entry);
  return fetchedAt && items.length > 0
    ? { asOf: fetchedAt.toISOString().slice(0, 10), items }
    : null;
}
