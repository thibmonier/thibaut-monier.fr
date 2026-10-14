import { detectPii, type PiiType } from '../../../src/lib/privacy.ts';

// Confidentialité et conformité du CV PDF (US-007, ADR-0005) : fonctions pures sur le texte extrait
// (pdftotext) et les métadonnées (pdfinfo). Les entrées-sorties sont dans cv-pdf.dist.check.ts.
export const PDF_PII_MESSAGE =
  'CV public : donnée personnelle interdite (téléphone, âge ou adresse)';
export const MAX_PDF_BYTES = 500 * 1024;
export const MAX_PDF_PAGES = 2;

export interface PdfInfo {
  pages: number;
  title?: string;
  author?: string;
  lang?: string;
  tagged: boolean;
}

export interface CvPdfFacts {
  sizeBytes: number;
  text: string;
  info: PdfInfo;
  linkedPages: number | null; // nombre de pages annoncé par le lien « Télécharger mon CV (PDF, N pages) »
  companies: string[];
  expectedTexts?: string[]; // textes de la source (résumé, réalisations) qui doivent se retrouver dans le PDF
}

// pdftotext coupe les lignes et utilise des espaces insécables : on compare sur un texte à espaces simples.
export const normalizeText = (text: string): string =>
  text.replace(/[\s\u00a0\u202f]+/g, ' ').trim();

export function findForbiddenPatterns(text: string): PiiType[] {
  return detectPii(normalizeText(text));
}

const field = (output: string, name: string): string | undefined =>
  new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(output)?.[1]?.trim();

// `output` : sortie de `pdfinfo -meta` (champs usuels, puis XMP).
export function parsePdfInfo(output: string): PdfInfo {
  const info: PdfInfo = {
    pages: Number(field(output, 'Pages') ?? 0),
    tagged: field(output, 'Tagged')?.toLowerCase() === 'yes',
  };
  const title = field(output, 'Title');
  const author = field(output, 'Author');
  const lang = /<dc:language>[\s\S]*?<rdf:li>([^<]+)<\/rdf:li>/.exec(output)?.[1];
  if (title) info.title = title;
  if (author) info.author = author;
  if (lang) info.lang = lang.trim();
  return info;
}

// Lit « (PDF, 2 pages) » dans le lien portant data-cv-download.
export function parseLinkedPages(html: string): number | null {
  const anchor = /<a\b[^>]*\bdata-cv-download\b[^>]*>([\s\S]*?)<\/a>/i.exec(html);
  const pages = anchor?.[1]
    ? /\(PDF,\s*(\d+)\s*pages?\)/i.exec(normalizeText(anchor[1]))?.[1]
    : null;
  return pages ? Number(pages) : null;
}

export function evaluateCvPdf(facts: CvPdfFacts): string[] {
  const errors: string[] = [];
  const text = normalizeText(facts.text).toLowerCase();

  if (findForbiddenPatterns(facts.text).length > 0) errors.push(PDF_PII_MESSAGE);

  if (facts.sizeBytes > MAX_PDF_BYTES) {
    errors.push(`CV PDF : ${Math.ceil(facts.sizeBytes / 1024)} Ko, limite de 500 Ko dépassée`);
  }
  if (facts.info.pages > MAX_PDF_PAGES) {
    errors.push(`CV PDF : ${facts.info.pages} pages, ${MAX_PDF_PAGES} pages au plus`);
  }
  if (facts.linkedPages === null) {
    errors.push('CV PDF : aucun lien « Télécharger mon CV (PDF, N pages) » trouvé dans /parcours/');
  } else if (facts.linkedPages !== facts.info.pages) {
    errors.push(`CV PDF : ${facts.info.pages} pages, le lien en annonce ${facts.linkedPages}`);
  }
  for (const company of facts.companies) {
    if (!text.includes(normalizeText(company).toLowerCase())) {
      errors.push(`CV PDF : entreprise absente du texte : ${company}`);
    }
  }
  for (const expected of facts.expectedTexts ?? []) {
    if (!text.includes(normalizeText(expected).toLowerCase())) {
      errors.push(`CV PDF : texte de la source absent du PDF : « ${expected.slice(0, 50)}… »`);
    }
  }
  if (!facts.info.title) errors.push('CV PDF : titre absent des métadonnées');
  if (!facts.info.tagged) errors.push('CV PDF : PDF non balisé (lecture accessible impossible)');
  if (facts.info.lang !== 'fr') errors.push('CV PDF : langue « fr » absente des métadonnées');
  return errors;
}
