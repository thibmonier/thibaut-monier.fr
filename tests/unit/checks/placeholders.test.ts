import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkPlaceholders, findPlaceholders } from '../../../scripts/checks/lib/placeholders.ts';

describe('findPlaceholders', () => {
  it('détecte les marqueurs de contenu provisoire, sans tenir compte de la casse', () => {
    expect(findPlaceholders('<p>Adresse : à vérifier avant publication</p>')).toEqual([
      'à vérifier',
    ]);
    expect(findPlaceholders('<p>TODO : compléter</p>')).toEqual(['todo']);
    expect(findPlaceholders('<p>Lorem ipsum dolor</p>')).toEqual(['lorem ipsum']);
  });

  it('accepte un contenu définitif', () => {
    expect(findPlaceholders('<p>Hébergeur : Railway Corp.</p>')).toEqual([]);
  });

  it('ne confond pas un mot contenant « todo » avec un marqueur', () => {
    expect(findPlaceholders('<p>Mastodon, potodolce et autodoc</p>')).toEqual([]);
  });

  it('ignore les marqueurs placés dans des commentaires HTML ou des scripts', () => {
    expect(findPlaceholders('<!-- TODO interne --><p>ok</p>')).toEqual([]);
    expect(findPlaceholders('<script>// todo</script><p>ok</p>')).toEqual([]);
  });
});

const dirs: string[] = [];
afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function distWith(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'dist-'));
  dirs.push(dir);
  for (const [path, html] of Object.entries(files)) {
    await mkdir(join(dir, path, '..'), { recursive: true });
    await writeFile(join(dir, path), html);
  }
  return dir;
}

describe('checkPlaceholders', () => {
  it('signale chaque page publiée contenant un marqueur', async () => {
    const dist = await distWith({
      'index.html': '<p>ok</p>',
      'mentions-legales/index.html': '<p>à vérifier avant publication</p>',
    });
    expect(await checkPlaceholders(dist)).toEqual([
      'Contenu provisoire publié dans mentions-legales/index.html : « à vérifier »',
    ]);
  });

  it('ne lit que les fichiers HTML', async () => {
    const dist = await distWith({ 'index.html': '<p>ok</p>', 'notes.txt': 'TODO' });
    expect(await checkPlaceholders(dist)).toEqual([]);
  });
});
