import { describe, expect, it } from 'vitest';
import {
  assertScores,
  median,
  medianScores,
} from '../../../scripts/checks/lib/lighthouse-assert.ts';

describe('median', () => {
  it('retient la médiane de 3 exécutions', () => {
    expect(median([0.9, 1, 0.97])).toBe(0.97);
  });
  it('gère un nombre pair', () => {
    expect(median([0.9, 1])).toBeCloseTo(0.95);
  });
});

describe('medianScores', () => {
  it('calcule la médiane par axe', () => {
    const runs = [
      { performance: 1, accessibility: 0.9, 'best-practices': 1, seo: 1 },
      { performance: 0.9, accessibility: 0.92, 'best-practices': 1, seo: 1 },
      { performance: 0.98, accessibility: 1, 'best-practices': 0.95, seo: 1 },
    ];
    expect(medianScores(runs)).toEqual({
      performance: 0.98,
      accessibility: 0.92,
      'best-practices': 1,
      seo: 1,
    });
  });
});

describe('assertScores', () => {
  it('passe quand les 4 axes sont ≥ 0.95', () => {
    expect(
      assertScores({ performance: 1, accessibility: 0.95, 'best-practices': 1, seo: 1 }, 0.95),
    ).toEqual([]);
  });
  it('renvoie le message exact par axe', () => {
    const errors = assertScores(
      { performance: 1, accessibility: 0.92, 'best-practices': 1, seo: 0.9 },
      0.95,
    );
    expect(errors).toEqual(['Accessibility score 0.92 < 0.95', 'SEO score 0.90 < 0.95']);
  });
  it('nomme Performance et Best Practices', () => {
    const errors = assertScores(
      { performance: 0.5, accessibility: 1, 'best-practices': 0.8, seo: 1 },
      0.95,
    );
    expect(errors).toEqual(['Performance score 0.50 < 0.95', 'Best Practices score 0.80 < 0.95']);
  });
});
