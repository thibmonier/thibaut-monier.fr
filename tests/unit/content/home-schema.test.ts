import { describe, expect, it } from 'vitest';
import { homeSchema } from '../../../src/content/schemas/home.ts';

const proof = (id: string, link = 'https://github.com/thibmonier') => ({
  id,
  value: '20',
  label: 'plugins open source pour Sylius 2',
  link,
  source: 'GitHub',
});

const valid = {
  name: 'Thibaut Monier',
  headline: 'Direction technique et delivery augmenté par IA',
  valueProp: 'Je pilote vos livraisons logicielles et mets l’IA au service de vos équipes.',
  availability: 'Missions au forfait, depuis Nantes ou à distance.',
  metaTitle: 'Thibaut Monier — direction technique et IA',
  metaDescription: 'Directeur technique de transition : delivery augmenté par IA.',
  ctas: [
    { label: 'Me confier une mission', motif: 'mission' },
    { label: 'Me recruter', motif: 'poste' },
  ],
  proofs: [proof('a'), proof('b'), proof('c'), proof('d')],
};

const messages = (input: unknown) =>
  homeSchema.safeParse(input).error?.issues.map((i) => i.message) ?? [];

describe('homeSchema', () => {
  it('accepte une entrée valide', () => {
    expect(homeSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    'name',
    'headline',
    'valueProp',
    'availability',
    'metaTitle',
    'metaDescription',
  ] as const)(
    "rejette l'absence de %s avec un message citant le champ et la collection",
    (field) => {
      const { [field]: _omit, ...rest } = valid;
      expect(messages(rest)).toContain(`Champ '${field}' requis dans la collection home`);
    },
  );

  it('rejette une clé inconnue', () => {
    expect(homeSchema.safeParse({ ...valid, phone: '0612345678' }).success).toBe(false);
  });

  it('rejette une valeur de proposition de plus de 25 mots', () => {
    const long = Array.from({ length: 26 }, () => 'mot').join(' ');
    expect(messages({ ...valid, valueProp: long })).toEqual([
      'valueProp : 25 mots maximum (reçu : 26)',
    ]);
  });

  it('accepte exactement 25 mots', () => {
    const exact = Array.from({ length: 25 }, () => 'mot').join(' ');
    expect(homeSchema.safeParse({ ...valid, valueProp: exact }).success).toBe(true);
  });

  it('limite metaTitle à 60 et metaDescription à 160 caractères', () => {
    expect(homeSchema.safeParse({ ...valid, metaTitle: 'x'.repeat(61) }).success).toBe(false);
    expect(homeSchema.safeParse({ ...valid, metaDescription: 'x'.repeat(161) }).success).toBe(
      false,
    );
  });

  it('exige exactement 2 appels à l’action de motifs distincts', () => {
    expect(homeSchema.safeParse({ ...valid, ctas: [valid.ctas[0]] }).success).toBe(false);
    const same = [valid.ctas[0], { ...valid.ctas[1], motif: 'mission' }];
    expect(homeSchema.safeParse({ ...valid, ctas: same }).success).toBe(false);
  });

  it('rejette un motif hors mission | poste | autre', () => {
    const bad = [valid.ctas[0], { label: 'x', motif: 'spam' }];
    expect(homeSchema.safeParse({ ...valid, ctas: bad }).success).toBe(false);
  });

  it('exige exactement 4 preuves', () => {
    expect(homeSchema.safeParse({ ...valid, proofs: valid.proofs.slice(0, 3) }).success).toBe(
      false,
    );
  });

  it('signale une preuve au lien mal formé avec son identifiant', () => {
    const proofs = [proof('a'), proof('b', 'http://x.org'), proof('c'), proof('d')];
    expect(messages({ ...valid, proofs })).toContain('Lien de preuve invalide : b');
  });

  it('rejette un identifiant de preuve dupliqué', () => {
    const proofs = [proof('a'), proof('a'), proof('c'), proof('d')];
    expect(homeSchema.safeParse({ ...valid, proofs }).success).toBe(false);
  });

  it('rejette une donnée personnelle dans un texte', () => {
    expect(
      homeSchema.safeParse({ ...valid, availability: 'Appelez le 06 12 34 56 78' }).success,
    ).toBe(false);
    expect(homeSchema.safeParse({ ...valid, valueProp: 'Je suis âgé de 50 ans' }).success).toBe(
      false,
    );
  });
});
