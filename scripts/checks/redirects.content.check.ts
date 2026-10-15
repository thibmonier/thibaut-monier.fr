import { loadRedirects } from '../../src/lib/redirects.ts';
import { articleStatuses } from './lib/blog.ts';
import { checkRedirectCoverage } from './lib/redirects.ts';
import type { CheckContext } from './lib/runner.ts';

// Schéma de la table (loadRedirects lève une erreur explicite) puis couverture des articles publiés, avant le build.
export default async function check({ root }: CheckContext): Promise<string[]> {
  const table = await loadRedirects(root);
  const { published } = await articleStatuses(root);
  return checkRedirectCoverage(published, table);
}
