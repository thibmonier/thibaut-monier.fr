import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { CV_FILE, loadCvData } from '../build-cv.ts';
import { evaluateCvPdf, parseLinkedPages, parsePdfInfo } from './lib/pdf-privacy.ts';
import type { CheckContext } from './lib/runner.ts';

const run = promisify(execFile);
const TIMEOUT_MS = 30_000;

async function poppler(tool: string, args: string[]): Promise<string> {
  try {
    return (await run(tool, args, { timeout: TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 })).stdout;
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    throw new Error(`${tool} indisponible ou en échec (poppler-utils requis) : ${reason}`, {
      cause: error,
    });
  }
}

// US-007 : confidentialité (texte extrait), taille, pages, métadonnées et fidélité du PDF à la source unique.
export default async function check({ root, distDir }: CheckContext): Promise<string[]> {
  const pdf = join(distDir, CV_FILE);
  const size = await stat(pdf).then(
    (file) => file.size,
    () => null,
  );
  if (size === null) return [`${CV_FILE} absent de dist/ (npm run build:cv non exécuté ?)`];

  const data = await loadCvData(root);
  const html = await readFile(join(distDir, 'parcours/index.html'), 'utf8');
  const [text, info, meta] = await Promise.all([
    poppler('pdftotext', ['-enc', 'UTF-8', pdf, '-']),
    poppler('pdfinfo', [pdf]),
    poppler('pdfinfo', ['-meta', pdf]),
  ]);

  return evaluateCvPdf({
    sizeBytes: size,
    text,
    info: parsePdfInfo(`${info}\n${meta}`),
    linkedPages: parseLinkedPages(html),
    companies: [...data.experiences, ...data.earlier].map((item) => item.company),
    expectedTexts: [data.summary, ...data.experiences.flatMap((item) => item.achievements)],
  });
}
