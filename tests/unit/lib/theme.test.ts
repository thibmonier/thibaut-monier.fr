import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { resolveTheme, toggleTheme } from '../../../src/lib/theme.ts';

describe('resolveTheme', () => {
  it('privilégie le choix mémorisé', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('suit la préférence système sans choix valide', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(undefined, false)).toBe('light');
    expect(resolveTheme('violet', true)).toBe('dark');
  });
});

describe('toggleTheme', () => {
  it('bascule entre les deux thèmes', () => {
    expect(toggleTheme('light')).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
  });
});

// Le script public/theme-init.js est du JavaScript brut chargé avant le rendu : on l'exécute dans un bac à sable.
describe('public/theme-init.js', () => {
  const source = readFileSync(
    resolve(import.meta.dirname, '../../../public/theme-init.js'),
    'utf8',
  );

  function run(options: { stored?: string; storageThrows?: boolean }) {
    const attributes: Record<string, string> = {};
    const classes = new Set<string>();
    const sandbox = {
      document: {
        documentElement: {
          setAttribute: (k: string, v: string) => (attributes[k] = v),
          classList: { add: (c: string) => classes.add(c) },
        },
      },
      localStorage: {
        getItem: () => {
          if (options.storageThrows) throw new Error('SecurityError');
          return options.stored ?? null;
        },
      },
    };
    runInNewContext(source, sandbox);
    return { attributes, classes };
  }

  it('pose la classe js et le thème mémorisé', () => {
    const { attributes, classes } = run({ stored: 'dark' });
    expect(classes.has('js')).toBe(true);
    expect(attributes['data-theme']).toBe('dark');
  });

  it('laisse la préférence système décider sans choix mémorisé', () => {
    expect(run({}).attributes['data-theme']).toBeUndefined();
    expect(run({ stored: 'violet' }).attributes['data-theme']).toBeUndefined();
  });

  it('ne casse pas si localStorage est indisponible', () => {
    const { classes, attributes } = run({ storageThrows: true });
    expect(classes.has('js')).toBe(true);
    expect(attributes['data-theme']).toBeUndefined();
  });

  it('pèse moins de 1 Ko', () => {
    expect(Buffer.byteLength(source)).toBeLessThan(1024);
  });
});
