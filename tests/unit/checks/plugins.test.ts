import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkPlugins, parseFrontmatter } from '../../../scripts/checks/lib/plugins.ts';

const fm = (extra: Record<string, unknown> = {}) => {
  const data = {
    name: 'Alpha',
    tagline: 'Une accroche.',
    theme: 'b2b',
    repo: { owner: 'thibmonier', name: 'sylius-alpha-plugin' },
    packagist: 'tmonier/sylius-alpha-plugin',
    features: ['a', 'b', 'c', 'd', 'e'],
    compatibility: {
      matrix: [{ sylius: '2.3', php: '>=8.3', symfony: ['7.4'] }],
      databases: ['mysql'],
    },
    installSteps: ['Un.', 'Deux.'],
    configExcerpt: 'x: 1',
    ...extra,
  };
  return `---\n${JSON.stringify(data)}\n---\n\nCorps.\n`;
};

const roots: string[] = [];
async function rootWith(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'pl-'));
  roots.push(root);
  const dir = join(root, 'src/content/plugins/fr');
  await mkdir(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) await writeFile(join(dir, name), content);
  return root;
}
afterEach(async () => {
  await Promise.all(roots.splice(0).map((r) => rm(r, { recursive: true, force: true })));
});

const opts = {
  expected: 2,
  themeCounts: { b2b: 2, 'conformite-ue': 0, 'back-office': 0, 'ia-integrations': 0 },
};

describe('parseFrontmatter', () => {
  it('lit le frontmatter YAML', () => {
    expect(parseFrontmatter(fm()).data).toMatchObject({ name: 'Alpha' });
  });
  it('signale un frontmatter absent', () => {
    expect(parseFrontmatter('Corps').error).toMatch(/frontmatter/);
  });
});

describe('checkPlugins', () => {
  it('ne signale rien pour un catalogue valide', async () => {
    const root = await rootWith({
      'alpha.mdx': fm(),
      'beta.mdx': fm({ name: 'Beta', requires: ['alpha'] }),
    });
    expect(await checkPlugins(root, opts)).toEqual([]);
  });

  it('échoue avec 1 plugin de trop ou de moins (V8)', async () => {
    const root = await rootWith({ 'alpha.mdx': fm() });
    expect(await checkPlugins(root, opts)).toContain(
      'Décompte des plugins : 2 attendus, 1 trouvé(s)',
    );
    const root2 = await rootWith({ 'alpha.mdx': fm(), 'beta.mdx': fm(), 'gamma.mdx': fm() });
    expect((await checkPlugins(root2, opts)).join()).toMatch(/3 trouvé/);
  });

  it('vérifie la répartition par thème', async () => {
    const root = await rootWith({ 'alpha.mdx': fm(), 'beta.mdx': fm({ theme: 'back-office' }) });
    expect((await checkPlugins(root, opts)).join()).toMatch(/Thème « b2b » : 2 attendus, 1/);
  });

  it('cite le plugin et le champ en cas d’erreur de schéma', async () => {
    const root = await rootWith({ 'alpha.mdx': fm({ theme: 'paiement' }), 'beta.mdx': fm() });
    expect(await checkPlugins(root, opts)).toContain(
      'plugins/fr/alpha.mdx : Plugin « alpha » invalide : thème doit valoir b2b, conformite-ue, back-office ou ia-integrations',
    );
  });

  it('détecte une dépendance inexistante et un cycle', async () => {
    const root = await rootWith({
      'alpha.mdx': fm({ requires: ['sylius-inconnu'] }),
      'beta.mdx': fm({ requires: ['alpha'] }),
    });
    expect((await checkPlugins(root, opts)).join()).toMatch(/la dépendance « sylius-inconnu »/);
    const cyc = await rootWith({
      'alpha.mdx': fm({ requires: ['beta'] }),
      'beta.mdx': fm({ requires: ['alpha'] }),
    });
    expect((await checkPlugins(cyc, opts)).join()).toMatch(/cycle/);
  });

  it('refuse une donnée personnelle dans le corps et un slug invalide', async () => {
    const bad = fm().replace('Corps.', 'Appelez le 06 12 34 56 78.');
    const root = await rootWith({ 'alpha.mdx': bad, 'Beta Plugin.mdx': fm() });
    const errors = (await checkPlugins(root, opts)).join('\n');
    expect(errors).toMatch(/telephone/);
    expect(errors).toMatch(/nom de fichier invalide/);
  });

  it('ignore les brouillons dans le décompte', async () => {
    const root = await rootWith({
      'alpha.mdx': fm(),
      'beta.mdx': fm(),
      'wip.mdx': fm({ draft: true }),
    });
    expect(await checkPlugins(root, opts)).toEqual([]);
  });
});
