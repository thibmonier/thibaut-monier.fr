import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  MAX_INDEX_BYTES,
  checkPagefind,
  indexBytes,
  indexedPages,
} from '../../../scripts/checks/lib/pagefind.ts';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const entry = (pages: number) =>
  JSON.stringify({
    version: '1.5.2',
    languages: { fr: { hash: 'fr_x', wasm: 'fr', page_count: pages } },
  });

/** Dossier `dist/` minimal : l'entrée Pagefind, des fragments d'index et des fichiers qui ne comptent pas dans le budget. */
async function dist(pages: number, indexSize = 1000, withUi = false): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'pagefind-'));
  roots.push(root);
  const files: Record<string, string | Buffer> = {
    'pagefind/pagefind-entry.json': entry(pages),
    'pagefind/fragment/a.pf_fragment': Buffer.alloc(indexSize),
    'pagefind/index/a.pf_index': Buffer.alloc(10),
    'pagefind/filter/a.pf_filter': Buffer.alloc(10),
    'pagefind/pagefind.fr_x.pf_meta': Buffer.alloc(10),
    // Hors budget : script d'entrée et module WebAssembly.
    'pagefind/pagefind.js': Buffer.alloc(200_000),
    'pagefind/wasm.fr.pagefind': Buffer.alloc(200_000),
  };
  if (withUi) files['pagefind/pagefind-ui.js'] = Buffer.alloc(200_000);
  for (const [path, data] of Object.entries(files)) {
    await mkdir(join(root, dirname(path)), { recursive: true });
    await writeFile(join(root, path), data);
  }
  return root;
}

describe('indexedPages et indexBytes', () => {
  it('additionne les pages de toutes les langues de l’entrée', async () => {
    expect(await indexedPages(await dist(28))).toBe(28);
  });

  it('ne compte dans le poids que les fichiers d’index (fragments, index, filtres, méta, entrée)', async () => {
    const root = await dist(28, 1000);
    expect(await indexBytes(root)).toBe(1000 + 10 + 10 + 10 + Buffer.byteLength(entry(28)));
  });
});

describe('checkPagefind', () => {
  it('ne signale rien pour un index plein, du bon nombre de pages et sous le budget', async () => {
    expect(await checkPagefind(await dist(28), 28)).toEqual([]);
  });

  it('signale un index absent', async () => {
    const root = await mkdtemp(join(tmpdir(), 'pagefind-'));
    roots.push(root);
    expect(await checkPagefind(root, 28)).toEqual([
      'Index Pagefind absent : pagefind/pagefind-entry.json introuvable (lancer npm run build:search)',
    ]);
  });

  it('signale un index vide', async () => {
    expect(await checkPagefind(await dist(0), 28)).toContain('Index Pagefind vide');
  });

  it('signale un nombre de pages indexées différent du nombre d’articles publiés', async () => {
    expect(await checkPagefind(await dist(27), 28)).toEqual([
      'Index Pagefind : 27 pages indexées, 28 articles publiés attendus',
    ]);
  });

  it('signale pagefind.js absent : le site ne pourrait plus chercher', async () => {
    const root = await dist(28);
    await rm(join(root, 'pagefind/pagefind.js'));
    expect(await checkPagefind(root, 28)).toEqual([
      'Index Pagefind : pagefind/pagefind.js absent (le site le charge à la recherche)',
    ]);
  });

  it('signale les interfaces par défaut restées dans dist/', async () => {
    expect(await checkPagefind(await dist(28, 1000, true), 28)).toEqual([
      'Index Pagefind : interface non chargée à supprimer (npm run build:search) : pagefind-ui.js',
    ]);
  });

  it('signale un index de plus de 500 Ko, wasm exclu', async () => {
    const heavy = await checkPagefind(await dist(28, MAX_INDEX_BYTES), 28);
    expect(heavy).toHaveLength(1);
    expect(heavy[0]).toMatch(/^Index Pagefind trop lourd : \d+ Ko \(budget 500 Ko\)$/);
  });
});
