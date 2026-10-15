import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '../lib/llms.ts';
import { loadLlms } from '../lib/site-pages.ts';

// Généré au build depuis les mêmes sources que le reste du site : profil, parcours, plugins, projets, articles.
export const GET: APIRoute = async ({ site }) => {
  const { header, entries } = await loadLlms();
  return new Response(buildLlmsTxt(entries, String(site), header), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
