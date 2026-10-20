import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from '../../../src/lib/contrast.ts';
import { tokensSchema } from '../../../src/content/schemas/tokens.ts';
import tokensJson from '../../../src/data/tokens.json' with { type: 'json' };

const tokens = tokensSchema.parse(tokensJson);

describe('contrastRatio', () => {
  it('vaut 21 pour noir sur blanc et 1 pour une couleur identique', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('est symétrique', () => {
    expect(contrastRatio('#1d4ed8', '#ffffff')).toBeCloseTo(
      contrastRatio('#ffffff', '#1d4ed8'),
      10,
    );
  });

  it('accepte les notations courtes et les majuscules', () => {
    expect(contrastRatio('#FFF', '#000')).toBeCloseTo(21, 5);
  });

  it('calcule la luminance relative', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBe(0);
  });

  it('rejette une couleur invalide', () => {
    expect(() => contrastRatio('rouge', '#fff')).toThrow(/couleur/i);
  });
});

// Paires [premier plan, arrière-plan, ratio minimal] : texte 4,5:1 ; composants d'interface 3:1.
const PAIRS: ReadonlyArray<[string, string, number]> = [
  ['fg', 'bg', 4.5],
  ['fg', 'surface', 4.5],
  ['fg', 'card', 4.5],
  ['muted', 'bg', 4.5],
  ['muted', 'surface', 4.5],
  ['muted', 'card', 4.5],
  ['accent', 'bg', 4.5],
  ['accent', 'surface', 4.5],
  ['accent', 'card', 4.5],
  // Bouton principal : texte sur fond inversé (fond = couleur du texte, texte = couleur du fond).
  ['bg', 'fg', 4.5],
  ['accent-fg', 'accent', 4.5],
  ['focus', 'bg', 3],
  ['focus', 'surface', 3],
  ['line', 'bg', 3],
];

describe.each(['light', 'dark'] as const)('contrastes WCAG 2.2 AA, thème %s', (theme) => {
  it.each(PAIRS)('%s sur %s ≥ %s:1', (foreground, background, minimum) => {
    const fg = tokens.color[foreground]?.[theme];
    const bg = tokens.color[background]?.[theme];
    expect(fg, `couleur « ${foreground} » absente de tokens.json`).toBeDefined();
    expect(bg, `couleur « ${background} » absente de tokens.json`).toBeDefined();
    expect(contrastRatio(fg as string, bg as string)).toBeGreaterThanOrEqual(minimum);
  });
});
