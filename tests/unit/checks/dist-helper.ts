import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach } from 'vitest';

// Fabrique un dist/ jetable pour les tests des contrôles ; nettoyé après chaque test.
const dirs: string[] = [];
afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

export async function distWith(files: Record<string, string | Uint8Array>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'dist-'));
  dirs.push(dir);
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(dir, path)), { recursive: true });
    await writeFile(join(dir, path), content);
  }
  return dir;
}

export interface PageOptions {
  title?: string;
  description?: string;
  robots?: string;
  jsonLd?: unknown[];
  body?: string;
  head?: string;
}

// Page HTML minimale avec les métadonnées d'un build Astro.
export function page(options: PageOptions = {}): string {
  const {
    title = 'Un titre de page correct — Thibaut Monier',
    description = 'Une description de page suffisamment longue pour passer le contrôle de longueur minimale.',
    robots,
    jsonLd = [],
    body = '<main><h1>Page</h1></main>',
    head = '',
  } = options;
  const scripts = jsonLd
    .map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`)
    .join('');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title><meta name="description" content="${description}">${robots ? `<meta name="robots" content="${robots}">` : ''}${head}${scripts}</head><body>${body}</body></html>`;
}
