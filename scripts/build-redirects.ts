import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { loadRedirects, toNginx } from '../src/lib/redirects.ts';
import { defaultSite, expectedOrigin } from './checks/lib/canonical.ts';

// Artefact de redirection de l'ancien site vers le nouveau (US-010), jamais déployé : écrit hors de dist/.
// Usage : node scripts/build-redirects.ts [dossier-de-sortie]   (défaut : reports/redirects, ignoré par Git et Docker)
const root = process.cwd();
const outDir = resolve(root, process.argv[2] ?? 'reports/redirects');
if (resolve(outDir).startsWith(join(root, 'dist'))) {
  throw new Error(
    'Le fichier de redirections ne doit jamais être écrit sous dist/ (il ne serait pas déployé).',
  );
}

const config = await readFile(join(root, 'astro.config.mjs'), 'utf8');
const origin = expectedOrigin(process.env, defaultSite(config));
const table = await loadRedirects(root);
const header = [
  '# Redirections 301 de agentic-agency.fr vers le nouveau site : fichier généré par scripts/build-redirects.ts.',
  "# À inclure dans le bloc `server` de l'ancien site au moment de la bascule (docs/guides/redirections-blog.md).",
  '',
].join('\n');

await mkdir(outDir, { recursive: true });
const file = join(outDir, 'agentic-agency.nginx.conf');
await writeFile(file, `${header}${toNginx(table, origin)}`, 'utf8');
console.log(`Redirections : ${table.length} entrées vers ${origin}, écrites dans ${file}`);
