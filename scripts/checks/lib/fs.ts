import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

// Liste récursive des fichiers d'un dossier (chemins absolus, triés).
export async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
    ),
  );
  return nested.flat().sort();
}
