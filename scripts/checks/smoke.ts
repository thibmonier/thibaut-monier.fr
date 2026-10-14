// Contrôle de fumée post-déploiement : node scripts/checks/smoke.ts <url>  (ou SMOKE_URL=<url>)
import { runSmoke } from './lib/smoke.ts';

const url = process.argv[2] || process.env.SMOKE_URL;
if (!url) {
  console.error('Usage : node scripts/checks/smoke.ts <url>  (ou variable SMOKE_URL)');
  process.exit(2);
}

let errors: string[];
try {
  errors = await runSmoke(url);
} catch (error) {
  console.error(`URL invalide : ${(error as Error).message}`);
  process.exit(2);
}

if (errors.length > 0) {
  console.error(`Contrôle de fumée en échec sur ${url} (${errors.length}) :`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(`Contrôle de fumée : OK (${url})`);
