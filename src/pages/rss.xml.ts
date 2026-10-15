import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/blog-source.ts';
import { buildRssXml } from '../lib/rss.ts';

// Flux unique /rss.xml (fichier statique, sans barre finale). `getPublishedPosts` est la seule source.
export const GET: APIRoute = async ({ site }) => {
  const now = new Date();
  const xml = await buildRssXml(await getPublishedPosts(now), now, site);
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
