import { checkAchievements } from './lib/achievements.ts';
import type { CheckContext } from './lib/runner.ts';

// US-006 : réalisations et compétences (schémas, références croisées, décompte, clients citables, données personnelles).
export default function check({ root }: CheckContext): Promise<string[]> {
  return checkAchievements(root);
}
