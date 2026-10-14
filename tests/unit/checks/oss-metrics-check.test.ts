import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkOssMetrics } from '../../../scripts/checks/lib/oss-metrics.ts';

const roots: string[] = [];
const now = new Date('2026-10-14T00:00:00Z');
const keys = ['thibmonier/alpha', 'thibmonier/beta'];

const entry = (fetchedAt: string) => ({
  fetchedAt,
  github: { stars: 1, pushedAt: '2026-10-01T00:00:00Z', latestRelease: null },
});

async function rootWith(content: unknown | string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'oss-metrics-'));
  roots.push(root);
  await mkdir(join(root, 'src/data'), { recursive: true });
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  await writeFile(join(root, 'src/data/oss-metrics.json'), text);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('checkOssMetrics', () => {
  it('ne signale rien pour des données fraîches et complètes', async () => {
    const root = await rootWith({
      generatedAt: '2026-10-13T00:00:00Z',
      entries: {
        [keys[0] as string]: entry('2026-10-13T00:00:00Z'),
        [keys[1] as string]: entry('2026-10-13T00:00:00Z'),
      },
    });
    expect(await checkOssMetrics(root, keys, now)).toEqual({ errors: [], warnings: [] });
  });

  it('échoue seulement quand le schéma est invalide', async () => {
    const root = await rootWith({ generatedAt: 'pas une date', entries: {} });
    const { errors } = await checkOssMetrics(root, keys, now);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/^oss-metrics\.json : /);
  });

  it('échoue sur un JSON illisible', async () => {
    const root = await rootWith('{ oups');
    const { errors } = await checkOssMetrics(root, keys, now);
    expect(errors[0]).toMatch(/^oss-metrics\.json : JSON illisible/);
  });

  it('avertit (sans bloquer) au-delà de 7 jours', async () => {
    const root = await rootWith({
      generatedAt: '2026-10-01T00:00:00Z',
      entries: {
        [keys[0] as string]: entry('2026-10-01T00:00:00Z'),
        [keys[1] as string]: entry('2026-10-13T00:00:00Z'),
      },
    });
    const { errors, warnings } = await checkOssMetrics(root, keys, now);
    expect(errors).toEqual([]);
    expect(warnings).toEqual([
      `Métriques périmées pour « ${keys[0]} » : données au 2026-10-01 (plus de 7 jours)`,
    ]);
  });

  it('avertit (sans bloquer) quand une clé attendue est absente', async () => {
    const root = await rootWith({
      generatedAt: '2026-10-13T00:00:00Z',
      entries: { [keys[0] as string]: entry('2026-10-13T00:00:00Z') },
    });
    const { errors, warnings } = await checkOssMetrics(root, keys, now);
    expect(errors).toEqual([]);
    expect(warnings).toEqual([`Métriques absentes pour « ${keys[1]} » : bloc masqué`]);
  });

  it('avertit des clés présentes mais non attendues, sans bloquer', async () => {
    const root = await rootWith({
      generatedAt: '2026-10-13T00:00:00Z',
      entries: { 'thibmonier/inconnu': entry('2026-10-13T00:00:00Z') },
    });
    const { errors, warnings } = await checkOssMetrics(root, [], now);
    expect(errors).toEqual([]);
    expect(warnings).toEqual(['Métriques sans page associée : « thibmonier/inconnu »']);
  });
});
