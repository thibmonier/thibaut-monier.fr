import { readFile } from 'node:fs/promises';
import { isSitemapIndexable } from '../../../src/lib/sitemap.ts';
import { readPages } from './html-meta.ts';

const LOC = /<loc>([^<]+)<\/loc>/g;
const locs = (xml: string): string[] => [...xml.matchAll(LOC)].map((m) => m[1] as string);

async function read(path: string): Promise<string | null> {
  return readFile(path, 'utf8').catch(() => null);
}

async function sitemapPaths(distDir: string): Promise<string[] | null> {
  const index = await read(`${distDir}/sitemap-index.xml`);
  if (index === null) return null;
  const paths: string[] = [];
  for (const sitemap of locs(index)) {
    const xml = await read(`${distDir}${new URL(sitemap).pathname}`);
    if (xml !== null) paths.push(...locs(xml).map((loc) => new URL(loc).pathname));
  }
  return paths;
}

// Toute page indexable de dist/ est dans le sitemap ; aucune page noindex n'y figure ; aucune entrée sans page.
export async function checkSitemapCoherence(distDir: string): Promise<string[]> {
  const listed = await sitemapPaths(distDir);
  if (listed === null) return ['sitemap-index.xml absent de dist/'];
  const inSitemap = new Set(listed);
  const errors: string[] = [];
  const known = new Set<string>();
  for (const { route, html } of await readPages(distDir)) {
    known.add(route);
    const indexable = isSitemapIndexable(route, html);
    if (indexable && !inSitemap.has(route))
      errors.push(`Page indexable absente du sitemap : ${route}`);
    if (!indexable && inSitemap.has(route))
      errors.push(`Page noindex présente dans le sitemap : ${route}`);
  }
  for (const path of listed) {
    if (!known.has(path)) errors.push(`Entrée du sitemap sans page : ${path}`);
  }
  return errors;
}
