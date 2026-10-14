import { nextFocusIndex } from '../lib/focus-trap.ts';

const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
const nav = document.querySelector<HTMLElement>('[data-site-nav]');
const scope = button?.closest<HTMLElement>('[data-menu-scope]');
const desktop = matchMedia('(min-width: 48rem)');

function setOpen(open: boolean, restoreFocus = false): void {
  if (!button || !nav) return;
  nav.dataset.open = String(open);
  button.setAttribute('aria-expanded', String(open));
  if (!open && restoreFocus) button.focus();
}

const isOpen = () => nav?.dataset.open === 'true';

function focusables(): HTMLElement[] {
  const all = scope?.querySelectorAll<HTMLElement>('a[href], button') ?? [];
  return [...all].filter((el) => el.getClientRects().length > 0);
}

function trapTab(event: KeyboardEvent): void {
  const items = focusables();
  const index = nextFocusIndex(
    items.indexOf(document.activeElement as HTMLElement),
    items.length,
    event.shiftKey,
  );
  if (index < 0) return;
  event.preventDefault();
  items[index]?.focus();
}

if (button && nav) {
  button.addEventListener('click', () => setOpen(!isOpen()));
  document.addEventListener('keydown', (event) => {
    if (!isOpen() || desktop.matches) return;
    if (event.key === 'Escape') setOpen(false, true);
    else if (event.key === 'Tab') trapTab(event);
  });
  desktop.addEventListener('change', () => setOpen(false));
}
