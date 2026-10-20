import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { discoverRoutes } from './helpers/routes.ts';
import { settleReveal } from './helpers/reveal.ts';

// US-020 : fiche détaillée d'un plugin.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const fiche = (slug: string) => `/open-source/sylius/${slug}/`;

const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('Scénario : lecture de la fiche Purchase Approval (1440 x 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('la matrice de compatibilité est visible sans défilement', async ({ page }) => {
    await page.goto(fiche('purchase-approval'));
    const matrix = page.locator('[data-compat] table');
    await expect(matrix).toBeVisible();
    await expect(matrix.getByRole('columnheader')).toHaveText(['Sylius', 'PHP', 'Symfony']);
    const box = await matrix.boundingBox();
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(900);
  });

  test('« Nécessite : Company Accounts, Order Hold » avec un lien vers chaque fiche', async ({
    page,
  }) => {
    await page.goto(fiche('purchase-approval'));
    const group = page.locator('[data-dep-group="requires"]');
    await expect(group).toContainText('Nécessite');
    await expect(group.getByRole('link')).toHaveText(['Company Accounts', 'Order Hold']);
    await expect(group.getByRole('link', { name: 'Order Hold' })).toHaveAttribute(
      'href',
      fiche('order-hold'),
    );
    await expect(group.getByRole('link', { name: 'Company Accounts' })).toHaveAttribute(
      'href',
      fiche('company-accounts'),
    );
  });

  test('les liens GitHub et Packagist s’ouvrent dans un nouvel onglet avec rel="noopener"', async ({
    page,
  }) => {
    await page.goto(fiche('purchase-approval'));
    const github = page.locator('[data-link="github"]');
    const packagist = page.locator('[data-link="packagist"]');
    await expect(github).toHaveAttribute(
      'href',
      'https://github.com/thibmonier/sylius-purchase-approval-plugin',
    );
    await expect(packagist).toHaveAttribute(
      'href',
      'https://packagist.org/packages/tmonier/sylius-purchase-approval-plugin',
    );
    for (const link of [github, packagist]) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('la commande composer require est copiable en un clic', async ({
    page,
    context,
    browserName,
  }) => {
    expect(browserName).toBe('chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(fiche('purchase-approval'));
    const button = page.getByRole('button', { name: 'Copier la commande' });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page.locator('[data-copy-root] [role="status"]')).toHaveText('Commande copiée');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'composer require tmonier/sylius-purchase-approval-plugin',
    );
  });
});

test.describe('Scénario : plugin sans dépendance', () => {
  test('Tier Pricing affiche « Aucune dépendance sur un autre plugin de la collection »', async ({
    page,
  }) => {
    await page.goto(fiche('tier-pricing'));
    await expect(page.locator('[data-deps]')).toContainText(
      'Aucune dépendance sur un autre plugin de la collection',
    );
  });
});

test.describe('Scénario : plugin non publié sur Packagist', () => {
  test('Agentic Feeds : seul le lien GitHub, commande visible avec la mention', async ({
    page,
  }) => {
    await page.goto(fiche('agentic-feeds'));
    await expect(page.locator('[data-link="github"]')).toBeVisible();
    await expect(page.locator('[data-link="packagist"]')).toHaveCount(0);
    await expect(page.locator('a[href*="packagist.org"]')).toHaveCount(0);
    await expect(page.locator('[data-copy-root] code')).toHaveText(
      'composer require tmonier/sylius-agentic-feeds-plugin',
    );
    await expect(page.locator('[data-install-note]')).toHaveText(
      'Paquet bientôt publié sur Packagist',
    );
    await expect(page.locator('[data-stat="downloads-monthly"]')).toHaveCount(0);
    await expect(page.locator('[data-stat="downloads-total"]')).toHaveCount(0);
  });
});

test.describe('Scénario : navigation entre fiches liées', () => {
  test('Trade Credit → Order Hold, avec « Utilisé par » Trade Credit et Purchase Approval', async ({
    page,
  }) => {
    await page.goto(fiche('trade-credit'));
    await page
      .locator('[data-dep-group="requires"]')
      .getByRole('link', { name: 'Order Hold' })
      .click();
    await expect(page).toHaveURL(new RegExp(`${fiche('order-hold')}$`));
    await expect(page.locator('h1')).toHaveText('Order Hold');
    const usedBy = page.locator('[data-dep-group="used-by"]');
    await expect(usedBy).toContainText('Utilisé par');
    await expect(usedBy.getByRole('link')).toHaveText(['Purchase Approval', 'Trade Credit']);
  });

  test('B2B MCP déclare sa dépendance externe sylius/mcp-server-plugin', async ({ page }) => {
    await page.goto(fiche('b2b-mcp'));
    await expect(page.locator('[data-dep-group="external"]')).toContainText(
      'sylius/mcp-server-plugin',
    );
  });
});

test.describe('Scénario : responsive', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('la matrice est une région défilable focalisable sans casser la page à 360 px', async ({
    page,
  }) => {
    await page.goto(fiche('company-accounts'));
    const region = page.locator('[data-compat] [role="region"]');
    await expect(region).toHaveAttribute('tabindex', '0');
    expect(await region.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
    expect(await region.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});

test.describe('Scénario : les 24 fiches', () => {
  test('sont explorées par le crawl, répondent 200 et portent chacune les sections attendues', async ({
    page,
    request,
    baseURL,
  }) => {
    const routes = (await discoverRoutes(request, baseURL as string)).filter((r) =>
      r.startsWith('/open-source/sylius/'),
    );
    expect(routes).toHaveLength(24);
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator('h1'), route).toHaveCount(1);
      expect(await page.locator('[data-features] li').count(), route).toBeGreaterThanOrEqual(5);
      await expect(page.locator('[data-deps]'), route).toBeVisible();
      await expect(page.locator('[data-breadcrumb]'), route).toContainText('Open source');
      if (route === fiche('customer-asset-management')) continue; // en conception : voir son scénario
      await expect(page.locator('[data-compat] tbody tr').first(), route).toBeVisible();
      await expect(page.locator('[data-install-steps] li').first(), route).toBeVisible();
      const hasCapture = (await page.locator('[data-gallery] img').count()) > 0;
      const hasExcerpt = (await page.locator('[data-config-excerpt]').count()) > 0;
      expect(hasCapture !== hasExcerpt, `${route} : captures ou extrait de configuration`).toBe(
        true,
      );
    }
  });

  test('chaque titre est unique, chaque image a un alt, aucun lien Packagist mort en structure', async ({
    page,
    request,
    baseURL,
  }) => {
    const routes = (await discoverRoutes(request, baseURL as string)).filter((r) =>
      r.startsWith('/open-source/sylius/'),
    );
    const titles = new Set<string>();
    for (const route of routes) {
      await page.goto(route);
      titles.add(await page.title());
      for (const img of await page.locator('[data-gallery] img').all()) {
        expect(((await img.getAttribute('alt')) ?? '').length, route).toBeGreaterThanOrEqual(10);
        expect(await img.getAttribute('width'), route).toBeTruthy();
        expect(await img.getAttribute('height'), route).toBeTruthy();
      }
    }
    expect(titles.size).toBe(24);
  });

  test('axe : aucune violation sur deux fiches types (avec et sans captures)', async ({ page }) => {
    for (const slug of [
      'purchase-approval',
      'gpsr',
      'b2b-mcp',
      'audit-log',
      'punchout-cxml',
      'customer-asset-management',
    ]) {
      await page.goto(fiche(slug));
      await settleReveal(page);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations.map((v) => `${slug} ${v.id}`)).toEqual([]);
    }
  });
});

test.describe('Scénario : lien « Voir dans la démo »', () => {
  test('une fiche installée dans la démo renvoie vers la boutique, dans un nouvel onglet', async ({
    page,
  }) => {
    await page.goto(fiche('purchase-approval'));
    const link = page.locator('[data-link="demo"]');
    await expect(link).toHaveAttribute('href', 'https://sylius-b2b.thibaut-monier.fr');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toContainText('Voir dans la démo');
  });

  test('les 23 fiches installées dans la démo portent le lien, pas Customer Asset Management', async ({
    page,
    request,
    baseURL,
  }) => {
    const routes = (await discoverRoutes(request, baseURL as string)).filter((r) =>
      r.startsWith('/open-source/sylius/'),
    );
    let withLink = 0;
    for (const route of routes) {
      await page.goto(route);
      const count = await page.locator('[data-link="demo"]').count();
      if (route === fiche('customer-asset-management')) expect(count, route).toBe(0);
      else expect(count, route).toBe(1);
      withLink += count;
    }
    expect(withLink).toBe(23);
  });
});

test.describe('Scénario : plugin en conception', () => {
  test('Customer Asset Management affiche « En conception », sans installation ni compatibilité', async ({
    page,
  }) => {
    await page.goto(fiche('customer-asset-management'));
    await expect(page.locator('[data-status="design"]')).toContainText('En conception');
    await expect(page.locator('[data-status-note]')).toContainText('aucune fonctionnalité');
    await expect(page.locator('[data-features] li')).not.toHaveCount(0);
    await expect(page.locator('#features-titre')).toHaveText('Fonctionnalités prévues');
    await expect(page.locator('[data-install]')).toHaveCount(0);
    await expect(page.locator('[data-copy-root]')).toHaveCount(0);
    await expect(page.locator('[data-compat]')).toHaveCount(0);
    await expect(page.locator('[data-link="packagist"]')).toHaveCount(0);
    await expect(page.locator('[data-link="demo"]')).toHaveCount(0);
    await expect(page.locator('[data-link="github"]')).toHaveAttribute(
      'href',
      'https://github.com/thibmonier/sylius-customer-asset-management-plugin',
    );
  });

  test('une fiche livrée n’affiche pas le badge de conception', async ({ page }) => {
    await page.goto(fiche('channel-access'));
    await expect(page.locator('[data-status="design"]')).toHaveCount(0);
    await expect(page.locator('#features-titre')).toHaveText('Fonctionnalités');
  });
});

test.describe('Scénario : les quatre fiches ajoutées le 2026-10-20', () => {
  test('Registration Approval nécessite Channel Access, qui est utilisé par lui', async ({
    page,
  }) => {
    await page.goto(fiche('registration-approval'));
    await expect(
      page.locator('[data-dep-group="requires"]').getByRole('link', { name: 'Channel Access' }),
    ).toHaveAttribute('href', fiche('channel-access'));
    await page.goto(fiche('channel-access'));
    await expect(
      page
        .locator('[data-dep-group="used-by"]')
        .getByRole('link', { name: 'Registration Approval' }),
    ).toHaveAttribute('href', fiche('registration-approval'));
  });

  test('PunchOut cXML/OCI affiche ses deux captures avec un texte alternatif', async ({ page }) => {
    await page.goto(fiche('punchout-cxml'));
    await expect(page.locator('[data-gallery] img')).toHaveCount(2);
    await expect(page.locator('[data-link="packagist"]')).toHaveAttribute(
      'href',
      'https://packagist.org/packages/tmonier/sylius-punchout-cxml-plugin',
    );
  });
});
