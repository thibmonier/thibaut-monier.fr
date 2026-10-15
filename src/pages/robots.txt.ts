import type { APIRoute } from 'astro';
import { buildRobots } from '../lib/sitemap.ts';

export const GET: APIRoute = ({ site }) =>
  new Response(buildRobots(String(site)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
