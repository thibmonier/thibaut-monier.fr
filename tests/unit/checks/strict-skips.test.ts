import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  findUnlistedSkips,
  formatSummary,
  parseAllowlist,
  type SkippedTest,
} from '../../../scripts/checks/lib/strict-skips.ts';

const entry = {
  file: 'tests/e2e/a.spec.ts',
  test: 'impression',
  projects: ['mobile'],
  reason: 'le PDF ne dépend pas du viewport',
  date: '2026-10-14',
};
const skip = (over: Partial<SkippedTest> = {}): SkippedTest => ({
  file: 'tests/e2e/a.spec.ts',
  title: 'Scénario : impression › tout est déplié',
  project: 'mobile',
  ...over,
});

describe('parseAllowlist', () => {
  it('accepte une entrée valide', () => {
    expect(parseAllowlist({ skips: [entry] })).toEqual([entry]);
  });
  it.each([
    [{}, 'tableau « skips »'],
    [{ skips: [{ ...entry, reason: '' }] }, '« reason » requis'],
    [{ skips: [{ ...entry, date: '14/10/2026' }] }, 'AAAA-MM-JJ'],
    [{ skips: [{ ...entry, extra: 1 }] }, 'champ inconnu'],
    [{ skips: [{ ...entry, projects: [''] }] }, '« projects »'],
    [{ skips: [null] }, 'invalide'],
  ])('refuse une liste mal formée (%#)', (input, message) => {
    expect(() => parseAllowlist(input)).toThrow(message);
  });
});

describe('findUnlistedSkips (le reporter échoue si la liste n’est pas vide)', () => {
  it('un ignoré hors liste est signalé', () => {
    expect(findUnlistedSkips([skip({ file: 'tests/e2e/b.spec.ts' })], [entry])).toHaveLength(1);
    expect(findUnlistedSkips([skip({ title: 'autre test' })], [entry])).toHaveLength(1);
  });
  it('un ignoré sur un autre projet que ceux de l’exception est signalé', () => {
    expect(findUnlistedSkips([skip({ project: 'desktop' })], [entry])).toHaveLength(1);
  });
  it('un ignoré listé est toléré ; sans « projects », tous les projets le sont', () => {
    expect(findUnlistedSkips([skip()], [entry])).toEqual([]);
    const { projects: _ignored, ...anyProject } = entry;
    expect(findUnlistedSkips([skip({ project: 'desktop' })], [anyProject])).toEqual([]);
  });
});

describe('formatSummary', () => {
  it('affiche exécutés / ignorés', () => {
    expect(formatSummary({ executed: 427, skipped: 3 }, [])).toBe(
      "Tests e2e : 427 exécutés / 3 ignorés (0 hors liste d'exceptions)",
    );
  });
  it('liste les ignorés hors liste', () => {
    const text = formatSummary({ executed: 1, skipped: 1 }, [skip()]);
    expect(text).toContain('1 hors liste');
    expect(text).toContain('tests/e2e/a.spec.ts [mobile]');
  });
});

describe('tests/e2e/skip-allowlist.json', () => {
  const file = resolve(import.meta.dirname, '../../e2e/skip-allowlist.json');
  const list = parseAllowlist(JSON.parse(readFileSync(file, 'utf8')));

  it('reprend les 3 ignorés attendus du sprint 2, chacun avec sa raison', () => {
    expect(list.map((e) => `${e.file}|${e.test}|${(e.projects ?? ['*']).join(',')}`)).toEqual([
      'tests/e2e/contact.spec.ts|[sans-clé]|desktop,mobile',
      'tests/e2e/parcours.spec.ts|impression|mobile',
    ]);
  });
});
