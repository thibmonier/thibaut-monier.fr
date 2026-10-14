import { relative, sep } from 'node:path';
import { walk } from './fs.ts';

// Pages sans intérêt pour Lighthouse et axe : page de confirmation du formulaire.
const EXCLUDED = new Set(['/contact/merci/']);

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
