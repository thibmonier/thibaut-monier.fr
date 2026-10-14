import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { discoverRoutes } from './helpers/routes.ts';

// WCAG 2.2 AA sur toutes les pages découvertes, thèmes clair et sombre.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('axe : aucune violation serious ou critical sur les pages découvertes', async ({
  browser,
  request,
  baseURL,
}) => {
  const routes = await discoverRoutes(request, baseURL as string);
  expect(routes).toContain('/');

  for (const colorScheme of ['light', 'dark'] as const) {
    const context = await browser.newContext({ baseURL, colorScheme });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(route);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const blocking = violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
      expect(
        blocking.map((v) => `${route} [${colorScheme}] ${v.id}: ${v.help}`),
        `Violations axe sur ${route} (${colorScheme})`,
      ).toEqual([]);
    }
    await context.close();
  }
});
