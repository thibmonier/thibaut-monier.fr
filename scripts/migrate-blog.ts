import { resolve } from 'node:path';
import { migrateFiles } from '../src/lib/blog-migration.ts';

// Outil de migration (US-009), conservé comme trace reproductible ; hors `make ci`.
// Usage : node scripts/migrate-blog.ts <dépôt-source> [--slugs a,b,c] [--root <dossier>] [--force]
// La source est lue seulement (montage `:ro` dans le conteneur) ; un article déjà migré est ignoré sans --force.
const USAGE =
  'Usage : node scripts/migrate-blog.ts <dépôt-source> [--slugs a,b,c] [--root <dossier>] [--force]';
const args = process.argv.slice(2);

function fail(message: string): never {
  console.error(`${message}\n${USAGE}`);
  process.exit(2);
}

/** Valeur d'une option ; une option sans valeur (ou suivie d'une autre option) est une erreur, pas un défaut. */
function option(name: string): string | undefined {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (value === undefined || value.startsWith('--')) fail(`${name} attend une valeur.`);
  return value;
}

const sourceDir = args[0];
if (sourceDir === undefined || sourceDir.startsWith('--')) fail('Dépôt source manquant.');
const slugs = option('--slugs')?.split(',').filter(Boolean);
// `--root` écrit hors de la collection (relecture par lots avant publication) ; par défaut ce dépôt.
const root = resolve(option('--root') ?? process.cwd());

const reports = await migrateFiles({
  sourceDir: resolve(sourceDir),
  root,
  ...(slugs ? { slugs } : {}),
  force: args.includes('--force'),
});

for (const report of reports) {
  console.log(`${report.status === 'migré' ? 'MIGRÉ  ' : 'IGNORÉ '} ${report.slug}`);
  if (report.status === 'ignoré') {
    console.log('  déjà présent (relectures conservées), utiliser --force pour réécrire');
    continue;
  }
  for (const change of report.changes) console.log(`  fait : ${change}`);
  for (const item of report.todo) console.log(`  à la main : ${item}`);
}
