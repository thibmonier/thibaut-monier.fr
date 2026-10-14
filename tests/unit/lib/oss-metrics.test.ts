import { describe, expect, it } from 'vitest';
import { STALE_AFTER_DAYS, getLiveStats, isStale, isoDay } from '../../../src/lib/oss-metrics.ts';

describe('isoDay', () => {
  it('formate la date du jour de la donnée en UTC (AAAA-MM-JJ)', () => {
    expect(isoDay(new Date('2026-10-14T23:59:59Z'))).toBe('2026-10-14');
  });
});

describe('isStale', () => {
  const fetchedAt = new Date('2026-10-01T00:00:00Z');

  it('est périmé au-delà de 7 jours', () => {
    expect(STALE_AFTER_DAYS).toBe(7);
    expect(isStale(fetchedAt, new Date('2026-10-08T00:00:01Z'))).toBe(true);
  });

  it('ne l’est pas à 7 jours pile', () => {
    expect(isStale(fetchedAt, new Date('2026-10-08T00:00:00Z'))).toBe(false);
  });
});

const source = {
  generatedAt: '2026-10-14T06:00:00Z',
  entries: {
    'thibmonier/sylius-x-plugin': {
      fetchedAt: '2026-10-14T06:00:00Z',
      github: {
        stars: 12,
        pushedAt: '2026-10-10T08:00:00Z',
        latestRelease: { tag: 'v1.1.0', publishedAt: '2026-10-11T17:38:27Z' },
      },
      packagist: { downloadsTotal: 1500, downloadsMonthly: 191, latestVersion: 'v1.1.0' },
    },
    'thibmonier/sylius-nopkg-plugin': {
      fetchedAt: '2026-10-13T06:00:00Z',
      github: { stars: 0, pushedAt: '2026-10-10T08:00:00Z', latestRelease: null },
    },
    'thibmonier/sylius-tagonly-plugin': {
      fetchedAt: '2026-10-13T06:00:00Z',
      github: {
        stars: 1,
        pushedAt: '2026-10-10T08:00:00Z',
        latestRelease: { tag: 'v2.0.0', publishedAt: '2026-10-09T08:00:00Z' },
      },
    },
    'thibmonier/tailsfadmin': {
      fetchedAt: '2026-10-14T06:00:00Z',
      github: {
        stars: 0,
        pushedAt: '2026-09-14T06:50:11Z',
        latestRelease: { tag: 'v1.6.1', publishedAt: '2026-09-13T18:44:00Z' },
      },
      packagist: { downloadsTotal: 230, downloadsMonthly: 46, latestVersion: 'v1.6.2' },
    },
    'thibmonier/sylius-bad-plugin': {
      fetchedAt: '2026-10-13T06:00:00Z',
      packagist: { downloadsMonthly: 'beaucoup', latestVersion: '2.0.0' },
    },
  },
};

const item = (key: string, id: string) =>
  getLiveStats(source, key)?.items.find((i) => i.id === id)?.value;

describe('getLiveStats', () => {
  it('présente version, release, étoiles et téléchargements avec libellés textuels', () => {
    const stats = getLiveStats(source, 'thibmonier/sylius-x-plugin');
    expect(stats?.asOf).toBe('2026-10-14');
    expect(stats?.items).toEqual([
      { id: 'version', label: 'Dernière version', value: 'v1.1.0' },
      { id: 'release', label: 'Date de release', value: '11 octobre 2026' },
      { id: 'stars', label: 'Étoiles GitHub', value: '12' },
      { id: 'downloads-monthly', label: 'Téléchargements Packagist (mois)', value: '191' },
      { id: 'downloads-total', label: 'Téléchargements Packagist (total)', value: '1 500' },
    ]);
  });

  it('n’affiche jamais la date d’une autre version que celle affichée (v1.6.2 vs release v1.6.1)', () => {
    expect(item('thibmonier/tailsfadmin', 'version')).toBe('v1.6.2');
    expect(item('thibmonier/tailsfadmin', 'release')).toBeUndefined();
  });

  it('masque la date quand la version vient de Packagist et que la release a un autre tag', () => {
    for (const key of Object.keys(source.entries)) {
      const stats = getLiveStats(source, key);
      const version = stats?.items.find((i) => i.id === 'version')?.value;
      const release = source.entries[key as keyof typeof source.entries] as {
        github?: { latestRelease: { tag: string } | null };
      };
      if (stats?.items.some((i) => i.id === 'release'))
        expect(release.github?.latestRelease?.tag).toBe(version);
    }
  });

  it('prend version et date du même tag GitHub sans Packagist', () => {
    expect(item('thibmonier/sylius-tagonly-plugin', 'version')).toBe('v2.0.0');
    expect(item('thibmonier/sylius-tagonly-plugin', 'release')).toBe('9 octobre 2026');
  });

  it('masque ce qui est absent', () => {
    expect(getLiveStats(source, 'thibmonier/sylius-nopkg-plugin')?.items.map((i) => i.id)).toEqual([
      'stars',
    ]);
  });

  it('renvoie null sans entrée, entrée invalide ou source exploitable, sans jamais lever', () => {
    expect(getLiveStats(source, 'thibmonier/absent')).toBeNull();
    expect(getLiveStats(source, 'thibmonier/sylius-bad-plugin')).toBeNull();
    expect(getLiveStats(null, 'a/b')).toBeNull();
    expect(getLiveStats({ entries: 3 }, 'a/b')).toBeNull();
    expect(getLiveStats({ entries: { 'a/b': { fetchedAt: 'nimportequoi' } } }, 'a/b')).toBeNull();
  });
});
