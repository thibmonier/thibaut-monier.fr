// Amélioration progressive : `details`/`summary` fonctionne sans JavaScript ; ce script synchronise
// `aria-expanded` sur le résumé et déplie tout avant l'impression (navigateurs sans ::details-content).
const collapsibles = [
  ...document.querySelectorAll<HTMLDetailsElement>('details[data-collapsible]'),
];

function sync(details: HTMLDetailsElement): void {
  details.querySelector(':scope > summary')?.setAttribute('aria-expanded', String(details.open));
}

for (const details of collapsibles) {
  sync(details);
  details.addEventListener('toggle', () => sync(details));
}

const wasClosed = new Set<HTMLDetailsElement>();

addEventListener('beforeprint', () => {
  for (const details of collapsibles) {
    if (!details.open) wasClosed.add(details);
    details.open = true;
  }
});

addEventListener('afterprint', () => {
  for (const details of wasClosed) details.open = false;
  wasClosed.clear();
});
