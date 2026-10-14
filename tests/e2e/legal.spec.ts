import { expect, test } from '@playwright/test';
import { discoverRoutes } from './helpers/routes.ts';

test.describe('Scénario : liens légaux dans le pied de page', () => {
  test('toutes les pages découvertes portent les liens légaux', async ({
    page,
    request,
    baseURL,
  }) => {
    const routes = await discoverRoutes(request, baseURL as string);
    for (const route of routes) {
      await page.goto(route);
      const footer = page.getByRole('contentinfo');
      const found =
        (await footer.getByRole('link', { name: 'Mentions légales' }).count()) > 0 &&
        (await footer.getByRole('link', { name: 'Vie privée' }).count()) > 0;
      expect(found, `Liens légaux absents sur ${route}`).toBe(true);
    }
  });
});

test.describe('Scénario : consultation des mentions légales', () => {
  test('affiche éditeur, directeur de la publication et hébergeur', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Mentions légales' }).click();
    await expect(page).toHaveURL(/\/mentions-legales\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mentions légales');
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { name: 'Éditeur du site' })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Directeur de la publication' })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Hébergeur' })).toBeVisible();
    await expect(main).toContainText('Thibaut Monier');
    await expect(main).toContainText('Railway');
    await expect(main.getByText(/Mis à jour le/)).toBeVisible();
  });

  test("ne publie ni téléphone ni adresse pour l'éditeur et reste indexable", async ({ page }) => {
    await page.goto('/mentions-legales/');
    const text = await page.getByRole('main').innerText();
    expect(text).not.toMatch(/(?:\+33|\b0)[1-9](?:[\s.]?\d{2}){4}/);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });

  test('les titres sont hiérarchisés (un seul h1, pas de saut de niveau)', async ({ page }) => {
    for (const route of ['/mentions-legales/', '/vie-privee/']) {
      await page.goto(route);
      const levels = await page
        .getByRole('main')
        .locator('h1, h2, h3, h4')
        .evaluateAll((nodes) => nodes.map((n) => Number(n.tagName.slice(1))));
      expect(levels.filter((l) => l === 1)).toHaveLength(1);
      levels.forEach((level, i) => {
        if (i > 0) expect(level - (levels[i - 1] as number)).toBeLessThanOrEqual(1);
      });
    }
  });
});

test.describe('Scénario : politique de vie privée', () => {
  test('liste les droits, le contact, la CNIL et l’absence de cookie', async ({ page }) => {
    await page.goto('/vie-privee/');
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1 })).toHaveText('Vie privée');
    await expect(main).toContainText('Ce site ne dépose aucun cookie');
    await expect(main.getByRole('link', { name: /CNIL/ }).first()).toHaveAttribute(
      'href',
      /^https:\/\/www\.cnil\.fr\//,
    );
    await expect(main).toContainText(/accès/i);
    await expect(main).toContainText(/rectification/i);
    await expect(main).toContainText(/effacement/i);
    await expect(main).toContainText('Web3Forms');
    await expect(main).toContainText('Umami');
    await expect(main).toContainText('Calendly');
    await expect(main.getByText(/Mis à jour le/)).toBeVisible();
  });

  test("l'ancre #formulaire existe", async ({ page }) => {
    await page.goto('/vie-privee/#formulaire');
    await expect(page.locator('#formulaire')).toHaveCount(1);
    await expect(page.locator('#formulaire')).toBeVisible();
  });

  test("n'émet aucun cookie", async ({ page, context }) => {
    await page.goto('/vie-privee/');
    expect(await context.cookies()).toEqual([]);
  });
});
