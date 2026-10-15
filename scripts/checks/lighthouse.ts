// Lighthouse 13.5 : 3 exécutions par page, médiane, seuil 0,95 sur 4 axes (ADR-0007).
// Exécuté dans l'image Playwright (Chromium inclus) contre `preview`. Pages découvertes dans dist/.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { discoverRoutes } from './lib/dist-routes.ts';
import { assertScores, AXES, medianScores, type Scores } from './lib/lighthouse-assert.ts';
import { loadSampleRules, sampleRoutes } from './lib/sample-routes.ts';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:8080';
const threshold = Number(process.env.LIGHTHOUSE_THRESHOLD ?? '0.95');
const runsPerPage = Number(process.env.LIGHTHOUSE_RUNS ?? '3');
const port = 9222;
const outDir = resolve('reports/lighthouse');
const slugOf = (route: string) =>
  route === '/' ? 'accueil' : route.replaceAll('/', '-').replace(/^-|-$/g, '');

// Gabarits répétés du blog échantillonnés (tests/e2e/sample-routes.json) ; toutes les pages uniques restent mesurées.
const routes = sampleRoutes(
  await discoverRoutes(resolve('dist')),
  loadSampleRules(resolve('tests/e2e/sample-routes.json')),
);
if (routes.length === 0) {
  console.error('Aucune page trouvée dans dist/ : lancer `make checks` (build) avant Lighthouse.');
  process.exit(2);
}
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  // Chromium système optionnel (voir playwright.config.ts)
  executablePath: process.env.PW_CHROMIUM_PATH || undefined,
  args: [`--remote-debugging-port=${port}`, '--no-sandbox'],
});
const failures: string[] = [];
const summary: Record<string, Scores> = {};

try {
  for (const route of routes) {
    const runs: Scores[] = [];
    for (let i = 0; i < runsPerPage; i++) {
      const result = await lighthouse(
        new URL(route, baseURL).href,
        { port, output: ['json', 'html'], logLevel: 'error' },
        undefined,
      );
      if (!result) throw new Error(`Lighthouse sans résultat pour ${route}`);
      const { categories } = result.lhr;
      runs.push({
        performance: categories.performance?.score ?? 0,
        accessibility: categories.accessibility?.score ?? 0,
        'best-practices': categories['best-practices']?.score ?? 0,
        seo: categories.seo?.score ?? 0,
      });
      const [, html] = result.report as string[];
      await writeFile(resolve(outDir, `${slugOf(route)}-${i + 1}.html`), html ?? '');
    }
    const median = medianScores(runs);
    summary[route] = median;
    failures.push(...assertScores(median, threshold).map((message) => `${route} : ${message}`));
  }
} finally {
  await browser.close();
}

await writeFile(resolve(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.table(
  Object.fromEntries(
    Object.entries(summary).map(([route, s]) => [
      route,
      Object.fromEntries(AXES.map(([axis]) => [axis, s[axis]])),
    ]),
  ),
);

if (failures.length > 0) {
  console.error(`Lighthouse sous le seuil ${threshold} :`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(
  `Lighthouse : ${routes.length} page(s) ≥ ${threshold} sur les 4 axes (médiane de ${runsPerPage}).`,
);
