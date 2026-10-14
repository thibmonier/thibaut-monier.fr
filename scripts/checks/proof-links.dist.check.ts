import { checkProofLinks } from './lib/proof-links.ts';
import type { CheckContext } from './lib/runner.ts';

// US-004 : aucune preuve de l'accueil ne pointe vers une 404 ; liens externes en https.
export default function check({ distDir }: CheckContext): Promise<string[]> {
  return checkProofLinks(distDir);
}
