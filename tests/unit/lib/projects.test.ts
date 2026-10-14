import { describe, expect, it } from 'vitest';
import {
  MAX_VISIBLE_WORDS,
  breadcrumbTrail,
  contributionLabel,
  countVisibleWords,
  formatLongDate,
  packagistUrl,
  projectEntryId,
  repoUrl,
  splitInlineCode,
  STATUS_LABELS,
  wordBudgetError,
} from '../../../src/lib/projects.ts';

const project = {
  name: 'career-ops',
  summary: 'un deux trois',
  role: 'quatre cinq',
  result: 'six',
  contributions: [
    {
      number: 1,
      type: 'pr' as const,
      problem: 'a b c',
      fix: 'd e',
      tests: 'f',
      technical: 'ne pas compter ces mots du tout',
    },
  ],
};

describe('countVisibleWords', () => {
  it('compte le résumé, le rôle, le résultat, les trois blocs et le corps, hors encadrés techniques', () => {
    // 3 + 2 + 1 + (3 + 2 + 1) + corps (4)
    expect(countVisibleWords(project, 'un corps de texte')).toBe(16);
  });

  it('ignore la ponctuation seule et les espaces multiples', () => {
    expect(countVisibleWords({ ...project, contributions: [] }, '—  ,  mot   autre')).toBe(8);
  });

  it('ne compte pas les blocs <details> du corps', () => {
    const body = 'visible\n<details><summary>x</summary>caché caché caché</details>\nfin';
    expect(countVisibleWords({ ...project, contributions: [] }, body)).toBe(8);
  });
});

describe('wordBudgetError', () => {
  it('reste silencieux jusqu’à 900 mots', () => {
    expect(wordBudgetError('career-ops', MAX_VISIBLE_WORDS)).toBeNull();
  });

  it('signale le dépassement du seuil de 900 mots', () => {
    expect(wordBudgetError('career-ops', MAX_VISIBLE_WORDS + 1)).toBe(
      'Étude de cas « career-ops » : 901 mots visibles, 900 au plus (hors encadrés techniques)',
    );
  });
});

describe('contributionLabel', () => {
  it('distingue PR et issue', () => {
    expect(contributionLabel({ type: 'pr', number: 3496 })).toBe('PR #3496');
    expect(contributionLabel({ type: 'issue', number: 3495 })).toBe('Issue #3495');
  });
});

describe('breadcrumbTrail', () => {
  it('lie la vitrine quand son lien de navigation est actif', () => {
    expect(breadcrumbTrail('career-ops', true)).toEqual([
      { label: 'Accueil', href: '/' },
      { label: 'Open source', href: '/open-source/' },
      { label: 'career-ops' },
    ]);
  });

  it('affiche la vitrine sans lien tant que sa page n’existe pas', () => {
    expect(breadcrumbTrail('career-ops', false)[1]).toEqual({ label: 'Open source' });
  });
});

describe('splitInlineCode', () => {
  it('isole les segments entre accents graves', () => {
    expect(splitInlineCode('Appelle `resolveColumns()` ici')).toEqual([
      { text: 'Appelle ', code: false },
      { text: 'resolveColumns()', code: true },
      { text: ' ici', code: false },
    ]);
  });

  it('renvoie un seul segment sans code et rien pour un texte vide', () => {
    expect(splitInlineCode('texte simple')).toEqual([{ text: 'texte simple', code: false }]);
    expect(splitInlineCode('')).toEqual([]);
  });
});

describe('helpers de chemin et de date', () => {
  it('construit l’identifiant de collection, l’URL du dépôt et la date longue', () => {
    expect(projectEntryId('career-ops')).toBe('fr/career-ops');
    expect(repoUrl({ owner: 'career-ops-hq', name: 'career-ops' })).toBe(
      'https://github.com/career-ops-hq/career-ops',
    );
    expect(formatLongDate(new Date('2026-09-02T22:00:00Z'))).toBe('2 septembre 2026');
    expect(packagistUrl('tailsfadmin/tailsfadmin-bundle')).toBe(
      'https://packagist.org/packages/tailsfadmin/tailsfadmin-bundle',
    );
    expect(STATUS_LABELS.merged).toBe('Mergée');
  });
});
