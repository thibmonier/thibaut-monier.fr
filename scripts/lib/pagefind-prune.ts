import { existsSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

// Pagefind génère trois interfaces prêtes à l'emploi (~400 Ko) que le site ne charge jamais : `search.ts` appelle
// directement l'API JavaScript de `pagefind.js`. On les supprime après l'indexation pour ne pas les déployer.
export const UNUSED_UI = /^pagefind-(?:component-|modular-)?ui\.(?:js|css)$/u;

/** Supprime les interfaces Pagefind non chargées de `<dist>/pagefind/` ; renvoie les noms supprimés. */
export async function pruneUnusedUi(distDir: string): Promise<string[]> {
  const dir = join(distDir, 'pagefind');
  if (!existsSync(dir)) return [];
  const names = (await readdir(dir)).filter((name) => UNUSED_UI.test(name));
  await Promise.all(names.map((name) => rm(join(dir, name))));
  return names.sort();
}
