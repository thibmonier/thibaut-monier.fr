import { expect, test } from '@playwright/test';
import { site } from '../../src/config/site.ts';
import tokens from '../../src/data/tokens.json' with { type: 'json' };

const mainItems = site.nav.main.filter((item) => item.enabled);
const footerItems = site.nav.footer.filter((item) => item.enabled);

const hexToRgb = (hex: string) => {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};
const BG = { light: hexToRgb(tokens.color.bg.light), dark: hexToRgb(tokens.color.bg.dark) };

test.describe('Scénario : layout commun affiché sur chaque page', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("l'en-tête porte le nom du site et les liens activés de la navigation", async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: site.name })).toHaveAttribute('href', '/');
    const nav = header.getByRole('navigation', { name: 'Navigation principale' });
    for (const item of mainItems) {
      await expect(nav.getByRole('link', { name: item.label, exact: true })).toHaveAttribute(
        'href',
        item.href,
      );
    }
    await expect(nav.getByRole('link')).toHaveCount(mainItems.length);
  });

  test('la page courante porte aria-current="page" (une seule fois)', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navigation principale' });
    await expect(nav.getByRole('link', { name: 'Accueil', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    await page.goto('/contact/');
    await expect(nav.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.getByRole('link', { name: 'Accueil', exact: true })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('les repères banner, main et contentinfo sont uniques', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
  });

  test('le pied de page expose LinkedIn, GitHub et les liens légaux activés', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    for (const [name, href] of [
      ['LinkedIn', site.social.linkedin],
      ['GitHub', site.social.github],
    ] as const) {
      const link = footer.getByRole('link', { name });
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link).toHaveAttribute('rel', /noreferrer/);
    }
    for (const item of footerItems) {
      await expect(footer.getByRole('link', { name: item.label, exact: true })).toHaveAttribute(
        'href',
        item.href,
      );
    }
    // Pages du pied de page + le flux RSS (/rss.xml), seul lien interne qui n'est pas une page.
    await expect(footer.locator('a[href^="/"]')).toHaveCount(footerItems.length + 1);
    await expect(footer.locator('a[href="/rss.xml"]')).toHaveCount(1);
  });

  test('aucun lien désactivé (Labo) ne figure dans la page', async ({ page }) => {
    await page.goto('/');
    for (const item of [...site.nav.main, ...site.nav.footer].filter((i) => !i.enabled)) {
      await expect(page.locator(`a[href="${item.href}"]`)).toHaveCount(0);
    }
    await expect(page.locator('a[href="/labo/"]')).toHaveCount(0);
  });

  test("le lien d'évitement est le premier élément focalisable et mène au contenu", async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Aller au contenu' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('#contenu')).toBeFocused();
  });

  test('le focus clavier est visible', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement as Element);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });
    expect(outline.style).not.toBe('none');
    expect(Number.parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Scénario : thème sombre selon la préférence système, sans flash', () => {
  // Relevé de la couleur de fond dès que le document est analysé, avant le premier rendu de la page.
  const recordBackground = () =>
    document.addEventListener('DOMContentLoaded', () => {
      (window as unknown as Record<string, string>).__bg = getComputedStyle(
        document.documentElement,
      ).backgroundColor;
    });

  for (const scheme of ['light', 'dark'] as const) {
    test(`préférence système ${scheme} : fond du jeton ${scheme} dès le premier rendu`, async ({
      browser,
      baseURL,
    }) => {
      const context = await browser.newContext({ baseURL, colorScheme: scheme });
      const page = await context.newPage();
      await page.addInitScript(recordBackground);
      await page.goto('/');
      expect(await page.evaluate(() => (window as unknown as Record<string, string>).__bg)).toBe(
        BG[scheme],
      );
      await context.close();
    });
  }

  test('un choix mémorisé prime sur la préférence système, sans flash', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL, colorScheme: 'dark' });
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.addInitScript(recordBackground);
    await page.goto('/');
    expect(await page.evaluate(() => (window as unknown as Record<string, string>).__bg)).toBe(
      BG.light,
    );
    await context.close();
  });

  test('le script de thème est externe, bloquant, dans <head> et avant la feuille de style', async ({
    page,
  }) => {
    await page.goto('/');
    const script = page.locator('head script[src="/theme-init.js"]');
    await expect(script).toHaveCount(1);
    expect(await script.evaluate((el: HTMLScriptElement) => el.async || el.defer || el.type)).toBe(
      '',
    );
    const order = await page.evaluate(() => {
      const nodes = [...document.head.children];
      return {
        script: nodes.findIndex(
          (n) => n.tagName === 'SCRIPT' && n.getAttribute('src') === '/theme-init.js',
        ),
        css: nodes.findIndex((n) => n.tagName === 'LINK' && n.getAttribute('rel') === 'stylesheet'),
      };
    });
    expect(order.script).toBeGreaterThanOrEqual(0);
    expect(order.script).toBeLessThan(order.css);
  });

  test('le bouton bascule le thème, mémorise le choix et le restitue au rechargement', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      colorScheme: 'light',
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Thème sombre' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Thème sombre' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await context.close();
  });

  test('un localStorage inaccessible ne casse pas la page', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('denied', 'SecurityError');
        },
      });
    });
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    expect(errors).toEqual([]);
    await context.close();
  });
});

test.describe('Scénario : menu mobile accessible', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

  test('le menu est replié, puis ouvert par le bouton avec aria-expanded', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    const nav = page.getByRole('navigation', { name: 'Navigation principale' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link', { name: 'Accueil', exact: true })).toBeVisible();
  });

  test('Tab reste piégé dans le menu ouvert', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest('[data-menu-scope]'),
      );
      expect(inside).toBe(true);
    }
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(
        await page.evaluate(() => !!document.activeElement?.closest('[data-menu-scope]')),
      ).toBe(true);
    }
  });

  test('Échap referme le menu et rend le focus au bouton', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    await button.click();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('les cibles interactives font au moins 24 × 24 px', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    const targets = page.locator('header a, header button');
    const count = await targets.count();
    expect(count).toBeGreaterThan(2);
    for (let i = 0; i < count; i++) {
      const box = await targets.nth(i).boundingBox();
      if (!box) continue;
      expect(box.width, `largeur de la cible ${i}`).toBeGreaterThanOrEqual(24);
      expect(box.height, `hauteur de la cible ${i}`).toBeGreaterThanOrEqual(24);
    }
  });
});

test.describe('Scénario : JavaScript désactivé', () => {
  test.use({
    javaScriptEnabled: false,
    colorScheme: 'dark',
    viewport: { width: 375, height: 667 },
  });

  test('la navigation reste visible et utilisable, sans bouton Menu ni bouton de thème', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navigation principale' });
    for (const item of mainItems) {
      await expect(nav.getByRole('link', { name: item.label, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Thème sombre' })).toBeHidden();
  });

  test('le thème suit la préférence système', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    );
    expect(bg).toBe(BG.dark);
  });
});

test.describe('Scénario : mouvement réduit', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });

  test('animations et transitions sont neutralisées', async ({ page }) => {
    await page.goto('/');
    const durations = await page.evaluate(() =>
      [...document.querySelectorAll('body, body *')].flatMap((el) => {
        const style = getComputedStyle(el);
        return [style.transitionDuration, style.animationDuration];
      }),
    );
    expect(new Set(durations.flatMap((d) => d.split(', ')))).toEqual(new Set(['0s']));
  });

  test('le défilement est instantané', async ({ page }) => {
    await page.goto('/');
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
    ).toBe('auto');
  });
});

test.describe('Scénario : responsive sans défilement horizontal', () => {
  for (const width of [320, 360, 768, 1280, 1920]) {
    for (const route of ['/', '/contact/']) {
      test(`${route} à ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  }
});

test.describe('Scénario : métadonnées SEO minimales', () => {
  test('canonical absolue, Open Graph et langue', async ({ page }) => {
    await page.goto('/contact/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /^https:\/\/[^/]+\/contact\/$/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      /^https:\/\/[^/]+\/contact\/$/,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fr_FR');
    expect((await page.title()).length).toBeLessThanOrEqual(60);
  });

  test('la police principale est préchargée en WOFF2 auto-hébergé', async ({ page }) => {
    await page.goto('/');
    const preload = page.locator('link[rel="preload"][as="font"]');
    await expect(preload.first()).toHaveAttribute('type', 'font/woff2');
    await expect(preload.first()).toHaveAttribute('href', /^\/fonts\/.+\.woff2$/);
    await expect(preload.first()).toHaveAttribute('crossorigin', '');
  });
});
