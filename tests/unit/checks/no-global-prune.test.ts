import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import check from '../../../scripts/checks/no-global-prune.content.check.ts';
import {
  checkNoGlobalPrune,
  findForbiddenPrune,
} from '../../../scripts/checks/lib/no-global-prune.ts';

// Les commandes sont assemblées pour que ce fichier ne soit pas lui-même signalé.
const cmd = (...parts: string[]) => ['docker', ...parts].join(' ');
const SYSTEM = cmd('system', 'prune', '-af');
const VOLUME = cmd('volume', 'prune');
const CONTAINER = cmd('container', 'prune', '-f');
const IMAGE_ALL = cmd('image', 'prune', '-a');
const BUILDER_ALL = cmd('builder', 'prune', '--all');

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'prune-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('findForbiddenPrune', () => {
  it.each([
    [SYSTEM, 'system prune'],
    [VOLUME, 'volume prune'],
    [CONTAINER, 'container prune'],
    [IMAGE_ALL, 'image prune -a'],
    [cmd('image', 'prune', '-fa'), 'image prune -a'],
    [BUILDER_ALL, 'builder prune -a'],
    [cmd('buildx', 'prune', '-a'), 'buildx prune -a'],
  ])('signale « %s »', (line, label) => {
    const [finding] = findForbiddenPrune(`\tx\n\t${line}\n`, 'Makefile');
    expect(finding?.line).toBe(2);
    expect(finding?.command).toContain(label.split(' ')[0]);
  });

  it('autorise le nettoyage limité au projet et le prune de cache sans option -a', () => {
    const allowed = [
      cmd('builder', 'prune', '-f'),
      cmd('image', 'prune', '-f'),
      'docker compose -p tm-w1 down -v --remove-orphans',
    ].join('\n');
    expect(findForbiddenPrune(allowed, 'Makefile')).toEqual([]);
  });

  it('refuse toute mention dans un fichier exécutable, même avec un terme d’interdiction', () => {
    const line = `# jamais ${SYSTEM}`;
    expect(findForbiddenPrune(line, 'mk/x.mk')).toHaveLength(1);
    expect(findForbiddenPrune(line, '.github/workflows/ci.yml')).toHaveLength(1);
  });

  it('tolère dans la documentation une mention portant un terme d’interdiction', () => {
    expect(findForbiddenPrune(`Interdit : ${SYSTEM}`, 'docs/guides/x.md')).toEqual([]);
    expect(findForbiddenPrune(`À lancer : ${SYSTEM}`, 'docs/guides/x.md')).toHaveLength(1);
  });
});

describe('checkNoGlobalPrune', () => {
  it('réussit sur un dépôt propre', async () => {
    await writeFile(join(root, 'Makefile'), `clean:\n\t${cmd('builder', 'prune', '-f')}\n`);
    expect(await checkNoGlobalPrune(root)).toEqual([]);
  });

  it('échoue et cite le fichier et la ligne', async () => {
    await mkdir(join(root, 'scripts'));
    await writeFile(join(root, 'scripts', 'clean.sh'), `echo ok\n${SYSTEM}\n`);
    const errors = await checkNoGlobalPrune(root);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('scripts/clean.sh:2');
    expect(errors[0]).toContain(cmd('system', 'prune'));
  });

  it('ignore node_modules, dist et les dossiers absents', async () => {
    await mkdir(join(root, 'node_modules'));
    await writeFile(join(root, 'node_modules', 'x.md'), SYSTEM);
    await mkdir(join(root, 'dist'));
    await writeFile(join(root, 'dist', 'x.txt'), SYSTEM);
    expect(await checkNoGlobalPrune(root)).toEqual([]);
  });

  it('le contrôle de contenu s’exécute sur la racine du contexte', async () => {
    await writeFile(join(root, 'README.md'), `${VOLUME}\n`);
    const errors = await check({ root, distDir: join(root, 'dist') });
    expect(errors[0]).toContain('README.md:1');
  });
});
