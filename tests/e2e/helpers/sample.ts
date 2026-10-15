import type { APIRequestContext } from '@playwright/test';
import { loadSampleRules, sampleRoutes } from '../../../scripts/checks/lib/sample-routes.ts';
import { discoverRoutes } from './routes.ts';

// Routes découvertes puis échantillonnées (gabarits répétés du blog) : voir tests/e2e/sample-routes.json.
export async function discoverSampledRoutes(
  request: APIRequestContext,
  baseURL: string,
): Promise<string[]> {
  const rules = loadSampleRules(`${import.meta.dirname}/../sample-routes.json`);
  return sampleRoutes(await discoverRoutes(request, baseURL), rules);
}
