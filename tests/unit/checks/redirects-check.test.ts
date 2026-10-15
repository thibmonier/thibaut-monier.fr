import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { parseRedirects } from '../../../src/lib/redirects.ts';
import check from '../../../scripts/checks/redirects.content.check.ts';
import {
  checkRedirectCoverage,
  checkRedirectTargets,
} from '../../../scripts/checks/lib/redirects.ts';

const FIXTURES = join(import.meta.dirname, '../../fixtures/redirects');
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function dist(files: string[]): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'redirects-'));
  roots.push(root);
  for (const path of files) {
    await mkdir(join(root, dirname(path)), { recursive: true });
    await writeFile(join(root, path), '<html></html>');
  }
  return root;
}

const fixtureTable = async () =>
  parseRedirects(await readFile(join(FIXTURES, 'table.yaml'), 'utf8'));

describe('checkRedirectTargets', () => {
  it('ne signale rien quand chaque cible existe dans dist/ (page ou fichier)', async () => {
    const root = await dist([
      'blog/la-spec/index.html',
      'blog/index.html',
      'blog/categorie/methode/index.html',
      'rss.xml',
    ]);
    expect(await checkRedirectTargets(root, await fixtureTable())).toEqual([]);
  });

  it('signale la ligne fautive pour une cible absente', async () => {
    const root = await dist(['blog/index.html', 'blog/categorie/methode/index.html', 'rss.xml']);
    expect(await checkRedirectTargets(root, await fixtureTable())).toEqual([
      'redirects.yaml entrée 1 : /blog/la-spec -> /blog/la-spec/ : cible absente de dist/',
    ]);
  });
});

describe('checkRedirectTargets : types différés', () => {
  it('ignore les types listés (flux non encore produit) mais pas les autres', async () => {
    const root = await dist(['blog/index.html', 'blog/categorie/methode/index.html']);
    expect(await checkRedirectTargets(root, await fixtureTable(), ['flux'])).toEqual([
      'redirects.yaml entrée 1 : /blog/la-spec -> /blog/la-spec/ : cible absente de dist/',
    ]);
  });
});

describe('checkRedirectCoverage', () => {
  const entries = parseRedirects('- { from: /blog/a, to: /blog/a/, kind: article }');

  it('signale un article sans correspondance avec la couverture exacte', () => {
    expect(checkRedirectCoverage(['a', 'b'], entries)).toEqual([
      'Correspondance manquante : b (couverture 1/2)',
    ]);
  });

  it('ne signale rien quand tous les articles sont couverts', () => {
    expect(checkRedirectCoverage(['a'], entries)).toEqual([]);
  });
});

describe('contrôle redirects (content)', () => {
  it("échoue sur une apostrophe dans `to` : elle ouvrirait une chaîne dans le 'return 301' de nginx", async () => {
    const root = await mkdtemp(join(tmpdir(), 'redirects-'));
    roots.push(root);
    await mkdir(join(root, 'src/data'), { recursive: true });
    await writeFile(
      join(root, 'src/data/redirects.yaml'),
      `- { from: /blog/a, to: "/blog/l'a/", kind: article }\n`,
    );
    await expect(check({ root } as Parameters<typeof check>[0])).rejects.toThrow(
      /entrée 1.*interdit/,
    );
  });
});
