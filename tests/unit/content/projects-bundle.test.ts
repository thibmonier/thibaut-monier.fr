import { readdirSync } from 'node:fs';
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { createProjectSchema } from '../../../src/content/schemas/projects.ts';
import { sentenceCount } from '../../../src/lib/projects.ts';

const schema = createProjectSchema(z.string());

const step = (title: string) => ({
  title,
  text: `${title} : à faire en suivant le README du dépôt.`,
});

const bundle = {
  name: 'tailsfadmin',
  kind: 'bundle',
  title: 'tailsfadmin, thème admin Symfony',
  description:
    'Bundle Symfony open source : un thème d’administration Tailwind v4 prêt à brancher.',
  summary: 'Thème d’administration pour Symfony, basé sur TailAdmin.',
  role: 'Auteur et mainteneur du bundle.',
  repo: { owner: 'thibmonier', name: 'tailsfadmin' },
  packagist: 'tailsfadmin/tailsfadmin-bundle',
  license: 'MIT',
  version: 'v1.6.2',
  inBrief:
    'Un thème d’administration prêt à l’emploi. Il évite de redessiner les écrans de gestion.',
  readmeUrl: 'https://github.com/thibmonier/tailsfadmin#readme',
  installSteps: [step('Installer'), step('Assets'), step('Thème'), step('Menu')],
};

const messages = (input: unknown) =>
  schema.safeParse(input).error?.issues.map((i) => i.message) ?? [];

describe('schéma projects : bundle', () => {
  it('accepte un bundle complet sans contribution ni démo en ligne', () => {
    expect(schema.safeParse(bundle).success).toBe(true);
  });

  it('accepte une démo en ligne https facultative et refuse une démo http', () => {
    expect(schema.safeParse({ ...bundle, demoUrl: 'https://demo.example.org/' }).success).toBe(
      true,
    );
    expect(schema.safeParse({ ...bundle, demoUrl: 'http://demo.example.org/' }).success).toBe(
      false,
    );
  });

  for (const field of ['packagist', 'license', 'version', 'inBrief', 'readmeUrl', 'installSteps']) {
    it(`exige « ${field} » pour un bundle`, () => {
      const { [field]: _removed, ...incomplete } = bundle as Record<string, unknown>;
      expect(messages(incomplete)).toContain(`${field} requis pour un bundle`);
    });
  }

  it('exige exactement 4 étapes d’installation', () => {
    const three = { ...bundle, installSteps: bundle.installSteps.slice(0, 3) };
    expect(messages(three)).toContain('installSteps : 4 étapes attendues, 3 fournies');
    const five = { ...bundle, installSteps: [...bundle.installSteps, step('Layout')] };
    expect(messages(five)).toContain('installSteps : 4 étapes attendues, 5 fournies');
  });

  it('limite l’encadré « En bref » à 2 phrases', () => {
    const long = { ...bundle, inBrief: 'Une phrase. Deux phrases. Trois phrases.' };
    expect(messages(long)).toContain('inBrief : 2 phrases au plus, 3 fournies');
  });

  it('refuse une donnée personnelle dans une étape', () => {
    const bad = {
      ...bundle,
      installSteps: [
        step('Installer'),
        step('Assets'),
        step('Thème'),
        { title: 'Menu', text: 'Appeler le 06 12 34 56 78' },
      ],
    };
    expect(messages(bad).join(' ')).toContain('Donnée personnelle interdite');
  });

  it('cohabite avec une étude de cas : kind = contribution reste valide', () => {
    const study = {
      name: 'career-ops',
      kind: 'contribution',
      title: 'Contributions à career-ops',
      description:
        'Étude de cas : trois correctifs acceptés dans un projet open source très suivi.',
      summary: 'Outil open source.',
      role: 'Contributeur',
      result: 'Trois défauts corrigés.',
      repo: { owner: 'career-ops-hq', name: 'career-ops' },
      contributions: [
        {
          number: 1,
          type: 'pr',
          title: 'Correctif',
          problem: 'Problème.',
          fix: 'Correctif.',
          tests: 'Test.',
          url: 'https://github.com/career-ops-hq/career-ops/pull/1',
          status: 'merged',
        },
      ],
    };
    expect(schema.safeParse(study).success).toBe(true);
  });
});

describe('collection projects', () => {
  it('compte 2 projets : career-ops et tailsfadmin', () => {
    const names = readdirSync('src/content/projects/fr').sort();
    expect(names).toEqual(['career-ops.md', 'tailsfadmin.md']);
  });
});

describe('sentenceCount', () => {
  it('compte les phrases terminées par . ! ou ? et ignore les points des nombres', () => {
    expect(sentenceCount('Une phrase. Deux ! Trois ?')).toBe(3);
    expect(sentenceCount('Version 1.6.2 stable. Fin.')).toBe(2);
    expect(sentenceCount('')).toBe(0);
  });
});
