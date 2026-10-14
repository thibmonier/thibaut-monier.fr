import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// US-021 (affichage) : le build lit src/data/oss-metrics.json, la page n'émet aucune requête réseau tierce.
const metrics = JSON.parse(readFileSync('src/data/oss-metrics.json', 'utf8')) as {
  entries: Record<
    string,
    { fetchedAt: string; github?: { stars: number }; packagist?: { latestVersion: string } }
  >;
};
const entry = metrics.entries['thibmonier/sylius-company-accounts-plugin'];

test.describe('Scénario : métriques affichées sur une fiche', () => {
  test('version, date de release, étoiles, téléchargements et « Données au … » avec libellés textuels', async ({
    page,
  }) => {
    expect(entry).toBeDefined();
    await page.goto('/open-source/sylius/company-accounts/');
    const block = page.locator('[data-live-stats]');
    await expect(block).toBeVisible();
    await expect(block.locator('[data-stat="version"] dt')).toHaveText('Dernière version');
    await expect(block.locator('[data-stat="version"] dd')).toHaveText(
      entry?.packagist?.latestVersion ?? '',
    );
    await expect(block.locator('[data-stat="release"] dt')).toHaveText('Date de release');
    await expect(block.locator('[data-stat="release"] dd')).toContainText(/\d{4}/);
    await expect(block.locator('[data-stat="stars"] dt')).toHaveText('Étoiles GitHub');
    await expect(block.locator('[data-stat="stars"] dd')).toHaveText(String(entry?.github?.stars));
    await expect(block.locator('[data-stat="downloads-monthly"] dt')).toContainText(
      'Téléchargements Packagist',
    );
    await expect(block.locator('[data-stat="downloads-total"] dd')).toHaveText(/^\d/);
    await expect(block.locator('[data-stats-date]')).toHaveText(
      `Données au ${(entry?.fetchedAt ?? '').slice(0, 10)}`,
    );
  });

  test('aucune requête réseau sortante de la page', async ({ page, baseURL }) => {
    const origin = new URL(baseURL as string).origin;
    const foreign: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) foreign.push(r.url());
    });
    await page.goto('/open-source/sylius/company-accounts/');
    await page.waitForLoadState('networkidle');
    expect(foreign).toEqual([]);
  });

  test('une métrique absente est masquée seule : Agentic Feeds sans téléchargements', async ({
    page,
  }) => {
    await page.goto('/open-source/sylius/agentic-feeds/');
    const block = page.locator('[data-live-stats]');
    await expect(block.locator('[data-stat="stars"]')).toBeVisible();
    await expect(block.locator('[data-stat="downloads-monthly"]')).toHaveCount(0);
    await expect(block.locator('[data-stats-date]')).toContainText('Données au');
  });

  test('aucune donnée de métrique dans les données structurées', async ({ page }) => {
    await page.goto('/open-source/sylius/company-accounts/');
    expect(await page.locator('script[type="application/ld+json"]').count()).toBe(0);
  });
});
