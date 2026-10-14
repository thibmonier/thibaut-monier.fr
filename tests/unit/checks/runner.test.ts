import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { discoverChecks, runChecks } from '../../../scripts/checks/lib/runner.ts';

const dir = resolve(import.meta.dirname, '../../fixtures/checks-sample');

describe('discoverChecks', () => {
  it('découvre *.content.check.ts pour la phase content', async () => {
    const files = await discoverChecks(dir, 'content');
    expect(files.map((f) => f.split('/').pop())).toEqual(['a.content.check.ts']);
  });
  it('découvre *.dist.check.ts pour la phase dist', async () => {
    const files = await discoverChecks(dir, 'dist');
    expect(files.map((f) => f.split('/').pop())).toEqual(['b.dist.check.ts']);
  });
});

describe('runChecks', () => {
  it('renvoie 0 quand tous les contrôles passent', async () => {
    const result = await runChecks(dir, 'content');
    expect(result.exitCode).toBe(0);
    expect(result.errors).toEqual([]);
  });
  it('renvoie 1 et les erreurs quand un contrôle échoue', async () => {
    const result = await runChecks(dir, 'dist');
    expect(result.exitCode).toBe(1);
    expect(result.errors).toEqual(['b.dist.check.ts : échec volontaire']);
  });
  it('renvoie 0 si aucun contrôle', async () => {
    const result = await runChecks(resolve(dir, '..'), 'content');
    expect(result.exitCode).toBe(0);
  });
});
