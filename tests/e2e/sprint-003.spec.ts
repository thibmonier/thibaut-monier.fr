import { expect, test, type Page } from '@playwright/test';

// Sprint 3, scénarios inter-US (T-900-24) : parcours courts qui relient blog, navigation, recherche, SEO et RSS.
// Strict : aucun test.skip. Le détail de chaque US est couvert par ses propres fichiers.
const REFERENCE = '/blog/la-spec-est-le-nouveau-code/';

async function jsonLdTypes(page: Page): Promise<unknown[]> {
  const texts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return texts.map((text) => (JSON.parse(text) as Record<string, unknown>)['@type']);
}

const canonical = (page: Page) => page.locator('link[rel="canonical"]').getAttribute('href');

test.describe('Scénario : de l’accueil à un article par la navigation du blog', () => {
  test('accueil, blog, catégorie, article, retour par le fil d’Ariane', async ({ page }) => {
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Menu' });
    if (await menu.isVisible()) await menu.click(); // petit écran : navigation repliée
    await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'Blog', exact: true })
      .click();
    await expect(page).toHaveURL(/\/blog\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    await page.goto(REFERENCE);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('La spec est le nouveau code');
    await page.locator('article').getByRole('link', { name: 'Méthode' }).first().click();
    await expect(page).toHaveURL(/\/blog\/categorie\/methode\/$/);
    await expect(page.locator('a[href="' + REFERENCE + '"]').first()).toBeVisible();

    await page.goto(REFERENCE);
    await page
      .getByRole('navigation', { name: 'Fil d’Ariane' })
      .getByRole('link', { name: 'Blog' })
      .click();
    await expect(page).toHaveURL(/\/blog\/$/);
  });

  test('aucun cookie ni stockage local sur tout le parcours', async ({ page, context }) => {
    for (const route of ['/', '/blog/', REFERENCE, '/blog/categorie/methode/', '/recherche/']) {
      await page.goto(route);
    }
    expect(await context.cookies()).toEqual([]);
    const stored = await page.evaluate(() => localStorage.length + sessionStorage.length);
    expect(stored).toBe(0);
  });
});

test.describe('Scénario : de la recherche à l’article', () => {
  test('« tokens » mène à un article avec canonical autoréférente et JSON-LD', async ({ page }) => {
    await page.goto('/recherche/');
    const input = page.getByRole('searchbox', { name: 'Rechercher dans le blog' });
    await input.focus();
    await expect(page.locator('[data-search]')).toHaveAttribute('data-index', 'ready');
    await input.fill('tokens');
    const first = page.locator('[data-search-results] li').first().getByRole('link');
    await expect(first).toBeVisible();
    await first.click();
    await expect(page).toHaveURL(/\/blog\/[^/]+\/(#.*)?$/);

    const path = new URL(page.url()).pathname;
    expect(await canonical(page)).toMatch(new RegExp(`^https://[^/]+${path}$`));
    expect(await jsonLdTypes(page)).toEqual(
      expect.arrayContaining(['BlogPosting', 'BreadcrumbList']),
    );
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toMatch(/\/og\/blog-[^/]+\.png$/);
  });
});

test.describe('Scénario : le flux RSS mène à des articles accessibles', () => {
  test('le lien du pied de page ouvre un flux dont le premier article répond 200', async ({
    page,
    request,
  }) => {
    await page.goto('/blog/');
    const rss = page.getByRole('contentinfo').getByRole('link', { name: /RSS/ });
    await expect(rss).toHaveAttribute('href', '/rss.xml');

    const feed = await request.get('/rss.xml');
    expect(feed.status()).toBe(200);
    expect(feed.headers()['content-type']).toContain('application/rss+xml');
    const xml = await feed.text();
    const link = xml.match(/<item>[\s\S]*?<link>([^<]+)<\/link>/)?.[1];
    expect(link).toBeTruthy();
    const article = await request.get(new URL(link as string).pathname);
    expect(article.status()).toBe(200);
  });
});
