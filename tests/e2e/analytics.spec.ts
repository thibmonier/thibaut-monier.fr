import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { discoverRoutes } from './helpers/routes.ts';

const SCRIPT = 'https://cloud.umami.is/script.js';
const GATEWAY = 'https://gateway.umami.is/api/send';
const SUBMIT = 'https://api.web3forms.com/submit';
const COLLECTOR = '**/__analytics-test__';

// Faux script Umami : enregistre chaque événement par une requête same-origin (survit aux navigations).
const STUB = `window.umami = { track: function (name, data) {
  fetch('/__analytics-test__', { method: 'POST', keepalive: true, body: JSON.stringify({ name: name, data: data }) });
} };`;

interface Recorded {
  name: string;
  data?: Record<string, string>;
}

// Le script n'est jamais appelé pour de vrai : le domaine d'audience est simulé de bout en bout.
// Playwright pilote un navigateur automatisé (`navigator.webdriver`) pour lequel le chargeur ne charge rien :
// les scénarios se présentent donc comme un visiteur ordinaire.
const asVisitor = () => Object.defineProperty(navigator, 'webdriver', { get: () => false });

async function simulate(context: BrowserContext): Promise<Recorded[]> {
  const events: Recorded[] = [];
  await context.addInitScript(asVisitor);
  await context.route(SCRIPT, (route) =>
    route.fulfill({ contentType: 'application/javascript', body: STUB }),
  );
  await context.route(COLLECTOR, async (route) => {
    events.push(JSON.parse(route.request().postData() ?? '{}') as Recorded);
    await route.fulfill({ status: 204 });
  });
  // Liens sortants : jamais de requête réelle vers GitHub, Packagist, LinkedIn ou Calendly.
  await context.route(
    /^https:\/\/(github\.com|packagist\.org|www\.linkedin\.com|calendly\.com)\//,
    (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<title>externe</title>' }),
  );
  return events;
}

// Le chargeur injecte le script en différé : on attend que le faux script ait défini `window.umami`.
async function scriptReady(page: Page): Promise<void> {
  await page.waitForFunction(() => 'umami' in window);
}

async function mockSubmit(page: Page): Promise<void> {
  await page.route(SUBMIT, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }),
  );
}

// Les scénarios exigent PUBLIC_UMAMI_WEBSITE_ID au build (valeur factice suffisante). En CI
// (E2E_EXPECT_FULL_CONFIG=1), une variable absente est une erreur, pas un test ignoré.
// Lecture du HTML par `request` : aucun navigateur, donc aucune requête vers Umami avant la simulation.
test.beforeEach(async ({ request }) => {
  const configured = (await (await request.get('/')).text()).includes(
    'name="analytics-website-id"',
  );
  if (!configured && process.env.E2E_EXPECT_FULL_CONFIG === '1') {
    throw new Error('Configuration attendue en CI : PUBLIC_UMAMI_WEBSITE_ID absente au build');
  }
  test.skip(!configured, 'PUBLIC_UMAMI_WEBSITE_ID absente au build');
});

async function submitContact(page: Page, motif: string): Promise<void> {
  await page.goto('/contact/');
  await page.getByLabel('Motif').selectOption(motif);
  await page.getByLabel('Nom').fill('Marc Durand');
  await page.getByLabel('E-mail').fill('marc@exemple.fr');
  await page.getByLabel('Message').fill('Je cherche un CTO de transition.');
  await page.waitForTimeout(3200); // délai anti-spam du formulaire
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await expect(page).toHaveURL(new RegExp(`/contact/merci/\\?motif=${motif}$`));
}

test.describe('Scénario : chargement du script', () => {
  test('un navigateur automatisé ne charge rien', async ({ page }) => {
    const hits: string[] = [];
    page.on('request', (r) => {
      if (/umami\.is|umami\.dev/.test(r.url())) hits.push(r.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(hits).toEqual([]);
    await expect(page.locator(`script[src="${SCRIPT}"]`)).toHaveCount(0);
  });

  test('avec un identifiant, le script est injecté en différé', async ({ page, context }) => {
    await simulate(context);
    const requested = page.waitForRequest(SCRIPT);
    await page.goto('/');
    await requested;
    const script = page.locator(`script[src="${SCRIPT}"]`);
    await expect(script).toHaveAttribute('defer', '');
    await expect(script).toHaveAttribute('data-website-id', /^[0-9a-f-]{36}$/);
    await expect(script).toHaveAttribute('data-do-not-track', 'true');
  });

  for (const [signal, init] of [
    ['DNT', () => Object.defineProperty(navigator, 'doNotTrack', { value: '1' })],
    ['GPC', () => Object.defineProperty(navigator, 'globalPrivacyControl', { value: true })],
  ] as const) {
    test(`avec ${signal}, aucune requête vers le domaine d'audience`, async ({
      browser,
      baseURL,
    }) => {
      const context = await browser.newContext({ baseURL });
      await context.addInitScript(asVisitor);
      await context.addInitScript(init);
      const hits: string[] = [];
      context.on('request', (r) => {
        if (/umami\.is|umami\.dev/.test(r.url())) hits.push(r.url());
      });
      const page = await context.newPage();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      expect(hits).toEqual([]);
      await expect(page.locator(`script[src="${SCRIPT}"]`)).toHaveCount(0);
      await context.close();
    });
  }

  test('script bloqué : navigation et formulaire normaux, aucune erreur', async ({
    page,
    context,
  }) => {
    await context.addInitScript(asVisitor);
    await context.route(SCRIPT, (route) => route.abort());
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await mockSubmit(page);
    await submitContact(page, 'mission');
    expect(errors).toEqual([]);
  });
});

test.describe('Scénario : événements', () => {
  test('contact_submit porte le motif et aucune donnée saisie', async ({ page, context }) => {
    test.setTimeout(60_000);
    const events = await simulate(context);
    await mockSubmit(page);
    for (const motif of ['poste', 'mission', 'autre']) {
      await submitContact(page, motif);
      await expect
        .poll(() => events.filter((e) => e.name === 'contact_submit').length)
        .toBeGreaterThan(0);
      expect(events.at(-1)).toEqual({ name: 'contact_submit', data: { motif } });
      events.length = 0;
    }
    const all = JSON.stringify(events);
    for (const secret of ['marc@exemple.fr', 'Marc Durand', 'CTO de transition']) {
      expect(all).not.toContain(secret);
    }
  });

  test('cv_download : un événement par clic', async ({ page, context }) => {
    const events = await simulate(context);
    await page.goto('/parcours/');
    await scriptReady(page);
    const download = page.waitForEvent('download');
    await page.locator('[data-cv-download]').click();
    await download;
    await expect.poll(() => events.filter((e) => e.name === 'cv_download')).toHaveLength(1);
  });

  test('rdv_click : un événement par clic', async ({ page, context }) => {
    const events = await simulate(context);
    await page.goto('/contact/');
    await scriptReady(page);
    await page.getByRole('link', { name: /Réserver un créneau/ }).click();
    await expect.poll(() => events.filter((e) => e.name === 'rdv_click')).toHaveLength(1);
  });

  test('outbound_github et outbound_packagist : un événement par clic, sans saisie libre', async ({
    page,
    context,
    request,
    baseURL,
  }) => {
    const events = await simulate(context);
    const plugins = (await discoverRoutes(request, baseURL as string)).filter((r) =>
      r.startsWith('/open-source/sylius/'),
    );
    let route = '';
    for (const candidate of plugins) {
      await page.goto(candidate);
      if ((await page.locator('[data-link="packagist"]').count()) > 0) {
        route = candidate;
        break;
      }
    }
    expect(route, 'une fiche avec un paquet Packagist').not.toBe('');
    await scriptReady(page);
    await page.locator('[data-link="github"]').click();
    await expect.poll(() => events.filter((e) => e.name === 'outbound_github')).toHaveLength(1);
    await page.locator('[data-link="packagist"]').click();
    await expect.poll(() => events.filter((e) => e.name === 'outbound_packagist')).toHaveLength(1);
    expect(events.find((e) => e.name === 'outbound_github')?.data).toEqual({
      repo: expect.stringMatching(/^[\w.-]+\/[\w.-]+$/),
    });
    expect(events.find((e) => e.name === 'outbound_packagist')?.data).toEqual({
      package: expect.stringMatching(/^[\w.-]+\/[\w.-]+$/),
    });
  });

  test('outbound_linkedin depuis le pied de page', async ({ page, context }) => {
    const events = await simulate(context);
    await page.goto('/');
    await scriptReady(page);
    await page.locator('footer').getByRole('link', { name: 'LinkedIn' }).click();
    await expect.poll(() => events.filter((e) => e.name === 'outbound_linkedin')).toHaveLength(1);
  });
});

test.describe('Scénario : aucun cookie, aucun stockage, aucun bandeau', () => {
  test('le parcours ne dépose rien et ne demande aucun consentement', async ({ page, context }) => {
    await simulate(context);
    await mockSubmit(page);
    await page.goto('/');
    await expect(
      page.locator('[role="dialog"], [id*="consent" i], [class*="cookie" i]'),
    ).toHaveCount(0);
    await submitContact(page, 'poste');
    expect(await context.cookies()).toEqual([]);
    const storage = await page.evaluate(() => ({
      local: window.localStorage.length,
      session: window.sessionStorage.length,
    }));
    expect(storage).toEqual({ local: 0, session: 0 });
  });
});

test.describe("Scénario : CSP d'Umami", () => {
  test('les domaines exacts sont autorisés, sans unsafe-inline', async ({ request }) => {
    const csp = (await request.get('/')).headers()['content-security-policy'] ?? '';
    expect(csp).toMatch(/script-src[^;]*https:\/\/cloud\.umami\.is(?=[\s;]|$)/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/gateway\.umami\.is(?=[\s;]|$)/);
    expect(csp).not.toContain('unsafe-inline');
    expect(GATEWAY).toContain('gateway.umami.is');
  });
});
