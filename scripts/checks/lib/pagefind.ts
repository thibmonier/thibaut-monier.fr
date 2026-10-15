import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { walk } from './fs.ts';

// Contrôle de l'index de recherche (US-012) : présent, non vide, une page par article publié, sous 500 Ko.
// Le poids ne compte que les fichiers d'index (fragments, index, filtres, méta, entrée) : `pagefind.js`, le worker,
// le module WebAssembly et l'interface par défaut (non chargée par le site) sont mesurés à part dans le guide.

export const MAX_INDEX_BYTES = 500 * 1024;
const DIR = 'pagefind';
const ENTRY = `${DIR}/pagefind-entry.json`;
const INDEX_FOLDERS = ['fragment', 'index', 'filter'];

interface Entry {
  languages?: Record<string, { page_count?: number }>;
}

async function readEntry(distDir: string): Promise<Entry | null> {
  const file = join(distDir, ENTRY);
  return existsSync(file) ? (JSON.parse(await readFile(file, 'utf8')) as Entry) : null;
}

/** Pages indexées, toutes langues confondues (0 si l'entrée est absente). */
export async function indexedPages(distDir: string): Promise<number> {
  const entry = await readEntry(distDir);
  return Object.values(entry?.languages ?? {}).reduce(
    (sum, { page_count = 0 }) => sum + page_count,
    0,
  );
}

const isIndexFile = (path: string): boolean =>
  INDEX_FOLDERS.some((folder) => path.startsWith(`${folder}/`)) ||
  path.endsWith('.pf_meta') ||
  path === 'pagefind-entry.json';

export async function indexBytes(distDir: string): Promise<number> {
  const root = join(distDir, DIR);
  const files = (await walk(root)).filter((file) =>
    isIndexFile(relative(root, file).split(sep).join('/')),
  );
  const sizes = await Promise.all(files.map(async (file) => (await stat(file)).size));
  return sizes.reduce((sum, size) => sum + size, 0);
}

export async function checkPagefind(distDir: string, expectedPages: number): Promise<string[]> {
  if ((await readEntry(distDir)) === null) {
    return [`Index Pagefind absent : ${ENTRY} introuvable (lancer npm run build:search)`];
  }
  const pages = await indexedPages(distDir);
  if (pages === 0) return ['Index Pagefind vide'];
  const errors: string[] = [];
  if (pages !== expectedPages) {
    errors.push(
      `Index Pagefind : ${pages} pages indexées, ${expectedPages} articles publiés attendus`,
    );
  }
  const bytes = await indexBytes(distDir);
  if (bytes > MAX_INDEX_BYTES) {
    errors.push(`Index Pagefind trop lourd : ${Math.ceil(bytes / 1024)} Ko (budget 500 Ko)`);
  }
  return errors;
}
