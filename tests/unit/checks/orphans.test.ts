import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkOrphans } from '../../../scripts/checks/lib/orphans.ts';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const page = (links: string[], head = '') =>
  `<!doctype html><html><head>${head}</head><body>${links.map((l) => `<a href="${l}">x</a>`).join('')}</body></html>`;

async function dist(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'orphans-'));
  roots.push(root);
  for (const [path, html] of Object.entries(files)) {
    await mkdir(join(root, dirname(path)), { recursive: true });
    await writeFile(join(root, path), html);
  }
  return root;
}

describe('checkOrphans', () => {
  it('ne signale rien quand chaque page est liée depuis une autre', async () => {
    const root = await dist({
      'index.html': page(['/blog/', '/blog/a/']),
      'blog/index.html': page(['/blog/a/', '/']),
      'blog/a/index.html': page(['/', '/blog/']),
    });
    expect(await checkOrphans(root)).toEqual([]);
  });

  it('signale une page orpheline avec sa route', async () => {
    const root = await dist({
      'index.html': page(['/blog/']),
      'blog/index.html': page(['/']),
      'blog/seule/index.html': page(['/', '/blog/']),
    });
    expect(await checkOrphans(root)).toEqual(['Page orpheline : /blog/seule/']);
  });

  it('un lien vers soi-même ne compte pas', async () => {
    const root = await dist({
      'index.html': page(['/']),
      'a/index.html': page(['/a/', '/']),
    });
    expect(await checkOrphans(root)).toEqual(['Page orpheline : /a/']);
  });

  it('résout les liens relatifs, ignore ancres et requêtes', async () => {
    const root = await dist({
      'index.html': page(['/blog/#haut', '/blog/?q=1']),
      'blog/index.html': page(['a/', '../']),
      'blog/a/index.html': page(['/']),
    });
    expect(await checkOrphans(root)).toEqual([]);
  });

  it('exclut les pages noindex et la 404 du contrôle', async () => {
    const root = await dist({
      'index.html': page(['/']),
      '404.html': page([]),
      'contact/merci/index.html': page([], '<meta name="robots" content="noindex">'),
    });
    expect(await checkOrphans(root)).toEqual([]);
  });
});
