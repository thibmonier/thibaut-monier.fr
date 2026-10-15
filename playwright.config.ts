import { defineConfig, devices } from '@playwright/test';

// Cible : le service `preview` (image de production) ; surchargeable pour CI ou tests locaux.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:8080';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports/playwright' }],
    // Échoue si un test est ignoré hors de tests/e2e/skip-allowlist.json ; affiche exécutés / ignorés.
    ['./tests/e2e/reporters/strict-skips.ts'],
  ],
  outputDir: 'reports/playwright-results',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    // Chromium système optionnel (poste à court d'espace disque) ; l'image Playwright suffit sinon.
    launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 }, isMobile: true },
    },
  ],
});
