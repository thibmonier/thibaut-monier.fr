import { expect, test, type Page } from '@playwright/test';

// US-011 : catégories, tags, séries et pagination du blog. Strict : aucun test.skip.
const cards = (page: Page) => page.locator('[data-article-card]');
const dates = (page: Page) =>
  cards(page)
    .locator('time')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('datetime') ?? ''));
const titles = (page: Page) =>
  cards(page)
    .getByRole('heading', { level: 2 })
    .evaluateAll((nodes) => nodes.map((n) => n.textContent?.trim() ?? ''));

test.describe('Scénario : catégorie Méthode', () => {
  test('affiche seulement ses articles, du plus récent au plus ancien', async ({ page }) => {
    await page.goto('/blog/categorie/methode/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Méthode (5 articles)');
    await expect(cards(page)).toHaveCount(5);
    const list = await dates(page);
    expect(list).toEqual([...list].sort().reverse());
    for (const label of await cards(page).locator('[data-card-category]').allTextContents()) {
      expect(label.trim()).toBe('Méthode');
    }
  });

  test('toutes les catégories du blog ont une page non vide', async ({ page }) => {
    for (const [slug, count] of [
      ['business', 4],
      ['methode', 5],
      ['metiers', 7],
      ['outils', 5],
      ['pilotage', 7],
    ] as const) {
      await page.goto(`/blog/categorie/${slug}/`);
      await expect(cards(page), slug).toHaveCount(count);
    }
  });

  test('l’index liste les catégories avec leur nombre d’articles', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/blog/');
    const filter = page.getByRole('navigation', { name: 'Catégories' });
    await expect(filter.getByRole('link', { name: /Méthode/ })).toHaveAttribute(
      'href',
      '/blog/categorie/methode/',
    );
    await expect(filter.getByRole('link')).toHaveCount(5);
  });
});

test.describe('Scénario : pagination', () => {
  test('/blog/ affiche 12 articles et « Page 1 sur 3 »', async ({ page }) => {
    await page.goto('/blog/');
    await expect(cards(page)).toHaveCount(12);
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText(
      'Page 1 sur 3',
    );
  });

  test('les 3 pages totalisent 28 articles distincts, du plus récent au plus ancien', async ({
    page,
  }) => {
    const all: string[] = [];
    const allDates: string[] = [];
    for (const [url, expected] of [
      ['/blog/', 12],
      ['/blog/page/2/', 12],
      ['/blog/page/3/', 4],
    ] as const) {
      await page.goto(url);
      await expect(cards(page), url).toHaveCount(expected);
      all.push(...(await titles(page)));
      allDates.push(...(await dates(page)));
    }
    expect(new Set(all).size).toBe(28);
    expect(allDates).toEqual([...allDates].sort().reverse());
  });

  test('la page 2 expose précédent, suivant et la page courante', async ({ page }) => {
    await page.goto('/blog/page/2/');
    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    await expect(pagination).toContainText('Page 2 sur 3');
    await expect(pagination.getByRole('link', { name: /Précédent/ })).toHaveAttribute(
      'href',
      '/blog/',
    );
    await expect(pagination.getByRole('link', { name: /Suivant/ })).toHaveAttribute(
      'href',
      '/blog/page/3/',
    );
    await expect(pagination.locator('[aria-current="page"]')).toHaveText('2');
    await expect(pagination.locator('[aria-current="page"]')).toHaveCount(1);
  });

  test('la pagination fonctionne sans JavaScript', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/blog/');
    await page
      .getByRole('navigation', { name: 'Pagination' })
      .getByRole('link', { name: /Suivant/ })
      .click();
    await expect(page).toHaveURL(/\/blog\/page\/2\/$/);
    await expect(cards(page)).toHaveCount(12);
    await context.close();
  });

  for (const url of ['/blog/page/9/', '/blog/page/1/']) {
    test(`${url} : statut 404, message et retour au blog`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(404);
      await expect(page.getByText("Cette page n'existe pas")).toBeVisible();
      await expect(page.getByRole('link', { name: 'Retour au blog' })).toHaveAttribute(
        'href',
        '/blog/',
      );
    });
  }
});

test.describe('Scénario : série', () => {
  const SERIES = '/blog/reduire-la-facture-token-caveman-codegraph/'; // 2e de « La boîte à outils agentic » (4 articles)

  test('l’encart annonce « article 2 sur 4 » avec précédent et suivant', async ({ page }) => {
    await page.goto(SERIES);
    const encart = page.locator('[data-series-nav]');
    await expect(encart).toContainText('Série : La boîte à outils agentic (article 2 sur 4)');
    await expect(encart.getByRole('link', { name: /Précédent/ })).toHaveAttribute(
      'href',
      '/blog/outils-agentic-engineering-qui-meritent-un-essai/',
    );
    await expect(encart.getByRole('link', { name: /Suivant/ })).toHaveAttribute(
      'href',
      '/blog/donner-a-lire-a-un-agent-markitdown-et-mq/',
    );
    await expect(encart.getByRole('link', { name: 'Voir toute la série' })).toHaveAttribute(
      'href',
      '/blog/serie/la-boite-a-outils-agentic/',
    );
  });

  test('le premier article n’a pas de précédent, le dernier pas de suivant', async ({ page }) => {
    await page.goto('/blog/outils-agentic-engineering-qui-meritent-un-essai/');
    const first = page.locator('[data-series-nav]');
    await expect(first).toContainText('article 1 sur 4');
    await expect(first.getByRole('link', { name: /Précédent/ })).toHaveCount(0);
    await expect(first.getByRole('link', { name: /Suivant/ })).toHaveCount(1);
    await page.goto('/blog/sortir-du-rendu-generique-hallmark-designmd-modern-web-guidance/');
    const last = page.locator('[data-series-nav]');
    await expect(last).toContainText('article 4 sur 4');
    await expect(last.getByRole('link', { name: /Suivant/ })).toHaveCount(0);
    await expect(last.getByRole('link', { name: /Précédent/ })).toHaveCount(1);
  });

  test('un article hors série n’affiche aucun encart', async ({ page }) => {
    await page.goto('/blog/la-boite-a-outils-du-poweruser/');
    await expect(page.locator('[data-series-nav]')).toHaveCount(0);
  });

  test('la page de série liste ses articles dans l’ordre de lecture', async ({ page }) => {
    await page.goto('/blog/serie/la-boite-a-outils-agentic/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'La boîte à outils agentic (4 articles)',
    );
    await expect(cards(page)).toHaveCount(4);
    expect(await titles(page)).toEqual([
      "Les outils de l'agentic engineering qui méritent vraiment un essai",
      'Réduire la facture token : ce que Caveman et CodeGraph font vraiment',
      'Donner à lire à un agent : MarkItDown et mq',
      'Sortir du rendu générique : Hallmark, DESIGN.md et Modern Web Guidance',
    ]);
  });
});

test.describe('Scénario : tags', () => {
  test('un tag à plusieurs articles a sa page', async ({ page }) => {
    await page.goto('/blog/tag/sdd/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('SDD (5 articles)');
    await expect(cards(page)).toHaveCount(5);
  });

  test('les tags d’un article sont des liens, sauf celui qui n’a qu’un article', async ({
    page,
  }) => {
    await page.goto('/blog/recruter-et-evaluer-un-developpeur-a-l-ere-de-l-ia/');
    const tags = page.locator('[data-tag-list]');
    await expect(tags.getByRole('link', { name: 'Recrutement' })).toHaveAttribute(
      'href',
      '/blog/tag/recrutement/',
    );
    await expect(tags.getByRole('link', { name: 'Vibecoding' })).toHaveCount(0);
    await expect(tags).toContainText('Vibecoding');
  });

  test('un tag à un seul article n’a pas de page', async ({ page }) => {
    const response = await page.goto('/blog/tag/vibecoding/');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Scénario : filtre des catégories repliable sous 768 px', () => {
  test('replié sur mobile, ouvert au clavier', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/blog/');
    const filter = page.getByRole('navigation', { name: 'Catégories' });
    await expect(filter.getByRole('link', { name: /Méthode/ })).toBeHidden();
    await filter.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(filter.getByRole('link', { name: /Méthode/ })).toBeVisible();
  });

  test('affiché sans interaction à partir de 768 px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto('/blog/');
    await expect(
      page.getByRole('navigation', { name: 'Catégories' }).getByRole('link', { name: /Méthode/ }),
    ).toBeVisible();
  });

  test('cibles tactiles de 44 px au moins', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/blog/');
    const filter = page.getByRole('navigation', { name: 'Catégories' });
    await filter.locator('summary').click();
    const box = await filter.getByRole('link', { name: /Méthode/ }).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
