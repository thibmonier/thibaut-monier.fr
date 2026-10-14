import { checkPlugins } from './lib/plugins.ts';
import type { CheckContext } from './lib/runner.ts';

export default function check({ root }: CheckContext): Promise<string[]> {
  return checkPlugins(root);
}
