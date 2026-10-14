import { expect, test } from '@playwright/test';

// US-004 : scénarios Gherkin de la page d'accueil. Le clic de bout en bout vers le formulaire est testé avec US-008.

const MIN_TARGET = 44;

test.describe('Scénario : proposition de valeur et preuves visibles sans défilement (1280 x 720)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('h1, phrase de valeur, deux boutons et quatre preuves tiennent dans la fenêtre', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();

    const valueProp = page.locator('[data-value-prop]');
    await expect(valueProp).toBeVisible();
    const words = ((await valueProp.textContent()) ?? '').split(/\s+/).filter(Boolean);
    expect(words.length).toBeLessThanOrEqual(25);

    await expect(page.getByRole('link', { name: 'Me confier une mission' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Me recruter' })).toBeVisible();

    const proofs = page.locator('[data-proof]');
    await expect(proofs).toHaveCount(4);
    for (const proof of await proofs.all()) {
      await expect(proof).toBeVisible();
      const box = await proof.boundingBox();
      expect(box?.y).toBeGreaterThanOrEqual(0);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(720);
    }
  });

  test('les preuves mentionnent 20 plugins, career-ops, 12 modules et 25 ans', async ({ page }) => {
    await page.goto('/');
    const text = (await page.locator('[data-proofs]').textContent()) ?? '';
    expect(text).toContain('20');
    expect(text).toMatch(/plugins/);
    expect(text).toMatch(/career-ops/);
    expect(text).toMatch(/12/);
    expect(text).toMatch(/25\+?\s*ans d/);
  });

  test('chaque preuve est un lien cliquable vers une destination réelle', async ({ page }) => {
    await page.goto('/');
    for (const proof of await page.locator('[data-proof]').all()) {
      const href = (await proof.getAttribute('href')) ?? '';
      expect(href).toMatch(/^(\/|https:\/\/)/);
    }
  });
});

test.describe('Scénario : parcours « Me recruter » et « Me confier une mission »', () => {
  test('les boutons mènent à la page contact avec le motif pré-sélectionné', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Me recruter' })).toHaveAttribute(
      'href',
      '/contact/?motif=poste',
    );
    await expect(page.getByRole('link', { name: 'Me confier une mission' })).toHaveAttribute(
      'href',
      '/contact/?motif=mission',
    );
  });

  test('un clic sur « Me recruter » arrive sur /contact/ en moins de 1 s', async ({ page }) => {
    await page.goto('/');
    const start = Date.now();
    await page.getByRole('link', { name: 'Me recruter' }).click();
    await page.waitForURL(/\/contact\/\?motif=poste$/);
    expect(Date.now() - start).toBeLessThan(1000);
  });

  test(`les boutons font au moins ${MIN_TARGET} px de haut`, async ({ page }) => {
    await page.goto('/');
    for (const name of ['Me recruter', 'Me confier une mission']) {
      const box = await page.getByRole('link', { name }).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(MIN_TARGET);
    }
  });
});

test.describe('Scénario : affichage sur mobile (375 x 667)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('les boutons sont visibles sans défilement et les preuves tiennent sur une colonne', async ({
    page,
  }) => {
    await page.goto('/');
    for (const name of ['Me recruter', 'Me confier une mission']) {
      const link = page.getByRole('link', { name });
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(667);
    }

    const lefts = new Set<number>();
    for (const proof of await page.locator('[data-proof]').all()) {
      lefts.add(Math.round((await proof.boundingBox())?.x ?? -1));
    }
    expect(lefts.size).toBe(1);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe('Scénario : SEO et structure', () => {
  test('un seul h1, title ≤ 60 et description ≤ 160 caractères', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect((description ?? '').length).toBeLessThanOrEqual(160);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  });
});
