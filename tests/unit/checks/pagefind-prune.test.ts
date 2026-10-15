import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { pruneUnusedUi } from '../../../scripts/lib/pagefind-prune.ts';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function dist(names: string[]): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'prune-'));
  roots.push(root);
  await mkdir(join(root, 'pagefind'));
  await Promise.all(names.map((name) => writeFile(join(root, 'pagefind', name), 'x')));
  return root;
}

describe('pruneUnusedUi', () => {
  it('supprime les trois interfaces et conserve pagefind.js, le worker, le wasm et l’index', async () => {
    const root = await dist([
      'pagefind.js',
      'pagefind-worker.js',
      'pagefind-entry.json',
      'pagefind-highlight.js',
      'wasm.fr.pagefind',
      'pagefind-ui.js',
      'pagefind-ui.css',
      'pagefind-modular-ui.js',
      'pagefind-modular-ui.css',
      'pagefind-component-ui.js',
      'pagefind-component-ui.css',
    ]);
    const removed = await pruneUnusedUi(root);
    expect(removed).toHaveLength(6);
    expect((await readdir(join(root, 'pagefind'))).sort()).toEqual([
      'pagefind-entry.json',
      'pagefind-highlight.js',
      'pagefind-worker.js',
      'pagefind.js',
      'wasm.fr.pagefind',
    ]);
  });

  it('ne fait rien quand le dossier pagefind est absent', async () => {
    const root = await mkdtemp(join(tmpdir(), 'prune-'));
    roots.push(root);
    expect(await pruneUnusedUi(root)).toEqual([]);
  });
});
