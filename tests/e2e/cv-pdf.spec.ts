import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// US-007 : scénarios Gherkin du CV PDF. Le contenu du PDF (texte, pages, métadonnées, données
// personnelles) est vérifié au build par scripts/checks/cv-pdf.dist.check.ts.
const LABEL = 'Télécharger mon CV (PDF, 2 pages)';
const PDF_PATH = '/thibaut-monier-cv.pdf';
const MAX_BYTES = 500 * 1024;

test.describe('Scénario : lien de téléchargement', () => {
  for (const route of ['/parcours/', '/contact/']) {
    test(`${route} propose « ${LABEL} » (cible ≥ 44 px, attribut download)`, async ({ page }) => {
      await page.goto(route);
      const link = page.locator('main a[data-cv-download]');
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAccessibleName(LABEL);
      await expect(link).toHaveAttribute('href', PDF_PATH);
      await expect(link).toHaveAttribute('download', 'thibaut-monier-cv.pdf');
      const box = await link.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    });
  }

  test('le libellé est statique : aucun poids n’est affiché', async ({ page }) => {
    await page.goto('/parcours/');
    const text = (await page.locator('a[data-cv-download]').textContent()) ?? '';
    expect(text.trim()).toBe(LABEL);
    expect(text).not.toMatch(/\b(Ko|Mo|KB|MB)\b/i);
  });

  test('le lien reste invisible à l’impression de la page Parcours', async ({ page }) => {
    await page.goto('/parcours/');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('a[data-cv-download]')).toBeHidden();
  });

  test('le lien est atteignable au clavier avec un focus visible', async ({ page }) => {
    await page.goto('/contact/');
    const link = page.locator('a[data-cv-download]');
    await link.focus();
    await expect(link).toBeFocused();
    const outline = await link.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });

  for (const route of ['/parcours/', '/contact/']) {
    test(`axe : aucune violation sur la zone du lien (${route})`, async ({ page }) => {
      await page.goto(route);
      const { violations } = await new AxeBuilder({ page })
        .include('a[data-cv-download]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(violations.map((v) => v.id)).toEqual([]);
    });
  }
});

test.describe('Scénario nominal : téléchargement du CV public', () => {
  test('un clic télécharge thibaut-monier-cv.pdf', async ({ page }) => {
    await page.goto('/parcours/');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('a[data-cv-download]').click(),
    ]);
    expect(download.suggestedFilename()).toBe('thibaut-monier-cv.pdf');
  });

  test('le fichier est un PDF de moins de 500 Ko', async ({ request }) => {
    const response = await request.get(PDF_PATH);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    const body = await response.body();
    expect(body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(body.length).toBeGreaterThan(10_000);
    expect(body.length).toBeLessThan(MAX_BYTES);
  });

  test('la réponse est revalidée et exclue de l’indexation', async ({ request }) => {
    const headers = (await request.get(PDF_PATH)).headers();
    expect(headers['cache-control']).toContain('no-cache');
    expect(headers['cache-control']).not.toMatch(/max-age=[1-9]/);
    expect(headers['x-robots-tag']).toContain('noindex');
    expect(headers['etag']).toBeTruthy();
  });

  test('les en-têtes de sécurité communs sont conservés sur le PDF', async ({ request }) => {
    const h = (await request.get(PDF_PATH)).headers();
    expect(h['content-security-policy']).toContain("default-src 'none'");
    expect(h['strict-transport-security']).toContain('max-age=');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['cross-origin-resource-policy']).toBe('same-origin');
  });

  test('la revalidation conditionnelle renvoie 304', async ({ request }) => {
    const etag = (await request.get(PDF_PATH)).headers()['etag'] as string;
    const response = await request.get(PDF_PATH, { headers: { 'If-None-Match': etag } });
    expect(response.status()).toBe(304);
  });

  test('le PDF n’est pas servi pour une autre méthode que GET ou HEAD', async ({ request }) => {
    expect((await request.post(PDF_PATH, { data: 'x' })).status()).toBe(405);
  });
});
