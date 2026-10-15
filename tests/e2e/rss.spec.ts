import { expect, test, type Page } from '@playwright/test';
import { isArticleRoute } from '../../scripts/checks/lib/sample-routes.ts';
import { discoverRoutes } from './helpers/routes.ts';

const MAX_ITEMS = 20;

interface Parsed {
  error: boolean;
  items: { title: string; link: string; pubDate: string; description: string; category: string }[];
  language: string;
  bytes: number;
}

// Le document est analysé par le navigateur : un flux mal formé donne un `parsererror`.
async function readFeed(page: Page): Promise<Parsed> {
  await page.goto('/');
  return page.evaluate(async () => {
    const text = await (await fetch('/rss.xml')).text();
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const read = (item: Element, tag: string) => item.querySelector(tag)?.textContent?.trim() ?? '';
    return {
      error: doc.querySelector('parsererror') !== null,
      language: doc.querySelector('channel > language')?.textContent ?? '',
      bytes: new TextEncoder().encode(text).length,
      items: [...doc.querySelectorAll('item')].map((item) => ({
        title: read(item, 'title'),
        link: read(item, 'link'),
        pubDate: read(item, 'pubDate'),
        description: read(item, 'description'),
        category: read(item, 'category'),
      })),
    };
  });
}

test.describe('Scénario : flux RSS', () => {
  test('/rss.xml répond 200 en application/rss+xml UTF-8, revalidé, avec la CSP', async ({
    request,
  }) => {
    const response = await request.get('/rss.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^application\/rss\+xml;\s*charset=utf-8/i);
    expect(response.headers()['cache-control']).toContain('no-cache');
    expect(response.headers()['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('le document est bien formé, en français, de moins de 100 Ko', async ({ page }) => {
    const feed = await readFeed(page);
    expect(feed.error).toBe(false);
    expect(feed.language).toBe('fr');
    expect(feed.bytes).toBeLessThan(100 * 1024);
  });

  test('les articles les plus récents (20 au plus) sont complets et seuls publiés', async ({
    page,
    request,
    baseURL,
  }) => {
    const feed = await readFeed(page);
    const articles = (await discoverRoutes(request, baseURL as string)).filter(isArticleRoute);
    expect(feed.items).toHaveLength(Math.min(MAX_ITEMS, articles.length));
    for (const item of feed.items) {
      expect(item.title).not.toBe('');
      expect(item.link).toMatch(/^https?:\/\//);
      expect(Number.isNaN(Date.parse(item.pubDate))).toBe(false);
      expect(item.description).not.toBe('');
      expect(item.category).not.toBe('');
      // Seuls les articles publiés (donc liés depuis le blog) sont dans le flux.
      expect(articles).toContain(new URL(item.link).pathname);
    }
  });

  test('la découverte automatique est présente sur un échantillon de pages', async ({
    page,
    request,
    baseURL,
  }) => {
    const routes = await discoverRoutes(request, baseURL as string);
    const plugin = routes.find((route) => route.startsWith('/open-source/sylius/'));
    const article = routes.find(isArticleRoute);
    for (const route of ['/', plugin, article].filter((r): r is string => r !== undefined)) {
      await page.goto(route);
      const link = page.locator('link[rel="alternate"][type="application/rss+xml"]');
      await expect(link, route).toHaveAttribute('href', '/rss.xml');
      await expect(link, route).toHaveAttribute('title', /\S/);
    }
  });

  test('le pied de page propose « S’abonner (RSS) » avec une cible de 24 px au moins', async ({
    page,
  }) => {
    await page.goto('/');
    const link = page.locator('footer').getByRole('link', { name: /S.abonner \(RSS\)/ });
    await expect(link).toHaveAttribute('href', '/rss.xml');
    const box = await link.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  });

  test('aucune violation CSP en console', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (m) => {
      if (/content security policy/i.test(m.text())) violations.push(m.text());
    });
    await readFeed(page);
    await page.goto('/rss.xml');
    expect(violations).toEqual([]);
  });
});
