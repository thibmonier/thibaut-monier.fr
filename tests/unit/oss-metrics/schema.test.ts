import { describe, expect, it } from 'vitest';
import { ossMetricsSchema } from '../../../src/content/schemas/oss-metrics.ts';

const entry = {
  fetchedAt: '2026-10-14T06:00:00Z',
  github: {
    stars: 3,
    pushedAt: '2026-10-10T12:00:00Z',
    latestRelease: { tag: 'v1.2.0', publishedAt: '2026-10-01T09:00:00Z' },
  },
  packagist: { downloadsTotal: 230, downloadsMonthly: 46, latestVersion: 'v1.2.0' },
};

const file = (entries: Record<string, unknown>) => ({
  generatedAt: '2026-10-14T06:00:00Z',
  entries,
});

describe('ossMetricsSchema', () => {
  it('accepte un fichier vide (squelette)', () => {
    expect(ossMetricsSchema.safeParse(file({})).success).toBe(true);
  });

  it('accepte une entrée complète et convertit les dates', () => {
    const parsed = ossMetricsSchema.parse(file({ 'thibmonier/tailsfadmin': entry }));
    expect(parsed.entries['thibmonier/tailsfadmin']?.fetchedAt).toBeInstanceOf(Date);
  });

  it('accepte une entrée sans packagist (plugin non publié) et une release nulle', () => {
    const { packagist: _packagist, ...github } = entry;
    const withoutRelease = { ...github, github: { ...entry.github, latestRelease: null } };
    expect(ossMetricsSchema.safeParse(file({ 'a/b': withoutRelease })).success).toBe(true);
  });

  it('refuse une clé qui n’est pas « owner/repo »', () => {
    expect(ossMetricsSchema.safeParse(file({ tailsfadmin: entry })).success).toBe(false);
  });

  it('refuse un nombre négatif ou décimal', () => {
    const bad = { ...entry, github: { ...entry.github, stars: -1 } };
    expect(ossMetricsSchema.safeParse(file({ 'a/b': bad })).success).toBe(false);
    const decimal = { ...entry, packagist: { ...entry.packagist, downloadsTotal: 1.5 } };
    expect(ossMetricsSchema.safeParse(file({ 'a/b': decimal })).success).toBe(false);
  });

  it('refuse un champ inconnu (schéma strict)', () => {
    expect(ossMetricsSchema.safeParse({ ...file({}), extra: 1 }).success).toBe(false);
    expect(ossMetricsSchema.safeParse(file({ 'a/b': { ...entry, stale: true } })).success).toBe(
      false,
    );
  });

  it('exige generatedAt et fetchedAt', () => {
    expect(ossMetricsSchema.safeParse({ entries: {} }).success).toBe(false);
    const { fetchedAt: _fetchedAt, ...noDate } = entry;
    expect(ossMetricsSchema.safeParse(file({ 'a/b': noDate })).success).toBe(false);
  });
});
