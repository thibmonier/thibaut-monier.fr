import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { metaContent, readPages } from './html-meta.ts';

const MAX_ITEMS = 20;
const MAX_BYTES = 100 * 1024;
const RFC_822 =
  /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} (?:GMT|[+-]\d{4})$/;
const CHANNEL_FIELDS = ['title', 'link', 'description', 'language', 'lastBuildDate'] as const;

// Pas de bibliothèque XML : expressions bornées sur la sortie connue de `@astrojs/rss`. La validité de forme
// (document bien formé) est vérifiée par le navigateur dans tests/e2e/rss.spec.ts.
const tag = (xml: string, name: string): string | undefined =>
  new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml)?.[1]?.trim();

/** `articleRoutes` : routes `/blog/<slug>/` des articles publiés présents dans dist/. */
export function checkRssXml(xml: string, articleRoutes: string[]): string[] {
  const errors: string[] = [];
  if (!/<rss\s[^>]*version="2\.0"/.test(xml)) {
    return ['Flux RSS : racine <rss version="2.0"> absente'];
  }
  const kb = Math.round(Buffer.byteLength(xml) / 1024);
  if (Buffer.byteLength(xml) > MAX_BYTES) errors.push(`Flux RSS trop lourd (${kb} Ko > 100 Ko)`);

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1] as string);
  const channel = xml.replace(/<item>[\s\S]*?<\/item>/g, '');
  for (const field of CHANNEL_FIELDS) {
    if (!tag(channel, field)) errors.push(`Flux RSS : <channel> sans <${field}>`);
  }

  const expected = Math.min(MAX_ITEMS, articleRoutes.length);
  if (items.length > MAX_ITEMS)
    errors.push(`Flux RSS : ${items.length} articles (${MAX_ITEMS} au plus)`);
  else if (items.length !== expected)
    errors.push(`Flux RSS : ${items.length} articles au lieu de ${expected}`);

  items.forEach((item, index) => {
    const n = index + 1;
    if (!tag(item, 'title')) errors.push(`Flux RSS : item ${n} sans <title>`);
    const link = tag(item, 'link');
    if (!link || !/^https?:\/\//.test(link)) {
      errors.push(`Flux RSS : item ${n} : lien absolu attendu (${link ?? 'absent'})`);
    } else if (!articleRoutes.includes(new URL(link).pathname)) {
      errors.push(
        `Flux RSS : l'entrée ${new URL(link).pathname} ne correspond à aucun article publié`,
      );
    }
    if (!tag(item, 'guid')) errors.push(`Flux RSS : item ${n} sans <guid>`);
    const date = tag(item, 'pubDate') ?? '';
    if (!RFC_822.test(date))
      errors.push(`Flux RSS : item ${n} : pubDate au format RFC 822 attendu (${date})`);
    if (!tag(item, 'description')) errors.push(`Flux RSS : item ${n} sans <description>`);
  });
  return errors;
}

export async function checkRss(distDir: string): Promise<string[]> {
  const xml = await readFile(join(distDir, 'rss.xml'), 'utf8').catch(() => null);
  if (xml === null) return ['rss.xml absent de dist/'];
  const routes = (await readPages(distDir))
    .filter(({ html }) => metaContent(html, 'property', 'og:type') === 'article')
    .map(({ route }) => route);
  return checkRssXml(xml, routes);
}
