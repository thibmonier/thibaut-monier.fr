import { describe, expect, it } from 'vitest';
import {
  THEMES,
  buildSearchEntry,
  countLabel,
  formatPluginIssue,
  groupByTheme,
  noResultMessage,
  normalize,
  parseThemeParam,
  searchPlugins,
  syliusVersions,
  themeCounts,
} from '../../../src/lib/plugins.ts';

const plugin = (slug: string, name: string, theme: (typeof THEMES)[number], tagline = '') => ({
  slug,
  name,
  theme,
  tagline,
});
const sample = [
  plugin('trade-credit', 'Trade Credit', 'b2b', 'Paiement en compte avec plafond.'),
  plugin('facturx', 'Factur-X', 'conformite-ue', 'Factures électroniques EN 16931.'),
  plugin('audit-log', 'Audit Log', 'back-office', 'Journal des modifications.'),
  plugin('company-accounts', 'Company Accounts', 'b2b', 'Comptes entreprise.'),
];

describe('thèmes', () => {
  it('expose les quatre thèmes dans l’ordre du catalogue', () => {
    expect(THEMES).toEqual(['b2b', 'conformite-ue', 'back-office', 'ia-integrations']);
  });

  it('regroupe par thème, par ordre alphabétique, en gardant les thèmes vides', () => {
    const groups = groupByTheme(sample);
    expect(groups.map((g) => g.theme)).toEqual([...THEMES]);
    expect(groups[0]?.label).toBe('B2B');
    expect(groups[0]?.plugins.map((p) => p.slug)).toEqual(['company-accounts', 'trade-credit']);
    expect(groups[3]?.plugins).toEqual([]);
  });

  it('compte les plugins par thème', () => {
    expect(themeCounts(sample)).toEqual({
      b2b: 2,
      'conformite-ue': 1,
      'back-office': 1,
      'ia-integrations': 0,
    });
  });

  it('lit ?theme= et ignore une valeur inconnue', () => {
    expect(parseThemeParam('?theme=b2b')).toBe('b2b');
    expect(parseThemeParam('?theme=paiement')).toBeNull();
    expect(parseThemeParam('')).toBeNull();
  });
});

describe('recherche', () => {
  it('normalise accents, casse et espaces', () => {
    expect(normalize('  Conformité  UE ')).toBe('conformite ue');
  });

  const entries = sample.map((p) =>
    buildSearchEntry({ id: p.slug, name: p.name, tagline: p.tagline, keywords: [] }),
  );

  it('place Factur-X en premier pour « facture »', () => {
    expect(searchPlugins(entries, 'facture')[0]).toBe('facturx');
  });

  it('classe le nom avant l’accroche', () => {
    const e = [
      buildSearchEntry({ id: 'a', name: 'Alpha', tagline: 'parle de logs', keywords: [] }),
      buildSearchEntry({ id: 'b', name: 'Logs', tagline: 'autre', keywords: [] }),
    ];
    expect(searchPlugins(e, 'logs')).toEqual(['b', 'a']);
  });

  it('exige que tous les mots correspondent', () => {
    expect(searchPlugins(entries, 'audit journal')).toEqual(['audit-log']);
    expect(searchPlugins(entries, 'audit blockchain')).toEqual([]);
  });

  it('renvoie tout, dans l’ordre, pour une requête vide', () => {
    expect(searchPlugins(entries, '  ')).toEqual(sample.map((p) => p.slug));
  });

  it('ne trouve rien pour « blockchain »', () => {
    expect(searchPlugins(entries, 'blockchain')).toEqual([]);
  });
});

describe('messages', () => {
  it('formate le compteur', () => {
    expect(countLabel(9)).toBe('9 plugins');
    expect(countLabel(1)).toBe('1 plugin');
    expect(countLabel(0)).toBe('0 plugin');
  });

  it('formate le message sans résultat', () => {
    expect(noResultMessage('blockchain')).toBe(
      'Aucun plugin ne correspond à « blockchain ». Essayez un autre mot-clé ou parcourez les 4 thèmes.',
    );
  });

  it('formate une erreur de schéma avec le slug et le libellé du champ', () => {
    expect(formatPluginIssue('paiement-x', { path: ['theme'], message: 'doit valoir b2b' })).toBe(
      'Plugin « paiement-x » invalide : thème doit valoir b2b',
    );
    expect(
      formatPluginIssue('x', {
        path: ['compatibility', 'matrix', 0, 'php'],
        message: 'est requis',
      }),
    ).toBe('Plugin « x » invalide : compatibilité.php est requis');
  });
});

describe('versions Sylius', () => {
  it('liste les versions sans doublon', () => {
    expect(
      syliusVersions([
        { sylius: '2.2.9+', php: '>=8.2', symfony: ['6.4'] },
        { sylius: '2.3', php: '>=8.3', symfony: ['7.4'] },
        { sylius: '2.3', php: '>=8.3', symfony: ['8.0'] },
      ]),
    ).toEqual(['2.2.9+', '2.3']);
  });
});
