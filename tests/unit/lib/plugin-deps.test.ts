import { describe, expect, it } from 'vitest';
import { computeDependencies, findDependencyErrors } from '../../../src/lib/plugin-deps.ts';

const node = (
  slug: string,
  requires: string[] = [],
  complements: string[] = [],
  ext: string[] = [],
) => ({
  slug,
  requires,
  complements,
  externalRequires: ext,
});
const all = [
  node('order-hold'),
  node('company-accounts', [], ['order-hold']),
  node('trade-credit', ['order-hold']),
  node('purchase-approval', ['company-accounts', 'order-hold']),
  node('tier-pricing'),
  node('facturx', [], [], ['sylius/invoicing-plugin']),
];

describe('computeDependencies', () => {
  it('calcule Nécessite, Complété par et Utilisé par', () => {
    const d = computeDependencies(all, 'purchase-approval');
    expect(d.requires).toEqual(['company-accounts', 'order-hold']);
    expect(computeDependencies(all, 'order-hold').usedBy).toEqual([
      'purchase-approval',
      'trade-credit',
    ]);
    expect(computeDependencies(all, 'company-accounts').complements).toEqual(['order-hold']);
  });

  it('signale l’absence de dépendance', () => {
    expect(computeDependencies(all, 'tier-pricing').isEmpty).toBe(true);
    expect(computeDependencies(all, 'facturx').isEmpty).toBe(false);
    expect(computeDependencies(all, 'facturx').externalRequires).toEqual([
      'sylius/invoicing-plugin',
    ]);
  });
});

describe('findDependencyErrors', () => {
  it('accepte un graphe valide', () => {
    expect(findDependencyErrors(all)).toEqual([]);
  });

  it('refuse une dépendance inexistante avec le message de l’US', () => {
    expect(findDependencyErrors([node('a', ['sylius-inconnu'])])).toEqual([
      "Plugin « a » : la dépendance « sylius-inconnu » n'existe pas dans la collection",
    ]);
  });

  it('refuse l’auto-référence et le cycle', () => {
    expect(findDependencyErrors([node('a', ['a'])])[0]).toMatch(/s'auto-référence/);
    const cycle = findDependencyErrors([node('a', ['b']), node('b', ['a'])]);
    expect(cycle.join()).toMatch(/cycle/);
  });

  it('refuse requires et complements simultanés', () => {
    expect(findDependencyErrors([node('a', ['b'], ['b']), node('b')])[0]).toMatch(
      /requis et complémentaire/,
    );
  });
});
