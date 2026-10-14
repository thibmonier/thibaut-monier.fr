import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { walk } from './fs.ts';

export interface BrokenLink {
  file: string;
  href: string;
  message: string;
}

export type Fetcher = (url: string) => Promise<{ status: number }>;

const HREF = /<a\b[^>]*?\shref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const ID = /\s(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const IGNORED_SCHEMES = /^(?:mailto:|tel:|javascript:|data:|sms:)/i;

export function extractLinks(html: string): { hrefs: string[]; ids: string[] } {
  const pick = (re: RegExp) => [...html.matchAll(re)].map((m) => m[1] ?? m[2] ?? '');
  return { hrefs: pick(HREF), ids: pick(ID) };
}

const isExternal = (href: string) => /^(?:https?:)?\/\//i.test(href);

// Chemin du fichier de dist correspondant à une URL interne (null si introuvable).
function resolveTarget(distDir: string, pathname: string): string | null {
  const clean = decodeURIComponent(pathname);
  const candidates = clean.endsWith('/')
    ? [join(distDir, clean, 'index.html')]
    : [join(distDir, clean), join(distDir, clean, 'index.html'), join(distDir, `${clean}.html`)];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function idsOf(file: string, cache: Map<string, Set<string>>): Promise<Set<string>> {
  const cached = cache.get(file);
  if (cached) return cached;
  const ids = new Set(extractLinks(await readFile(file, 'utf8')).ids);
  cache.set(file, ids);
  return ids;
}

// Liens internes et ancres de toutes les pages HTML de dist/.
export async function findBrokenInternalLinks(distDir: string): Promise<BrokenLink[]> {
  const pages = (await walk(distDir)).filter((file) => file.endsWith('.html'));
  const idCache = new Map<string, Set<string>>();
  const broken: BrokenLink[] = [];

  for (const page of pages) {
    const rel = `/${relative(distDir, page).split(sep).join('/')}`;
    const route = rel.endsWith('index.html') ? rel.slice(0, -'index.html'.length) : rel;
    const { hrefs } = extractLinks(await readFile(page, 'utf8'));

    for (const href of hrefs) {
      if (href === '' || isExternal(href) || IGNORED_SCHEMES.test(href)) continue;
      const url = new URL(href, `http://local${route}`);
      const target = href.startsWith('#') ? page : resolveTarget(distDir, url.pathname);
      if (!target) {
        broken.push({ file: rel, href, message: `${rel} : lien interne cassé « ${href} »` });
        continue;
      }
      const fragment = decodeURIComponent(url.hash.slice(1));
      if (fragment && target.endsWith('.html') && !(await idsOf(target, idCache)).has(fragment)) {
        broken.push({ file: rel, href, message: `${rel} : ancre manquante « ${href} »` });
      }
    }
  }
  return broken;
}

export async function collectExternalLinks(distDir: string): Promise<string[]> {
  const pages = (await walk(distDir)).filter((file) => file.endsWith('.html'));
  const urls = new Set<string>();
  for (const page of pages) {
    for (const href of extractLinks(await readFile(page, 'utf8')).hrefs) {
      if (/^https?:\/\//i.test(href)) urls.add(href.split('#')[0] as string);
    }
  }
  return [...urls].sort();
}

const defaultFetcher: Fetcher = async (url) => {
  const response = await fetch(url, {
    method: 'HEAD',
    redirect: 'follow',
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status };
};

// Liens externes : avertissements uniquement, jamais bloquants.
export async function checkExternalLinks(
  urls: string[],
  fetcher: Fetcher = defaultFetcher,
): Promise<string[]> {
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const { status } = await fetcher(url);
        return status >= 400 ? `Lien externe indisponible (${status}) : ${url}` : null;
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        return `Lien externe injoignable (${reason}) : ${url}`;
      }
    }),
  );
  return results.filter((warning): warning is string => warning !== null);
}
