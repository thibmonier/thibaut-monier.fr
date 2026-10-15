import { checkNoGlobalPrune } from './lib/no-global-prune.ts';
import type { CheckContext } from './lib/runner.ts';

// Action 1 de la rétro du sprint 2 (E25) : aucun nettoyage Docker global dans le dépôt
// (Makefile, mk/, scripts, workflows, guides, prompts de sprint).
export default function check({ root }: CheckContext): Promise<string[]> {
  return checkNoGlobalPrune(root);
}
