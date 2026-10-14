import { checkExternalLinks, collectExternalLinks, findBrokenInternalLinks } from './lib/links.ts';
import type { CheckContext } from './lib/runner.ts';

// Liens internes et ancres : bloquants. Liens externes : avertissements (CHECK_EXTERNAL_LINKS=0 pour les ignorer).
export default async function check({ distDir }: CheckContext): Promise<string[]> {
  const broken = await findBrokenInternalLinks(distDir);
  if (process.env.CHECK_EXTERNAL_LINKS !== '0') {
    for (const warning of await checkExternalLinks(await collectExternalLinks(distDir))) {
      console.warn(`AVERTISSEMENT ${warning}`);
    }
  }
  return broken.map((link) => link.message);
}
