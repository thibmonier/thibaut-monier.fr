import { readFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';
import { hasNoindexMeta } from '../../../src/lib/sitemap.ts';
import { walk } from './fs.ts';

// Extraction HTML partagée par les contrôles de métadonnées, JSON-LD, sitemap et Open Graph : une seule
// analyse, par expressions régulières bornées sur la sortie connue d'Astro (aucune bibliothèque HTML installée).

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function decodeEntities(text: string): string {
  return text.replace(/&(?:#x([0-9a-f]+)|#(\d+)|([a-z]+));/gi, (match, hex, dec, name) => {
    if (hex) return String.fromCodePoint(Number.parseInt(hex, 16));
    if (dec) return String.fromCodePoint(Number(dec));
    return ENTITIES[String(name).toLowerCase()] ?? match;
  });
}

function attribute(tag: string, name: string): string | undefined {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag);
  const value = match?.[1] ?? match?.[2];
  return value === undefined ? undefined : decodeEntities(value);
}

/** Valeur `content` d'une balise `<meta name|property="key">` ; `undefined` si absente. */
export function metaContent(
  html: string,
  kind: 'name' | 'property',
  key: string,
): string | undefined {
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attribute(tag, kind) === key) return attribute(tag, 'content');
  }
  return undefined;
}

export interface PageMeta {
  title?: string;
  description?: string;
  noindex: boolean;
}

export function extractMeta(html: string): PageMeta {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const description = metaContent(html, 'name', 'description');
  const meta: PageMeta = { noindex: hasNoindexMeta(html) };
  if (title !== undefined) meta.title = decodeEntities(title.trim());
  if (description !== undefined) meta.description = description;
  return meta;
}

export function isNoindexHtml(html: string): boolean {
  return extractMeta(html).noindex;
}

const JSON_LD =
  /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

export function extractJsonLd(html: string): string[] {
  return [...html.matchAll(JSON_LD)].map((match) => match[1] as string);
}

/** Texte visible : sans scripts, styles ni balises, entités décodées. */
export function visibleText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  );
}

export interface DistPage {
  route: string;
  html: string;
}

// Pages = `dist/**/index.html` (la 404 est un fichier `404.html` : exclue d'office).
export async function readPages(distDir: string): Promise<DistPage[]> {
  const files = (await walk(distDir))
    .map((file) => ({ file, rel: relative(distDir, file).split(sep).join('/') }))
    .filter(({ rel }) => rel === 'index.html' || rel.endsWith('/index.html'));
  return Promise.all(
    files.map(async ({ file, rel }) => ({
      route: `/${rel.slice(0, -'index.html'.length)}`,
      html: await readFile(file, 'utf8'),
    })),
  );
}
