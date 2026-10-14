import { resolveTheme, THEME_STORAGE_KEY, toggleTheme, type Theme } from '../lib/theme.ts';

const root = document.documentElement;
const dark = matchMedia('(prefers-color-scheme: dark)');
const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');

const current = (): Theme => resolveTheme(root.getAttribute('data-theme'), dark.matches);

function render(): void {
  for (const button of buttons) button.setAttribute('aria-pressed', String(current() === 'dark'));
}

function choose(theme: Theme): void {
  root.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Stockage indisponible : le choix vaut pour la page seulement.
  }
  render();
}

for (const button of buttons)
  button.addEventListener('click', () => choose(toggleTheme(current())));
dark.addEventListener('change', render);
render();
