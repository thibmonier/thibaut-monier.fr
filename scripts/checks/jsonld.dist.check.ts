import { checkJsonLd } from './lib/jsonld.ts';
import type { CheckContext } from './lib/runner.ts';

// US-024 : données structurées valides sur toutes les pages indexables (types attendus, liste blanche de Person).
export default function check({ distDir }: CheckContext): Promise<string[]> {
  return checkJsonLd(distDir);
}
