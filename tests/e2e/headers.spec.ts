import { expect, test, type APIRequestContext } from '@playwright/test';

test.describe("Scénario : 'wasm-unsafe-eval' limité à la recherche", () => {
  const cspOf = async (request: APIRequestContext, path: string) =>
    (await request.get(path)).headers()['content-security-policy'] ?? '';

  test('absent des pages courantes, de l’index et du flux', async ({ request }) => {
    for (const path of ['/', '/blog/', '/rss.xml', '/inconnu-pour-la-csp/']) {
      expect(await cspOf(request, path), path).not.toContain('wasm-unsafe-eval');
    }
  });

  test('présent sur /recherche/ et sur les fichiers Pagefind', async ({ request }) => {
    for (const path of ['/recherche/', '/pagefind/pagefind.js', '/pagefind/pagefind-worker.js']) {
      expect(await cspOf(request, path), path).toMatch(/script-src[^;]*'wasm-unsafe-eval'/);
    }
  });
});

test.describe('Scénario : En-têtes de sécurité présents', () => {
  test("l'accueil porte tous les en-têtes de sécurité", async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    const h = response.headers();

    const csp = h['content-security-policy'] ?? '';
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toContain("'unsafe-eval'");
    // Umami (ADR-0011) : domaines exacts, aucun joker.
    expect(csp).toMatch(/script-src[^;]*https:\/\/cloud\.umami\.is(?=[\s;]|$)/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/gateway\.umami\.is(?=[\s;]|$)/);
    expect(csp).not.toMatch(/\*\.umami|api-gateway\.umami\.dev/);

    const hsts = h['strict-transport-security'] ?? '';
    expect(Number(/max-age=(\d+)/.exec(hsts)?.[1])).toBeGreaterThanOrEqual(31536000);

    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy']).toContain('camera=()');
    expect(h['cross-origin-opener-policy']).toBe('same-origin');
    expect(h['cross-origin-resource-policy']).toBe('same-origin');
    // ADR-0009 : COEP volontairement absent
    expect(h['cross-origin-embedder-policy']).toBeUndefined();
    // Aucune version de serveur exposée
    expect(h['server'] ?? '').not.toMatch(/\d/);
    expect(h['set-cookie']).toBeUndefined();
  });

  test('les en-têtes sont aussi présents sur le 404', async ({ request }) => {
    const response = await request.get('/page-inexistante');
    expect(response.status()).toBe(404);
    expect(response.headers()['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });
});

test.describe('Scénario : cache', () => {
  test('le HTML est revalidé, les assets hachés sont immuables', async ({ request, page }) => {
    const html = await request.get('/');
    expect(html.headers()['cache-control']).toContain('no-cache');

    await page.goto('/');
    const href = await page.locator('link[rel="stylesheet"]').first().getAttribute('href');
    expect(href).toMatch(/^\/_astro\//);
    const asset = await request.get(href as string);
    expect(asset.status()).toBe(200);
    expect(asset.headers()['cache-control']).toContain('immutable');
    expect(asset.headers()['content-security-policy']).toContain("default-src 'none'");
  });
});

test.describe('Scénario : surface exposée réduite', () => {
  test('POST renvoie 405', async ({ request }) => {
    const response = await request.post('/', { data: 'x' });
    expect(response.status()).toBe(405);
  });

  for (const path of ['/.git/config', '/.env', '/package.json.bak', '/src/pages/index.ts']) {
    test(`${path} renvoie 404`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(404);
    });
  }
});

test.describe('Scénario : Redirection HTTP vers HTTPS', () => {
  test('une requête X-Forwarded-Proto: http reçoit un 301 vers https', async ({ request }) => {
    const response = await request.get('/contact/', {
      headers: { 'X-Forwarded-Proto': 'http', Host: 'thibaut-monier.fr' },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe('https://thibaut-monier.fr/contact/');
  });

  test('une requête déjà en https (X-Forwarded-Proto: https) est servie', async ({ request }) => {
    const response = await request.get('/', { headers: { 'X-Forwarded-Proto': 'https' } });
    expect(response.status()).toBe(200);
  });
});

test.describe('Scénario : aucun script ni style inline (CSP stricte)', () => {
  test("l'accueil n'a ni <script> inline, ni attribut on*, ni <style>", async ({ request }) => {
    const body = await (await request.get('/')).text();
    // Les blocs JSON-LD sont des données (type application/ld+json), pas du code exécutable.
    expect(body).not.toMatch(/<script(?![^>]*\ssrc=)(?![^>]*type="application\/ld\+json")[^>]*>/i);
    expect(body).not.toMatch(/\son\w+\s*=/i);
    expect(body).not.toMatch(/<style[\s>]/i);
  });

  test('aucune violation CSP dans la console', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (m) => {
      if (/content security policy/i.test(m.text())) violations.push(m.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(violations).toEqual([]);
  });
});
