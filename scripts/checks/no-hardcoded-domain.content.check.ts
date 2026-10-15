import { readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { walk } from './lib/fs.ts';
import { findHardcodedDomain } from './lib/no-hardcoded-domain.ts';
import type { CheckContext } from './lib/runner.ts';

const DOMAIN = 'thibaut-monier.fr';
// Liste blanche motivée : les pages légales nomment le site ; l'objet du message du formulaire est un libellé
// lisible dans la messagerie du PO, pas une URL.
const ALLOWED = ['src/content/legal/', 'src/lib/contact.ts'];
const SOURCE = /\.(?:astro|ts|md|mdx|yaml|yml|json|css)$/;

export default async function check({ root }: CheckContext): Promise<string[]> {
  const files = [...(await walk(join(root, 'src'))), join(root, 'astro.config.mjs')].filter(
    (file) => SOURCE.test(file) || file.endsWith('.mjs'),
  );
  const sources = await Promise.all(
    files.map(async (file) => ({
      path: relative(root, file).split(sep).join('/'),
      content: await readFile(file, 'utf8'),
    })),
  );
  return findHardcodedDomain(sources, DOMAIN, ALLOWED);
}
