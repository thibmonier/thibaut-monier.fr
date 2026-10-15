import {
  DEBOUNCE_MS,
  UNAVAILABLE_MESSAGE,
  countMessage,
  createDebouncer,
  emptyMessage,
  isRelevant,
  moveSelection,
  searchReducer,
  toResult,
  type RawResult,
  type SearchResult,
  type SearchState,
} from '../lib/search.ts';

// Page /recherche/ (US-012) : l'index Pagefind n'est importé qu'à la première interaction (focus ou saisie).
// Rendu par nœuds DOM et `textContent` ; seul l'extrait nettoyé (balises `mark`) passe par un fragment contrôlé.
// Aucun cookie, aucun stockage local.

interface Pagefind {
  init?(): Promise<void>;
  search(term: string): Promise<{ results: { data(): Promise<RawResult> }[] }>;
}

const MAX_RESULTS = 20;
const INDEX_URL = '/pagefind/pagefind.js';
const BLOG_URL = '/blog/';

const root = document.querySelector<HTMLElement>('[data-search]');
const input = root?.querySelector<HTMLInputElement>('input[type="search"]');
const status = root?.querySelector<HTMLElement>('[data-search-status]');
const message = root?.querySelector<HTMLElement>('[data-search-message]');
const list = root?.querySelector<HTMLElement>('[data-search-results]');

let index: Promise<Pagefind | null> | null = null;
let state: SearchState = { kind: 'idle' };

function loadIndex(): Promise<Pagefind | null> {
  index ??= import(/* @vite-ignore */ INDEX_URL).then(
    async (module: Pagefind) => {
      await module.init?.(); // charge le module WebAssembly maintenant : la première frappe n'attend plus
      if (root) root.dataset.index = 'ready';
      return module;
    },
    () => null,
  );
  return index;
}

function link(href: string, text: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.textContent = text;
  anchor.className = 'font-medium text-accent underline underline-offset-4';
  return anchor;
}

function resultItem(result: SearchResult): HTMLLIElement {
  const item = document.createElement('li');
  // Le focus arrive sur le titre de l'article (h1 tabindex="-1", identifiant ci-dessous) à l'ouverture d'un résultat.
  const title = link(`${result.url}#article-titre`, result.title);
  title.className += ' text-lg inline-flex min-h-11 items-center';
  const excerpt = document.createElement('p');
  const template = document.createElement('template');
  template.innerHTML = result.excerptHtml;
  excerpt.append(template.content);
  const category = document.createElement('p');
  category.dataset.resultCategory = '';
  category.className = 'text-sm text-muted';
  category.textContent = result.category;
  item.append(title, excerpt, category);
  return item;
}

function render(next: SearchState): void {
  state = next;
  if (!root || !status || !message || !list) return;
  root.dataset.state = next.kind;
  message.replaceChildren();
  if (next.kind === 'results') {
    list.replaceChildren(...next.results.map(resultItem));
    status.textContent = countMessage(next.results.length);
  } else if (next.kind !== 'loading') {
    list.replaceChildren();
    status.textContent = '';
  }
  if (next.kind === 'empty') {
    const text = emptyMessage(next.query);
    message.append(
      text.slice(0, text.lastIndexOf('catégories.')),
      link(BLOG_URL, 'catégories'),
      '.',
    );
  } else if (next.kind === 'unavailable') {
    message.append(`${UNAVAILABLE_MESSAGE} `, link(BLOG_URL, 'Parcourir le blog'));
  }
}

async function run(query: string): Promise<void> {
  const pagefind = await loadIndex();
  if (pagefind === null) return render(searchReducer(state, { type: 'failure' }));
  try {
    const found = await pagefind.search(query);
    const data = await Promise.all(found.results.slice(0, MAX_RESULTS).map((item) => item.data()));
    // Une réponse tardive d'une saisie remplacée est ignorée.
    if (state.kind === 'loading' && state.query === query) {
      const relevant = data.filter((item) => isRelevant(item.excerpt, query));
      render(searchReducer(state, { type: 'results', results: relevant.map(toResult) }));
    }
  } catch {
    render(searchReducer(state, { type: 'failure' }));
  }
}

const schedule = createDebouncer((query: string) => void run(query), DEBOUNCE_MS, window);

// Première interaction : l'index est chargé ici, jamais au chargement de la page.
input?.addEventListener(
  'focus',
  () =>
    void loadIndex().then(
      (pagefind) => pagefind === null && render(searchReducer(state, { type: 'failure' })),
    ),
  { once: true },
);
root?.querySelector('form')?.addEventListener('submit', (event) => event.preventDefault());
input?.addEventListener('input', () => {
  render(searchReducer(state, { type: 'input', query: input.value }));
  if (state.kind === 'loading') schedule(state.query);
  else schedule.cancel();
});

// Flèches haut et bas entre le champ et les résultats ; Entrée suit le lien actif.
root?.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const links = [...(list?.querySelectorAll<HTMLAnchorElement>('li > a:first-child') ?? [])];
  const active = links.indexOf(document.activeElement as HTMLAnchorElement);
  if (links.length === 0) return;
  const next = moveSelection(active, event.key, links.length);
  event.preventDefault();
  (next === -1 ? input : links[next])?.focus();
});
