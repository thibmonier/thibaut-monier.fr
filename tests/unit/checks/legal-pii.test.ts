import { describe, expect, it } from 'vitest';
import { scanLegalSources } from '../../../scripts/checks/lib/legal-pii.ts';

describe('scanLegalSources', () => {
  it('ne signale rien pour un contenu propre', () => {
    expect(scanLegalSources([{ file: 'a.md', text: 'Éditeur : Thibaut Monier.' }])).toEqual([]);
  });

  it('signale un numéro de mobile avec le message attendu', () => {
    expect(
      scanLegalSources([{ file: 'mentions-legales.md', text: 'Appelez le 06 12 34 56 78' }]),
    ).toEqual(['Donnée personnelle interdite dans mentions-legales.md : telephone']);
  });

  it('signale une adresse personnelle', () => {
    expect(scanLegalSources([{ file: 'x.md', text: 'Habite 12 rue des Lilas' }])).toEqual([
      'Donnée personnelle interdite dans x.md : adresse',
    ]);
  });

  it('autorise « 25 ans d’expérience » (arbitrage A1)', () => {
    expect(scanLegalSources([{ file: 'x.md', text: "25 ans d'expérience" }])).toEqual([]);
  });
});
