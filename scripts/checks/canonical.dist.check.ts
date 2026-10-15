import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { checkCanonicals, defaultSite, expectedOrigin } from './lib/canonical.ts';
import type { CheckContext } from './lib/runner.ts';

// Origine attendue : PUBLIC_SITE_URL, sinon le site par défaut de astro.config.mjs (même règle que la configuration).
export default async function check({ root, distDir }: CheckContext): Promise<string[]> {
  const config = await readFile(join(root, 'astro.config.mjs'), 'utf8');
  return checkCanonicals(distDir, expectedOrigin(process.env, defaultSite(config)));
}
