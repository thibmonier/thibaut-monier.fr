import { checkOrphans } from './lib/orphans.ts';
import type { CheckContext } from './lib/runner.ts';

export default function check({ distDir }: CheckContext): Promise<string[]> {
  return checkOrphans(distDir);
}
