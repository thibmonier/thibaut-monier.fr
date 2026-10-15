import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { absoluteUrl } from './site-url.ts';

// Briques pures du sitemap et de robots.txt (US-024). `astro.config.mjs` les branche sur `@astrojs/sitemap`
// (le plugin ne voit que des URL : la liste d'exclusion ci-dessous est donc un chemin, vérifiée contre le HTML
// réel par le contrôle `sitemap-coherence`).

/** Pages `noindex` : jamais dans le sitemap. */
export const SITEMAP_EXCLUDED_PATHS = ['/contact/merci/', '/recherche/', '/404/'] as const;

const toPath = (urlOrPath: string): string =>
  urlOrPath.startsWith('/') ? urlOrPath : new URL(urlOrPath).pathname;

export function isExcludedFromSitemap(urlOrPath: string): boolean {
  return (SITEMAP_EXCLUDED_PATHS as readonly string[]).includes(toPath(urlOrPath));
}

/** `true` si le HTML porte `<meta name="robots" content="…noindex…">` (quel que soit l'ordre des attributs). */
export function hasNoindexMeta(html: string): boolean {
  return (
    /<meta\b[^>]*\bname=["']robots["'][^>]*noindex/i.test(html) ||
    /<meta\b[^>]*noindex[^>]*\bname=["']robots["']/i.test(html)
  );
}

export function isSitemapIndexable(path: string, html: string): boolean {
  return path !== '/404/' && !hasNoindexMeta(html);
}

export interface LastmodSources {
  /** Date du contenu par chemin (`updatedDate ?? pubDate` d'un article, date d'une page légale). */
  contentDates: Record<string, Date>;
  buildDate: Date;
}

/** Date du contenu quand elle existe, sinon date du build ; jamais une date future (écart E18). */
export function lastmodFor(path: string, sources: LastmodSources): Date {
  const date = sources.contentDates[path];
  return date !== undefined && date.getTime() <= sources.buildDate.getTime()
    ? date
    : sources.buildDate;
}

export function buildRobots(origin: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap-index.xml', origin)}\n`;
}

// --- Lecture des dates de contenu (Node, au chargement de astro.config.mjs) -----------------------------------

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

function frontmatterDate(source: string, key: string): Date | undefined {
  const block = FRONTMATTER.exec(source)?.[1] ?? '';
  const value = new RegExp(`^${key}:\\s*['"]?([0-9T:.\\-Z+]+)['"]?\\s*$`, 'm').exec(block)?.[1];
  const date = value === undefined ? undefined : new Date(value);
  return date !== undefined && !Number.isNaN(date.getTime()) ? date : undefined;
}

function markdownFiles(dir: string): string[] {
  try {
    return readdirSync(dir).filter((name) => /\.mdx?$/.test(name));
  } catch {
    return [];
  }
}

/**
 * Dates des articles (`/blog/<slug>/`) et des pages légales (`/<nom>/`) lues dans leur frontmatter. Lecture
 * directe des fichiers : `astro.config.mjs` s'exécute avant les collections. Une date illisible est ignorée.
 */
export function readContentDates(root: string): Record<string, Date> {
  const dates: Record<string, Date> = {};
  for (const name of markdownFiles(join(root, 'src/content/blog/fr'))) {
    const source = readFileSync(join(root, 'src/content/blog/fr', name), 'utf8');
    const date = frontmatterDate(source, 'updatedDate') ?? frontmatterDate(source, 'pubDate');
    if (date) dates[`/blog/${name.replace(/\.mdx?$/, '')}/`] = date;
  }
  for (const name of markdownFiles(join(root, 'src/content/legal'))) {
    const source = readFileSync(join(root, 'src/content/legal', name), 'utf8');
    const date = frontmatterDate(source, 'updatedDate');
    if (date) dates[`/${name.replace(/\.mdx?$/, '')}/`] = date;
  }
  return dates;
}
