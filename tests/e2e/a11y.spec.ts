import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { discoverSampledRoutes } from './helpers/sample.ts';
import { settleReveal } from './helpers/reveal.ts';

// WCAG 2.2 AA sur toutes les pages découvertes, thèmes clair et sombre.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('axe : aucune violation serious ou critical sur les pages découvertes', async ({
  browser,
  request,
  baseURL,
}) => {
  const routes = await discoverSampledRoutes(request, baseURL as string);
  expect(routes).toContain('/');
  // Le site grandit à chaque sprint : délai proportionnel au nombre de pages réellement testées (échantillonnées).
  test.setTimeout(30_000 + routes.length * 2 * 5_000);

  const blocking: string[] = [];
  for (const colorScheme of ['light', 'dark'] as const) {
    const context = await browser.newContext({ baseURL, colorScheme });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(route);
      await settleReveal(page);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const v of violations) {
        if (['serious', 'critical'].includes(v.impact ?? '')) {
          blocking.push(`${route} [${colorScheme}] ${v.id}: ${v.help}`);
        }
      }
    }
    await context.close();
  }
  // Toutes les violations sont rapportées en une fois, pas seulement celles de la première page fautive.
  expect(blocking, 'Violations axe serious ou critical').toEqual([]);
});
