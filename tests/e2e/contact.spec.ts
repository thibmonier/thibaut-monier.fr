import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const SUBMIT = 'https://api.web3forms.com/submit';
const SUCCESS = 'Merci, votre message est bien envoyé. Réponse sous 48 h ouvrées.';
const FAILURE = "L'envoi a échoué. Écrivez-moi directement à l'adresse ci-dessous.";

// Toutes les requêtes Web3Forms sont simulées : aucun appel réel dans la suite.
async function mockSubmit(page: Page, status = 200, body: object = { success: true }) {
  const requests: { body: Record<string, unknown> }[] = [];
  await page.route(SUBMIT, async (route) => {
    requests.push({ body: route.request().postDataJSON() as Record<string, unknown> });
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  return requests;
}

async function fill(
  page: Page,
  values: Partial<Record<'name' | 'email' | 'message', string>> = {},
) {
  await page.getByLabel('Nom').fill(values.name ?? 'Marc Durand');
  await page.getByLabel('E-mail').fill(values.email ?? 'marc@exemple.fr');
  await page.getByLabel('Message').fill(values.message ?? 'Je cherche un CTO de transition.');
}

// Les scénarios du formulaire exigent PUBLIC_WEB3FORMS_KEY au build (valeur factice suffisante : les appels sont
// simulés). Sans clé, seul le scénario « [sans-clé] » s'exécute.
// En CI (E2E_EXPECT_FULL_CONFIG=1), une variable de build absente est une erreur, pas un test ignoré.
function skipUnlessConfigured(missing: boolean, reason: string): void {
  if (missing && process.env.E2E_EXPECT_FULL_CONFIG === '1') {
    throw new Error(`Configuration attendue en CI : ${reason}`);
  }
  test.skip(missing, reason);
}

test.beforeEach(async ({ page }, info) => {
  if (info.title.includes('[sans-clé]')) return;
  await page.goto('/contact/');
  skipUnlessConfigured(
    (await page.locator('form[data-contact-form]').count()) === 0,
    'PUBLIC_WEB3FORMS_KEY absente au build',
  );
});

// Le délai anti-spam est de 3 s : on laisse passer ce délai avant un envoi « humain ».
const waitHuman = (page: Page) => page.waitForTimeout(3200);

test.describe('Scénario : envoi nominal', () => {
  test('envoie le motif Mission et affiche la confirmation en moins de 3 s', async ({ page }) => {
    const requests = await mockSubmit(page);
    await page.goto('/contact/');
    await page.getByLabel('Motif').selectOption('mission');
    await fill(page);
    await waitHuman(page);
    const start = Date.now();
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(page).toHaveURL(/\/contact\/merci\/\?motif=mission$/);
    await expect(page.getByText(SUCCESS)).toBeVisible();
    expect(Date.now() - start).toBeLessThan(3000);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.body).toMatchObject({
      motif: 'mission',
      email: 'marc@exemple.fr',
      botcheck: '',
    });
    expect(String(requests[0]?.body.subject)).toContain('[Mission]');
  });

  test('la page de remerciement est exclue des moteurs', async ({ page }) => {
    await page.goto('/contact/merci/?motif=poste');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByText(SUCCESS)).toBeVisible();
  });
});

test.describe('Scénario : motif pré-sélectionné', () => {
  test('?motif=poste sélectionne « Poste »', async ({ page }) => {
    await page.goto('/contact/?motif=poste');
    await expect(page.getByLabel('Motif')).toHaveValue('poste');
  });
  test('un motif inconnu retombe sur « Mission »', async ({ page }) => {
    await page.goto('/contact/?motif=xyz');
    await expect(page.getByLabel('Motif')).toHaveValue('mission');
  });
});

// T-008-11 : scénario inter-US (US-004 produit les CTA, US-008 lit le paramètre `motif`).
test.describe("Scénario : de l'accueil au formulaire de contact", () => {
  for (const [cta, motif] of [
    ['Me recruter', 'poste'],
    ['Me confier une mission', 'mission'],
  ] as const) {
    test(`le bouton « ${cta} » ouvre /contact/ avec le motif « ${motif} » pré-sélectionné`, async ({
      page,
    }) => {
      await page.goto('/');
      await page.getByRole('link', { name: cta }).click();
      await expect(page).toHaveURL(new RegExp(`/contact/\\?motif=${motif}$`));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByLabel('Motif')).toHaveValue(motif);
    });
  }
});

test.describe('Scénario : prise de rendez-vous', () => {
  test('le lien de RDV, quand il est configuré, s’ouvre dans un nouvel onglet sûr', async ({
    page,
  }) => {
    await page.goto('/contact/');
    const link = page.getByRole('link', { name: /Réserver un créneau de 30 min/ });
    skipUnlessConfigured((await link.count()) === 0, 'PUBLIC_CALENDLY_URL absente : bouton masqué');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);
  });
});

test.describe('Scénario : champ obligatoire manquant', () => {
  test('affiche le message sous le champ, place le focus et n’envoie rien', async ({ page }) => {
    const requests = await mockSubmit(page);
    await page.goto('/contact/');
    await fill(page, { email: '' });
    await waitHuman(page);
    await page.getByRole('button', { name: 'Envoyer' }).click();
    const email = page.getByLabel('E-mail');
    await expect(page.getByText('Veuillez renseigner votre adresse e-mail.')).toBeVisible();
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    const describedBy = await email.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toHaveText(
      'Veuillez renseigner votre adresse e-mail.',
    );
    expect(requests).toHaveLength(0);
  });
});

test.describe('Scénario : envoi détecté comme robot', () => {
  test('un envoi en moins de 3 s donne un faux succès sans requête', async ({ page }) => {
    const requests = await mockSubmit(page);
    await page.goto('/contact/');
    await fill(page);
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(page).toHaveURL(/\/contact\/merci\//);
    expect(requests).toHaveLength(0);
  });

  test('le champ piège rempli donne un faux succès sans requête', async ({ page }) => {
    const requests = await mockSubmit(page);
    await page.goto('/contact/');
    await fill(page);
    await page.locator('input[name="botcheck"]').evaluate((el: HTMLInputElement) => {
      el.checked = true;
    });
    await waitHuman(page);
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(page).toHaveURL(/\/contact\/merci\//);
    expect(requests).toHaveLength(0);
  });

  test('le champ piège est masqué aux utilisateurs et aux lecteurs d’écran', async ({ page }) => {
    await page.goto('/contact/');
    const trap = page.locator('input[name="botcheck"]');
    await expect(trap).toBeHidden();
    await expect(trap).toHaveAttribute('tabindex', '-1');
  });
});

test.describe('Scénario : service indisponible', () => {
  for (const status of [503, 500]) {
    test(`réponse ${status} : message de repli et saisie conservée`, async ({ page }) => {
      await mockSubmit(page, status, { success: false });
      await page.goto('/contact/');
      await fill(page);
      await waitHuman(page);
      await page.getByRole('button', { name: 'Envoyer' }).click();
      await expect(page.getByRole('alert').filter({ hasText: FAILURE })).toBeVisible();
      await expect(page.getByLabel('Message')).toHaveValue('Je cherche un CTO de transition.');
      await expect(page.getByLabel('E-mail')).toHaveValue('marc@exemple.fr');
      await expect(page.getByRole('button', { name: 'Envoyer' })).toBeEnabled();
    });
  }

  test('réseau coupé : même repli', async ({ page }) => {
    await page.route(SUBMIT, (route) => route.abort('failed'));
    await page.goto('/contact/');
    await fill(page);
    await waitHuman(page);
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(page.getByRole('alert').filter({ hasText: FAILURE })).toBeVisible();
    await expect(page.getByLabel('Nom')).toHaveValue('Marc Durand');
  });

  test('erreur 4xx : message du service affiché en ligne', async ({ page }) => {
    await mockSubmit(page, 422, { success: false, message: 'Invalid email address' });
    await page.goto('/contact/');
    await fill(page);
    await waitHuman(page);
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Invalid email address' }),
    ).toBeVisible();
    await expect(page.getByLabel('Message')).toHaveValue('Je cherche un CTO de transition.');
  });
});

test.describe('Scénario : accessibilité et mentions', () => {
  test('étiquettes liées, cibles de 44 px et région de statut', async ({ page }) => {
    await page.goto('/contact/');
    for (const label of ['Nom', 'E-mail', 'Motif', 'Message']) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByLabel('E-mail')).toHaveAttribute('autocomplete', 'email');
    await expect(page.getByLabel('Nom')).toHaveAttribute('autocomplete', 'name');
    for (const target of [
      page.getByLabel('Nom'),
      page.getByLabel('E-mail'),
      page.getByLabel('Motif'),
      page.getByRole('button', { name: 'Envoyer' }),
    ]) {
      const box = await target.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    await expect(page.locator('[aria-live]')).not.toHaveCount(0);
  });

  test('la mention RGPD renvoie vers /vie-privee/#formulaire', async ({ page }) => {
    await page.goto('/contact/');
    const link = page.getByRole('link', { name: /En savoir plus/ });
    await expect(link).toHaveAttribute('href', '/vie-privee/#formulaire');
    await expect(page.getByText(/Web3Forms/)).toBeVisible();
  });

  test('aucune requête tierce au chargement', async ({ page, baseURL }) => {
    const origin = new URL(baseURL as string).origin;
    const external: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.push(r.url());
    });
    await page.goto('/contact/');
    await page.waitForLoadState('networkidle');
    expect(external).toEqual([]);
  });

  test('aucune violation CSP pendant un envoi simulé', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (m) => {
      if (/content security policy/i.test(m.text())) violations.push(m.text());
    });
    await mockSubmit(page);
    await page.goto('/contact/');
    await fill(page);
    await waitHuman(page);
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(page).toHaveURL(/merci/);
    expect(violations).toEqual([]);
  });
});

test.describe('Scénario : amélioration progressive', () => {
  test('le formulaire est un POST natif vers Web3Forms avec redirection et botcheck', async ({
    page,
  }) => {
    await page.goto('/contact/');
    const form = page.locator('form[data-contact-form]');
    skipUnlessConfigured(
      (await form.count()) === 0,
      'PUBLIC_WEB3FORMS_KEY absente : message de repli affiché',
    );
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('action', SUBMIT);
    await expect(form.locator('input[name="redirect"]')).toHaveAttribute(
      'value',
      /\/contact\/merci\/$/,
    );
    await expect(form.locator('input[name="access_key"]')).toHaveCount(1);
    await expect(form.locator('input[name="botcheck"]')).toHaveCount(1);
  });

  test('sans JavaScript, la page reste utilisable (validation HTML5 requise)', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/contact/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel('E-mail')).toHaveAttribute('required', '');
    await context.close();
  });
});

test.describe('Scénario : clé Web3Forms absente', () => {
  test('[sans-clé] affiche un message de repli accessible au lieu d’un formulaire cassé', async ({
    page,
  }) => {
    await page.goto('/contact/');
    test.skip((await page.locator('form[data-contact-form]').count()) > 0, 'clé présente');
    await expect(page.getByRole('status')).toContainText('indisponible');
    await expect(page.locator('form')).toHaveCount(0);
  });
});

test.describe('Scénario : en-têtes et accessibilité de la page de remerciement', () => {
  test('la CSP autorise Web3Forms en form-action et connect-src', async ({ request }) => {
    const csp = (await request.get('/contact/')).headers()['content-security-policy'] ?? '';
    expect(csp).toContain("form-action 'self' https://api.web3forms.com");
    expect(csp).toMatch(/connect-src[^;]*https:\/\/api\.web3forms\.com/);
  });

  test('/contact/merci/ n’a aucune violation axe serious ou critical', async ({ page }) => {
    await page.goto('/contact/merci/');
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  });
});
