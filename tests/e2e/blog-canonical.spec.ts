import { expect, test } from '@playwright/test';

// US-010 : canonical autoréférente sur le domaine du site. Strict.
// Échantillon : 3 articles (le délai reste proportionnel : une page chacun).
const SAMPLE = [
  'la-spec-est-le-nouveau-code',
  'le-vrai-developpeur-augmente-c-est-le-chef',
  'shadow-it-agentique-perdre-la-trace-de-ses-agents',
];

test.describe('Scénario : canonical autoréférente', () => {
  test.setTimeout(30_000 + SAMPLE.length * 5_000);

  test('une seule balise canonical absolue, égale à l’URL de la page sur le site', async ({
    page,
  }) => {
    await page.goto('/');
    const origin = new URL((await page.locator('link[rel="canonical"]').getAttribute('href')) ?? '')
      .origin;
    for (const slug of SAMPLE) {
      await page.goto(`/blog/${slug}/`);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical, slug).toHaveCount(1);
      const href = (await canonical.getAttribute('href')) ?? '';
      expect(href, slug).toBe(`${origin}/blog/${slug}/`);
      expect(new URL(href).protocol).toMatch(/^https?:$/);
    }
  });

  test('une page noindex ne porte aucune canonical', async ({ page }) => {
    await page.goto('/recherche/');
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});
