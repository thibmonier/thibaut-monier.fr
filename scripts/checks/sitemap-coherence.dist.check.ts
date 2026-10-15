import { checkSitemapCoherence } from './lib/sitemap-coherence.ts';
import type { CheckContext } from './lib/runner.ts';

// US-024 : le sitemap liste exactement les pages indexables de dist/.
export default function check({ distDir }: CheckContext): Promise<string[]> {
  return checkSitemapCoherence(distDir);
}
