import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { createPluginSchema } from '../../../src/content/schemas/plugins.ts';
import { formatPluginIssue } from '../../../src/lib/plugins.ts';

const schema = createPluginSchema(() => z.string());

const valid = () => ({
  name: 'Order Hold',
  tagline: 'Noyau de blocage des commandes pour Sylius 2.',
  theme: 'b2b',
  repo: { owner: 'thibmonier', name: 'sylius-order-hold-plugin' },
  packagist: 'tmonier/sylius-order-hold-plugin',
  features: ['a', 'b', 'c', 'd', 'e'],
  compatibility: {
    matrix: [{ sylius: '2.3', php: '>=8.3', symfony: ['7.4'] }],
    databases: ['mysql'],
  },
  installSteps: ['Enregistrer le bundle.', 'Vider le cache.'],
  configExcerpt: 'tmonier_order_hold: ~',
});

const issues = (input: unknown, slug = 'order-hold') => {
  const result = schema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => formatPluginIssue(slug, i));
};

describe('schéma plugins', () => {
  it('accepte une fiche valide, licence MIT et brouillon faux par défaut', () => {
    const parsed = schema.parse(valid());
    expect(parsed.license).toBe('MIT');
    expect(parsed.draft).toBe(false);
    expect(parsed.requires).toEqual([]);
    expect(parsed.externalRequires).toEqual([]);
  });

  it('rejette un thème inconnu avec le message de l’US', () => {
    expect(issues({ ...valid(), theme: 'paiement' })).toEqual([
      'Plugin « order-hold » invalide : thème doit valoir b2b, conformite-ue, back-office ou ia-integrations',
    ]);
  });

  it('exige la version minimale de PHP', () => {
    const input = valid();
    input.compatibility.matrix = [{ sylius: '2.3', symfony: ['7.4'] } as never];
    expect(issues(input)).toEqual([
      'Plugin « order-hold » invalide : compatibilité.php est requis',
    ]);
  });

  it('rejette une clé inconnue et une accroche de plus de 140 caractères', () => {
    expect(schema.safeParse({ ...valid(), phone: '0102030405' }).success).toBe(false);
    expect(schema.safeParse({ ...valid(), tagline: 'x'.repeat(141) }).success).toBe(false);
  });

  it('accepte un plugin sans paquet Packagist', () => {
    const { packagist: _omit, ...rest } = valid();
    expect(schema.safeParse(rest).success).toBe(true);
  });

  it('exige 5 à 8 fonctionnalités', () => {
    expect(schema.safeParse({ ...valid(), features: ['a'] }).success).toBe(false);
    expect(schema.safeParse({ ...valid(), features: Array(9).fill('a') }).success).toBe(false);
  });

  it('exige des captures ou un extrait de configuration, 4 captures au plus, alt de 10 caractères', () => {
    const { configExcerpt: _omit, ...noExcerpt } = valid();
    expect(schema.safeParse(noExcerpt).success).toBe(false);
    const shot = (alt: string) => ({ src: './a.webp', alt });
    expect(
      schema.safeParse({ ...noExcerpt, screenshots: [shot('Liste des flux produits')] }).success,
    ).toBe(true);
    expect(schema.safeParse({ ...noExcerpt, screenshots: [shot('court')] }).success).toBe(false);
    expect(
      schema.safeParse({ ...noExcerpt, screenshots: Array(5).fill(shot('Texte alternatif ok')) })
        .success,
    ).toBe(false);
  });

  it('refuse un plugin à la fois requis et complémentaire', () => {
    expect(schema.safeParse({ ...valid(), requires: ['a'], complements: ['a'] }).success).toBe(
      false,
    );
  });

  it('refuse une donnée personnelle dans l’accroche', () => {
    expect(schema.safeParse({ ...valid(), tagline: 'Appelez le 06 12 34 56 78' }).success).toBe(
      false,
    );
  });

  it('valide les dépendances externes au format vendor/paquet', () => {
    expect(
      schema.safeParse({ ...valid(), externalRequires: ['sylius/invoicing-plugin'] }).success,
    ).toBe(true);
    expect(schema.safeParse({ ...valid(), externalRequires: ['Invalide'] }).success).toBe(false);
  });
});
