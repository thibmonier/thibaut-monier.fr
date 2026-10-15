import { expect, test, type Page } from '@playwright/test';
import { discoverSampledRoutes } from './helpers/sample.ts';

// T-002-11 : vérification transverse sur TOUTES les pages découvertes (aucune liste à maintenir) :
// responsive (360, 768, 1280), JavaScript désactivé, préférence de mouvement réduit.
const WIDTHS = [360, 768, 1280];

const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('Scénario : toutes les pages, responsive', () => {
  for (const width of WIDTHS) {
    test(`aucun défilement horizontal, un h1 et un main à ${width} px`, async ({
      page,
      request,
      baseURL,
    }) => {
      const routes = await discoverSampledRoutes(request, baseURL as string);
      expect(routes.length).toBeGreaterThanOrEqual(5);
      test.setTimeout(Math.max(30_000, routes.length * 2_000)); // une navigation par page : le délai suit le volume
      await page.setViewportSize({ width, height: 800 });
      for (const route of routes) {
        await page.goto(route);
        expect(
          await horizontalOverflow(page),
          `${route} déborde à ${width} px`,
        ).toBeLessThanOrEqual(0);
        await expect(page.getByRole('heading', { level: 1 }), route).toHaveCount(1);
        await expect(page.getByRole('main'), route).toHaveCount(1);
      }
    });
  }
});

test.describe('Scénario : toutes les pages, JavaScript désactivé', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });

  test('le contenu et la navigation restent accessibles, sans débordement', async ({
    page,
    request,
    baseURL,
  }) => {
    const routes = await discoverSampledRoutes(request, baseURL as string);
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.getByRole('heading', { level: 1 }), route).toBeVisible();
      await expect(
        page.getByRole('navigation', { name: 'Navigation principale' }),
        route,
      ).toBeVisible();
      await expect(page.getByRole('contentinfo'), route).toBeVisible();
      expect(await horizontalOverflow(page), route).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('Scénario : toutes les pages, mouvement réduit', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });

  test('animations et transitions neutralisées, défilement instantané', async ({
    page,
    request,
    baseURL,
  }) => {
    const routes = await discoverSampledRoutes(request, baseURL as string);
    for (const route of routes) {
      await page.goto(route);
      const { durations, behavior } = await page.evaluate(() => ({
        durations: [...document.querySelectorAll('body, body *')].flatMap((el) => {
          const style = getComputedStyle(el);
          return [style.transitionDuration, style.animationDuration];
        }),
        behavior: getComputedStyle(document.documentElement).scrollBehavior,
      }));
      expect(new Set(durations.flatMap((d) => d.split(', '))), route).toEqual(new Set(['0s']));
      expect(behavior, route).toBe('auto');
    }
  });
});

test.describe('Scénario : toutes les pages, CSP', () => {
  test('aucune violation de Content-Security-Policy ni erreur de console', async ({
    page,
    request,
    baseURL,
  }) => {
    const problems: string[] = [];
    page.on('console', (m) => {
      if (/content security policy/i.test(m.text()) || m.type() === 'error') {
        problems.push(`${page.url()} : ${m.text()}`);
      }
    });
    page.on('pageerror', (e) => problems.push(`${page.url()} : ${e.message}`));
    for (const route of await discoverSampledRoutes(request, baseURL as string)) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }
    expect(problems).toEqual([]);
  });
});
