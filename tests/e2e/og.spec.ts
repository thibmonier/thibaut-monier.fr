import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { isArticleRoute } from '../../scripts/checks/lib/sample-routes.ts';
import { discoverRoutes } from './helpers/routes.ts';

const meta = (page: Page, property: string) =>
  page
    .locator(`meta[property="${property}"], meta[name="${property}"]`)
    .first()
    .getAttribute('content');

// Dimensions lues dans l'en-tête IHDR du PNG (octets 16 à 23).
function pngSize(bytes: Buffer): { width: number; height: number } {
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function assertImage(request: APIRequestContext, url: string): Promise<void> {
  const response = await request.get(new URL(url).pathname);
  expect(response.status(), url).toBe(200);
  expect(response.headers()['content-type'], url).toBe('image/png');
  expect(response.headers()['cache-control'], url).toMatch(/max-age=\d+|no-cache/);
  expect(response.headers()['content-security-policy'], url).toContain("default-src 'none'");
  const body = await response.body();
  expect(pngSize(body), url).toEqual({ width: 1200, height: 630 });
  expect(body.length, url).toBeLessThan(300 * 1024);
}

test.describe('Scénario : partage et images Open Graph', () => {
  test('accueil, article, fiche plugin et liste portent leurs balises de partage', async ({
    page,
    request,
    baseURL,
  }) => {
    const routes = await discoverRoutes(request, baseURL as string);
    const sample = [
      '/',
      '/open-source/',
      routes.find((r) => r.startsWith('/open-source/sylius/')),
      routes.find(isArticleRoute),
      routes.find((r) => r === '/blog/'),
    ].filter((r): r is string => r !== undefined);
    test.setTimeout(30_000 + sample.length * 5_000);

    for (const route of sample) {
      await page.goto(route);
      expect(await meta(page, 'og:title'), route).toBeTruthy();
      expect(await meta(page, 'og:description'), route).toBeTruthy();
      const image = (await meta(page, 'og:image')) as string;
      expect(image, route).toMatch(/^https?:\/\/.+\/og\/[a-z0-9-]+\.png$/);
      expect(await meta(page, 'og:image:width'), route).toBe('1200');
      expect(await meta(page, 'og:image:height'), route).toBe('630');
      expect(await meta(page, 'og:image:alt'), route).toBeTruthy();
      expect(await meta(page, 'twitter:card'), route).toBe('summary_large_image');
      expect(await meta(page, 'twitter:image'), route).toBe(image);
      await assertImage(request, image);
    }
  });

  test('une page sans image dédiée reçoit l’image par défaut', async ({ page, request }) => {
    await page.goto('/contact/');
    const image = (await meta(page, 'og:image')) as string;
    expect(new URL(image).pathname).toBe('/og/default.png');
    await assertImage(request, image);
  });

  test('l’article au titre le plus long a son image, générée sans erreur', async ({
    page,
    request,
    baseURL,
  }) => {
    const articles = (await discoverRoutes(request, baseURL as string)).filter(isArticleRoute);
    test.setTimeout(30_000 + articles.length * 2_000);
    let longest = { route: '', length: 0 };
    for (const route of articles) {
      await page.goto(route);
      const title = (await page.locator('h1').first().textContent()) ?? '';
      if (title.length > longest.length) longest = { route, length: title.length };
    }
    if (longest.route === '') return; // aucun article publié : rien à générer
    await page.goto(longest.route);
    await assertImage(request, (await meta(page, 'og:image')) as string);
  });

  test('les visiteurs ne chargent jamais les images de partage', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (r) => {
      if (new URL(r.url()).pathname.startsWith('/og/')) loaded.push(r.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(loaded).toEqual([]);
  });
});
