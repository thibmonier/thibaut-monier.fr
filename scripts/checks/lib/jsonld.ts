import { assertPersonProperties } from '../../../src/lib/jsonld/person.ts';
import { extractJsonLd, isNoindexHtml, metaContent, readPages, visibleText } from './html-meta.ts';

const MAX_BYTES = 5 * 1024;
type Block = Record<string, unknown>;

const BLOG_POSTING_REQUIRED = ['headline', 'datePublished', 'author', 'image'] as const;

function typeOf(block: Block): string | undefined {
  const type = block['@type'];
  return typeof type === 'string' ? type : undefined;
}

function expectedTypes(route: string, html: string): string[] {
  if (route === '/') return ['Person'];
  if (route === '/parcours/') return ['ProfilePage'];
  if (route === '/open-source/') return ['ItemList'];
  if (/^\/open-source\/sylius\/[^/]+\/$/.test(route)) return ['SoftwareSourceCode'];
  return metaContent(html, 'property', 'og:type') === 'article' ? ['BlogPosting'] : [];
}

function parseBlocks(route: string, html: string, errors: string[]): Block[] {
  const blocks: Block[] = [];
  for (const raw of extractJsonLd(html)) {
    try {
      blocks.push(JSON.parse(raw) as Block);
    } catch {
      errors.push(`JSON-LD invalide (JSON mal formé) : ${route}`);
    }
  }
  return blocks;
}

function checkPerson(route: string, person: Block, errors: string[]): void {
  try {
    assertPersonProperties(person);
  } catch (error) {
    errors.push(`${(error as Error).message} : ${route}`);
  }
}

function checkBlogPosting(route: string, post: Block, errors: string[]): void {
  const slug = route.split('/').filter(Boolean).pop() ?? route;
  for (const field of BLOG_POSTING_REQUIRED) {
    if (post[field] === undefined || post[field] === '') {
      errors.push(`JSON-LD BlogPosting invalide : ${field} requis (${slug})`);
    }
  }
}

function checkFaq(route: string, faq: Block, html: string, errors: string[]): void {
  const text = visibleText(html);
  const questions = (faq['mainEntity'] as { name?: string }[] | undefined) ?? [];
  if (questions.length === 0 || questions.some((q) => !q.name || !text.includes(q.name))) {
    errors.push(`FAQPage sans FAQ visible : ${route}`);
  }
}

/** Contrôle d'une page : les pages `noindex` ne portent aucune exigence. */
export function checkJsonLdPage(route: string, html: string): string[] {
  if (isNoindexHtml(html)) return [];
  const errors: string[] = [];
  const blocks = parseBlocks(route, html, errors);
  const types = new Set(blocks.map(typeOf));

  if (!types.has('BreadcrumbList')) errors.push(`BreadcrumbList absent : ${route}`);
  for (const type of expectedTypes(route, html)) {
    if (!types.has(type)) errors.push(`JSON-LD ${type} absent : ${route}`);
  }
  for (const block of blocks) {
    const type = typeOf(block);
    if (type === 'Person') checkPerson(route, block, errors);
    if (type === 'ProfilePage' && typeof block['mainEntity'] === 'object') {
      checkPerson(route, block['mainEntity'] as Block, errors);
    }
    if (type === 'BlogPosting') checkBlogPosting(route, block, errors);
    if (type === 'FAQPage') checkFaq(route, block, html, errors);
  }
  const bytes = Buffer.byteLength(extractJsonLd(html).join(''));
  if (bytes > MAX_BYTES)
    errors.push(`JSON-LD trop lourd (${bytes} octets > ${MAX_BYTES}) : ${route}`);
  return errors;
}

export async function checkJsonLd(distDir: string): Promise<string[]> {
  const pages = await readPages(distDir);
  return pages.flatMap(({ route, html }) => checkJsonLdPage(route, html));
}
