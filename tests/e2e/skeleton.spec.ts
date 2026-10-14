import { expect, test } from '@playwright/test';

test.describe("Scénario : Page d'accueil minimale servie en HTTPS après fusion", () => {
  test("l'accueil répond 200 avec nom, titre du profil et liens de contact", async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Direction technique et delivery augmenté par IA');
    await expect(page.getByText('Thibaut Monier').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Me recruter' })).toHaveAttribute(
      'href',
      '/contact/?motif=poste',
    );
  });

  test('langue, titre, description et canonical sont présents', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page).toHaveTitle(/Thibaut Monier/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/.+\/$/);
  });

  test('aucun défilement horizontal', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe('Scénario : URL inexistante', () => {
  test('renvoie un vrai 404 sans fuite technique', async ({ page }) => {
    const response = await page.goto('/page-inexistante');
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Cette page n'existe pas")).toBeVisible();
    await expect(page.getByRole('link', { name: "Retour à l'accueil" })).toHaveAttribute(
      'href',
      '/',
    );
    const body = await page.content();
    expect(body).not.toMatch(/nginx\/\d|stack trace|at \w+\.\w+ \(/i);
  });
});

test.describe('Scénario : aucun cookie', () => {
  test("l'accueil ne dépose aucun cookie", async ({ page, context }) => {
    await page.goto('/');
    expect(await context.cookies()).toEqual([]);
  });
});
