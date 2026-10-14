import { describe, expect, it } from 'vitest';
import { countWords } from '../../../src/lib/text.ts';

describe('countWords', () => {
  it('compte les mots séparés par des espaces', () => {
    expect(countWords('un deux trois')).toBe(3);
  });

  it("compte une élision comme un seul mot (l'IA)", () => {
    expect(countWords("mets l'IA au service")).toBe(4);
  });

  it('ignore les ponctuations isolées et les espaces insécables', () => {
    expect(countWords('Directeur technique : je pilote')).toBe(4);
    expect(countWords('un — deux')).toBe(2);
  });

  it('renvoie 0 pour un texte vide ou blanc', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('  \n ')).toBe(0);
  });

  it('compte les nombres comme des mots', () => {
    expect(countWords('25 ans')).toBe(2);
  });
});
