import { describe, expect, it } from 'vitest';
import { achievementSchema } from '../../../src/content/schemas/achievements.ts';
import { skillSchema } from '../../../src/content/schemas/skills.ts';

const valid = {
  id: 'migration-magento-sylius',
  title: 'Migration Magento vers Sylius d’un site B2C à 10 millions d’euros de chiffre d’affaires',
  domains: ['e-commerce', 'donnees-migrations'],
  year: 2024,
};

const messages = (input: unknown) =>
  achievementSchema.safeParse(input).error?.issues.map((i) => i.message) ?? [];

describe('achievementSchema', () => {
  it('accepte une réalisation valide et applique les valeurs par défaut', () => {
    const result = achievementSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.clients).toEqual([]); // vide = « Référence confidentielle »
    expect(result.data?.skills).toEqual([]);
  });

  it('refuse un domaine hors liste avec un message en français', () => {
    const text = messages({ ...valid, domains: ['marketing'] }).join(' ');
    expect(text).toContain('Domaine');
    expect(text).toContain('marketing');
    expect(text).toContain('ia-appliquee');
  });

  it('exige au moins un domaine', () => {
    expect(achievementSchema.safeParse({ ...valid, domains: [] }).success).toBe(false);
  });

  it('refuse une clé inconnue (strictObject)', () => {
    expect(achievementSchema.safeParse({ ...valid, budget: '770 k€' }).success).toBe(false);
  });

  it('borne le titre à 120 caractères et refuse les données personnelles', () => {
    expect(achievementSchema.safeParse({ ...valid, title: 'a'.repeat(121) }).success).toBe(false);
    expect(
      achievementSchema.safeParse({ ...valid, title: 'Coaching au 06 12 34 56 78' }).success,
    ).toBe(false);
  });

  it('borne l’année et impose https pour la preuve', () => {
    expect(achievementSchema.safeParse({ ...valid, year: 1999 }).success).toBe(false);
    expect(achievementSchema.safeParse({ ...valid, year: 2101 }).success).toBe(false);
    expect(achievementSchema.safeParse({ ...valid, proofUrl: 'http://exemple.fr' }).success).toBe(
      false,
    );
    expect(
      achievementSchema.safeParse({ ...valid, proofUrl: 'https://exemple.fr/preuve' }).success,
    ).toBe(true);
  });

  it('exige des identifiants en kebab-case pour id et compétences', () => {
    expect(achievementSchema.safeParse({ ...valid, id: 'Pas Valide' }).success).toBe(false);
    expect(achievementSchema.safeParse({ ...valid, skills: ['Sylius 2'] }).success).toBe(false);
  });
});

describe('skillSchema', () => {
  const skill = { id: 'sylius', label: 'Sylius', domain: 'e-commerce' };

  it('accepte une compétence avec ou sans niveau', () => {
    expect(skillSchema.safeParse(skill).success).toBe(true);
    expect(skillSchema.safeParse({ ...skill, level: 'expert' }).success).toBe(true);
  });

  it('refuse un niveau inconnu, un domaine hors liste ou une clé inconnue', () => {
    expect(skillSchema.safeParse({ ...skill, level: 'gourou' }).success).toBe(false);
    expect(skillSchema.safeParse({ ...skill, domain: 'marketing' }).success).toBe(false);
    expect(skillSchema.safeParse({ ...skill, years: 12 }).success).toBe(false);
  });
});
