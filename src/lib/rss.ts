import { getRssString, type RSSFeedItem } from '@astrojs/rss';
import { isPublished, postPath, slugOf, sortByDateDesc, type BlogEntry } from './blog.ts';
import { absoluteUrl } from './site-url.ts';

// Flux RSS (US-013, docs/guides/flux-rss.md) : les 20 articles publiés les plus récents, extrait seulement.
export const MAX_ITEMS = 20;
export const FEED_TITLE = 'Thibaut Monier : blog';
export const FEED_DESCRIPTION =
  'Articles de Thibaut Monier sur le pilotage de projets, les méthodes, les métiers et les outils.';

/** Même filtre de publication que la liste du blog (`isPublished`) ; liens absolus par `absoluteUrl` (C4). */
export function buildRssItems(
  entries: BlogEntry[],
  now: Date,
  site?: string | URL,
): Required<Pick<RSSFeedItem, 'title' | 'link' | 'pubDate' | 'description' | 'categories'>>[] {
  return sortByDateDesc(entries.filter((entry) => isPublished(entry.data, now)))
    .slice(0, MAX_ITEMS)
    .map((entry) => {
      const slug = slugOf(entry.id);
      const description = entry.data.excerpt || entry.data.description;
      if (!description) throw new Error(`Flux RSS : description manquante pour ${slug}`);
      return {
        title: entry.data.title,
        link: absoluteUrl(postPath(slug), site),
        pubDate: entry.data.pubDate,
        description,
        categories: [entry.data.category],
      };
    });
}

/** XML du flux : l'échappement des caractères spéciaux est délégué à `@astrojs/rss`. */
export function buildRssXml(entries: BlogEntry[], now: Date, site?: string | URL): Promise<string> {
  return getRssString({
    title: FEED_TITLE,
    description: FEED_DESCRIPTION,
    site: absoluteUrl('/', site),
    items: buildRssItems(entries, now, site),
    customData: `<language>fr</language><lastBuildDate>${now.toUTCString()}</lastBuildDate>`,
  });
}
