import { resolve } from 'node:path';
import { pruneUnusedUi } from './lib/pagefind-prune.ts';

const removed = await pruneUnusedUi(resolve(process.argv[2] ?? 'dist'));
console.log(
  `Pagefind : ${removed.length} fichiers d'interface non chargés supprimés de dist/pagefind/`,
);
