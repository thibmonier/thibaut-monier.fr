import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  EXPECTED_PLUGINS,
  EXPECTED_THEME_COUNTS,
  checkPlugins,
  parseFrontmatter,
} from '../../../scripts/checks/lib/plugins.ts';
import { demo } from '../../../src/config/demo.ts';

const DIR = 'src/content/plugins/fr';

interface Fiche {
  slug: string;
  theme: string;
  status?: string;
  inDemo?: boolean;
  requires?: string[];
  complements?: string[];
  compatibility?: unknown;
  packagist?: string;
}

async function fiches(): Promise<Fiche[]> {
  const names = (await readdir(DIR)).filter((n) => n.endsWith('.mdx')).sort();
  return Promise.all(
    names.map(async (name) => {
      const { data } = parseFrontmatter(await readFile(`${DIR}/${name}`, 'utf8'));
      return { slug: name.replace(/\.mdx$/, ''), ...(data as object) } as Fiche;
    }),
  );
}

describe('catalogue réel des plugins', () => {
  it('compte 24 fiches, réparties 13 / 3 / 5 / 3 par thème', async () => {
    const all = await fiches();
    expect(EXPECTED_PLUGINS).toBe(24);
    expect(all).toHaveLength(24);
    const count = (theme: string) => all.filter((f) => f.theme === theme).length;
    expect({
      b2b: count('b2b'),
      'conformite-ue': count('conformite-ue'),
      'back-office': count('back-office'),
      'ia-integrations': count('ia-integrations'),
    }).toEqual({ b2b: 13, 'conformite-ue': 3, 'back-office': 5, 'ia-integrations': 3 });
    expect(EXPECTED_THEME_COUNTS.b2b).toBe(13);
  });

  it('passe le contrôle de contenu (schéma, dépendances, captures, décompte)', async () => {
    expect(await checkPlugins(process.cwd())).toEqual([]);
  });

  it('un seul plugin est en conception : customer-asset-management, sans lien de démo', async () => {
    const all = await fiches();
    const inDesign = all.filter((f) => f.status === 'design');
    expect(inDesign.map((f) => f.slug)).toEqual(['customer-asset-management']);
    expect(inDesign[0]?.inDemo).toBeUndefined();
    expect(inDesign[0]?.compatibility).toBeUndefined();
    expect(inDesign[0]?.packagist).toBeUndefined();
  });

  it('les 23 autres plugins sont installés dans la démo', async () => {
    const all = await fiches();
    const inDemo = all.filter((f) => f.inDemo === true);
    expect(inDemo).toHaveLength(23);
    expect(all.filter((f) => f.inDemo !== true).map((f) => f.slug)).toEqual([
      'customer-asset-management',
    ]);
  });

  it('registration-approval nécessite channel-access, punchout-cxml complète company-accounts', async () => {
    const all = await fiches();
    const bySlug = new Map(all.map((f) => [f.slug, f]));
    expect(bySlug.get('registration-approval')?.requires).toEqual(['channel-access']);
    expect(bySlug.get('channel-access')?.requires ?? []).toEqual([]);
    expect(bySlug.get('punchout-cxml')?.complements).toEqual(['company-accounts']);
  });
});

describe('configuration de la démo', () => {
  it('une seule URL https, la page des comptes est sur le même site', () => {
    expect(demo.url).toBe('https://sylius-b2b.thibaut-monier.fr');
    expect(demo.accountsUrl).toBe(`${demo.url}/demo/accounts`);
  });
});
