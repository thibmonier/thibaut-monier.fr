import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { discoverRoutes } from '../../../scripts/checks/lib/dist-routes.ts';

describe('discoverRoutes', () => {
  it('découvre les routes depuis dist/**/index.html sans 404 ni /contact/merci/', async () => {
    const routes = await discoverRoutes(resolve(import.meta.dirname, '../../fixtures/dist-ok'));
    expect(routes).toEqual(['/', '/contact/', '/parcours/']);
  });
});
