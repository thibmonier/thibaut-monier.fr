import { getCollection } from 'astro:content';
import { isPublished, sortByDateDesc, type BlogEntry } from './blog.ts';

// Contrat C3 : le SEUL appel de getCollection('blog') du dépôt (un contrôle de contenu le vérifie, T-009-11).
// Pages, flux RSS, sitemap, llms.txt, JSON-LD et images Open Graph passent par cette fonction.
export async function getPublishedPosts(now = new Date()): Promise<BlogEntry[]> {
  const entries = await getCollection('blog');
  return sortByDateDesc(entries.filter((entry) => isPublished(entry.data, now)));
}
