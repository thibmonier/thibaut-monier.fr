import {
  countLabel,
  noResultMessage,
  parseThemeParam,
  searchPlugins,
  type PluginTheme,
} from '../lib/plugins.ts';

const root = document.querySelector<HTMLElement>('[data-filter]');
const cards = [...document.querySelectorAll<HTMLElement>('[data-plugin]')];

if (root && cards.length > 0) {
  const input = root.querySelector<HTMLInputElement>('input') as HTMLInputElement;
  const count = root.querySelector<HTMLElement>('[data-count]') as HTMLElement;
  const empty = root.querySelector<HTMLElement>('[data-empty]') as HTMLElement;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-theme-button]')];
  const sections = [...document.querySelectorAll<HTMLElement>('[data-theme-section]')];
  const wrap = document.querySelector<HTMLElement>('[data-results-wrap]') as HTMLElement;
  const results = wrap.querySelector('ul') as HTMLUListElement;
  const homes = new Map(cards.map((card) => [card, card.parentElement as HTMLElement]));
  const entries = cards.map(({ dataset: d }) => ({
    id: d.plugin ?? '',
    name: d.searchName ?? '',
    tagline: d.searchTagline ?? '',
    extra: d.searchExtra ?? '',
  }));
  const byId = new Map(cards.map((card) => [card.dataset.plugin, card]));
  let theme: PluginTheme | null = parseThemeParam(location.search);

  const render = (): void => {
    const query = input.value.trim();
    const ids = searchPlugins(entries, query).filter(
      (id) => !theme || byId.get(id)?.dataset.theme === theme,
    );
    for (const card of cards) homes.get(card)?.append(card);
    if (query) for (const id of ids) results.append(byId.get(id) as HTMLElement);
    wrap.hidden = !query;
    for (const section of sections) {
      section.hidden = Boolean(query) || (theme !== null && section.dataset.themeSection !== theme);
    }
    for (const button of buttons) {
      button.setAttribute(
        'aria-pressed',
        String((button.dataset.themeButton ?? 'all') === (theme ?? 'all')),
      );
    }
    count.textContent = countLabel(ids.length);
    empty.hidden = ids.length > 0;
    empty.textContent = ids.length > 0 ? '' : noResultMessage(query);
    history.replaceState(null, '', theme ? `?theme=${theme}` : location.pathname);
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      theme = parseThemeParam(`?theme=${button.dataset.themeButton}`);
      render();
    });
  }
  input.addEventListener('input', render);
  document.querySelector('[data-anchors]')?.setAttribute('hidden', '');
  root.hidden = false;
  render();
}
