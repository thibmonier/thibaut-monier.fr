import { expect, test } from '@playwright/test';

// US-010 : canonical autoréférente sur le nouveau domaine et mention de l'article d'origine. Strict.
// Échantillon : 3 articles (le délai reste proportionnel : une page chacun).
const SAMPLE = [
  { slug: 'la-spec-est-le-nouveau-code', date: '2026-03-17', label: '17 mars 2026' },
  { slug: 'le-vrai-developpeur-augmente-c-est-le-chef', date: '2026-03-20', label: '20 mars 2026' },
  {
    slug: 'shadow-it-agentique-perdre-la-trace-de-ses-agents',
    date: '2026-09-21',
    label: '21 septembre 2026',
  },
];

test.describe('Scénario : canonical autoréférente', () => {
  test.setTimeout(30_000 + SAMPLE.length * 5_000);

  test('une seule balise canonical absolue, égale à l’URL de la page sur le site', async ({
    page,
  }) => {
    await page.goto('/');
    const origin = new URL((await page.locator('link[rel="canonical"]').getAttribute('href')) ?? '')
      .origin;
    for (const { slug } of SAMPLE) {
      await page.goto(`/blog/${slug}/`);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical, slug).toHaveCount(1);
      const href = (await canonical.getAttribute('href')) ?? '';
      expect(href, slug).toBe(`${origin}/blog/${slug}/`);
      expect(new URL(href).protocol).toMatch(/^https?:$/);
    }
  });

  test('aucune canonical ni lien alternatif vers agentic-agency.fr', async ({ page }) => {
    for (const { slug } of SAMPLE) {
      await page.goto(`/blog/${slug}/`);
      await expect(page.locator('link[href*="agentic-agency.fr"]'), slug).toHaveCount(0);
    }
  });

  test('une page noindex ne porte aucune canonical', async ({ page }) => {
    await page.goto('/recherche/');
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});

test.describe('Scénario : mention de l’article d’origine', () => {
  for (const { slug, date, label } of SAMPLE) {
    test(`« Initialement publié sur Agentic Agency le ${label} » (${slug})`, async ({ page }) => {
      await page.goto(`/blog/${slug}/`);
      const notice = page.locator('[data-original-notice]');
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(`Initialement publié sur Agentic Agency le ${label}`);
      await expect(notice.locator('time')).toHaveAttribute('datetime', date);
      const link = notice.getByRole('link', { name: /Agentic Agency/ });
      await expect(link).toHaveAttribute('href', `https://agentic-agency.fr/blog/${slug}`);
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link).toHaveAttribute('rel', /noreferrer/);
    });
  }

  test('la mention est un texte lisible, pas une icône seule', async ({ page }) => {
    await page.goto(`/blog/${SAMPLE[0]?.slug}/`);
    const text = (await page.locator('[data-original-notice]').innerText()).trim();
    expect(text.length).toBeGreaterThan(30);
  });
});
