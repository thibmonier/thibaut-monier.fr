import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { EXPECTED_PROJECTS, checkProjects } from '../../../scripts/checks/lib/projects.ts';

const roots: string[] = [];

const frontmatter = (
  overrides: Record<string, string> = {},
  tests = '"Un test de non-régression."',
) =>
  [
    '---',
    ...Object.entries({
      name: 'career-ops',
      kind: 'contribution',
      title: '"Contributions à career-ops"',
      description:
        '"Étude de cas : trois correctifs acceptés dans un projet open source très suivi."',
      summary: '"Outil open source."',
      role: '"Contributeur"',
      result: '"Trois défauts corrigés."',
      repo: '{ owner: career-ops-hq, name: career-ops }',
      ...overrides,
    }).map(([key, value]) => `${key}: ${value}`),
    'contributions:',
    '  - number: 3496',
    '    type: pr',
    '    title: "fix"',
    '    problem: "Problème."',
    '    fix: "Correctif."',
    `    tests: ${tests}`,
    '    url: https://github.com/career-ops-hq/career-ops/pull/3496',
    '    status: merged',
    '---',
  ].join('\n');

async function rootWith(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'projects-check-'));
  roots.push(root);
  const dir = join(root, 'src/content/projects/fr');
  await mkdir(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) await writeFile(join(dir, name), content);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('checkProjects', () => {
  it('attend 2 projets (career-ops et tailsfadmin)', () => {
    expect(EXPECTED_PROJECTS).toBe(2);
  });

  it('ne signale rien pour une étude de cas valide', async () => {
    const root = await rootWith({ 'career-ops.md': `${frontmatter()}\n\nCorps court.\n` });
    expect(await checkProjects(root, 1)).toEqual([]);
  });

  it('échoue avec le message de la story quand le bloc « tests » est vide', async () => {
    const root = await rootWith({ 'career-ops.md': `${frontmatter({}, '""')}\n\nCorps.\n` });
    expect(await checkProjects(root, 1)).toContain(
      "projects/career-ops.md : contributions.0.tests : Étude de cas « career-ops » : la PR #3496 n'a pas de tests de non-régression décrits",
    );
  });

  it('échoue au-delà de 900 mots visibles', async () => {
    const root = await rootWith({
      'career-ops.md': `${frontmatter()}\n\n${'mot '.repeat(900)}\n`,
    });
    const errors = await checkProjects(root, 1);
    expect(errors.some((e) => e.includes('mots visibles, 900 au plus'))).toBe(true);
  });

  it('ne compte pas le contenu des <details> dans le budget', async () => {
    const body = `<details><summary>Détail</summary>${'mot '.repeat(2000)}</details>`;
    const root = await rootWith({ 'career-ops.md': `${frontmatter()}\n\n${body}\n` });
    expect(await checkProjects(root, 1)).toEqual([]);
  });

  it('refuse une donnée personnelle dans le corps', async () => {
    const root = await rootWith({
      'career-ops.md': `${frontmatter()}\n\nAppeler le 06 12 34 56 78.\n`,
    });
    expect(await checkProjects(root, 1)).toContain(
      'Donnée personnelle interdite détectée dans career-ops.md : telephone',
    );
  });

  it('refuse un lien non https dans le corps', async () => {
    const root = await rootWith({
      'career-ops.md': `${frontmatter()}\n\n[PR](http://github.com/x/y/pull/1)\n`,
    });
    expect(await checkProjects(root, 1)).toContain(
      'projects/career-ops.md : lien non https dans le corps : http://github.com/x/y/pull/1',
    );
  });

  it('signale un front matter absent', async () => {
    const root = await rootWith({ 'career-ops.md': 'Pas de front matter.\n' });
    expect(await checkProjects(root, 1)).toContain(
      'projects/career-ops.md : front matter YAML absent',
    );
  });

  it('signale un YAML illisible', async () => {
    const root = await rootWith({ 'career-ops.md': '---\nname: [oups\n---\n' });
    const errors = await checkProjects(root, 1);
    expect(errors[0]).toMatch(/^projects\/career-ops\.md : YAML illisible/);
  });

  it('signale un décompte incorrect', async () => {
    const root = await rootWith({ 'career-ops.md': `${frontmatter()}\n` });
    expect(await checkProjects(root, 2)).toContain(
      'Décompte des projets : 2 attendus, 1 trouvé(s)',
    );
  });

  it('rejette un nom de fichier qui n’est pas un slug', async () => {
    const root = await rootWith({ 'Career Ops.md': `${frontmatter()}\n` });
    expect(await checkProjects(root, 1)).toContain(
      'projects/Career Ops.md : nom de fichier invalide (slug en kebab-case attendu)',
    );
  });
});
