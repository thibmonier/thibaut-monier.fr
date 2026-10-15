import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { coverage, type Redirect } from '../../../src/lib/redirects.ts';

// Contrôles de la table de correspondance (US-010) : la table est lue par `src/lib/redirects.ts` (contrat C6).

/** Chaque cible de la table existe dans dist/ (page `index.html` ou fichier) ; message avec l'entrée fautive. `skipKinds` : types dont la cible n'est pas encore produite. */
export async function checkRedirectTargets(
  distDir: string,
  table: Redirect[],
  skipKinds: readonly Redirect['kind'][] = [],
): Promise<string[]> {
  return table.flatMap((entry, index) => {
    if (skipKinds.includes(entry.kind)) return [];
    const target = entry.to.endsWith('/')
      ? join(distDir, entry.to, 'index.html')
      : join(distDir, entry.to);
    return existsSync(target)
      ? []
      : [
          `redirects.yaml entrée ${index + 1} : ${entry.from} -> ${entry.to} : cible absente de dist/`,
        ];
  });
}

/** Chaque article publié a une entrée `article` (« Correspondance manquante : <slug> (couverture 27/28) »). */
export function checkRedirectCoverage(slugs: string[], table: Redirect[]): string[] {
  return coverage(slugs, table).errors;
}
