import { describe, expect, it } from 'vitest';
import { buildSoftwareSourceCode } from '../../../../src/lib/jsonld/software-source-code.ts';

const SITE = 'https://thibaut-monier.fr';
const input = {
  name: 'Factur-X Sylius',
  description: 'Factures électroniques Factur-X pour Sylius 2.',
  path: '/open-source/sylius/factur-x/',
  repoUrl: 'https://github.com/thibmonier/factur-x',
  license: 'MIT',
};

describe('buildSoftwareSourceCode', () => {
  it('décrit le dépôt, la licence et le langage', () => {
    expect(buildSoftwareSourceCode(input, SITE)).toEqual({
      '@type': 'SoftwareSourceCode',
      name: 'Factur-X Sylius',
      description: 'Factures électroniques Factur-X pour Sylius 2.',
      url: 'https://thibaut-monier.fr/open-source/sylius/factur-x/',
      codeRepository: 'https://github.com/thibmonier/factur-x',
      license: 'https://spdx.org/licenses/MIT',
      programmingLanguage: 'PHP',
    });
  });

  it('ajoute la version seulement si elle est connue', () => {
    expect(buildSoftwareSourceCode({ ...input, version: '1.2.0' }, SITE)['version']).toBe('1.2.0');
    expect(buildSoftwareSourceCode(input, SITE)).not.toHaveProperty('version');
  });
});
