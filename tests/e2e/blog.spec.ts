import { expect, test, type Page } from '@playwright/test';

// US-009 : les articles migrés, leur lecture et l'index. Strict : aucun test.skip.
const REFERENCE = '/blog/la-spec-est-le-nouveau-code/'; // série, FAQ de 3 questions, catégorie Méthode
const WIDEST = '/blog/cycle-en-v-agile-sdd-comparaison-timelines/'; // tableaux et SVG
const WITH_CODE = '/blog/reduire-la-facture-token-caveman-codegraph/'; // blocs de code et FAQ
const WITH_SVG = '/blog/certifications-ia-signal-ou-bruit-au-recrutement/';

const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('Scénario : un article de référence', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('affiche titre, date, catégorie, image décrite et temps de lecture', async ({ page }) => {
    await page.goto(REFERENCE);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('La spec est le nouveau code');
    const published = page.locator('article time[datetime="2026-03-17"]').first();
    await expect(published).toBeVisible();
    await expect(published).toHaveText('17 mars 2026');
    await expect(
      page.locator('article').getByRole('link', { name: 'Méthode' }).first(),
    ).toBeVisible();
    await expect(page.getByText(/\d+ min de lecture/)).toBeVisible();
    const cover = page.locator('article img').first();
    await expect(cover).toBeVisible();
    expect(((await cover.getAttribute('alt')) ?? '').trim().length).toBeGreaterThan(10);
  });

  test('porte un fil d’Ariane visible, le titre de page et la note d’auteur', async ({ page }) => {
    await page.goto(REFERENCE);
    const crumbs = page.getByRole('navigation', { name: 'Fil d’Ariane' });
    await expect(crumbs.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog/');
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText('La spec est le nouveau code');
    await expect(page).toHaveTitle(/La spec est le nouveau code/);
    const note = page.locator('[data-author-note]');
    await expect(note).toContainText('Thibaut Monier');
    await expect(note.getByRole('link', { name: 'Parcours' })).toHaveAttribute(
      'href',
      '/parcours/',
    );
    await expect(note.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact/');
  });

  test('la largeur de lecture ne dépasse pas 75 caractères', async ({ page }) => {
    await page.goto(REFERENCE);
    const fits = await page.evaluate(() => {
      const body = document.querySelector('[data-article-body]') as HTMLElement;
      const probe = document.createElement('div');
      probe.style.width = '75ch';
      body.appendChild(probe);
      const limit = probe.getBoundingClientRect().width;
      probe.remove();
      return body.getBoundingClientRect().width <= limit + 1;
    });
    expect(fits).toBe(true);
  });

  test('aucun marquage défilant n’est nécessaire pour lire le texte courant', async ({ page }) => {
    await page.goto(REFERENCE);
    await expect(page.locator('[data-article-body] h2').first()).toBeVisible();
    await expect(page.locator('[data-article-body] h1')).toHaveCount(0);
  });
});

test.describe('Scénario : article avec FAQ', () => {
  test('affiche les 3 questions repliables, ouvertes et fermées au clavier', async ({ page }) => {
    await page.goto(REFERENCE);
    const faq = page.locator('[data-faq]');
    await expect(faq.getByRole('heading', { level: 2 })).toHaveText('Questions fréquentes');
    const questions = faq.locator('details');
    await expect(questions).toHaveCount(3);
    const first = questions.first();
    await expect(first).not.toHaveAttribute('open', '');
    await first.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('open', '');
    await expect(first.locator('p').first()).toBeVisible();
    await page.keyboard.press('Space');
    await expect(first).not.toHaveAttribute('open', '');
  });

  test('une question est un titre de niveau 3', async ({ page }) => {
    await page.goto(WITH_CODE);
    await expect(page.locator('[data-faq] summary h3')).toHaveCount(3);
  });

  test('un article sans FAQ n’affiche aucune section de questions', async ({ page }) => {
    await page.goto(WITH_SVG);
    await expect(page.locator('[data-faq]')).toHaveCount(0);
  });
});

test.describe('Scénario : l’index du blog', () => {
  test('liste les articles par date décroissante', async ({ page }) => {
    await page.goto('/blog/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog');
    const dates = await page
      .locator('[data-article-card] time')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('datetime') ?? ''));
    expect(dates.length).toBeGreaterThanOrEqual(12);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(dates[0]).toBe('2026-09-22');
  });

  test('chaque carte porte titre lié, extrait et catégorie', async ({ page }) => {
    await page.goto('/blog/');
    const card = page.locator('[data-article-card]').first();
    await expect(card.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(card.getByRole('link').first()).toHaveAttribute('href', /^\/blog\/[^/]+\/$/);
    await expect(card.locator('[data-card-excerpt]')).not.toBeEmpty();
    await expect(card.locator('[data-card-category]')).not.toBeEmpty();
  });
});

test.describe('Scénario : une adresse d’article inexistante', () => {
  test('renvoie une 404 avec le message du site', async ({ page }) => {
    const response = await page.goto('/blog/un-article-qui-n-existe-pas/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("Cette page n'existe pas");
  });
});

test.describe('Scénario : lecture sur mobile', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('aucun défilement horizontal sur l’article le plus large (tableaux et SVG)', async ({
    page,
  }) => {
    await page.goto(WIDEST);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await expect(page.locator('[data-article-body] svg').first()).toBeVisible();
  });

  test('les tableaux sont dans une région défilante atteignable au clavier', async ({ page }) => {
    await page.goto(WIDEST);
    const region = page.locator('[data-article-body] .table-scroll').first();
    await expect(region).toHaveAttribute('tabindex', '0');
    await expect(region).toHaveAttribute('role', 'region');
    await region.focus();
    await expect(region).toBeFocused();
  });

  test('les blocs de code sont focalisables et défilent sans élargir la page', async ({ page }) => {
    await page.goto(WITH_CODE);
    const block = page.locator('[data-article-body] pre').first();
    await expect(block).toHaveAttribute('tabindex', '0');
    await block.focus();
    await expect(block).toBeFocused();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});

test.describe('Scénario : politique de sécurité du contenu', () => {
  test('aucune violation CSP ni erreur de console sur les articles à SVG, code et tableaux', async ({
    page,
  }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (/content security policy/i.test(message.text()) || message.type() === 'error') {
        problems.push(`${page.url()} : ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => problems.push(`${page.url()} : ${error.message}`));
    for (const route of [REFERENCE, WIDEST, WITH_CODE, WITH_SVG]) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }
    expect(problems).toEqual([]);
  });

  test('aucun attribut style en ligne dans le corps des articles', async ({ page }) => {
    for (const route of [WIDEST, WITH_CODE, WITH_SVG]) {
      await page.goto(route);
      await expect(page.locator('[data-article-body] [style]'), route).toHaveCount(0);
    }
  });
});
