import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateProofs, type ProofRef } from '../../../src/lib/proofs.ts';
import { discoverRoutes } from './dist-routes.ts';

const ANCHOR = /<a\b[^>]*>/gi;
const attribute = (tag: string, name: string): string | undefined =>
  new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag)?.slice(1).find(Boolean);

// Preuves rendues dans une page : liens portant l'attribut `data-proof="<id>"`.
export function extractProofs(html: string): ProofRef[] {
  return [...html.matchAll(ANCHOR)].flatMap(([tag]) => {
    const id = attribute(tag, 'data-proof');
    const link = attribute(tag, 'href');
    return id && link !== undefined ? [{ id, link }] : [];
  });
}

// Vérifie les preuves de l'accueil contre les routes réellement construites dans dist/.
export async function checkProofLinks(distDir: string): Promise<string[]> {
  const html = await readFile(join(distDir, 'index.html'), 'utf8');
  const routes = new Set(await discoverRoutes(distDir));
  return validateProofs(extractProofs(html), routes);
}
