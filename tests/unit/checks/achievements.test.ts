import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CITABLE_CLIENTS,
  MAX_ACHIEVEMENTS,
  MIN_ACHIEVEMENTS,
  checkAchievements,
} from '../../../scripts/checks/lib/achievements.ts';

const DOMAINS = ['delivery', 'architecture', 'e-commerce', 'donnees-migrations', 'ia-appliquee'];

const skillsYaml = (extra = '') =>
  DOMAINS.map((d) => `- id: skill-${d}\n  label: Compétence ${d}\n  domain: ${d}`).join('\n') +
  `\n${extra}`;

const achievement = (n: number, extra: Record<string, string> = {}) =>
  Object.entries({
    id: `realisation-${n}`,
    title: `"Réalisation numéro ${n}."`,
    domains: `[${DOMAINS[n % DOMAINS.length]}]`,
    year: '2024',
    skills: '[skill-delivery]',
    ...extra,
  })
    .map(([key, value], index) => `${index === 0 ? '- ' : '  '}${key}: ${value}`)
    .join('\n');

const achievementsYaml = (count = MIN_ACHIEVEMENTS, extra: Record<string, string> = {}) =>
  Array.from({ length: count }, (_, i) => achievement(i + 1, i === 0 ? extra : {})).join('\n');

const roots: string[] = [];
async function rootWith(files: { achievements?: string; skills?: string }): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'ach-'));
  roots.push(root);
  const dir = join(root, 'src/data/cv');
  await mkdir(join(dir, 'experiences'), { recursive: true });
  await writeFile(join(dir, 'experiences/gingerminds.yaml'), 'company: x\n');
  await writeFile(join(dir, 'achievements.yaml'), files.achievements ?? achievementsYaml());
  await writeFile(join(dir, 'skills.yaml'), files.skills ?? skillsYaml());
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('checkAchievements', () => {
  it('accepte un contenu valide', async () => {
    expect(await checkAchievements(await rootWith({}))).toEqual([]);
  });

  it('borne le nombre de réalisations (10 à 15)', async () => {
    expect(MIN_ACHIEVEMENTS).toBe(10);
    expect(MAX_ACHIEVEMENTS).toBe(15);
    const few = await checkAchievements(await rootWith({ achievements: achievementsYaml(9) }));
    expect(few.join()).toMatch(/9 réalisation.*10 à 15/);
    const many = await checkAchievements(await rootWith({ achievements: achievementsYaml(16) }));
    expect(many.join()).toMatch(/16 réalisation.*10 à 15/);
  });

  it('refuse une compétence référencée inexistante avec un message précis', async () => {
    const errors = await checkAchievements(
      await rootWith({ achievements: achievementsYaml(10, { skills: '[sylius-fantome]' }) }),
    );
    expect(errors).toContain(
      'achievements.yaml : realisation-1 : skills : compétence inconnue « sylius-fantome »',
    );
  });

  it('refuse une expérience référencée inexistante', async () => {
    const errors = await checkAchievements(
      await rootWith({ achievements: achievementsYaml(10, { experienceId: 'nulle-part' }) }),
    );
    expect(errors.join()).toContain('experienceId : expérience inconnue « nulle-part »');
    expect(
      await checkAchievements(
        await rootWith({ achievements: achievementsYaml(10, { experienceId: 'gingerminds' }) }),
      ),
    ).toEqual([]);
  });

  it('refuse les identifiants en double', async () => {
    const duplicated = `${achievementsYaml(10)}\n${achievement(1)}`;
    const errors = await checkAchievements(await rootWith({ achievements: duplicated }));
    expect(errors.join()).toContain('identifiant en double « realisation-1 »');
  });

  it('refuse un client qui ne figure pas dans la liste validée par le PO', async () => {
    expect(CITABLE_CLIENTS).toEqual([]); // anonymisation par défaut (arbitrage E12)
    const errors = await checkAchievements(
      await rootWith({ achievements: achievementsYaml(10, { clients: '[Gémo]' }) }),
    );
    expect(errors.join()).toContain('clients : « Gémo » absent de la liste des clients citables');
  });

  it('refuse un domaine hors liste en citant le fichier, la réalisation et le champ', async () => {
    const errors = await checkAchievements(
      await rootWith({ achievements: achievementsYaml(10, { domains: '[marketing]' }) }),
    );
    expect(errors.join()).toMatch(/achievements\.yaml : realisation-1 : domains\.0 : .*marketing/);
  });

  it('refuse une donnée personnelle dans les sources', async () => {
    const errors = await checkAchievements(
      await rootWith({
        achievements: achievementsYaml(10, { title: '"Joignable au 06 12 34 56 78"' }),
      }),
    );
    expect(errors.join()).toContain(
      'Donnée personnelle interdite détectée dans achievements.yaml : telephone',
    );
  });

  it('exige au moins une compétence par domaine', async () => {
    const skills = DOMAINS.slice(1)
      .map((d) => `- id: skill-${d}\n  label: C\n  domain: ${d}`)
      .join('\n');
    const errors = await checkAchievements(await rootWith({ skills }));
    expect(errors.join()).toContain('skills.yaml : domaine « delivery » sans compétence');
  });

  it('refuse un YAML illisible', async () => {
    const errors = await checkAchievements(await rootWith({ achievements: 'a: [' }));
    expect(errors.join()).toContain('achievements.yaml : YAML illisible');
  });
});
