import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { metaContent, readPages, extractMeta } from './html-meta.ts';

const MAX_BYTES = 300 * 1024;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** Dimensions lues dans l'en-tête IHDR (24 premiers octets) ; `null` si ce n'est pas un PNG. */
export function pngSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

export interface OgReport {
  errors: string[];
  count: number;
  totalBytes: number;
  heaviest: number;
}

const REQUIRED = ['og:image:width', 'og:image:height', 'og:image:alt'] as const;

// Chaque page indexable : og:image absolue, joignable dans dist/, PNG 1200 × 630 de moins de 300 Ko,
// dimensions et texte alternatif déclarés. Aucun lien visible ne doit pointer vers une image Open Graph.
export async function checkOg(distDir: string): Promise<OgReport> {
  const report: OgReport = { errors: [], count: 0, totalBytes: 0, heaviest: 0 };
  const seen = new Set<string>();
  for (const { route, html } of await readPages(distDir)) {
    if (extractMeta(html).noindex) continue;
    const image = metaContent(html, 'property', 'og:image');
    if (image === undefined) {
      report.errors.push(`og:image absent : ${route}`);
      continue;
    }
    for (const property of REQUIRED) {
      const value = metaContent(html, 'property', property);
      if (value === undefined || value === '') report.errors.push(`${property} absent : ${route}`);
    }
    if (!/^https?:\/\//.test(image)) {
      report.errors.push(`og:image doit être une URL absolue (${image}) : ${route}`);
      continue;
    }
    const path = new URL(image).pathname;
    if (
      new RegExp(
        `<a\\b[^>]*href=["'][^"']*${path.replace(/[.\\^$*+?()[\]{}|]/g, '\\$&')}["']`,
        'i',
      ).test(html)
    ) {
      report.errors.push(`Image Open Graph liée dans le contenu visible : ${route}`);
    }
    const file = join(distDir, path);
    const bytes = await readFile(file).catch(() => null);
    if (bytes === null) {
      report.errors.push(`Image Open Graph introuvable dans dist/ (${path}) : ${route}`);
      continue;
    }
    const size = pngSize(bytes);
    if (size === null) report.errors.push(`Image Open Graph illisible (PNG attendu) : ${route}`);
    else if (size.width !== 1200 || size.height !== 630) {
      report.errors.push(
        `Image Open Graph de ${size.width} × ${size.height} au lieu de 1200 × 630 : ${route}`,
      );
    }
    const { size: weight } = await stat(file);
    if (weight > MAX_BYTES) {
      report.errors.push(
        `Image Open Graph trop lourde (${Math.ceil(weight / 1024)} Ko > 300 Ko) : ${route}`,
      );
    }
    if (!seen.has(path)) {
      seen.add(path);
      report.count += 1;
      report.totalBytes += weight;
      report.heaviest = Math.max(report.heaviest, weight);
    }
  }
  return report;
}
