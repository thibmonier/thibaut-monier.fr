import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { EXPECTED_EXPERIENCES, checkExperiences } from '../../../scripts/checks/lib/experiences.ts';

const now = new Date('2026-10-14T00:00:00Z');

const yaml = (extra: Record<string, string> = {}) =>
  Object.entries({
    company: 'ACME',
    role: 'CTO',
    start: '"2019-01"',
    end: '"2020-01"',
    context: '"Contexte."',
    achievements: '["Premier résultat.", "Second résultat."]',
    featured: 'true',
    ...extra,
  })
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

const roots: string[] = [];
async function rootWith(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'xp-'));
  roots.push(root);
  const dir = join(root, 'src/data/cv/experiences');
  await mkdir(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) await writeFile(join(dir, name), content);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('checkExperiences', () => {
  it('attend 7 expériences', () => {
    expect(EXPECTED_EXPERIENCES).toBe(7);
  });

  it('ne signale rien pour des données valides au bon décompte', async () => {
    const root = await rootWith({ 'acme.yaml': yaml() });
    expect(await checkExperiences(root, now, 1)).toEqual([]);
  });

  it('signale un décompte incorrect', async () => {
    const root = await rootWith({ 'acme.yaml': yaml() });
    expect(await checkExperiences(root, now, 2)).toEqual([
      'Décompte des expériences : 2 attendues, 1 trouvée(s)',
    ]);
  });

  it('rejette un numéro de téléphone avec le fichier dans le message', async () => {
    const root = await rootWith({ 'acme.yaml': yaml({ context: '"Appeler le 06 12 34 56 78."' }) });
    const errors = await checkExperiences(root, now, 1);
    expect(errors).toContain('Donnée personnelle interdite détectée dans acme.yaml : telephone');
  });

  it('rejette un âge mais accepte « 25 ans d’expérience »', async () => {
    const bad = await rootWith({ 'acme.yaml': yaml({ context: '"Il a 47 ans."' }) });
    expect(await checkExperiences(bad, now, 1)).toContain(
      'Donnée personnelle interdite détectée dans acme.yaml : age',
    );
    const ok = await rootWith({ 'acme.yaml': yaml({ context: '"25 ans d\'expérience."' }) });
    expect(await checkExperiences(ok, now, 1)).toEqual([]);
  });

  it('cite le fichier et le champ quand le schéma échoue', async () => {
    const root = await rootWith({ 'acme.yaml': yaml({ start: '"2019"' }) });
    const errors = await checkExperiences(root, now, 1);
    expect(errors.some((e) => e.startsWith('experiences/acme.yaml : start'))).toBe(true);
  });

  it('applique la règle des 10 ans (V7)', async () => {
    const root = await rootWith({
      'acme.yaml': yaml({ featured: 'false', summaryOnly: '"Résumé."' }),
    });
    expect(await checkExperiences(root, now, 1)).toEqual([
      'experiences/acme.yaml : expérience terminée après 2016, featured doit être true (V7)',
    ]);
  });

  it('rejette un nom de fichier qui n’est pas un slug', async () => {
    const root = await rootWith({ 'Acme Corp.yaml': yaml() });
    expect(await checkExperiences(root, now, 1)).toContain(
      'experiences/Acme Corp.yaml : nom de fichier invalide (slug en kebab-case attendu)',
    );
  });

  it('signale un YAML illisible', async () => {
    const root = await rootWith({ 'acme.yaml': 'company: [oups' });
    const errors = await checkExperiences(root, now, 1);
    expect(errors[0]).toMatch(/^experiences\/acme\.yaml : YAML illisible/);
  });
});
