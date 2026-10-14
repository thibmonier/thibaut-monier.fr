import { describe, expect, it } from 'vitest';
import { experienceSchema } from '../../../src/content/schemas/experiences.ts';

const valid = {
  company: 'GINGERMINDS',
  role: 'Delivery Manager / CTO',
  start: '2021-01',
  end: '2025-12',
  location: 'Nantes',
  context: 'Agence de 3 millions d’euros de budget annuel.',
  achievements: [
    'Pilotage de vingt projets simultanés.',
    'Recrutement d’une quinzaine de personnes.',
  ],
  featured: true,
};

const messages = (input: unknown) =>
  experienceSchema.safeParse(input).error?.issues.map((i) => i.message) ?? [];

describe('experienceSchema', () => {
  it('accepte une expérience valide et applique les valeurs par défaut', () => {
    const r = experienceSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.data?.skills).toEqual([]);
    expect(r.data?.clientsCited).toBe(false);
  });

  it('accepte un poste en cours (end null ou absent)', () => {
    expect(experienceSchema.safeParse({ ...valid, end: null }).success).toBe(true);
    const { end: _end, ...rest } = valid;
    expect(experienceSchema.parse(rest).end).toBeNull();
  });

  it.each(['company', 'role', 'start', 'context', 'achievements'] as const)(
    "rejette l'absence de %s avec un message citant champ et collection",
    (field) => {
      const { [field]: _omit, ...rest } = valid;
      expect(messages(rest)).toContain(`Champ '${field}' requis dans la collection experiences`);
    },
  );

  it('rejette une clé inconnue comme phone', () => {
    expect(experienceSchema.safeParse({ ...valid, phone: '0612345678' }).success).toBe(false);
  });

  it('rejette une période mal formée', () => {
    expect(experienceSchema.safeParse({ ...valid, start: '2021-13' }).success).toBe(false);
    expect(experienceSchema.safeParse({ ...valid, start: '2021' }).success).toBe(false);
  });

  it('rejette une fin antérieure au début', () => {
    expect(messages({ ...valid, start: '2022-01', end: '2021-01' })).toContain('end précède start');
  });

  it('exige summaryOnly pour une expérience non featured', () => {
    expect(messages({ ...valid, featured: false })).toContain('summaryOnly requis si non featured');
    expect(
      experienceSchema.safeParse({ ...valid, featured: false, summaryOnly: 'Résumé court.' })
        .success,
    ).toBe(true);
  });

  it('exige au moins 2 réalisations pour une expérience featured', () => {
    expect(messages({ ...valid, achievements: ['Une seule.'] })).toContain(
      'au moins 2 réalisations pour une expérience featured',
    );
  });

  it('limite context à 280, summaryOnly à 160 et une réalisation à 300 caractères', () => {
    expect(experienceSchema.safeParse({ ...valid, context: 'x'.repeat(281) }).success).toBe(false);
    expect(
      experienceSchema.safeParse({ ...valid, featured: false, summaryOnly: 'x'.repeat(161) })
        .success,
    ).toBe(false);
    expect(
      experienceSchema.safeParse({ ...valid, achievements: ['x'.repeat(301), 'ok'] }).success,
    ).toBe(false);
  });

  it('rejette téléphone, âge et adresse dans les textes', () => {
    expect(
      experienceSchema.safeParse({ ...valid, context: 'Joignable au 06 12 34 56 78' }).success,
    ).toBe(false);
    expect(experienceSchema.safeParse({ ...valid, context: 'Il a 47 ans' }).success).toBe(false);
    expect(
      experienceSchema.safeParse({ ...valid, achievements: ['12 rue de la Paix', 'ok'] }).success,
    ).toBe(false);
  });

  it('accepte « 25 ans d’expérience »', () => {
    expect(
      experienceSchema.safeParse({ ...valid, context: '25 ans d’expérience cumulée.' }).success,
    ).toBe(true);
  });
});
