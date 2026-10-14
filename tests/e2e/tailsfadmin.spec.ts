import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const PATH = '/open-source/tailsfadmin/';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const COMMAND = 'composer require tailsfadmin/tailsfadmin-bundle';

// Version lue à la rédaction : la source de vérité est le frontmatter du contenu, pas une copie dans le test.
const frontmatter = readFileSync('src/content/projects/fr/tailsfadmin.md', 'utf8');
const VERSION = /^version: (\S+)$/m.exec(frontmatter)?.[1] ?? '';

test.describe('Scénario : page du bundle', () => {
  test('nom, version et licence visibles sans défilement', async ({ page }) => {
    await page.goto(PATH);
    expect(VERSION).toMatch(/^v\d+\.\d+\.\d+$/);
    await expect(page.locator('h1')).toContainText('tailsfadmin');
    await expect(page.locator('[data-fact="version"]')).toHaveText(`Version ${VERSION}`);
    await expect(page.locator('[data-fact="license"]')).toHaveText('Licence MIT');
    const height = page.viewportSize()?.height ?? 0;
    for (const selector of ['h1', '[data-fact="version"]', '[data-fact="license"]']) {
      const bottom = await page
        .locator(selector)
        .evaluate((el) => el.getBoundingClientRect().bottom);
      expect(bottom, selector).toBeLessThanOrEqual(height);
    }
  });

  test('la commande composer require est affichée et copiable', async ({
    page,
    context,
    browserName,
  }) => {
    await page.goto(PATH);
    const command = page.locator('[data-install-command] code');
    await expect(command).toHaveText(COMMAND);
    const copy = page.getByRole('button', { name: 'Copier la commande' });
    await expect(copy).toBeVisible();
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }
    await copy.click();
    await expect(page.locator('[data-install-command] [role="status"]')).toHaveText(
      'Commande copiée',
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(COMMAND);
  });

  test('installation en 4 étapes qui renvoie au README', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator('[data-install-steps] > li')).toHaveCount(4);
    await expect(
      page.locator('main').getByRole('link', { name: 'README du dépôt' }),
    ).toHaveAttribute('href', 'https://github.com/thibmonier/tailsfadmin#readme');
  });

  test('liens GitHub, Packagist et README en un clic, sortants sécurisés', async ({ page }) => {
    await page.goto(PATH);
    const expected = {
      repo: 'https://github.com/thibmonier/tailsfadmin',
      packagist: 'https://packagist.org/packages/tailsfadmin/tailsfadmin-bundle',
      readme: 'https://github.com/thibmonier/tailsfadmin#readme',
    };
    for (const [key, href] of Object.entries(expected)) {
      const link = page.locator(`[data-project-links] a[data-link="${key}"]`);
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(link).toBeVisible();
    }
  });

  test('title, description et canonical propres à la page', async ({ page }) => {
    await page.goto(PATH);
    const title = await page.title();
    expect(title).toContain('tailsfadmin');
    expect(title.length).toBeLessThanOrEqual(60);
    const description =
      (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(description.length).toBeGreaterThan(50);
    expect(description.length).toBeLessThanOrEqual(160);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${PATH}$`),
    );
  });
});

test.describe('Scénario : métriques', () => {
  test('affichées avec la mention « Données au {date} », sans requête tierce', async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL as string).origin;
    const foreign: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith(origin) && !request.url().startsWith('data:'))
        foreign.push(request.url());
    });
    await page.goto(PATH);
    await page.waitForLoadState('networkidle');
    const stats = page.locator('[data-live-stats]');
    await expect(stats).toBeVisible();
    await expect(stats.locator('[data-stats-date]')).toHaveText(/^Données au \d{4}-\d{2}-\d{2}$/);
    await expect(stats.locator('[data-stat="stars"]')).toBeVisible();
    await expect(stats.locator('[data-stat="version"] dd')).not.toBeEmpty();
    expect(foreign).toEqual([]);
  });
});

test.describe('Scénario : version et date de release cohérentes', () => {
  test('la date de release n’est affichée que pour la version affichée', async ({ page }) => {
    const entry = JSON.parse(readFileSync('src/data/oss-metrics.json', 'utf8')).entries[
      'thibmonier/tailsfadmin'
    ] as {
      github: { latestRelease: { tag: string } | null };
      packagist: { latestVersion: string };
    };
    await page.goto(PATH);
    const version = await page.locator('[data-live-stats] [data-stat="version"] dd').innerText();
    expect(version.replace(/^v/, '')).toBe(entry.packagist.latestVersion.replace(/^v/, ''));
    const sameTag = entry.github.latestRelease?.tag.replace(/^v/, '') === version.replace(/^v/, '');
    await expect(page.locator('[data-live-stats] [data-stat="release"]')).toHaveCount(
      sameTag ? 1 : 0,
    );
  });
});

test.describe('Scénario : visiteur non technique', () => {
  test('l’encadré « En bref » de 2 phrases précède l’installation', async ({ page }) => {
    await page.goto(PATH);
    const brief = page.locator('aside[data-in-brief]');
    await expect(brief.locator('h2')).toHaveText('En bref');
    const sentences = ((await brief.locator('p').innerText()).match(/[.!?](?=\s|$)/g) ?? []).length;
    expect(sentences).toBe(2);
    const briefTop = await brief.evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const stepsTop = await page
      .locator('[data-install-steps]')
      .evaluate((el) => el.getBoundingClientRect().top + scrollY);
    expect(briefTop).toBeLessThan(stepsTop);
  });
});

test.describe('Scénario : sans capture ni visuel provisoire', () => {
  test('aucune image dans la page (capture non fournie)', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator('main img')).toHaveCount(0);
  });

  test('la page reste cohérente sans JavaScript : le bouton de copie reste masqué, la commande lisible', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(PATH);
    await expect(page.locator('[data-install-command] code')).toHaveText(COMMAND);
    await expect(page.getByRole('button', { name: 'Copier la commande' })).toBeHidden();
    await context.close();
  });
});

test.describe('Scénario : accessibilité et responsive', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe : aucune violation serious ou critical (${colorScheme})`, async ({
      browser,
      baseURL,
    }) => {
      const context = await browser.newContext({ baseURL, colorScheme });
      const page = await context.newPage();
      await page.goto(PATH);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const blocking = violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
      expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      await context.close();
    });
  }

  test('structure de titres : un h1, des h2, des h3 et rien de plus profond', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h4, main h5, main h6')).toHaveCount(0);
  });

  test('aucun défilement horizontal à 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(PATH);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
