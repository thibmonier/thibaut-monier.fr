import type { Page } from '@playwright/test';

/**
 * Affiche tous les blocs `.reveal` et attend la fin de leurs transitions.
 *
 * axe mesure les couleurs calculées : pendant le fondu de `src/scripts/reveal.ts`, l'opacité partielle
 * fait chuter le contraste. Les analyses portent donc sur l'état final vu par le visiteur. Les animations
 * infinies (pastille `animate-ping` du hero) ne se terminent jamais : seules les animations finies sont attendues.
 */
export async function settleReveal(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (const el of document.querySelectorAll('.reveal')) el.classList.add('is-revealed');
    const finite = document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity);
    await Promise.all(finite.map((animation) => animation.finished));
  });
}
