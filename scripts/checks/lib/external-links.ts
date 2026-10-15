import { readFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';
import { walk } from './fs.ts';
import { extractLinks } from './links.ts';

export type StatusFetcher = (url: string) => Promise<{ status: number }>;

export interface ShowcaseLink {
  url: string;
  pages: string[];
}

export interface LinkReport {
  errors: string[];
  warnings: string[];
}

interface Options {
  retries?: number;
  sleep?: (ms: number) => Promise<unknown>;
  concurrency?: number;
}

// Pages dont les liens externes sont vérifiés : la vitrine open source et le blog (articles, listes, séries).
const LINK_PREFIXES = ['open-source/', 'blog/'];
const DEAD_STATUSES = new Set([404, 410]);
const RETRY_DELAY_MS = 1000;
const DEFAULT_RETRIES = 2;
const DEFAULT_CONCURRENCY = 6;
const REQUEST_TIMEOUT_MS = 10_000;

export async function collectShowcaseLinks(distDir: string): Promise<ShowcaseLink[]> {
  const files = (await walk(distDir))
    .map((file) => relative(distDir, file).split(sep).join('/'))
    .filter(
      (file) =>
        LINK_PREFIXES.some((prefix) => file.startsWith(prefix)) && file.endsWith('/index.html'),
    );
  const byUrl = new Map<string, string[]>();
  for (const file of files) {
    const route = `/${file.slice(0, -'index.html'.length)}`;
    const html = await readFile(`${distDir}/${file}`, 'utf8');
    for (const href of extractLinks(html).hrefs) {
      if (!/^https?:\/\//i.test(href)) continue;
      const url = href.split('#')[0] as string;
      byUrl.set(url, [...new Set([...(byUrl.get(url) ?? []), route])]);
    }
  }
  return [...byUrl]
    .map(([url, pages]) => ({ url, pages }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

/** HEAD d'abord, GET si le serveur refuse HEAD ; délai de 10 s par appel. */
export const fetchStatus: StatusFetcher = async (url) => {
  const call = (method: 'HEAD' | 'GET') =>
    fetch(url, {
      method,
      redirect: 'follow',
      headers: { 'user-agent': 'thibaut-monier-site-link-check' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  const head = await call('HEAD');
  if (![403, 405, 501].includes(head.status)) return { status: head.status };
  return { status: (await call('GET')).status };
};

type Outcome = { kind: 'ok' } | { kind: 'dead'; status: number } | { kind: 'soft'; reason: string };

async function probe(
  url: string,
  fetcher: StatusFetcher,
  retries: number,
  sleep: (ms: number) => Promise<unknown>,
): Promise<Outcome> {
  let last: Outcome = { kind: 'ok' };
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (attempt > 0) await sleep(RETRY_DELAY_MS * attempt);
    try {
      const { status } = await fetcher(url);
      if (status < 400) return { kind: 'ok' };
      if (DEAD_STATUSES.has(status)) return { kind: 'dead', status };
      last = { kind: 'soft', reason: String(status) };
    } catch (error) {
      last = { kind: 'soft', reason: error instanceof Error ? error.message : String(error) };
    }
  }
  return last;
}

function describe(link: ShowcaseLink, outcome: Outcome): LinkReport {
  if (outcome.kind === 'ok') return { errors: [], warnings: [] };
  if (outcome.kind === 'dead') {
    return {
      errors: link.pages.map((page) => `Lien cassé sur ${page} : ${link.url} (${outcome.status})`),
      warnings: [],
    };
  }
  const label = /^\d+$/.test(outcome.reason) ? 'indisponible' : 'injoignable';
  return {
    errors: [],
    warnings: link.pages.map(
      (page) => `Lien ${label} sur ${page} : ${link.url} (${outcome.reason})`,
    ),
  };
}

/** Échec seulement sur 404 et 410 ; 429, 5xx et délais d'attente restent des avertissements (E14). */
export async function checkShowcaseLinks(
  links: ShowcaseLink[],
  fetcher: StatusFetcher = fetchStatus,
  {
    retries = DEFAULT_RETRIES,
    sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
    concurrency = DEFAULT_CONCURRENCY,
  }: Options = {},
): Promise<LinkReport> {
  const reports: LinkReport[] = new Array(links.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < links.length) {
      const index = next++;
      const link = links[index] as ShowcaseLink;
      reports[index] = describe(link, await probe(link.url, fetcher, retries, sleep));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, links.length) }, worker));
  return {
    errors: reports.flatMap((report) => report.errors),
    warnings: reports.flatMap((report) => report.warnings),
  };
}
