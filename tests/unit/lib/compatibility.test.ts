import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from '../../../scripts/checks/lib/plugins.ts';
import { findCompatibilityErrors, type MatrixRow } from '../../../src/lib/compatibility.ts';

const row = (sylius: string, php: string, symfony: string[]): MatrixRow => ({
  sylius,
  php,
  symfony,
});
const S8 = '8.0 (PHP 8.4 requis)';

describe('findCompatibilityErrors', () => {
  it('accepte la matrice cohérente 2.2 / 2.3', () => {
    expect(
      findCompatibilityErrors([
        row('2.2.9+', '>=8.2', ['6.4', '7.4']),
        row('2.3', '>=8.3', ['6.4', '7.4', S8]),
      ]),
    ).toEqual([]);
  });

  it('refuse Symfony 8 sur Sylius 2.2', () => {
    expect(findCompatibilityErrors([row('2.2', '>=8.2', ['6.4', '7.4', S8])])).toEqual([
      'Sylius 2.2 : Symfony 8 exige Sylius 2.3',
    ]);
  });

  it('refuse Sylius 2.3 avec PHP 8.2', () => {
    expect(findCompatibilityErrors([row('2.3', '>=8.2', ['7.4'])])).toEqual([
      'Sylius 2.3 : PHP >=8.3 exigé (>=8.2 déclaré)',
    ]);
  });

  it('refuse une ligne « 2.2 et 2.3 » qui mélange deux jeux de contraintes', () => {
    expect(findCompatibilityErrors([row('2.2 et 2.3', '>=8.2', ['6.4', '7.4', S8])])).toContain(
      'Sylius « 2.2 et 2.3 » : une ligne par version mineure',
    );
  });

  it('refuse PHP 8.1 sur Sylius 2.2 et une version Sylius inconnue', () => {
    expect(findCompatibilityErrors([row('2.2', '>=8.1', ['7.4'])])).toEqual([
      'Sylius 2.2 : PHP >=8.2 exigé (>=8.1 déclaré)',
    ]);
    expect(findCompatibilityErrors([row('2.1', '>=8.2', ['7.4'])])).toEqual([
      'Sylius « 2.1 » : version non prise en charge (2.2 ou 2.3)',
    ]);
  });

  it('exige la mention PHP 8.4 devant Symfony 8', () => {
    expect(findCompatibilityErrors([row('2.3', '>=8.3', ['7.4', '8.0'])])).toEqual([
      'Sylius 2.3 : Symfony 8.0 sans mention « PHP 8.4 requis »',
    ]);
  });
});

describe('fiches réelles', () => {
  it('aucune des fiches ne déclare de combinaison incohérente', async () => {
    const dir = 'src/content/plugins/fr';
    const names = (await readdir(dir)).filter((n) => n.endsWith('.mdx'));
    expect(names.length).toBe(24);
    for (const name of names) {
      const { data } = parseFrontmatter(await readFile(`${dir}/${name}`, 'utf8'));
      // Un plugin en conception (customer-asset-management) n'a pas de matrice de compatibilité.
      const matrix =
        (data as { compatibility?: { matrix: MatrixRow[] } }).compatibility?.matrix ?? [];
      expect({ name, errors: findCompatibilityErrors(matrix) }).toEqual({ name, errors: [] });
    }
  });
});
