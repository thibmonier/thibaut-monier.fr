// Amélioration progressive du filtre de /competences/ (US-006) : toutes les entrées sont rendues au build ;
// ce script lit ?domaine=, masque les entrées hors domaine et met à jour boutons, compteur et messages.
import { buildSearch, countLabel, parseDomainParam, statusMessage } from '../lib/filters.ts';

const group = document.querySelector('[data-domain-filter]');
const count = document.querySelector('[data-count]');
const message = document.querySelector('[data-message]');
const reset = document.querySelector<HTMLElement>('[data-reset]');

if (group && count && message && reset) {
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('button')];
  const targets = [...document.querySelectorAll<HTMLElement>('[data-domains]')];
  const ids = buttons.map((button) => button.dataset.domain ?? '').filter(Boolean);

  const apply = (domain: string | null, unknown: boolean): void => {
    let shown = 0;
    for (const item of targets) {
      const visible = domain === null || (item.dataset.domains ?? '').split(' ').includes(domain);
      item.hidden = !visible;
      if (visible && item.dataset.achievement) shown++;
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String((button.dataset.domain || null) === domain));
    }
    count.textContent = countLabel(shown);
    message.textContent = statusMessage({ unknown, count: shown });
    reset.hidden = shown > 0;
  };

  group.addEventListener('click', (event) => {
    const button = (event.target as Element).closest('button');
    if (!button) return;
    const domain = button.dataset.domain || null;
    apply(domain, false);
    history.replaceState(null, '', location.pathname + buildSearch(domain));
  });

  const { domain, unknown } = parseDomainParam(location.search, ids);
  apply(domain, unknown);
}
