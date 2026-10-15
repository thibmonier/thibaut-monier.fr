import { readFile } from 'node:fs/promises';
import { extractLinks } from './links.ts';
import { isNoindex, pageRoutes } from './canonical.ts';
import { walk } from './fs.ts';

// « Aucune page orpheline » (US-010) : toute page de dist/ (hors 404 et pages noindex) est la cible d'au moins
// un lien interne d'une autre page.

const IGNORED = /^(?:mailto:|tel:|javascript:|data:|sms:|https?:|\/\/)/i;

function routeOf(href: string, from: string): string | null {
  if (href === '' || IGNORED.test(href)) return null;
  const { pathname } = new URL(href, `http://local${from}`);
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return null; // adresse mal encodée : le contrôle des liens internes la signale
  }
  if (path.endsWith('/')) return path;
  return /\.[a-z0-9]+$/i.test(path) ? null : `${path}/`;
}

export async function checkOrphans(distDir: string): Promise<string[]> {
  const pages = await pageRoutes(distDir);
  const linked = new Set<string>();
  const sources = (await walk(distDir)).filter((file) => file.endsWith('.html'));
  const routeOfFile = new Map(pages.map(({ route, file }) => [file, route]));
  for (const file of sources) {
    const from = routeOfFile.get(file) ?? '/';
    for (const href of extractLinks(await readFile(file, 'utf8')).hrefs) {
      const target = routeOf(href, from);
      if (target !== null && target !== from) linked.add(target);
    }
  }
  const orphans: string[] = [];
  for (const { route, file } of pages) {
    if (!linked.has(route) && route !== '/' && !isNoindex(await readFile(file, 'utf8'))) {
      orphans.push(`Page orpheline : ${route}`);
    }
  }
  return orphans;
}
