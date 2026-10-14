import { describe, expect, it } from 'vitest';
import { profileSchema } from '../../../src/content/schemas/profile.ts';

const valid = {
  name: 'Thibaut Monier',
  title: 'Directeur de projets IT, architecte e-commerce',
  tagline: 'Delivery, architecture et IA appliquée pour des projets e-commerce B2B.',
  summary: 'Plus de vingt-cinq ans de développement, d’architecture et de pilotage de projets IT.',
  links: [{ kind: 'linkedin', url: 'https://www.linkedin.com/in/thibautmonier/' }],
};

const messages = (input: unknown) =>
  profileSchema.safeParse(input).error?.issues.map((i) => i.message) ?? [];

describe('profileSchema', () => {
  it('accepte un profil valide et applique les valeurs par défaut', () => {
    const { links: _links, ...withoutLinks } = valid;
    const result = profileSchema.safeParse(withoutLinks);
    expect(result.success).toBe(true);
    expect(result.data?.links).toEqual([]);
  });

  it('rejette une clé inconnue comme phone ou age', () => {
    expect(profileSchema.safeParse({ ...valid, phone: '0612345678' }).success).toBe(false);
    expect(profileSchema.safeParse({ ...valid, age: 50 }).success).toBe(false);
  });

  it('impose le nom public', () => {
    expect(profileSchema.safeParse({ ...valid, name: 'Autre Nom' }).success).toBe(false);
  });

  it.each([
    ['title', 81],
    ['tagline', 241],
    ['summary', 601],
  ] as const)('rejette %s au-delà de la longueur maximale', (field, length) => {
    expect(profileSchema.safeParse({ ...valid, [field]: 'a'.repeat(length) }).success).toBe(false);
  });

  it.each(['tagline', 'summary'] as const)('rejette une donnée personnelle dans %s', (field) => {
    expect(
      messages({ ...valid, [field]: 'Consultant de 50 ans, joignable au 06 12 34 56 78.' }),
    ).toContain('Donnée personnelle interdite détectée : telephone');
  });

  it('autorise « 25 ans d’expérience » (arbitrage A1)', () => {
    expect(
      profileSchema.safeParse({ ...valid, summary: '25 ans d’expérience en IT.' }).success,
    ).toBe(true);
  });

  it('refuse un lien non https ou un type de lien inconnu', () => {
    expect(
      profileSchema.safeParse({ ...valid, links: [{ kind: 'github', url: 'http://github.com/x' }] })
        .success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({ ...valid, links: [{ kind: 'twitter', url: 'https://x.com/x' }] })
        .success,
    ).toBe(false);
  });

  it('refuse une adresse e-mail mal formée', () => {
    expect(profileSchema.safeParse({ ...valid, email: 'pas-un-email' }).success).toBe(false);
    expect(profileSchema.safeParse({ ...valid, email: 'contact@exemple.fr' }).success).toBe(true);
  });
});
