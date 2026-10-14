import { describe, expect, it, vi } from 'vitest';
import { ossMetricsSchema } from '../../../src/content/schemas/oss-metrics.ts';
import {
  type CollectDeps,
  type Target,
  collectMetrics,
} from '../../../scripts/lib/fetch-metrics.ts';

type Answer = Response | Error;
type Router = (url: string, init: RequestInit) => Answer | undefined;

const NOW = new Date('2026-10-14T06:00:00.000Z');
const TWO_DAYS_AGO = '2026-10-12T06:00:00.000Z';
const TOKEN = 'ghp_SECRET_TOKEN_VALUE';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const repoBody = { stargazers_count: 7, pushed_at: '2026-10-10T12:00:00Z' };
const releaseBody = { tag_name: 'v1.2.0', published_at: '2026-10-01T09:00:00Z' };
const packagistBody = {
  package: {
    downloads: { total: 230, monthly: 46 },
    versions: {
      'dev-main': { version: 'dev-main' },
      'v1.2.0': { version: 'v1.2.0' },
      'v1.1.0': { version: 'v1.1.0' },
    },
  },
};

const a: Target = {
  slug: 'alpha',
  repo: 'thibmonier/sylius-alpha-plugin',
  packagist: 'tmonier/sylius-alpha-plugin',
};
const b: Target = {
  slug: 'beta',
  repo: 'thibmonier/sylius-beta-plugin',
  packagist: 'tmonier/sylius-beta-plugin',
};

function harness(router: Router, token?: string) {
  const calls: string[] = [];
  const logs: string[] = [];
  const inits: RequestInit[] = [];
  const deps: CollectDeps = {
    fetch: async (url, init) => {
      calls.push(url);
      inits.push(init);
      const answer = router(url, init) ?? new Response('{}', { status: 404 });
      if (answer instanceof Error) throw answer;
      return answer;
    },
    now: () => NOW,
    sleep: vi.fn(async () => undefined),
    log: { info: (m) => logs.push(m), warn: (m) => logs.push(m) },
    ...(token ? { token } : {}),
  };
  return { deps, calls, logs, inits };
}

const happy: Router = (url) => {
  if (url.includes('/releases/latest')) return json(releaseBody);
  if (url.startsWith('https://api.github.com/repos/')) return json(repoBody);
  if (url.startsWith('https://packagist.org/packages/')) return json(packagistBody);
  return undefined;
};

const previousFor = (...targets: Target[]) =>
  ossMetricsSchema.parse({
    generatedAt: TWO_DAYS_AGO,
    entries: Object.fromEntries(
      targets.map((t) => [
        t.repo,
        {
          fetchedAt: TWO_DAYS_AGO,
          github: {
            stars: 5,
            pushedAt: '2026-10-05T00:00:00Z',
            latestRelease: { tag: 'v1.1.0', publishedAt: '2026-09-20T00:00:00Z' },
          },
          packagist: { downloadsTotal: 200, downloadsMonthly: 40, latestVersion: 'v1.1.0' },
        },
      ]),
    ),
  });

describe('collectMetrics : succès', () => {
  it('collecte GitHub et Packagist et daterait chaque entrée du jour de collecte', async () => {
    const { deps } = harness(happy);
    const data = await collectMetrics([a], undefined, deps);
    expect(ossMetricsSchema.safeParse(JSON.parse(JSON.stringify(data))).success).toBe(true);
    expect(data.generatedAt).toEqual(NOW);
    expect(data.entries[a.repo]).toEqual({
      fetchedAt: NOW,
      github: {
        stars: 7,
        pushedAt: new Date('2026-10-10T12:00:00Z'),
        latestRelease: { tag: 'v1.2.0', publishedAt: new Date('2026-10-01T09:00:00Z') },
      },
      packagist: { downloadsTotal: 230, downloadsMonthly: 46, latestVersion: 'v1.2.0' },
    });
  });

  it('émet 3 requêtes par plugin publié, 2 par plugin non publié sur Packagist', async () => {
    const unpublished: Target = { slug: 'gamma', repo: 'thibmonier/sylius-gamma-plugin' };
    const { deps, calls, logs } = harness(happy);
    const data = await collectMetrics([a, unpublished], undefined, deps);
    expect(calls).toHaveLength(5);
    expect(calls.filter((url) => url.startsWith('https://packagist.org/'))).toHaveLength(1);
    expect(data.entries[unpublished.repo]?.packagist).toBeUndefined();
    expect(logs.filter((m) => m.includes('gamma'))).toEqual([]);
  });

  it('trie les entrées par clé et ignore les dépôts qui ne sont plus des cibles', async () => {
    const stale = previousFor({ slug: 'old', repo: 'thibmonier/old', packagist: 'x/y' }, b);
    const { deps } = harness(happy);
    const data = await collectMetrics([b, a], stale, deps);
    expect(Object.keys(data.entries)).toEqual([a.repo, b.repo]);
  });

  it('garde null quand le dépôt n’a pas encore de release (404), sans avertissement', async () => {
    const router: Router = (url) =>
      url.includes('/releases/latest') ? json({}, 404) : happy(url, {});
    const { deps, logs } = harness(router);
    const data = await collectMetrics([a], undefined, deps);
    expect(data.entries[a.repo]?.github?.latestRelease).toBeNull();
    expect(logs).toEqual([]);
  });

  it('retient la dernière version stable de Packagist, pas dev-main', async () => {
    const { deps } = harness(happy);
    const data = await collectMetrics([a], undefined, deps);
    expect(data.entries[a.repo]?.packagist?.latestVersion).toBe('v1.2.0');
  });
});

describe('collectMetrics : repli', () => {
  it('Packagist 503 : conserve la valeur précédente avec sa date et avertit', async () => {
    const router: Router = (url) =>
      url.startsWith('https://packagist.org/') ? json({}, 503) : happy(url, {});
    const { deps, logs, calls } = harness(router);
    const data = await collectMetrics([a], previousFor(a), deps);
    const entry = data.entries[a.repo];
    expect(entry?.packagist).toEqual({
      downloadsTotal: 200,
      downloadsMonthly: 40,
      latestVersion: 'v1.1.0',
    });
    expect(entry?.github?.stars).toBe(7);
    expect(entry?.fetchedAt).toEqual(new Date(TWO_DAYS_AGO));
    expect(logs.some((m) => m.includes('alpha') && m.toLowerCase().includes('packagist'))).toBe(
      true,
    );
    expect(calls.filter((url) => url.startsWith('https://packagist.org/'))).toHaveLength(3);
  });

  it('GitHub 403 : plus aucune requête GitHub, valeurs précédentes conservées, Packagist continue', async () => {
    const router: Router = (url) =>
      url.startsWith('https://api.github.com/') ? json({}, 403) : happy(url, {});
    const { deps, calls } = harness(router);
    const data = await collectMetrics([a, b], previousFor(a, b), deps);
    expect(calls.filter((url) => url.startsWith('https://api.github.com/'))).toHaveLength(1);
    expect(calls.filter((url) => url.startsWith('https://packagist.org/'))).toHaveLength(2);
    expect(data.entries[a.repo]?.github?.stars).toBe(5);
    expect(data.entries[b.repo]?.github?.stars).toBe(5);
    expect(data.entries[a.repo]?.packagist?.downloadsTotal).toBe(230);
  });

  it('ne reprend pas un 403 (limite de débit) et ne dort pas', async () => {
    const router: Router = () => json({}, 403);
    const { deps } = harness(router);
    await collectMetrics([a], previousFor(a), deps);
    expect(deps.sleep).not.toHaveBeenCalledWith(expect.any(Number));
  });

  it('réponse Packagist sans « downloads » : omet les téléchargements de ce plugin seulement', async () => {
    const router: Router = (url) =>
      url.includes('sylius-alpha-plugin.json')
        ? json({ package: { versions: {} } })
        : happy(url, {});
    const { deps, logs } = harness(router);
    const data = await collectMetrics([a, b], undefined, deps);
    expect(data.entries[a.repo]?.packagist).toBeUndefined();
    expect(data.entries[a.repo]?.github?.stars).toBe(7);
    expect(data.entries[b.repo]?.packagist?.downloadsTotal).toBe(230);
    expect(logs.some((m) => m.includes('downloads') && m.includes('alpha'))).toBe(true);
  });

  it('sans cache ni API : métrique absente et message de la story', async () => {
    const router: Router = () => new Error('fetch failed');
    const { deps, logs } = harness(router);
    const data = await collectMetrics([a], undefined, deps);
    expect(data.entries[a.repo]).toBeUndefined();
    expect(logs).toContain('Métrique « stars » indisponible pour « alpha » : bloc masqué');
  });

  it('release inconnue sans cache : null plutôt qu’une valeur inventée, et avertissement', async () => {
    const router: Router = (url) =>
      url.includes('/releases/latest') ? json({}, 500) : happy(url, {});
    const { deps, logs } = harness(router);
    const data = await collectMetrics([a], undefined, deps);
    expect(data.entries[a.repo]?.github?.latestRelease).toBeNull();
    expect(logs).toContain('Métrique « release » indisponible pour « alpha » : bloc masqué');
  });

  it('ne lève jamais d’exception, même si tout échoue (code de sortie 0 en panne réseau)', async () => {
    const { deps } = harness(() => new Error('réseau coupé'));
    await expect(collectMetrics([a, b], previousFor(a, b), deps)).resolves.toBeDefined();
  });

  it('une valeur conservée n’est jamais rajeunie : fetchedAt est la plus ancienne date retenue', async () => {
    const router: Router = (url) =>
      url.startsWith('https://packagist.org/') ? new Error('timeout') : happy(url, {});
    const { deps } = harness(router);
    const data = await collectMetrics([a], previousFor(a), deps);
    expect(data.entries[a.repo]?.fetchedAt).toEqual(new Date(TWO_DAYS_AGO));
  });
});

describe('collectMetrics : délais et reprises', () => {
  it('passe un délai de 10 s à chaque appel', async () => {
    const { deps, inits } = harness(happy);
    await collectMetrics([a], undefined, deps);
    expect(inits.length).toBeGreaterThan(0);
    for (const init of inits) expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('reprend 2 fois après une erreur réseau puis réussit', async () => {
    let failures = 0;
    const router: Router = (url) => {
      if (url.startsWith('https://packagist.org/') && failures < 2) {
        failures += 1;
        return new Error('ECONNRESET');
      }
      return happy(url, {});
    };
    const { deps, calls } = harness(router);
    const data = await collectMetrics([a], undefined, deps);
    expect(data.entries[a.repo]?.packagist?.downloadsTotal).toBe(230);
    expect(calls.filter((url) => url.startsWith('https://packagist.org/'))).toHaveLength(3);
    expect(deps.sleep).toHaveBeenCalledTimes(2);
  });
});

describe('collectMetrics : jeton GitHub', () => {
  it('envoie le jeton à GitHub seulement, jamais à Packagist', async () => {
    const { deps, calls, inits } = harness(happy, TOKEN);
    await collectMetrics([a], undefined, deps);
    calls.forEach((url, index) => {
      const headers = new Headers(inits[index]?.headers);
      expect(headers.get('authorization') === `Bearer ${TOKEN}`).toBe(
        url.startsWith('https://api.github.com/'),
      );
    });
  });

  it('n’écrit jamais le jeton dans les journaux ni dans les données', async () => {
    const router: Router = (url) =>
      url.startsWith('https://api.github.com/')
        ? json({ message: TOKEN }, 403)
        : new Error(`échec ${TOKEN}`);
    const { deps, logs } = harness(router, TOKEN);
    const data = await collectMetrics([a, b], undefined, deps);
    expect(logs.join('\n')).not.toContain(TOKEN);
    expect(JSON.stringify(data)).not.toContain(TOKEN);
  });
});
