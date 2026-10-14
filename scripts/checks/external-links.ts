import { resolve } from 'node:path';
import { checkShowcaseLinks, collectShowcaseLinks } from './lib/external-links.ts';

// Job CI dédié (E14) : jamais dans le build Docker, un site tiers en panne ne doit pas bloquer un déploiement.
const distDir = resolve(process.argv[2] ?? 'dist');
const links = await collectShowcaseLinks(distDir);
const { errors, warnings } = await checkShowcaseLinks(links);

for (const warning of warnings) console.warn(`AVERTISSEMENT ${warning}`);
if (errors.length > 0) {
  console.error(`Liens externes de la vitrine en échec (${errors.length}) :`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(
  `Liens externes de la vitrine : OK (${links.length} liens, ${warnings.length} avertissement(s))`,
);
