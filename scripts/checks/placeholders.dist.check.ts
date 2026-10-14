import { checkPlaceholders } from './lib/placeholders.ts';
import type { CheckContext } from './lib/runner.ts';

// Revue DoD (B2) : aucun marqueur provisoire (« à vérifier », TODO, lorem ipsum) dans les pages publiées.
export default function check({ distDir }: CheckContext): Promise<string[]> {
  return checkPlaceholders(distDir);
}
