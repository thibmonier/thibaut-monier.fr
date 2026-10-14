import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { createProjectSchema } from '../../../src/content/schemas/projects.ts';

const schema = createProjectSchema(z.string());

const contribution = {
  number: 3496,
  type: 'pr',
  title: 'fix(calibrate) : lire les colonnes depuis le tableau de lignes',
  problem: 'Le tableau de suivi était lu avec le mauvais plan de colonnes.',
  fix: 'Transmettre la liste des lignes au calcul des colonnes.',
  tests: 'Un test lit un tableau avec et sans la colonne optionnelle.',
  url: 'https://github.com/career-ops-hq/career-ops/pull/3496',
  mergedAt: '2026-09-02',
  status: 'merged',
};

const valid = {
  name: 'career-ops',
  kind: 'contribution',
  title: 'Contributions à career-ops',
  description: 'Étude de cas : trois correctifs acceptés dans un projet open source très suivi.',
  summary: 'Outil open source de recherche d’emploi assistée par IA.',
  role: 'Contributeur, membre de l’équipe Contributors',
  result: 'Trois défauts silencieux corrigés et acceptés.',
  repo: { owner: 'career-ops-hq', name: 'career-ops' },
  contributions: [contribution],
};

const messages = (input: unknown) =>
  schema.safeParse(input).error?.issues.map((i) => i.message) ?? [];

describe('schéma projects : contribution', () => {
  it('accepte une étude de cas valide', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('exige au moins une contribution pour kind = contribution', () => {
    expect(messages({ ...valid, contributions: [] })).toContain('au moins une contribution');
  });

  it('exige le résultat pour kind = contribution', () => {
    const { result: _result, ...withoutResult } = valid;
    expect(messages(withoutResult)).toContain('result requis pour une étude de cas');
  });

  it('refuse une PR sans test de non-régression avec le message de la story', () => {
    const input = { ...valid, contributions: [{ ...contribution, tests: '   ' }] };
    expect(messages(input)).toContain(
      "Étude de cas « career-ops » : la PR #3496 n'a pas de tests de non-régression décrits",
    );
  });

  it('nomme l’issue (et non la PR) quand la contribution est une issue', () => {
    const input = { ...valid, contributions: [{ ...contribution, type: 'issue', tests: '' }] };
    expect(messages(input)).toContain(
      "Étude de cas « career-ops » : l'issue #3496 n'a pas de tests de non-régression décrits",
    );
  });

  it('refuse une URL de contribution non https', () => {
    const input = { ...valid, contributions: [{ ...contribution, url: 'http://github.com/x' }] };
    expect(schema.safeParse(input).success).toBe(false);
  });

  it('refuse les statuts inconnus et les numéros non positifs', () => {
    expect(
      schema.safeParse({ ...valid, contributions: [{ ...contribution, status: 'draft' }] }).success,
    ).toBe(false);
    expect(
      schema.safeParse({ ...valid, contributions: [{ ...contribution, number: 0 }] }).success,
    ).toBe(false);
  });

  it('refuse un champ inconnu (schéma strict)', () => {
    expect(schema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
  });

  it('refuse une donnée personnelle dans un texte publié', () => {
    const input = { ...valid, role: 'Contributeur, joignable au 06 12 34 56 78' };
    expect(messages(input).join(' ')).toContain('Donnée personnelle interdite');
  });

  it('limite le résumé à 200 caractères et la description à 160', () => {
    expect(schema.safeParse({ ...valid, summary: 'x'.repeat(201) }).success).toBe(false);
    expect(schema.safeParse({ ...valid, description: 'x'.repeat(161) }).success).toBe(false);
  });

  it('accepte un encadré technique facultatif', () => {
    const input = { ...valid, contributions: [{ ...contribution, technical: 'Détail.' }] };
    expect(schema.safeParse(input).success).toBe(true);
  });
});
