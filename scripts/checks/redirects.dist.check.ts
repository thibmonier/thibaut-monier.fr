import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadRedirects } from '../../src/lib/redirects.ts';
import { checkRedirectTargets } from './lib/redirects.ts';
import type { CheckContext } from './lib/runner.ts';

// Chaque cible de la table de correspondance répond 200 dans dist/. Le flux `/rss.xml` (lot B, US-013) n'est exigé
// que lorsque sa route existe dans les sources : avant, la cible `flux` ne peut pas exister.
export default async function check({ root, distDir }: CheckContext): Promise<string[]> {
  const feedImplemented = existsSync(join(root, 'src/pages/rss.xml.ts'));
  return checkRedirectTargets(distDir, await loadRedirects(root), feedImplemented ? [] : ['flux']);
}
