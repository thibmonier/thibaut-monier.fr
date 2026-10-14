import { describe, expect, it } from 'vitest';
import {
  ALL_LABEL,
  CONFIDENTIAL_LABEL,
  DOMAIN_IDS,
  DOMAIN_LABELS,
  EMPTY_MESSAGE,
  UNKNOWN_DOMAIN_MESSAGE,
  buildSearch,
  clientsLabel,
  countLabel,
  filterByDomain,
  parseDomainParam,
  statusMessage,
} from '../../../src/lib/filters.ts';

describe('domaines', () => {
  it('expose les 5 domaines du PRD avec un libellé français', () => {
    expect(DOMAIN_IDS).toEqual([
      'delivery',
      'architecture',
      'e-commerce',
      'donnees-migrations',
      'ia-appliquee',
    ]);
    expect(DOMAIN_LABELS['donnees-migrations']).toBe('Données et migrations');
    expect(DOMAIN_LABELS['ia-appliquee']).toBe('IA appliquée');
    expect(ALL_LABEL).toBe('Tous les domaines');
  });
});

describe('parseDomainParam', () => {
  it('lit un domaine valide, avec ou sans « ? »', () => {
    expect(parseDomainParam('?domaine=ia-appliquee')).toEqual({
      domain: 'ia-appliquee',
      unknown: false,
    });
    expect(parseDomainParam('domaine=e-commerce')).toEqual({
      domain: 'e-commerce',
      unknown: false,
    });
  });

  it('signale un domaine inconnu et retombe sur la liste complète', () => {
    expect(parseDomainParam('?domaine=inconnu')).toEqual({ domain: null, unknown: true });
    expect(parseDomainParam('?domaine=IA-Appliquee')).toEqual({ domain: null, unknown: true });
  });

  it('traite un paramètre vide ou absent comme « tous », sans message', () => {
    expect(parseDomainParam('?domaine=')).toEqual({ domain: null, unknown: false });
    expect(parseDomainParam('')).toEqual({ domain: null, unknown: false });
    expect(parseDomainParam('?autre=1')).toEqual({ domain: null, unknown: false });
  });

  it('retient la première valeur si le paramètre est répété', () => {
    expect(parseDomainParam('?domaine=delivery&domaine=architecture').domain).toBe('delivery');
  });

  it('accepte une liste de domaines valides fournie par l’appelant (script du navigateur)', () => {
    expect(parseDomainParam('?domaine=x', ['x', 'y'])).toEqual({ domain: 'x', unknown: false });
  });
});

describe('filterByDomain', () => {
  const items = [
    { id: 'a', domains: ['e-commerce', 'delivery'] },
    { id: 'b', domains: ['delivery'] },
    { id: 'c', domains: ['architecture'] },
  ];

  it('garde les réalisations portant le domaine, quelle que soit sa position', () => {
    expect(filterByDomain(items, 'delivery').map((i) => i.id)).toEqual(['a', 'b']);
    expect(filterByDomain(items, 'e-commerce').map((i) => i.id)).toEqual(['a']);
  });

  it('retourne tout sans domaine et une liste vide pour un domaine sans résultat', () => {
    expect(filterByDomain(items, null)).toHaveLength(3);
    expect(filterByDomain(items, 'ia-appliquee')).toEqual([]);
  });
});

describe('countLabel', () => {
  it.each([
    [0, '0 réalisation'],
    [1, '1 réalisation'],
    [2, '2 réalisations'],
    [6, '6 réalisations'],
  ])('%i -> « %s »', (count, label) => {
    expect(countLabel(count)).toBe(label);
  });
});

describe('statusMessage', () => {
  it('annonce un domaine inconnu', () => {
    expect(statusMessage({ unknown: true, count: 13 })).toBe(
      'Domaine inconnu, affichage de toutes les réalisations',
    );
    expect(UNKNOWN_DOMAIN_MESSAGE).toBe('Domaine inconnu, affichage de toutes les réalisations');
  });

  it('annonce un filtre sans résultat', () => {
    expect(statusMessage({ unknown: false, count: 0 })).toBe(
      'Aucune réalisation pour ce domaine pour le moment',
    );
    expect(EMPTY_MESSAGE).toBe('Aucune réalisation pour ce domaine pour le moment');
  });

  it('ne dit rien dans les autres cas', () => {
    expect(statusMessage({ unknown: false, count: 4 })).toBe('');
  });
});

describe('clientsLabel', () => {
  it('affiche « Référence confidentielle » sans client cité', () => {
    expect(clientsLabel([])).toBe('Référence confidentielle');
    expect(CONFIDENTIAL_LABEL).toBe('Référence confidentielle');
  });

  it('liste les clients validés', () => {
    expect(clientsLabel(['Acme', 'Globex'])).toBe('Acme, Globex');
  });
});

describe('buildSearch', () => {
  it('construit le paramètre de partage, vide pour « tous »', () => {
    expect(buildSearch('ia-appliquee')).toBe('?domaine=ia-appliquee');
    expect(buildSearch(null)).toBe('');
  });
});
