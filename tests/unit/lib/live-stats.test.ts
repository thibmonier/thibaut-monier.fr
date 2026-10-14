import { describe, expect, it } from 'vitest';
import { getLiveStats } from '../../../src/lib/live-stats.ts';

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
      packagist: { downloadsTotal: 1500, downloadsMonthly: 191, latestVersion: '1.1.0' },
    },
    'thibmonier/sylius-nopkg-plugin': {
      fetchedAt: '2026-10-13T06:00:00Z',
      github: { stars: 0, pushedAt: '2026-10-10T08:00:00Z', latestRelease: null },
    },
    'thibmonier/sylius-bad-plugin': {
      fetchedAt: '2026-10-13T06:00:00Z',
      packagist: { downloadsMonthly: 'beaucoup', latestVersion: '2.0.0' },
    },
  },
};

const labels = (key: string, src: unknown = source) =>
  getLiveStats(src, key)?.items.map((i) => i.label);

describe('getLiveStats', () => {
  it('présente version, release, étoiles et téléchargements avec libellés textuels', () => {
    const stats = getLiveStats(source, 'thibmonier/sylius-x-plugin');
    expect(stats?.asOf).toBe('2026-10-14');
    expect(stats?.items).toEqual([
      { id: 'version', label: 'Dernière version', value: '1.1.0' },
      { id: 'release', label: 'Date de release', value: '11 octobre 2026' },
      { id: 'stars', label: 'Étoiles GitHub', value: '12' },
      { id: 'downloads-monthly', label: 'Téléchargements Packagist (mois)', value: '191' },
      { id: 'downloads-total', label: 'Téléchargements Packagist (total)', value: '1 500' },
    ]);
  });

  it('masque métrique par métrique', () => {
    expect(labels('thibmonier/sylius-nopkg-plugin')).toEqual(['Étoiles GitHub']);
    expect(labels('thibmonier/sylius-bad-plugin')).toEqual(['Dernière version']);
  });

  it('renvoie null sans entrée ni source exploitable, sans jamais lever', () => {
    expect(getLiveStats(source, 'thibmonier/absent')).toBeNull();
    expect(getLiveStats(null, 'a/b')).toBeNull();
    expect(getLiveStats({ entries: 3 }, 'a/b')).toBeNull();
    expect(getLiveStats({ entries: { 'a/b': { fetchedAt: 'nimportequoi' } } }, 'a/b')).toBeNull();
  });
});
