// Exécuteur de contrôles : node scripts/checks/run.ts --phase=content|dist
import { resolve } from 'node:path';
import { runChecks, type Phase } from './lib/runner.ts';

const arg = process.argv.find((value) => value.startsWith('--phase='))?.split('=')[1];
if (arg !== 'content' && arg !== 'dist') {
  console.error('Usage : node scripts/checks/run.ts --phase=content|dist');
  process.exit(2);
}
const phase: Phase = arg;
const root = process.cwd();

const { exitCode, errors } = await runChecks(import.meta.dirname, phase, {
  root,
  distDir: resolve(root, 'dist'),
});

if (errors.length > 0) {
  console.error(`Contrôles ${phase} en échec (${errors.length}) :`);
  for (const error of errors) console.error(`  - ${error}`);
} else {
  console.log(`Contrôles ${phase} : OK`);
}
process.exit(exitCode);
