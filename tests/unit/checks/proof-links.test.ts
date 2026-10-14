import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkProofLinks, extractProofs } from '../../../scripts/checks/lib/proof-links.ts';

const anchor = (id: string, href: string) =>
  `<a class="x" href="${href}" data-proof="${id}">Preuve ${id}</a>`;

const home = (links: Record<string, string>) =>
  `<!doctype html><main>${Object.entries(links)
    .map(([id, href]) => anchor(id, href))
    .join('')}<a href="/contact/">hors preuve</a></main>`;

const valid = {
  a: 'https://github.com/thibmonier',
  b: 'https://github.com/career-ops-hq/career-ops/pulls',
  c: '/parcours/',
  d: '/parcours/#x',
};

const dirs: string[] = [];
async function distWith(index: string, routes: string[] = ['parcours']): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'proofs-'));
  dirs.push(dir);
  await writeFile(join(dir, 'index.html'), index);
  for (const route of routes) {
    await mkdir(join(dir, route), { recursive: true });
    await writeFile(join(dir, route, 'index.html'), '<!doctype html>');
  }
  return dir;
}

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('extractProofs', () => {
  it('ne retient que les liens portant data-proof, quel que soit l’ordre des attributs', () => {
    const html = `<a data-proof="z" href="/parcours/">z</a>${anchor('y', 'https://a.fr')}<a href="/x/">n</a>`;
    expect(extractProofs(html)).toEqual([
      { id: 'z', link: '/parcours/' },
      { id: 'y', link: 'https://a.fr' },
    ]);
  });
});

describe('checkProofLinks', () => {
  it('ne signale rien quand les 4 preuves sont valides', async () => {
    expect(await checkProofLinks(await distWith(home(valid)))).toEqual([]);
  });

  it('signale une preuve vers une route absente de dist', async () => {
    const dist = await distWith(home({ ...valid, c: '/inexistant/' }));
    expect(await checkProofLinks(dist)).toEqual(['Lien de preuve invalide : c']);
  });

  it('signale un lien externe non https', async () => {
    const dist = await distWith(home({ ...valid, a: 'http://github.com/x' }));
    expect(await checkProofLinks(dist)).toEqual(['Lien de preuve invalide : a']);
  });

  it('signale un nombre de preuves incorrect', async () => {
    const dist = await distWith(home({ a: valid.a }));
    expect(await checkProofLinks(dist)).toEqual(['Il faut exactement 4 preuves (reçu : 1)']);
  });
});
