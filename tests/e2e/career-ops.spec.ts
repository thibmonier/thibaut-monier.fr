import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const PATH = '/open-source/career-ops/';
const PRS = [3496, 3808, 3866];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const MAX_WORDS = 900;

async function visibleBottom(page: Page, selector: string): Promise<number> {
  return page.locator(selector).evaluate((el) => el.getBoundingClientRect().bottom);
}

test.describe('Scénario : étude de cas complète', () => {
  test('résumé de 3 lignes (projet, rôle, résultat) visible sans défilement', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator('h1')).toHaveCount(1);
    const rows = page.locator('[data-project-summary] > [data-summary-row]');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toHaveAttribute('data-summary-row', 'project');
    await expect(rows.nth(1)).toHaveAttribute('data-summary-row', 'role');
    await expect(rows.nth(2)).toHaveAttribute('data-summary-row', 'result');
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const bottom = await visibleBottom(page, '[data-summary-row="result"]');
    expect(bottom).toBeLessThanOrEqual(viewport?.height ?? 0);
  });

  test('trois contributions, quatre blocs chacune, liens vers les PR', async ({ page }) => {
    await page.goto(PATH);
    const cards = page.locator('[data-contribution]');
    await expect(cards).toHaveCount(PRS.length);
    for (const [index, number] of PRS.entries()) {
      const card = cards.nth(index);
      await expect(card).toHaveAttribute('data-contribution', String(number));
      for (const block of ['problem', 'fix', 'tests', 'link']) {
        await expect(card.locator(`[data-block="${block}"]`)).toBeVisible();
        await expect(card.locator(`[data-block="${block}"] dd`)).not.toBeEmpty();
      }
      await expect(card.locator('[data-block="link"] a')).toHaveAttribute(
        'href',
        `https://github.com/career-ops-hq/career-ops/pull/${number}`,
      );
    }
  });

  test('le chiffre « 128 URL et 61 archétypes perdus sur 224 rapports » figure dans le cas n°2', async ({
    page,
  }) => {
    await page.goto(PATH);
    const second = page.locator('[data-contribution="3808"]');
    await expect(second).toContainText('128 URL et 61 archétypes perdus sur 224 rapports');
    await expect(page.locator('[data-contribution="3496"]')).not.toContainText('224 rapports');
  });

  test('la page se lit en moins de 4 minutes : 900 mots au plus hors encadrés techniques', async ({
    page,
  }) => {
    await page.goto(PATH);
    const words = await page.locator('main').evaluate((main) => {
      const clone = main.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('details, nav, [data-back], [data-repo]').forEach((n) => n.remove());
      return (clone.innerText.match(/[\p{L}\p{N}]+/gu) ?? []).length;
    });
    expect(words).toBeLessThanOrEqual(MAX_WORDS);
    expect(words).toBeGreaterThan(150);
  });

  test('title, description et canonical propres à la page, fil d’Ariane visible', async ({
    page,
  }) => {
    await page.goto(PATH);
    const title = await page.title();
    expect(title).toContain('career-ops');
    expect(title.length).toBeLessThanOrEqual(60);
    const description =
      (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(description.length).toBeGreaterThan(50);
    expect(description.length).toBeLessThanOrEqual(160);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${PATH}$`),
    );
    const crumbs = page.locator('nav[aria-label="Fil d’Ariane"]');
    await expect(crumbs).toBeVisible();
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText('career-ops');
  });

  test('liens sortants sécurisés et aucune requête vers un tiers', async ({ page, baseURL }) => {
    const origin = new URL(baseURL as string).origin;
    const foreign: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith(origin) && !request.url().startsWith('data:'))
        foreign.push(request.url());
    });
    await page.goto(PATH);
    await page.waitForLoadState('networkidle');
    expect(foreign).toEqual([]);
    const hrefs = await page
      .locator('main a[href^="http"]')
      .evaluateAll((links) =>
        links.map((a) => ({ href: a.getAttribute('href'), rel: a.getAttribute('rel') })),
      );
    expect(hrefs.length).toBeGreaterThanOrEqual(PRS.length + 1);
    for (const link of hrefs) expect(link.rel).toBe('noopener noreferrer');
  });
});

test.describe('Scénario : lecture non technique', () => {
  test('les encadrés techniques sont repliés et aucun extrait de code n’est visible', async ({
    page,
  }) => {
    await page.goto(PATH);
    const boxes = page.locator('details[data-technical]');
    await expect(boxes).toHaveCount(PRS.length);
    for (const box of await boxes.all()) {
      expect(await box.evaluate((el: HTMLDetailsElement) => el.open)).toBe(false);
    }
    await expect(page.locator('main code:visible')).toHaveCount(0);
    await expect(page.locator('main pre:visible')).toHaveCount(0);
  });

  for (const key of ['Enter', 'Space'] as const) {
    test(`un encadré se déplie au clavier (${key}) et aria-expanded suit`, async ({ page }) => {
      await page.goto(PATH);
      const box = page.locator('details[data-technical]').first();
      const summary = box.locator('> summary');
      await expect(summary).toHaveAttribute('aria-expanded', 'false');
      await summary.focus();
      await page.keyboard.press(key);
      await expect(summary).toHaveAttribute('aria-expanded', 'true');
      await expect(box.locator('code').first()).toBeVisible();
      await page.keyboard.press(key);
      await expect(summary).toHaveAttribute('aria-expanded', 'false');
    });
  }

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('le dépliage natif fonctionne', async ({ page }) => {
      await page.goto(PATH);
      const box = page.locator('details[data-technical]').first();
      await box.locator('> summary').click();
      await expect(box.locator('code').first()).toBeVisible();
    });
  });
});

test.describe('Scénario : accès depuis la page profil', () => {
  test('la mention « Contributeur career-ops » de /parcours/ ouvre l’étude de cas', async ({
    page,
  }) => {
    await page.goto('/parcours/');
    await page.getByRole('link', { name: 'Contributeur career-ops' }).click();
    await expect(page).toHaveURL(/\/open-source\/career-ops\/$/);
    await expect(page.locator('main a[data-back]')).toHaveText(/Retour au profil/);
  });

  test('« Retour au profil » est visible en tête de page, avant le titre, et ramène au parcours', async ({
    page,
  }) => {
    await page.goto(PATH);
    const back = page.locator('main a[data-back]');
    await expect(back).toHaveText(/Retour au profil/);
    await expect(back).toHaveAttribute('href', '/parcours/');
    const backTop = await back.evaluate((el) => el.getBoundingClientRect().top);
    const titleTop = await page.locator('h1').evaluate((el) => el.getBoundingClientRect().top);
    expect(backTop).toBeLessThan(titleTop);
    expect(await visibleBottom(page, 'main a[data-back]')).toBeLessThanOrEqual(
      page.viewportSize()?.height ?? 0,
    );
    await back.click();
    await expect(page).toHaveURL(/\/parcours\/$/);
  });
});

test.describe('Scénario : accessibilité, responsive et impression', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe : aucune violation serious ou critical (${colorScheme})`, async ({
      browser,
      baseURL,
    }) => {
      const context = await browser.newContext({ baseURL, colorScheme });
      const page = await context.newPage();
      await page.goto(PATH);
      await page.locator('details[data-technical]').first().locator('> summary').click();
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const blocking = violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
      expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      await context.close();
    });
  }

  test('structure de titres : un h1, des h2, des h3 et rien de plus profond', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h2').first()).toBeVisible();
    await expect(page.locator('main h3')).toHaveCount(PRS.length);
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

  test('impression : en-tête et pied masqués, encadrés dépliés, page lisible', async ({ page }) => {
    await page.goto(PATH);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('header')).toBeHidden();
    await expect(page.locator('footer')).toBeHidden();
    await expect(page.locator('details[data-technical] code').first()).toBeVisible();
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
