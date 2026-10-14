import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { tokensSchema } from '../../../src/content/schemas/tokens.ts';
import { renderTokensCss } from '../../../src/lib/tokens-css.ts';
import tokensJson from '../../../src/data/tokens.json' with { type: 'json' };

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('tokensSchema', () => {
  it('valide src/data/tokens.json', () => {
    expect(() => tokensSchema.parse(tokensJson)).not.toThrow();
  });

  it('fournit une valeur claire et une valeur sombre pour chaque couleur', () => {
    const { color } = tokensSchema.parse(tokensJson);
    expect(Object.keys(color).length).toBeGreaterThanOrEqual(8);
    for (const value of Object.values(color)) {
      expect(value.light).toMatch(/^#[0-9a-f]{6}$/i);
      expect(value.dark).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('rejette une couleur sans variante sombre et une clé inconnue', () => {
    const base = { font: { sans: 'a', mono: 'b' }, space: { '1': '0.25rem' } };
    expect(() => tokensSchema.parse({ ...base, color: { bg: { light: '#ffffff' } } })).toThrow();
    expect(() => tokensSchema.parse({ ...base, color: {}, extra: 1 })).toThrow();
  });
});

describe('renderTokensCss', () => {
  const tokens = tokensSchema.parse(tokensJson);
  const css = renderTokensCss(tokens);

  it('déclare le thème clair par défaut puis le sombre (préférence système et [data-theme])', () => {
    expect(css).toMatch(/:root\s*{[^}]*--c-bg:\s*#/);
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(":root:not([data-theme='light'])");
    expect(css).toContain(":root[data-theme='dark']");
  });

  it('expose chaque jeton comme variable et comme jeton Tailwind', () => {
    for (const name of Object.keys(tokens.color)) {
      expect(css).toContain(`--c-${name}:`);
      expect(css).toContain(`--color-${name}: var(--c-${name})`);
    }
    for (const name of Object.keys(tokens.space)) {
      expect(css).toContain(`--spacing-${name}: ${tokens.space[name]}`);
    }
  });
});

describe('parité tokens.json / feuilles de style', () => {
  it('src/styles/tokens.css est à jour (régénérer avec « npm run tokens »)', () => {
    const expected = renderTokensCss(tokensSchema.parse(tokensJson));
    expect(read('src/styles/tokens.css')).toBe(expected);
  });

  it('global.css importe tokens.css et déclare les polices des jetons', () => {
    const globalCss = read('src/styles/global.css');
    const { font } = tokensSchema.parse(tokensJson);
    expect(globalCss).toContain("@import './tokens.css'");
    for (const stack of Object.values(font)) {
      const family = stack.split(',')[0]?.trim().replace(/['"]/g, '') as string;
      expect(globalCss).toContain(`font-family: '${family}'`);
    }
  });

  it("n'utilise que des polices WOFF2 auto-hébergées de moins de 100 Ko, en font-display swap", () => {
    const globalCss = read('src/styles/global.css');
    const urls = [...globalCss.matchAll(/url\('(\/fonts\/[^']+\.woff2)'\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThanOrEqual(2);
    for (const url of urls) {
      expect(readFileSync(resolve(root, 'public', (url as string).slice(1))).length).toBeLessThan(
        100 * 1024,
      );
    }
    expect(globalCss).not.toMatch(/https?:\/\//);
    expect((globalCss.match(/font-display:\s*swap/g) ?? []).length).toBe(urls.length);
  });
});
