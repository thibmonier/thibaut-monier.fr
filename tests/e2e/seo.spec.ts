import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { isArticleRoute } from '../../scripts/checks/lib/sample-routes.ts';
import { discoverRoutes } from './helpers/routes.ts';
import { discoverSampledRoutes } from './helpers/sample.ts';

type JsonLd = Record<string, unknown>;

async function jsonLd(page: Page): Promise<JsonLd[]> {
  const texts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return texts.map((text) => JSON.parse(text) as JsonLd);
}
const typesOf = (blocks: JsonLd[]) => blocks.map((block) => block['@type']);
const isNoindex = (html: string) => /<meta[^>]+name="robots"[^>]+noindex/i.test(html);

// Les routes indexables sont découvertes par liens internes : une page non liée n'est pas contrôlée.
async function indexableRoutes(request: APIRequestContext, baseURL: string): Promise<string[]> {
  const routes = await discoverRoutes(request, baseURL);
  const kept: string[] = [];
  for (const route of routes) {
    const html = await (await request.get(route)).text();
    if (!isNoindex(html)) kept.push(route);
  }
  return kept;
}

test.describe('Scénario : données structurées par type de page', () => {
  test("l'accueil expose Person et un fil d'Ariane d'un seul élément", async ({ page }) => {
    await page.goto('/');
    const blocks = await jsonLd(page);
    expect(typesOf(blocks)).toEqual(expect.arrayContaining(['Person', 'BreadcrumbList']));
    const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList');
    expect(crumbs?.['itemListElement']).toHaveLength(1);
    const person = blocks.find((b) => b['@type'] === 'Person') as JsonLd;
    expect(Object.keys(person).sort()).toEqual(
      ['@context', '@type', 'address', 'jobTitle', 'name', 'sameAs', 'url'].sort(),
    );
  });

  test('le profil expose ProfilePage avec Person en entité principale', async ({ page }) => {
    await page.goto('/parcours/');
    const blocks = await jsonLd(page);
    const profile = blocks.find((b) => b['@type'] === 'ProfilePage');
    expect(profile).toBeDefined();
    expect((profile?.['mainEntity'] as JsonLd)['@type']).toBe('Person');
  });

  test('une fiche plugin expose SoftwareSourceCode', async ({ page, request, baseURL }) => {
    const routes = await discoverRoutes(request, baseURL as string);
    const plugin = routes.find((route) => route.startsWith('/open-source/sylius/'));
    expect(plugin, 'au moins une fiche plugin').toBeDefined();
    await page.goto(plugin as string);
    const blocks = await jsonLd(page);
    expect(typesOf(blocks)).toContain('SoftwareSourceCode');
    const code = blocks.find((b) => b['@type'] === 'SoftwareSourceCode') as JsonLd;
    expect(code['programmingLanguage']).toBe('PHP');
    expect(String(code['codeRepository'])).toMatch(/^https:\/\/github\.com\//);
  });

  test('le catalogue expose une ItemList des plugins', async ({ page }) => {
    await page.goto('/open-source/');
    const list = (await jsonLd(page)).find((b) => b['@type'] === 'ItemList');
    expect(list).toBeDefined();
    expect(Number(list?.['numberOfItems'])).toBeGreaterThanOrEqual(20);
  });

  test('un article expose BlogPosting, et sa FAQPage correspond à une FAQ visible', async ({
    page,
    request,
    baseURL,
  }) => {
    const articles = (await discoverRoutes(request, baseURL as string))
      .filter(isArticleRoute)
      .slice(0, 3);
    test.setTimeout(30_000 + articles.length * 5_000);
    for (const route of articles) {
      await page.goto(route);
      const blocks = await jsonLd(page);
      expect(typesOf(blocks), route).toContain('BlogPosting');
      // Une FAQPage n'existe que si sa FAQ est visible sur la page.
      const faq = blocks.find((b) => b['@type'] === 'FAQPage');
      for (const question of (faq?.['mainEntity'] as { name: string }[] | undefined) ?? []) {
        await expect(page.getByText(question.name).first(), route).toBeVisible();
      }
    }
  });

  test("toutes les pages d'un échantillon ont un BreadcrumbList valide, léger et sans violation CSP", async ({
    page,
    request,
    baseURL,
  }) => {
    const routes = await discoverSampledRoutes(request, baseURL as string);
    test.setTimeout(30_000 + routes.length * 3_000);
    const violations: string[] = [];
    page.on('console', (m) => {
      if (/content security policy/i.test(m.text())) violations.push(m.text());
    });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      const html = await page.content();
      if (isNoindex(html)) continue;
      const blocks = await jsonLd(page);
      const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList');
      expect(crumbs, `BreadcrumbList sur ${route}`).toBeDefined();
      for (const item of crumbs?.['itemListElement'] as JsonLd[]) {
        expect(String(item['item']), route).toMatch(/^https?:\/\//);
      }
      const weight = (
        await page.locator('script[type="application/ld+json"]').allTextContents()
      ).join('').length;
      expect(weight, `poids JSON-LD de ${route}`).toBeLessThan(5 * 1024);
    }
    expect(violations).toEqual([]);
  });

  test('aucun hreflang tant que l’anglais n’est pas activé', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('link[hreflang]').count()).toBe(0);
  });
});

test.describe('Scénario : sitemap, robots.txt et llms.txt', () => {
  test('le sitemap liste exactement les pages indexables, en URL absolues', async ({
    request,
    baseURL,
  }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.status()).toBe(200);
    const sitemapUrls = [...(await index.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(sitemapUrls.length).toBeGreaterThan(0);

    const paths: string[] = [];
    for (const url of sitemapUrls as string[]) {
      expect(url).toMatch(/^https?:\/\//);
      const body = await (await request.get(new URL(url).pathname)).text();
      for (const loc of body.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        expect(loc[1]).toMatch(/^https?:\/\//);
        paths.push(new URL(loc[1] as string).pathname);
      }
      expect(body).toMatch(/<lastmod>/);
    }
    for (const excluded of ['/contact/merci/', '/recherche/', '/404/']) {
      expect(paths).not.toContain(excluded);
    }
    const expected = await indexableRoutes(request, baseURL as string);
    expect([...paths].sort()).toEqual(expected);
  });

  test('robots.txt autorise tout et référence le sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    const body = await response.text();
    expect(body).toMatch(/^User-agent: \*/m);
    expect(body).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap-index\.xml$/m);
  });

  test('llms.txt : 200, texte brut UTF-8 et au moins 10 liens', async ({ request }) => {
    const response = await request.get('/llms.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/text\/plain;\s*charset=utf-8/i);
    expect(response.headers()['content-security-policy']).toContain("default-src 'none'");
    const body = await response.text();
    expect(body).toMatch(/^# /m);
    expect(body.match(/^- \[[^\]]+\]\(https?:\/\/[^)]+\)/gm)?.length ?? 0).toBeGreaterThanOrEqual(
      10,
    );
  });

  test('le sitemap et robots.txt sont servis avec le bon type et la CSP', async ({ request }) => {
    const sitemap = await request.get('/sitemap-index.xml');
    expect(sitemap.headers()['content-type']).toContain('application/xml');
    expect(sitemap.headers()['content-security-policy']).toContain("default-src 'none'");
    expect(sitemap.headers()['cache-control']).toContain('no-cache');
    const robots = await request.get('/robots.txt');
    expect(robots.headers()['content-type']).toMatch(/charset=utf-8/i);
    expect(robots.headers()['content-security-policy']).toContain("default-src 'none'");
  });
});
