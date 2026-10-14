import { describe, expect, it } from 'vitest';
import { legalConfig } from '../../../src/config/legal.ts';
import { legalConfigSchema } from '../../../src/content/schemas/legal.ts';

const valid = {
  editor: { name: 'Thibaut Monier', contactUrl: '/contact/' },
  publicationDirector: 'Thibaut Monier',
  host: { name: 'Railway Corp.', address: '1 Exemple Street, Ville, Pays' },
};

describe('legalConfigSchema', () => {
  it('accepte une configuration valide', () => {
    expect(legalConfigSchema.parse(valid).host.name).toBe('Railway Corp.');
  });

  it("refuse une adresse ou un téléphone pour l'éditeur", () => {
    const withAddress = { ...valid, editor: { ...valid.editor, address: '12 rue des Lilas' } };
    expect(() => legalConfigSchema.parse(withAddress)).toThrow();
    const withPhone = { ...valid, editor: { ...valid.editor, phone: '06 12 34 56 78' } };
    expect(() => legalConfigSchema.parse(withPhone)).toThrow();
  });

  it("exige l'hébergeur", () => {
    const { host: _host, ...rest } = valid;
    expect(() => legalConfigSchema.parse(rest)).toThrow();
  });

  it("refuse un moyen de contact qui n'est ni un chemin interne ni une URL https", () => {
    const bad = { ...valid, editor: { name: 'T', contactUrl: 'http://exemple.fr' } };
    expect(() => legalConfigSchema.parse(bad)).toThrow();
  });

  it('la configuration réelle est valide et ne publie aucune adresse de l’éditeur', () => {
    expect(legalConfig.editor).not.toHaveProperty('address');
    expect(legalConfig.editor).not.toHaveProperty('phone');
    expect(legalConfig.publicationDirector).toBe('Thibaut Monier');
  });
});
