import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const script = resolve(import.meta.dirname, '../../../scripts/preflight.sh');
const GB = 1024 * 1024; // en Ko

function run(env: Record<string, string>) {
  const result = spawnSync('sh', [script], {
    env: {
      PATH: process.env.PATH ?? '',
      PREFLIGHT_SKIP_DOCKER: '1',
      PREFLIGHT_SKIP_GIT: '1',
      ...env,
    },
    encoding: 'utf8',
  });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

describe('scripts/preflight.sh (make preflight)', () => {
  it('réussit avec assez d’espace et affiche espace libre et plafond de workers', () => {
    const { code, out } = run({ PREFLIGHT_FREE_KB: String(9 * GB) });
    expect(code).toBe(0);
    expect(out).toContain('Espace libre : 9.0 Go (seuil 8 Go)');
    expect(out).toContain('Plafond de workers : 2');
  });

  it('échoue sous le seuil avec un message clair et un nettoyage limité au projet', () => {
    const { code, err } = run({ PREFLIGHT_FREE_KB: String(4 * GB) });
    expect(code).toBe(1);
    expect(err).toContain('espace libre insuffisant');
    expect(err).toContain('docker builder prune -f');
    expect(err).toContain('Jamais de prune global');
  });

  it('seuil par défaut de 8 Go (action 4 de la rétro du sprint 3)', () => {
    expect(run({ PREFLIGHT_FREE_KB: String(Math.round(7.9 * GB)) }).code).toBe(1);
    expect(run({ PREFLIGHT_FREE_KB: String(Math.round(8.1 * GB)) }).code).toBe(0);
  });

  it('le seuil est paramétrable (PREFLIGHT_MIN_GB)', () => {
    expect(run({ PREFLIGHT_FREE_KB: String(4 * GB), PREFLIGHT_MIN_GB: '1' }).code).toBe(0);
    expect(run({ PREFLIGHT_FREE_KB: String(4 * GB), PREFLIGHT_MIN_GB: '9999' }).code).toBe(1);
  });

  it.each([
    [3.5, '2'],
    [2, '1'],
  ])('plafond de workers pour %s Go libres : %s', (free, cap) => {
    const { out } = run({ PREFLIGHT_FREE_KB: String(free * GB), PREFLIGHT_MIN_GB: '1' });
    expect(out).toContain(`Plafond de workers : ${cap}`);
  });

  it('sous 1,5 Go : plafond nul, arrêt de tout build', () => {
    const { out } = run({ PREFLIGHT_FREE_KB: String(1 * GB), PREFLIGHT_MIN_GB: '0.5' });
    expect(out).toContain('Plafond de workers : 0');
  });
});
