import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { legalConfig } from '../../src/config/legal.ts';
import { scanLegalSources, type LegalSource } from './lib/legal-pii.ts';
import type { CheckContext } from './lib/runner.ts';

// Pages légales et données de l'éditeur : aucune donnée personnelle. Les coordonnées publiques de
// l'hébergeur (clé `host`) sont volontairement exclues du scan.
export default async function check({ root }: CheckContext): Promise<string[]> {
  const dir = join(root, 'src/content/legal');
  const names = (await readdir(dir)).filter((name) => name.endsWith('.md'));
  const sources: LegalSource[] = await Promise.all(
    names.map(async (name) => ({
      file: `src/content/legal/${name}`,
      text: await readFile(join(dir, name), 'utf8'),
    })),
  );
  const { editor, publicationDirector } = legalConfig;
  sources.push({
    file: 'src/config/legal.ts',
    text: JSON.stringify({ editor, publicationDirector }),
  });
  return scanLegalSources(sources);
}
