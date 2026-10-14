import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { experienceSchema } from '../../../src/content/schemas/experiences.ts';
import { profileSchema } from '../../../src/content/schemas/profile.ts';
import { tokensSchema } from '../../../src/content/schemas/tokens.ts';
import { EARLIER_LABEL, buildCvData, type CvExperienceInput } from '../../../src/lib/cv-data.ts';
import { EXPECTED_EXPERIENCES } from '../../../scripts/checks/lib/experiences.ts';

const read = (path: string): unknown => parse(readFileSync(join(process.cwd(), path), 'utf8'));
const tokens = tokensSchema.parse(JSON.parse(readFileSync('src/data/tokens.json', 'utf8')));
const generatedAt = new Date('2026-10-14T08:30:00Z');

const profile = profileSchema.parse({
  name: 'Thibaut Monier',
  title: 'Directeur de projets IT',
  tagline: 'Delivery et architecture.',
  summary: 'Résumé du profil.',
  email: 'contact@exemple.fr',
  links: [{ kind: 'linkedin', url: 'https://www.linkedin.com/in/thibautmonier/' }],
});

const exp = (id: string, extra: Partial<CvExperienceInput> = {}): CvExperienceInput => ({
  id,
  company: id.toUpperCase(),
  role: `Rôle ${id}`,
  start: '2021-01',
  end: '2023-06',
  location: 'Nantes',
  context: `Contexte ${id}.`,
  achievements: [`Réalisation 1 ${id}.`, `Réalisation 2 ${id}.`],
  skills: ['symfony'],
  featured: true,
  clientsCited: false,
  ...extra,
});

const earlier = exp('vieux', {
  start: '2000-09',
  end: '2007-09',
  featured: false,
  summaryOnly: 'Résumé du vieux poste.',
});

const build = (experiences: CvExperienceInput[]) =>
  buildCvData({ profile, experiences, tokens, generatedAt });

describe('buildCvData', () => {
  it('ne produit que les clés de la liste blanche', () => {
    const data = build([exp('a'), earlier]);
    expect(Object.keys(data).sort()).toEqual([
      'earlier',
      'experiences',
      'header',
      'labels',
      'meta',
      'summary',
      'theme',
    ]);
    expect(Object.keys(data.header).sort()).toEqual([
      'links',
      'location',
      'name',
      'tagline',
      'title',
    ]);
    expect(Object.keys(data.experiences[0] ?? {}).sort()).toEqual([
      'achievements',
      'company',
      'context',
      'location',
      'period',
      'role',
    ]);
    expect(Object.keys(data.earlier[0] ?? {}).sort()).toEqual([
      'company',
      'period',
      'role',
      'summary',
    ]);
  });

  it('n’expose ni e-mail, ni compétences, ni drapeaux internes, ni identifiants', () => {
    const json = JSON.stringify(build([exp('a'), earlier]));
    for (const forbidden of [
      'contact@exemple.fr',
      'symfony',
      'clientsCited',
      'featured',
      '"id"',
      'email',
    ]) {
      expect(json).not.toContain(forbidden);
    }
  });

  it('localise en « Nantes (France) » sans adresse', () => {
    expect(build([exp('a')]).header.location).toBe('Nantes (France)');
  });

  it('ordonne la frise du plus récent au plus ancien (poste en cours d’abord)', () => {
    const data = build([
      exp('b', { start: '2019-01', end: '2020-01' }),
      exp('c', { start: '2025-12', end: null }),
      exp('a', { start: '2021-01', end: '2023-06' }),
    ]);
    expect(data.experiences.map((e) => e.company)).toEqual(['C', 'A', 'B']);
  });

  it('sépare les expériences détaillées du bloc « Avant 2016 »', () => {
    const data = build([earlier, exp('a')]);
    expect(data.experiences).toHaveLength(1);
    expect(data.earlier).toEqual([
      {
        company: 'VIEUX',
        role: 'Rôle vieux',
        period: 'septembre 2000 – septembre 2007',
        summary: 'Résumé du vieux poste.',
      },
    ]);
    expect(data.labels.earlier).toBe(EARLIER_LABEL);
  });

  it('formate la période comme la page Parcours', () => {
    const data = build([exp('c', { start: '2025-12', end: null })]);
    expect(data.experiences[0]?.period).toBe('décembre 2025 – aujourd’hui');
  });

  it('place la date de génération et la langue dans les métadonnées', () => {
    const { meta } = build([exp('a')]);
    expect(meta).toEqual({
      title: 'Thibaut Monier – CV',
      author: 'Thibaut Monier',
      lang: 'fr',
      generatedAt: '2026-10-14',
    });
  });

  it('reprend les couleurs claires et la police des jetons du site', () => {
    const { theme } = build([exp('a')]);
    expect(theme.colors.accent).toBe(tokens.color['accent']?.light);
    expect(theme.colors.fg).toBe(tokens.color['fg']?.light);
    expect(theme.font).toBe('Inter');
  });

  it('transmet les liens du profil avec un libellé', () => {
    expect(build([exp('a')]).header.links).toContainEqual({
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/thibautmonier/',
    });
  });

  it('échoue si une expérience non détaillée n’a pas de résumé', () => {
    expect(() => build([exp('x', { featured: false })])).toThrow(/summaryOnly/);
  });
});

describe('buildCvData sur les données réelles', () => {
  const dir = 'src/data/cv/experiences';
  const experiences = readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .map((name) => ({
      ...experienceSchema.parse(read(join(dir, name))),
      id: name.replace(/\.yaml$/, ''),
    }));

  it('contient les 7 expériences, détaillées ou résumées', () => {
    const profileData = profileSchema.parse(
      (read('src/data/cv/profile.yaml') as { fr: unknown }).fr,
    );
    const data = buildCvData({ profile: profileData, experiences, tokens, generatedAt });
    expect(data.experiences.length + data.earlier.length).toBe(EXPECTED_EXPERIENCES);
    expect(data.earlier.length).toBeGreaterThan(0);
  });
});
