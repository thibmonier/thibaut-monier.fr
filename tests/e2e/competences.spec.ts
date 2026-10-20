import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { settleReveal } from './helpers/reveal.ts';

// US-006 : scénarios Gherkin de /competences/. Aucun décompte en dur : tout est lu dans achievements.yaml.
interface Achievement {
  id: string;
  title: string;
  domains: string[];
  clients?: string[];
}
const achievements = parse(
  readFileSync(join(process.cwd(), 'src/data/cv/achievements.yaml'), 'utf8'),
) as Achievement[];

const LABELS: Record<string, string> = {
  delivery: 'Delivery',
  architecture: 'Architecture',
  'e-commerce': 'E-commerce',
  'donnees-migrations': 'Données et migrations',
  'ia-appliquee': 'IA appliquée',
};
const total = achievements.length;
const inDomain = (domain: string) => achievements.filter((a) => a.domains.includes(domain)).length;
const plural = (n: number) => `${n} réalisation${n > 1 ? 's' : ''}`;

const cards = (page: Page) => page.locator('li[data-achievement]');
const visibleCards = (page: Page) => page.locator('li[data-achievement]:not([hidden])');
const filterButton = (page: Page, name: string) =>
  page
    .getByRole('group', { name: 'Filtrer par domaine' })
    .getByRole('button', { name, exact: true });

test.describe('Scénario : page complète', () => {
  test('affiche toutes les réalisations, un compteur exact et « Référence confidentielle »', async ({
    page,
  }) => {
    await page.goto('/competences/');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(total).toBeGreaterThanOrEqual(10);
    expect(total).toBeLessThanOrEqual(15);
    await expect(cards(page)).toHaveCount(total);
    await expect(visibleCards(page)).toHaveCount(total);
    await expect(page.locator('[data-count]')).toHaveText(plural(total));
    for (const card of await cards(page).all()) {
      await expect(card.locator('[data-clients]')).toHaveText(/Référence confidentielle/);
      await expect(card.locator('[data-year]')).toHaveText(/^\d{4}$/);
      expect(await card.locator('[data-domain-tag]').count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('le compteur est annoncé via une région aria-live polie', async ({ page }) => {
    await page.goto('/competences/');
    const region = page.locator('[data-status]');
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(region.locator('[data-count]')).toBeVisible();
  });

  test('titre, description et lien vers le parcours', async ({ page }) => {
    await page.goto('/competences/');
    expect(await page.title()).toMatch(/Compétences/);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    const description =
      (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(description.length).toBeGreaterThan(50);
    expect(description.length).toBeLessThanOrEqual(160);
    await expect(page.locator('main a[href="/parcours/"]').first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/competences\/$/);
  });

  test('le lien « Compétences » de la navigation est actif', async ({ page }) => {
    await page.goto('/competences/');
    await expect(page.locator('header a[href="/competences/"]').first()).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('aucun nom de client ni donnée personnelle dans la page', async ({ page }) => {
    await page.goto('/competences/');
    const text = (await page.locator('main').textContent()) ?? '';
    for (const client of [
      'Gémo',
      'Gemo',
      'Pileje',
      'Lescuyer',
      'Brittany',
      'Christian Dior',
      'Manitou',
    ]) {
      expect(text).not.toContain(client);
    }
    expect(text).not.toMatch(/\b0[1-9]([ .]?\d{2}){4}\b/);
    expect(text).not.toMatch(/\b\d{2}\s?ans\b(?!\s+d['’]\s?(expérience|ancienneté))/i);
  });
});

test.describe('Scénario nominal : filtre par domaine', () => {
  test('« E-commerce » ne garde que les réalisations du domaine, avec le compteur exact', async ({
    page,
  }) => {
    await page.goto('/competences/');
    await filterButton(page, 'E-commerce').click();
    const expected = inDomain('e-commerce');
    expect(expected).toBeGreaterThan(0);
    await expect(visibleCards(page)).toHaveCount(expected);
    await expect(page.locator('[data-count]')).toHaveText(plural(expected));
    for (const card of await visibleCards(page).all()) {
      expect(await card.getAttribute('data-domains')).toContain('e-commerce');
    }
    await expect(filterButton(page, 'E-commerce')).toHaveAttribute('aria-pressed', 'true');
    await expect(filterButton(page, 'Tous les domaines')).toHaveAttribute('aria-pressed', 'false');
    expect(new URL(page.url()).searchParams.get('domaine')).toBe('e-commerce');
  });

  test('le filtre masque aussi les groupes de compétences des autres domaines', async ({
    page,
  }) => {
    await page.goto('/competences/');
    await filterButton(page, 'Delivery').click();
    const groups = page.locator('[data-skill-group]:not([hidden])');
    await expect(groups).toHaveCount(1);
    await expect(groups.first()).toHaveAttribute('data-domains', 'delivery');
  });

  for (const [id, label] of Object.entries(LABELS)) {
    test(`le bouton « ${label} » filtre sur ${id}`, async ({ page }) => {
      await page.goto('/competences/');
      await filterButton(page, label).click();
      await expect(visibleCards(page)).toHaveCount(inDomain(id));
    });
  }
});

test.describe('Scénario : réinitialisation du filtre', () => {
  test('« Tous les domaines » restaure la liste complète et le total', async ({ page }) => {
    await page.goto('/competences/');
    await filterButton(page, 'Données et migrations').click();
    await expect(visibleCards(page)).toHaveCount(inDomain('donnees-migrations'));
    await filterButton(page, 'Tous les domaines').click();
    await expect(visibleCards(page)).toHaveCount(total);
    await expect(page.locator('[data-count]')).toHaveText(plural(total));
    await expect(filterButton(page, 'Tous les domaines')).toHaveAttribute('aria-pressed', 'true');
    expect(new URL(page.url()).searchParams.has('domaine')).toBe(false);
  });
});

test.describe('Scénario : filtre partagé par lien', () => {
  test('/competences/?domaine=ia-appliquee active « IA appliquée »', async ({ page }) => {
    await page.goto('/competences/?domaine=ia-appliquee');
    await expect(filterButton(page, 'IA appliquée')).toHaveAttribute('aria-pressed', 'true');
    await expect(filterButton(page, 'Tous les domaines')).toHaveAttribute('aria-pressed', 'false');
    await expect(visibleCards(page)).toHaveCount(inDomain('ia-appliquee'));
    await expect(page.locator('[data-count]')).toHaveText(plural(inDomain('ia-appliquee')));
  });
});

test.describe('Scénario d’erreur : domaine inconnu', () => {
  test('affiche toute la liste et annonce le message', async ({ page }) => {
    await page.goto('/competences/?domaine=inconnu');
    await expect(visibleCards(page)).toHaveCount(total);
    await expect(page.locator('[data-status] [data-message]')).toHaveText(
      'Domaine inconnu, affichage de toutes les réalisations',
    );
    await expect(filterButton(page, 'Tous les domaines')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Scénario d’erreur : filtre sans résultat', () => {
  test('message, lien « Voir toutes les réalisations » et retour à la liste', async ({ page }) => {
    // Le contenu réel couvre tous les domaines : on retire « ia-appliquee » du HTML servi.
    await page.route('**/competences/', async (route) => {
      const response = await route.fetch();
      const html = (await response.text()).replace(
        /data-domains="([^"]*)"/g,
        (_m, value: string) =>
          `data-domains="${value
            .split(' ')
            .filter((d) => d !== 'ia-appliquee')
            .join(' ')}"`,
      );
      await route.fulfill({ response, body: html });
    });
    await page.goto('/competences/');
    await filterButton(page, 'IA appliquée').click();
    await expect(visibleCards(page)).toHaveCount(0);
    await expect(page.locator('[data-count]')).toHaveText('0 réalisation');
    await expect(page.locator('[data-message]')).toHaveText(
      'Aucune réalisation pour ce domaine pour le moment',
    );
    const reset = page.getByRole('link', { name: 'Voir toutes les réalisations' });
    await expect(reset).toBeVisible();
    await expect(reset).toHaveAttribute('href', '/competences/');
  });
});

test.describe('Scénario : sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('toutes les réalisations sont visibles et aucun contrôle inerte n’est affiché', async ({
    page,
  }) => {
    await page.goto('/competences/');
    await expect(visibleCards(page)).toHaveCount(total);
    await expect(page.locator('[data-domain-filter]')).toBeHidden();
    for (const button of await page.locator('[data-domain-filter] button').all()) {
      await expect(button).toBeHidden();
    }
    await expect(page.locator('[data-count]')).toHaveText(plural(total));
    await expect(page.locator('[data-message]')).toBeEmpty();
    await expect(page.locator('a[data-reset]')).toBeHidden();
  });
});

test.describe('Scénario : performance, responsive et accessibilité', () => {
  test('le script de filtrage pèse moins de 3 Ko', async ({ page, request }) => {
    const sources = new Set<string>();
    page.on('response', (r) => {
      if (/\/_astro\/.*\.js$/.test(new URL(r.url()).pathname))
        sources.add(new URL(r.url()).pathname);
    });
    await page.goto('/competences/');
    await page.waitForLoadState('networkidle');
    let filterScript: number | null = null;
    for (const source of sources) {
      const body = (await (await request.get(source)).body()).toString('utf8');
      if (body.includes('aria-pressed')) filterScript = Buffer.byteLength(body);
    }
    expect(filterScript, 'script de filtrage introuvable').not.toBeNull();
    expect(filterScript).toBeLessThan(3 * 1024);
  });

  test('aucun défilement horizontal à 360 px, filtre actif compris', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/competences/?domaine=delivery');
    const overflow = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
    expect(await overflow()).toBeLessThanOrEqual(0);
    await filterButton(page, 'Tous les domaines').click();
    expect(await overflow()).toBeLessThanOrEqual(0);
  });

  test('cibles des boutons de filtre ≥ 44 px et focus visible', async ({ page }) => {
    await page.goto('/competences/');
    for (const button of await page.locator('[data-domain-filter] button').all()) {
      const box = await button.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    const first = page.locator('[data-domain-filter] button').first();
    await first.focus();
    expect(await first.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
  });

  test('le filtre se pilote au clavier', async ({ page }) => {
    await page.goto('/competences/');
    await filterButton(page, 'Architecture').focus();
    await page.keyboard.press('Enter');
    await expect(filterButton(page, 'Architecture')).toHaveAttribute('aria-pressed', 'true');
    await expect(visibleCards(page)).toHaveCount(inDomain('architecture'));
  });

  for (const scheme of ['light', 'dark'] as const) {
    test(`axe : aucune violation (${scheme}, filtre actif)`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, colorScheme: scheme });
      const page = await context.newPage();
      await page.goto('/competences/?domaine=e-commerce');
      await settleReveal(page);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      await context.close();
    });
  }
});
