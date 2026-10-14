import { expect, test } from '@playwright/test';
import { byRecency, loadExperiences } from './helpers/experiences.ts';

// US-005 : scénarios Gherkin de la frise. Aucun décompte en dur : tout est lu dans la collection.

const all = loadExperiences();
const featured = byRecency(all.filter((e) => e.featured));
const earlier = byRecency(all.filter((e) => !e.featured));

test.describe('Scénario : frise complète', () => {
  test('liste ordonnée du plus récent au plus ancien, avec rôle, entreprise, période et contexte', async ({
    page,
  }) => {
    await page.goto('/parcours/');
    await expect(page.locator('h1')).toHaveCount(1);
    const timeline = page.locator('ol[data-timeline]');
    await expect(timeline).toBeVisible();

    const items = timeline.locator('> li[data-experience]');
    await expect(items).toHaveCount(featured.length);
    expect(featured.length).toBeGreaterThan(0);

    for (const [index, expected] of featured.entries()) {
      const item = items.nth(index);
      await expect(item).toHaveAttribute('data-experience', expected.slug);
      await expect(item.locator('[data-company]')).toHaveText(expected.company);
      await expect(item.locator('[data-role]')).toHaveText(expected.role);
      await expect(item.locator('[data-period]')).toHaveText(/\d{4}/);
      await expect(item.locator('[data-context]')).not.toBeEmpty();
      expect(await item.locator('[data-achievements] li').count()).toBeGreaterThanOrEqual(2);
    }
  });

  test('le poste en cours affiche « aujourd’hui »', async ({ page }) => {
    await page.goto('/parcours/');
    const current = featured.find((e) => e.end === null);
    expect(current).toBeDefined();
    await expect(page.locator(`[data-experience="${current?.slug}"] [data-period]`)).toContainText(
      'aujourd’hui',
    );
  });

  test('le titre et la description sont propres à la page', async ({ page }) => {
    await page.goto('/parcours/');
    const home = await (await page.request.get('/')).text();
    const title = await page.title();
    expect(title).toMatch(/Parcours/);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(home).not.toContain(`<title>${title}</title>`);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect((description ?? '').length).toBeGreaterThan(50);
    expect((description ?? '').length).toBeLessThanOrEqual(160);
  });

  test('le lien « Parcours » de la navigation est actif', async ({ page }) => {
    await page.goto('/parcours/');
    const link = page.locator('header a[href="/parcours/"]');
    await expect(link).toHaveAttribute('aria-current', 'page');
  });

  test('aucune donnée personnelle (téléphone, âge, naissance) dans la page', async ({ page }) => {
    await page.goto('/parcours/');
    const text = (await page.locator('main').textContent()) ?? '';
    expect(text).not.toMatch(/\b0[1-9]([ .]?\d{2}){4}\b/);
    expect(text).not.toMatch(/\b\d{2}\s?ans\b(?!\s+d['’]\s?(expérience|ancienneté))/i);
    expect(text).not.toMatch(/\bnée?\s+le\b|date de naissance/i);
  });
});

test.describe('Scénario : dépliage d’une expérience', () => {
  test('au clavier : Entrée sur « Voir le détail » déplie et aria-expanded passe à true', async ({
    page,
  }) => {
    await page.goto('/parcours/');
    const summary = page.locator('[data-experience] summary').first();
    await expect(summary).toHaveAttribute('aria-expanded', 'false');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(summary).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-experience] [data-achievements]').first()).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(summary).toHaveAttribute('aria-expanded', 'false');
  });

  test('à la souris : un clic déplie le détail', async ({ page }) => {
    await page.goto('/parcours/');
    const item = page.locator('[data-experience]').first();
    await expect(item.locator('[data-achievements]')).toBeHidden();
    await item.locator('summary').click();
    await expect(item.locator('[data-achievements]')).toBeVisible();
  });

  test.describe('au toucher', () => {
    test.use({ hasTouch: true });
    test('un toucher déplie le détail', async ({ page }) => {
      await page.goto('/parcours/');
      const item = page.locator('[data-experience]').first();
      await item.locator('summary').tap();
      await expect(item.locator('summary')).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('le dépliage natif fonctionne', async ({ page }) => {
      await page.goto('/parcours/');
      const item = page.locator('[data-experience]').first();
      await item.locator('summary').click();
      await expect(item.locator('[data-achievements]')).toBeVisible();
    });
  });
});

test.describe('Scénario : bloc « Avant 2016 »', () => {
  test('est repliable et liste les expériences antérieures', async ({ page }) => {
    await page.goto('/parcours/');
    const block = page.locator('details[data-earlier]');
    await expect(block).toHaveCount(1);
    await expect(block.locator('li[data-earlier-item]')).toHaveCount(earlier.length);
    await expect(block.locator('li[data-earlier-item]').first()).toBeHidden();
    await block.locator('> summary').click();
    for (const [index, expected] of earlier.entries()) {
      const item = block.locator('li[data-earlier-item]').nth(index);
      await expect(item).toBeVisible();
      await expect(item).toContainText(expected.company);
      await expect(item).toContainText(expected.role);
    }
  });
});

test.describe('Scénario : impression', () => {
  test('tout est déplié et le document tient sur 2 pages A4 au plus', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'le PDF ne dépend pas du viewport');
    await page.goto('/parcours/');
    await page.emulateMedia({ media: 'print' });

    for (const list of await page.locator('[data-experience] [data-achievements]').all()) {
      await expect(list).toBeVisible();
    }
    await expect(page.locator('li[data-earlier-item]').first()).toBeVisible();
    await expect(page.locator('header')).toBeHidden();

    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    const pages = pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? [];
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages.length).toBeLessThanOrEqual(2);
  });
});

test.describe('Scénario : responsive', () => {
  test('colonne unique sous 768 px, deux colonnes au-delà', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 });
    await page.goto('/parcours/');
    const columns = () =>
      page
        .locator('[data-experience]')
        .first()
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length,
        );
    expect(await columns()).toBe(1);
    await page.setViewportSize({ width: 1024, height: 900 });
    expect(await columns()).toBe(2);
  });

  test('aucun défilement horizontal à 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/parcours/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
