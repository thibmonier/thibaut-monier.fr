import { checkExperiences } from './lib/experiences.ts';
import type { CheckContext } from './lib/runner.ts';

// US-005 : liste blanche de données personnelles, schéma, règle des 10 ans et décompte des expériences.
export default function check({ root }: CheckContext): Promise<string[]> {
  return checkExperiences(root);
}
