import { assertEventPayload } from '../../../src/lib/analytics-events.ts';

export interface SourceFile {
  path: string;
  content: string;
}

// Un `data-event`, un `data-umami-event` ou un appel `track(...)` dont le nom ou une propriété sort du contrat
// (ADR-0011) fait échouer le build. S'applique à `src/` entier, Markdown des articles compris.
const TAG = /<[a-zA-Z][^<>]*?\bdata-(?:umami-)?event\s*=\s*[^<>]*>/g;
const NAME_ATTR = /\bdata-(?:umami-)?event\s*=\s*["']([^"']+)["']/;
const PROP_ATTR = /\bdata-umami-event-([\w-]+)\s*=/g;
const CALL = /\btrack(?:Event)?\(\s*(['"`])([^'"`]+)\1\s*(?:,\s*\{([^}]*)\})?/g;
const OBJECT_KEY = /([\w$]+)\s*:/g;

const lineOf = (content: string, offset: number): number =>
  content.slice(0, offset).split('\n').length;

function verify(name: string, props: string[], where: string, errors: string[]): void {
  try {
    assertEventPayload(name, Object.fromEntries(props.map((p) => [p, ''])));
  } catch (error) {
    errors.push(`${(error as Error).message} (${where})`);
  }
}

export function findEventViolations(files: SourceFile[]): string[] {
  const errors: string[] = [];
  for (const { path, content } of files) {
    for (const match of content.matchAll(TAG)) {
      const name = NAME_ATTR.exec(match[0])?.[1];
      if (name === undefined) continue;
      const props = [...match[0].matchAll(PROP_ATTR)].map((m) => m[1] as string);
      verify(name, props, `${path}:${lineOf(content, match.index)}`, errors);
    }
    for (const match of content.matchAll(CALL)) {
      const props = [...(match[3] ?? '').matchAll(OBJECT_KEY)].map((m) => m[1] as string);
      verify(match[2] as string, props, `${path}:${lineOf(content, match.index)}`, errors);
    }
  }
  return errors;
}
