// Recherche plein texte (US-012) : logique pure, indépendante de Pagefind et du DOM (testable sous Node).
// Le script `src/scripts/search.ts` câble ces fonctions à l'API JavaScript de `/pagefind/pagefind.js`.

export const DEBOUNCE_MS = 150;
export const UNAVAILABLE_MESSAGE = 'La recherche est momentanément indisponible.';

/** Partie d'un résultat Pagefind (`result.data()`) utilisée ici. */
export interface RawResult {
  url: string;
  excerpt: string;
  meta: { title?: string; category?: string };
}

export interface SearchResult {
  url: string;
  title: string;
  /** HTML sûr : seules les balises `mark` sont conservées. */
  excerptHtml: string;
  category: string;
}

// Pagefind encode l'apostrophe en `&#x27;` et l'espace insécable en `&nbsp;` dans ses extraits (vérifié sur dist/).
function numericEntity(match: string, hex?: string, decimal?: string): string {
  const code = hex === undefined ? Number(decimal) : Number.parseInt(hex, 16);
  return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
}

const ENTITIES: [RegExp, string][] = [
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&amp;/g, '&'],
];
const escapeHtml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const decode = (text: string): string =>
  ENTITIES.reduce(
    (out, [pattern, to]) => out.replace(pattern, to),
    text.replace(/&nbsp;/g, ' ').replace(/&#x([0-9a-f]+);|&#(\d+);/gi, numericEntity),
  );

/** L'extrait vient du contenu et est inséré en HTML : tout est échappé sauf `<mark>` et `</mark>` nus. */
export function cleanExcerpt(html: string): string {
  return html
    .split(/(<mark>|<\/mark>)/)
    .map((part) => (part === '<mark>' || part === '</mark>' ? part : escapeHtml(decode(part))))
    .join('');
}

export function toResult(raw: RawResult): SearchResult {
  if (!raw.url.startsWith('/') || raw.url.startsWith('//')) {
    throw new Error(`Adresse de résultat invalide : ${raw.url}`);
  }
  return {
    url: raw.url,
    title: raw.meta.title ?? raw.url,
    excerptHtml: cleanExcerpt(raw.excerpt),
    category: raw.meta.category ?? '',
  };
}

export interface Clock<Handle = number> {
  setTimeout: (run: () => void, delay: number) => Handle;
  clearTimeout: (handle: Handle) => void;
}

export interface Debounced<Args extends unknown[]> {
  (...args: Args): void;
  cancel(): void;
}

/** Appelle `run` `delay` ms après le dernier appel ; l'horloge est injectée pour les tests. */
export function createDebouncer<Args extends unknown[], Handle = number>(
  run: (...args: Args) => void,
  delay: number,
  clock: Clock<Handle>,
): Debounced<Args> {
  let handle: Handle | undefined;
  const cancel = (): void => {
    if (handle !== undefined) clock.clearTimeout(handle);
    handle = undefined;
  };
  const schedule = (...args: Args): void => {
    cancel();
    handle = clock.setTimeout(() => {
      handle = undefined;
      run(...args);
    }, delay);
  };
  return Object.assign(schedule, { cancel });
}

export type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading'; query: string }
  | { kind: 'results'; query: string; results: SearchResult[] }
  | { kind: 'empty'; query: string }
  | { kind: 'unavailable' };

export type SearchEvent =
  | { type: 'input'; query: string }
  | { type: 'results'; results: SearchResult[] }
  | { type: 'failure' };

export function searchReducer(state: SearchState, event: SearchEvent): SearchState {
  if (event.type === 'failure') return { kind: 'unavailable' };
  if (state.kind === 'unavailable') return state;
  if (event.type === 'input') {
    const query = event.query.trim();
    return query === '' ? { kind: 'idle' } : { kind: 'loading', query };
  }
  if (state.kind !== 'loading') return state;
  return event.results.length === 0
    ? { kind: 'empty', query: state.query }
    : { kind: 'results', query: state.query, results: event.results };
}

const fold = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function commonPrefix(a: string, b: string): number {
  let length = 0;
  while (length < a.length && length < b.length && a[length] === b[length]) length += 1;
  return length;
}

/**
 * Pagefind tolère les approximations : « zzzzqq » ramène une page dont l'extrait surligne seulement « Z ».
 * Un résultat n'est gardé que si un mot surligné partage au moins 3 lettres de début (ou toute la requête si
 * elle est plus courte) avec un mot de la requête, accents et casse ignorés.
 */
export function isRelevant(excerptHtml: string, query: string): boolean {
  const marked = [...excerptHtml.matchAll(/<mark>(.*?)<\/mark>/g)].map(([, word = '']) =>
    fold(decode(word)),
  );
  const tokens = fold(query).split(/\s+/).filter(Boolean);
  return marked.some((word) =>
    tokens.some((token) => commonPrefix(word, token) >= Math.min(3, token.length)),
  );
}

export const emptyMessage = (query: string): string =>
  `Aucun résultat pour « ${query} ». Essayez un autre mot ou parcourez les catégories.`;

export const countMessage = (count: number): string =>
  `${count} ${count > 1 ? 'résultats' : 'résultat'}`;

/** Indice du résultat actif après une flèche ; -1 désigne le champ de saisie. */
export function moveSelection(index: number, key: 'ArrowDown' | 'ArrowUp', count: number): number {
  if (count === 0) return -1;
  return key === 'ArrowDown' ? Math.min(index + 1, count - 1) : Math.max(index - 1, -1);
}
