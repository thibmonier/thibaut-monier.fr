import { relative, sep } from 'node:path';
import { walk } from './fs.ts';

// Pages exclues de Lighthouse et axe : confirmation du formulaire et recherche (noindex voulu pour les deux).
const EXCLUDED = new Set(['/contact/merci/', '/recherche/']);

// Découvre les routes depuis dist/**/index.html : aucune liste de pages à maintenir.
export async function discoverRoutes(distDir: string): Promise<string[]> {
  const files = await walk(distDir);
  return files
    .map((file) => relative(distDir, file).split(sep).join('/'))
    .filter((file) => file === 'index.html' || file.endsWith('/index.html'))
    .map((file) => `/${file.slice(0, -'index.html'.length)}`)
    .filter((route) => !EXCLUDED.has(route))
    .sort();
}
