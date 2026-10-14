import { describe, expect, it } from 'vitest';
import {
  findRecentNotFeatured,
  formatPeriod,
  recentThreshold,
  sortExperiences,
  splitFeatured,
  type ExperienceLike,
} from '../../../src/lib/experiences.ts';

const make = (id: string, start: string, end: string | null, extra = {}): ExperienceLike => ({
  id,
  start,
  end,
  featured: true,
  ...extra,
});

const now = new Date('2026-10-14T00:00:00Z');

describe('sortExperiences', () => {
  it('place le poste en cours d’abord puis ordre décroissant de fin', () => {
    const list = [
      make('a', '2010-01', '2013-12'),
      make('b', '2025-12', null),
      make('c', '2019-01', '2019-09'),
    ];
    expect(sortExperiences(list).map((e) => e.id)).toEqual(['b', 'c', 'a']);
  });

  it('départage deux fins identiques par début décroissant puis par order croissant', () => {
    const list = [
      make('court', '2018-01', '2019-01'),
      make('long', '2015-01', '2019-01'),
      make('o2', '2017-01', '2019-01', { order: 2 }),
      make('o1', '2017-01', '2019-01', { order: 1 }),
    ];
    expect(sortExperiences(list).map((e) => e.id)).toEqual(['court', 'o1', 'o2', 'long']);
  });

  it('ne modifie pas le tableau d’origine', () => {
    const list = [make('a', '2010-01', '2011-01'), make('b', '2012-01', '2013-01')];
    sortExperiences(list);
    expect(list.map((e) => e.id)).toEqual(['a', 'b']);
  });
});

describe('recentThreshold', () => {
  it('vaut l’année courante moins 10', () => {
    expect(recentThreshold(now)).toBe(2016);
  });
});

describe('splitFeatured et règle des 10 ans (V7)', () => {
  const list = [
    make('en-cours', '2025-12', null),
    make('recent', '2019-01', '2019-09'),
    make('ancien', '2007-09', '2016-12', { featured: false }),
  ];

  it('sépare les expériences détaillées de celles de « Avant 2016 »', () => {
    const { featured, earlier } = splitFeatured(list);
    expect(featured.map((e) => e.id)).toEqual(['en-cours', 'recent']);
    expect(earlier.map((e) => e.id)).toEqual(['ancien']);
  });

  it('signale une expérience terminée après année-10 non featured', () => {
    expect(findRecentNotFeatured(list, now)).toEqual([]);
    const bad = [...list, make('oublie', '2018-01', '2020-01', { featured: false })];
    expect(findRecentNotFeatured(bad, now).map((e) => e.id)).toEqual(['oublie']);
  });

  it('traite un poste en cours non featured comme une violation', () => {
    const bad = [make('encours', '2025-01', null, { featured: false })];
    expect(findRecentNotFeatured(bad, now)).toHaveLength(1);
  });

  it('accepte une expérience terminée exactement en année-10', () => {
    expect(
      findRecentNotFeatured([make('limite', '2010-01', '2016-12', { featured: false })], now),
    ).toEqual([]);
  });
});

describe('formatPeriod', () => {
  it('formate une période terminée en français', () => {
    expect(formatPeriod('2019-03', '2023-06')).toBe('mars 2019 – juin 2023');
  });

  it('formate un poste en cours', () => {
    expect(formatPeriod('2025-12', null)).toBe('décembre 2025 – aujourd’hui');
  });

  it.each([
    ['2020-01', 'janvier 2020'],
    ['2020-02', 'février 2020'],
    ['2020-08', 'août 2020'],
    ['2020-12', 'décembre 2020'],
  ])('nomme le mois de %s', (start, expected) => {
    expect(formatPeriod(start, null).startsWith(expected)).toBe(true);
  });
});
