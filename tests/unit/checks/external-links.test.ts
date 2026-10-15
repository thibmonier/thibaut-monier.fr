import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type StatusFetcher,
  checkShowcaseLinks,
  collectShowcaseLinks,
} from '../../../scripts/checks/lib/external-links.ts';

const roots: string[] = [];
const PR = 'https://github.com/career-ops-hq/career-ops/pull/3808';
const PKG = 'https://packagist.org/packages/tailsfadmin/tailsfadmin-bundle';

async function distWith(pages: Record<string, string[]>): Promise<string> {
  const dist = await mkdtemp(join(tmpdir(), 'external-links-'));
  roots.push(dist);
  for (const [route, hrefs] of Object.entries(pages)) {
    const file = join(dist, route, 'index.html');
    await mkdir(dirname(file), { recursive: true });
    const anchors = hrefs.map((href) => `<a href="${href}">lien</a>`).join('');
    await writeFile(file, `<html><body>${anchors}</body></html>`);
  }
  return dist;
}

const sleep = vi.fn(async () => undefined);
const fetcherReturning =
  (status: Record<string, number | Error>): StatusFetcher =>
  async (url) => {
    const value = status[url] ?? 200;
    if (value instanceof Error) throw value;
    return { status: value };
  };

afterEach(async () => {
  sleep.mockClear();
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('collectShowcaseLinks', () => {
  it('ne lit que les pages de /open-source/ et /blog/ et ignore les liens internes et les ancres', async () => {
    const dist = await distWith({
      'open-source/career-ops': [PR + '#section', '/parcours/', 'mailto:a@b.fr'],
      parcours: ['https://example.org/hors-vitrine'],
    });
    const links = await collectShowcaseLinks(dist);
    expect(links).toEqual([{ url: PR, pages: ['/open-source/career-ops/'] }]);
  });

  it('lit aussi les pages du blog : articles et listes, jamais le reste du site', async () => {
    const dist = await distWith({
      'blog/mon-article': [PKG, '/blog/autre/'],
      'blog/page/2': [PKG],
      parcours: ['https://example.org/hors-blog'],
    });
    expect(await collectShowcaseLinks(dist)).toEqual([
      { url: PKG, pages: ['/blog/mon-article/', '/blog/page/2/'] },
    ]);
  });

  it('signale un lien mort d’une page du blog, mais 429 reste un avertissement', async () => {
    const dist = await distWith({ 'blog/mon-article': [PR, PKG] });
    const result = await checkShowcaseLinks(
      await collectShowcaseLinks(dist),
      fetcherReturning({ [PR]: 404, [PKG]: 429 }),
      { sleep },
    );
    expect(result.errors).toEqual([`Lien cassé sur /blog/mon-article/ : ${PR} (404)`]);
    expect(result.warnings).toEqual([`Lien indisponible sur /blog/mon-article/ : ${PKG} (429)`]);
  });

  it('regroupe les pages qui partagent un même lien', async () => {
    const dist = await distWith({ 'open-source/a': [PR], 'open-source/b': [PR] });
    const [link] = await collectShowcaseLinks(dist);
    expect(link?.pages).toEqual(['/open-source/a/', '/open-source/b/']);
  });

  it('renvoie une liste vide quand la vitrine est absente de dist/', async () => {
    const dist = await distWith({ parcours: [] });
    expect(await collectShowcaseLinks(dist)).toEqual([]);
  });
});

describe('checkShowcaseLinks', () => {
  const pagesWith = (...urls: string[]) => [
    { url: urls[0] as string, pages: ['/open-source/career-ops/'] },
    ...urls.slice(1).map((url) => ({ url, pages: ['/open-source/tailsfadmin/'] })),
  ];

  it('ne signale rien quand tous les liens répondent', async () => {
    const result = await checkShowcaseLinks(pagesWith(PR), fetcherReturning({}), { sleep });
    expect(result).toEqual({ errors: [], warnings: [] });
  });

  it('bloque sur 404 avec le message de la story', async () => {
    const result = await checkShowcaseLinks(pagesWith(PR), fetcherReturning({ [PR]: 404 }), {
      sleep,
    });
    expect(result.errors).toEqual([`Lien cassé sur /open-source/career-ops/ : ${PR} (404)`]);
    expect(result.warnings).toEqual([]);
  });

  it('bloque sur 410', async () => {
    const result = await checkShowcaseLinks(pagesWith(PKG), fetcherReturning({ [PKG]: 410 }), {
      sleep,
    });
    expect(result.errors).toEqual([`Lien cassé sur /open-source/career-ops/ : ${PKG} (410)`]);
  });

  it('nomme chaque page qui porte le lien cassé', async () => {
    const links = [{ url: PR, pages: ['/open-source/a/', '/open-source/b/'] }];
    const result = await checkShowcaseLinks(links, fetcherReturning({ [PR]: 404 }), { sleep });
    expect(result.errors).toHaveLength(2);
  });

  it('n’échoue pas sur 429 : avertissement après reprises', async () => {
    const fetcher = vi.fn(fetcherReturning({ [PR]: 429 }));
    const result = await checkShowcaseLinks(pagesWith(PR), fetcher, { sleep, retries: 2 });
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      `Lien indisponible sur /open-source/career-ops/ : ${PR} (429)`,
    ]);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('n’échoue pas sur 503 : avertissement après reprises', async () => {
    const result = await checkShowcaseLinks(pagesWith(PR), fetcherReturning({ [PR]: 503 }), {
      sleep,
      retries: 1,
    });
    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(1);
  });

  it('n’échoue pas sur un délai dépassé : avertissement', async () => {
    const timeout = new Error('délai dépassé');
    const result = await checkShowcaseLinks(pagesWith(PR), fetcherReturning({ [PR]: timeout }), {
      sleep,
      retries: 1,
    });
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      `Lien injoignable sur /open-source/career-ops/ : ${PR} (délai dépassé)`,
    ]);
  });

  it('réussit à la reprise quand l’échec était transitoire', async () => {
    let calls = 0;
    const flaky: StatusFetcher = async () => ({ status: ++calls === 1 ? 503 : 200 });
    const result = await checkShowcaseLinks(pagesWith(PR), flaky, { sleep, retries: 2 });
    expect(result).toEqual({ errors: [], warnings: [] });
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it('ne reprend pas un 404 (définitif)', async () => {
    const fetcher = vi.fn(fetcherReturning({ [PR]: 404 }));
    await checkShowcaseLinks(pagesWith(PR), fetcher, { sleep, retries: 2 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('avertit sur les autres statuts 4xx (403) sans bloquer', async () => {
    const result = await checkShowcaseLinks(pagesWith(PR), fetcherReturning({ [PR]: 403 }), {
      sleep,
      retries: 0,
    });
    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(1);
  });
});
