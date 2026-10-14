import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// US-019 : catalogue des 20 plugins Sylius 2 filtrable par thème.
const COUNTS = { b2b: 9, 'conformite-ue': 3, 'back-office': 5, 'ia-integrations': 3 };
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const visibleCards = (page: import('@playwright/test').Page) =>
  page.locator('[data-plugin]:visible');

test.describe('Scénario : catalogue complet puis filtre par thème', () => {
  test('20 cartes, avec nom, accroche, thème et lien vers la fiche', async ({ page }) => {
    await page.goto('/open-source/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-plugin]')).toHaveCount(20);
    for (const card of await page.locator('[data-plugin]').all()) {
      await expect(card.locator('h3 a')).toHaveAttribute(
        'href',
        /^\/open-source\/sylius\/[a-z0-9-]+\/$/,
      );
      await expect(card.locator('p').first()).not.toBeEmpty();
      await expect(card.locator('[data-card-theme]')).not.toBeEmpty();
    }
    await expect(page.locator('[data-count]')).toHaveText('20 plugins');
  });

  test('le thème « B2B » affiche 9 cartes, « 9 plugins » et l’URL ?theme=b2b', async ({ page }) => {
    await page.goto('/open-source/');
    const b2b = page.getByRole('button', { name: 'B2B', exact: true });
    await expect(b2b).toHaveAttribute('aria-pressed', 'false');
    await b2b.click();
    await expect(b2b).toHaveAttribute('aria-pressed', 'true');
    await expect(visibleCards(page)).toHaveCount(COUNTS.b2b);
    await expect(page.locator('[data-count]')).toHaveText('9 plugins');
    await expect(page).toHaveURL(/\?theme=b2b$/);
  });

  test('l’URL partagée restitue le même filtre', async ({ page }) => {
    await page.goto('/open-source/?theme=b2b');
    await expect(visibleCards(page)).toHaveCount(COUNTS.b2b);
    await expect(page.getByRole('button', { name: 'B2B', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('[data-count]')).toHaveText('9 plugins');
  });

  for (const [theme, expected] of Object.entries(COUNTS)) {
    test(`le thème ${theme} contient ${expected} plugins`, async ({ page }) => {
      await page.goto(`/open-source/?theme=${theme}`);
      await expect(visibleCards(page)).toHaveCount(expected);
    });
  }

  test('« Tous » retire le filtre et l’URL', async ({ page }) => {
    await page.goto('/open-source/?theme=b2b');
    await page.getByRole('button', { name: 'Tous', exact: true }).click();
    await expect(visibleCards(page)).toHaveCount(20);
    await expect(page).toHaveURL(/\/open-source\/$/);
  });

  test('un thème inconnu dans l’URL affiche tous les plugins', async ({ page }) => {
    await page.goto('/open-source/?theme=paiement');
    await expect(visibleCards(page)).toHaveCount(20);
  });
});

test.describe('Scénario : recherche par mot-clé', () => {
  test('« facture » place la carte Factur-X en premier et met le compteur à jour', async ({
    page,
  }) => {
    await page.goto('/open-source/');
    await page.getByLabel('Rechercher un plugin').fill('facture');
    await expect(visibleCards(page).first().locator('h3')).toHaveText('Factur-X');
    const count = await visibleCards(page).count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThan(20);
    await expect(page.locator('[data-count]')).toHaveText(
      count === 1 ? '1 plugin' : `${count} plugins`,
    );
  });

  test('la recherche ignore les accents et la casse', async ({ page }) => {
    await page.goto('/open-source/');
    await page.getByLabel('Rechercher un plugin').fill('CONFORMITE');
    await expect(visibleCards(page).first()).toBeVisible();
    expect(await visibleCards(page).count()).toBeGreaterThan(0);
  });

  test('« blockchain » affiche le message sans résultat', async ({ page }) => {
    await page.goto('/open-source/');
    await page.getByLabel('Rechercher un plugin').fill('blockchain');
    await expect(visibleCards(page)).toHaveCount(0);
    await expect(page.locator('[data-empty]')).toHaveText(
      'Aucun plugin ne correspond à « blockchain ». Essayez un autre mot-clé ou parcourez les 4 thèmes.',
    );
    await expect(page.locator('[data-count]')).toHaveText('0 plugin');
  });

  test('effacer la recherche rétablit les sections par thème', async ({ page }) => {
    await page.goto('/open-source/');
    const search = page.getByLabel('Rechercher un plugin');
    await search.fill('facture');
    await search.fill('');
    await expect(visibleCards(page)).toHaveCount(20);
    await expect(page.locator('[data-theme-section]:visible')).toHaveCount(4);
  });
});

test.describe('Scénario : accès sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('les 20 plugins sont listés, groupés par thème avec des ancres', async ({ page }) => {
    await page.goto('/open-source/');
    await expect(page.locator('[data-plugin]:visible')).toHaveCount(20);
    await expect(page.locator('[data-filter]')).toBeHidden();
    for (const [theme, expected] of Object.entries(COUNTS)) {
      await expect(page.locator(`[data-theme-section="${theme}"] [data-plugin]`)).toHaveCount(
        expected,
      );
      await expect(page.locator(`nav[data-anchors] a[href="#theme-${theme}"]`)).toBeVisible();
      await expect(page.locator(`#theme-${theme}`)).toBeVisible();
    }
  });
});

test.describe('Scénario : accessibilité', () => {
  test('boutons à bascule et résultats annoncés', async ({ page }) => {
    await page.goto('/open-source/');
    await expect(
      page.getByRole('group', { name: 'Filtrer par thème' }).getByRole('button'),
    ).toHaveCount(5);
    const status = page.locator('[data-count]');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('aria-live', 'polite');
  });

  test('axe : aucune violation sur le catalogue, filtré et recherché', async ({ page }) => {
    test.setTimeout(90_000);
    for (const url of ['/open-source/', '/open-source/?theme=b2b']) {
      await page.goto(url);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations.map((v) => `${url} ${v.id}`)).toEqual([]);
    }
    await page.getByLabel('Rechercher un plugin').fill('facture');
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(violations.map((v) => v.id)).toEqual([]);
  });

  test('le filtre est utilisable au clavier', async ({ page }) => {
    await page.goto('/open-source/');
    const button = page.getByRole('button', { name: 'Conformité UE' });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(visibleCards(page)).toHaveCount(COUNTS['conformite-ue']);
  });
});

test.describe('Scénario : responsive', () => {
  for (const [width, columns] of [
    [600, 1],
    [800, 2],
    [1280, 3],
  ] as const) {
    test(`${columns} colonne(s) à ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/open-source/');
      const count = await page
        .locator('[data-theme-section="b2b"] ul')
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length,
        );
      expect(count).toBe(columns);
    });
  }
});

test.describe('Scénario : SEO et réseau', () => {
  test('title et description propres, aucune requête tierce', async ({ page }) => {
    const foreign: string[] = [];
    const origin = new URL(test.info().project.use.baseURL ?? 'http://localhost:8080').origin;
    page.on('request', (r) => {
      if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) foreign.push(r.url());
    });
    await page.goto('/open-source/');
    await page.getByLabel('Rechercher un plugin').fill('audit');
    const title = await page.title();
    expect(title).toMatch(/Plugins Sylius 2 open source/);
    expect(title.length).toBeLessThanOrEqual(60);
    const description =
      (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(description.length).toBeGreaterThan(50);
    expect(description.length).toBeLessThanOrEqual(160);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/open-source\/$/);
    expect(foreign).toEqual([]);
  });

  test('l’entrée « Open source » de la navigation est active', async ({ page }) => {
    await page.goto('/open-source/');
    await expect(page.locator('header a[href="/open-source/"]').first()).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

test.describe('Scénario : autres projets depuis le hub', () => {
  test('tailsfadmin et career-ops sont accessibles, le catalogue reste à 20 plugins', async ({
    page,
  }) => {
    await page.goto('/open-source/');
    await expect(visibleCards(page)).toHaveCount(20);
    const section = page.locator('[data-other-projects]');
    await expect(section.getByRole('heading', { name: 'Autres projets', level: 2 })).toBeVisible();
    await expect(section.locator('[data-project]')).toHaveCount(2);
    await section.getByRole('link', { name: 'tailsfadmin' }).click();
    await expect(page).toHaveURL(/\/open-source\/tailsfadmin\/$/);
    await page.goto('/open-source/');
    await page.locator('[data-other-projects]').getByRole('link', { name: 'career-ops' }).click();
    await expect(page).toHaveURL(/\/open-source\/career-ops\/$/);
  });
});
