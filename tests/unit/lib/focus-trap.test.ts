import { describe, expect, it } from 'vitest';
import { nextFocusIndex } from '../../../src/lib/focus-trap.ts';

describe('nextFocusIndex', () => {
  it('avance et reboucle sur le premier élément', () => {
    expect(nextFocusIndex(0, 3, false)).toBe(1);
    expect(nextFocusIndex(2, 3, false)).toBe(0);
  });

  it('recule et reboucle sur le dernier élément', () => {
    expect(nextFocusIndex(1, 3, true)).toBe(0);
    expect(nextFocusIndex(0, 3, true)).toBe(2);
  });

  it('repart du début ou de la fin quand le focus est hors du piège', () => {
    expect(nextFocusIndex(-1, 3, false)).toBe(0);
    expect(nextFocusIndex(-1, 3, true)).toBe(2);
  });

  it('retourne -1 sans élément focalisable', () => {
    expect(nextFocusIndex(-1, 0, false)).toBe(-1);
  });
});
