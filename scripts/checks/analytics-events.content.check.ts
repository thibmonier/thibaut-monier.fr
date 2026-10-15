import { readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { findEventViolations } from './lib/analytics-events.ts';
import { walk } from './lib/fs.ts';
import type { CheckContext } from './lib/runner.ts';

// US-026 : contrat des événements d'audience (nom et propriétés) sur toutes les sources de `src/`.
export default async function check({ root }: CheckContext): Promise<string[]> {
  const files = (await walk(join(root, 'src'))).filter((file) =>
    /\.(?:astro|ts|md|mdx)$/.test(file),
  );
  const sources = await Promise.all(
    files.map(async (file) => ({
      path: relative(root, file).split(sep).join('/'),
      content: await readFile(file, 'utf8'),
    })),
  );
  return findEventViolations(sources);
}
