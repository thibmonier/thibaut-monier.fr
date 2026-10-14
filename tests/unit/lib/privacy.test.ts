import { describe, expect, it } from 'vitest';
import { detectPii, formatPiiError } from '../../../src/lib/privacy.ts';

describe('detectPii', () => {
  it.each([
    ['+33 6 12 34 56 78', 'telephone'],
    ['06 12 34 56 78', 'telephone'],
    ['06.12.34.56.78', 'telephone'],
    ['Âge : 47 ans', 'age'],
    ['âgé de 47 ans', 'age'],
    ['Thibaut, 47 ans, développeur', 'age'],
    ['née le 12/03/1978', 'naissance'],
    ['né le 3 mai 1978', 'naissance'],
    ['date de naissance : 1978', 'naissance'],
    ['12 rue de la Paix', 'adresse'],
    ['4 bis avenue des Champs', 'adresse'],
  ])('rejette « %s » (%s)', (texte, type) => {
    expect(detectPii(texte)).toContain(type);
  });

  it.each([
    "25 ans d'expérience",
    '25 ans d’expérience en direction technique',
    'pendant 3 ans',
    "20 ans d'ancienneté",
    'Direction technique et delivery augmenté par IA',
    'Livraison en 2024 pour 12 équipes',
    '',
  ])('accepte « %s »', (texte) => {
    expect(detectPii(texte)).toEqual([]);
  });

  it('retourne chaque type une seule fois', () => {
    const types = detectPii('06 12 34 56 78 et 07 98 76 54 32');
    expect(types).toEqual(['telephone']);
  });
});

describe('formatPiiError', () => {
  it('cite le fichier et le type', () => {
    expect(formatPiiError('src/data/home.yaml', 'telephone')).toBe(
      'Donnée personnelle interdite détectée dans src/data/home.yaml : telephone',
    );
  });
});
