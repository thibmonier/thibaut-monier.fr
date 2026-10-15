import { expect, test, type Page } from '@playwright/test';

// US-012 : recherche plein texte (Pagefind). L'index n'existe qu'après `astro build` : ces tests tournent sur
// `preview` (image de production), jamais sur `astro dev`. Strict : aucun test.skip.
const input = (page: Page) => page.getByRole('searchbox', { name: 'Rechercher dans le blog' });
const results = (page: Page) => page.locator('[data-search-results] li');

async function ready(page: Page): Promise<void> {
  await page.goto('/recherche/');
  await input(page).focus(); // première interaction : l'index est chargé ici, pas avant
  await expect(page.locator('[data-search]')).toHaveAttribute('data-index', 'ready');
}

test.describe('Scénario : rechercher un mot', () => {
  test('« tokens » renvoie titre, extrait surligné et catégorie en moins de 300 ms après la dernière frappe', async ({
    page,
  }) => {
    await ready(page);
    // Mesure dans la page (horloge unique) : de la dernière frappe à l'affichage des résultats.
    await page.evaluate(() => {
      const root = document.querySelector('[data-search]') as HTMLElement;
      const times = { lastInput: 0, done: 0 };
      (window as unknown as { __times: typeof times }).__times = times;
      document.querySelector('[data-search] input')?.addEventListener('input', () => {
        times.lastInput = performance.now();
      });
      new MutationObserver(() => {
        if (root.dataset.state === 'results') times.done = performance.now();
      }).observe(root, { attributes: true, attributeFilter: ['data-state'] });
    });
    await input(page).pressSequentially('tokens', { delay: 30 });
    await page.waitForFunction(() => {
      const times = (window as unknown as { __times: { lastInput: number; done: number } }).__times;
      return times.done > times.lastInput;
    });
    const elapsed = await page.evaluate(() => {
      const times = (window as unknown as { __times: { lastInput: number; done: number } }).__times;
      return times.done - times.lastInput;
    });
    expect(elapsed).toBeLessThan(300);
    const first = results(page).first();
    await expect(first.getByRole('link')).toHaveAttribute(
      'href',
      /^\/blog\/[^/]+\/#article-titre$/,
    );
    await expect(first.locator('mark').first()).toBeVisible();
    await expect(first.locator('[data-result-category]')).not.toBeEmpty();
    expect(await results(page).count()).toBeGreaterThan(1);
  });

  test('annonce le nombre de résultats dans une région aria-live', async ({ page }) => {
    await ready(page);
    await input(page).fill('tokens');
    const live = page.locator('[data-search-status]');
    await expect(live).toHaveAttribute('aria-live', 'polite');
    await expect(live).toHaveText(/\d+ résultats?/);
  });

  test('« methode » trouve un article qui contient « méthode »', async ({ page }) => {
    await ready(page);
    await input(page).fill('methode');
    await expect(results(page).first()).toBeVisible();
    await expect(results(page).first().locator('mark').first()).toBeVisible();
  });

  test('flèche bas puis Entrée ouvrent l’article et placent le focus sur son titre', async ({
    page,
  }) => {
    await ready(page);
    await input(page).fill('tokens');
    await expect(results(page).first()).toBeVisible();
    await input(page).press('ArrowDown');
    await expect(results(page).first().getByRole('link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/blog\/[^/]+\/(#article-titre)?$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  });

  test('flèche haut revient au champ de saisie', async ({ page }) => {
    await ready(page);
    await input(page).fill('tokens');
    await expect(results(page).first()).toBeVisible();
    await input(page).press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await expect(input(page)).toBeFocused();
  });
});

test.describe('Scénario : aucun résultat et indisponibilité', () => {
  test('« zzzzqq » : message exact et lien vers les catégories', async ({ page }) => {
    await ready(page);
    await input(page).fill('zzzzqq');
    const message = page.locator('[data-search-message]');
    await expect(message).toContainText(
      'Aucun résultat pour « zzzzqq ». Essayez un autre mot ou parcourez les catégories.',
    );
    await expect(message.getByRole('link', { name: 'catégories' })).toHaveAttribute(
      'href',
      '/blog/',
    );
    await expect(results(page)).toHaveCount(0);
  });

  test('index bloqué : message d’indisponibilité et lien vers le blog', async ({ page }) => {
    await page.route('**/pagefind/**', (route) => route.abort());
    await page.goto('/recherche/');
    await input(page).fill('tokens');
    const message = page.locator('[data-search-message]');
    await expect(message).toContainText('La recherche est momentanément indisponible.');
    await expect(message.getByRole('link', { name: 'Parcourir le blog' })).toHaveAttribute(
      'href',
      '/blog/',
    );
  });

  test('JavaScript désactivé : un message utile et le lien vers la liste du blog', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/recherche/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Recherche');
    await expect(page.getByText('La recherche nécessite JavaScript')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Parcourir le blog' })).toHaveAttribute(
      'href',
      '/blog/',
    );
    await context.close();
  });
});

test.describe('Scénario : page de recherche', () => {
  test('est en noindex, sans canonical, et liée depuis la navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'Recherche' })
      .click();
    await expect(page).toHaveURL(/\/recherche\/$/);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test('aucune requête vers /pagefind/ avant la première interaction', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/pagefind/')) requests.push(request.url());
    });
    await page.goto('/recherche/');
    await page.waitForLoadState('networkidle');
    expect(requests).toEqual([]);
    await input(page).focus();
    await expect(page.locator('[data-search]')).toHaveAttribute('data-index', 'ready');
    expect(requests.length).toBeGreaterThan(0);
  });

  test('aucun stockage local ni cookie', async ({ page, context }) => {
    await ready(page);
    await input(page).fill('tokens');
    await expect(results(page).first()).toBeVisible();
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
    expect(await context.cookies()).toEqual([]);
  });

  test('aucune violation CSP ni erreur de console, WebAssembly compris', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (
        /content security policy|refused to/i.test(message.text()) ||
        message.type() === 'error'
      ) {
        problems.push(message.text());
      }
    });
    page.on('pageerror', (error) => problems.push(error.message));
    await ready(page);
    await input(page).fill('tokens');
    await expect(results(page).first()).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('pagefind.js est servi comme JavaScript et revalidé (no-cache)', async ({ request }) => {
    const script = await request.get('/pagefind/pagefind.js');
    expect(script.status()).toBe(200);
    expect(script.headers()['content-type']).toMatch(/javascript/);
    expect(script.headers()['cache-control']).toContain('no-cache');
  });

  test('le module WebAssembly de l’index est servi et revalidé (no-cache)', async ({ request }) => {
    const entry = await request.get('/pagefind/pagefind-entry.json');
    expect(entry.status()).toBe(200);
    expect(entry.headers()['cache-control']).toContain('no-cache');
    const languages = Object.keys(
      ((await entry.json()) as { languages: Record<string, unknown> }).languages,
    );
    expect(languages.length).toBeGreaterThan(0);
    const wasm = await request.get(`/pagefind/wasm.${languages[0]}.pagefind`);
    expect(wasm.status()).toBe(200);
    expect(wasm.headers()['cache-control']).toContain('no-cache');
  });
});
