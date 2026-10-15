import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { createBlogSchema } from '../../../src/content/schemas/blog.ts';

const schema = createBlogSchema(z.string());

const valid = {
  title: 'La spec est le nouveau code',
  description:
    'Pourquoi la spécification devient l’artefact principal quand un agent écrit le code à votre place.',
  pubDate: '2026-09-22',
  category: 'Méthode',
};

const fields = (input: unknown) =>
  schema.safeParse(input).error?.issues.map((issue) => String(issue.path[0])) ?? [];
const messages = (input: unknown) =>
  schema.safeParse(input).error?.issues.map((issue) => issue.message) ?? [];

describe('schéma blog (contrat C1)', () => {
  it('accepte un frontmatter minimal et applique les valeurs par défaut', () => {
    const parsed = schema.parse(valid);
    expect(parsed.author).toBe('Thibaut Monier');
    expect(parsed.draft).toBe(false);
    expect(parsed.validated).toBe(false);
    expect(parsed.tags).toEqual([]);
    expect(parsed.pubDate).toBeInstanceOf(Date);
  });

  it('refuse les champs inconnus (strictObject)', () => {
    expect(schema.safeParse({ ...valid, toolsMentioned: ['x'] }).success).toBe(false);
  });

  describe('title', () => {
    it('accepte de 1 à 100 caractères', () => {
      expect(schema.safeParse({ ...valid, title: 'A' }).success).toBe(true);
      const title = 'T'.repeat(100);
      expect(
        schema.safeParse({ ...valid, title, seoTitle: 'Titre pour le moteur de recherche' })
          .success,
      ).toBe(true);
    });
    it('refuse vide ou au-delà de 100 caractères', () => {
      expect(fields({ ...valid, title: '' })).toContain('title');
      expect(
        fields({ ...valid, title: 'T'.repeat(101), seoTitle: 'Titre pour le moteur de recherche' }),
      ).toContain('title');
    });
    it('refuse une donnée personnelle (safeText)', () => {
      expect(messages({ ...valid, title: 'Appelez le 06 12 34 56 78' }).join()).toContain(
        'Donnée personnelle',
      );
    });
  });

  describe('description', () => {
    it('accepte de 50 à 160 caractères', () => {
      expect(schema.safeParse({ ...valid, description: 'd'.repeat(50) }).success).toBe(true);
      expect(schema.safeParse({ ...valid, description: 'd'.repeat(160) }).success).toBe(true);
    });
    it('refuse 49 et 161 caractères', () => {
      expect(fields({ ...valid, description: 'd'.repeat(49) })).toContain('description');
      expect(fields({ ...valid, description: 'd'.repeat(161) })).toContain('description');
    });
  });

  describe('category', () => {
    it.each(['Business', 'Méthode', 'Métiers', 'Outils', 'Pilotage'])('accepte %s', (category) => {
      expect(schema.safeParse({ ...valid, category }).success).toBe(true);
    });
    it('refuse une catégorie inconnue en citant le champ fautif', () => {
      expect(fields({ ...valid, category: 'Divers' })).toEqual(['category']);
      expect(fields({ ...valid, category: 'Methode' })).toEqual(['category']);
    });
  });

  describe('seoTitle', () => {
    const seoTitle = 'La spec, nouveau code des agents';
    it('est obligatoire quand title dépasse 60 caractères', () => {
      const title = 'T'.repeat(61);
      expect(fields({ ...valid, title })).toEqual(['seoTitle']);
      expect(schema.safeParse({ ...valid, title, seoTitle }).success).toBe(true);
    });
    it('est facultatif jusqu’à 60 caractères', () => {
      expect(schema.safeParse({ ...valid, title: 'T'.repeat(60) }).success).toBe(true);
    });
    it('compte de 20 à 60 caractères', () => {
      expect(fields({ ...valid, seoTitle: 's'.repeat(19) })).toContain('seoTitle');
      expect(fields({ ...valid, seoTitle: 's'.repeat(61) })).toContain('seoTitle');
      expect(schema.safeParse({ ...valid, seoTitle: 's'.repeat(20) }).success).toBe(true);
      expect(schema.safeParse({ ...valid, seoTitle: 's'.repeat(60) }).success).toBe(true);
    });
  });

  describe('image et imageAlt (ensemble, ou aucun des deux)', () => {
    it('accepte les deux ou aucun', () => {
      expect(
        schema.safeParse({ ...valid, image: 'cover.webp', imageAlt: 'Un schéma de la boucle' })
          .success,
      ).toBe(true);
      expect(schema.safeParse(valid).success).toBe(true);
    });
    it('refuse image sans imageAlt', () => {
      expect(fields({ ...valid, image: 'cover.webp' })).toEqual(['imageAlt']);
    });
    it('refuse imageAlt sans image', () => {
      expect(fields({ ...valid, imageAlt: 'Un schéma' })).toEqual(['image']);
    });
  });

  describe('series et seriesOrder (ensemble)', () => {
    it('accepte les deux avec un entier ≥ 1', () => {
      expect(schema.safeParse({ ...valid, series: 'Agentic', seriesOrder: 1 }).success).toBe(true);
    });
    it('refuse series sans seriesOrder, et inversement', () => {
      expect(fields({ ...valid, series: 'Agentic' })).toEqual(['seriesOrder']);
      expect(fields({ ...valid, seriesOrder: 2 })).toEqual(['series']);
    });
    it.each([0, -1, 1.5])('refuse seriesOrder = %s', (seriesOrder) => {
      expect(fields({ ...valid, series: 'Agentic', seriesOrder })).toContain('seriesOrder');
    });
  });

  describe('originalUrl et originalPublishedAt', () => {
    const origin = 'https://agentic-agency.fr/blog/la-spec-est-le-nouveau-code';
    it('accepte une URL https d’agentic-agency.fr avec la date de première publication', () => {
      expect(
        schema.safeParse({ ...valid, originalUrl: origin, originalPublishedAt: '2026-09-20' })
          .success,
      ).toBe(true);
    });
    it('refuse originalUrl sans originalPublishedAt', () => {
      expect(fields({ ...valid, originalUrl: origin })).toEqual(['originalPublishedAt']);
    });
    it('refuse un autre domaine ou http', () => {
      expect(
        fields({
          ...valid,
          originalUrl: 'https://exemple.fr/x',
          originalPublishedAt: '2026-09-20',
        }),
      ).toEqual(['originalUrl']);
      expect(
        fields({
          ...valid,
          originalUrl: 'http://agentic-agency.fr/x',
          originalPublishedAt: '2026-09-20',
        }),
      ).toEqual(['originalUrl']);
    });
  });

  describe('updatedDate', () => {
    it('accepte la même date ou une date postérieure', () => {
      expect(schema.safeParse({ ...valid, updatedDate: '2026-09-22' }).success).toBe(true);
      expect(schema.safeParse({ ...valid, updatedDate: '2026-10-01' }).success).toBe(true);
    });
    it('refuse une date antérieure à pubDate', () => {
      expect(fields({ ...valid, updatedDate: '2026-09-21' })).toEqual(['updatedDate']);
    });
  });

  describe('faq', () => {
    const entry = {
      question: 'Faut-il tout spécifier ?',
      answer: 'Non, seulement ce qui engage le résultat.',
    };
    it('accepte au moins une question', () => {
      expect(schema.safeParse({ ...valid, faq: [entry] }).success).toBe(true);
    });
    it('refuse une liste vide et une réponse vide', () => {
      expect(fields({ ...valid, faq: [] })).toContain('faq');
      expect(fields({ ...valid, faq: [{ ...entry, answer: '' }] })).toContain('faq');
    });
    it('refuse une donnée personnelle dans une réponse (safeText)', () => {
      expect(
        messages({ ...valid, faq: [{ ...entry, answer: 'Écrivez au 12 rue de la Paix' }] }).join(),
      ).toContain('Donnée personnelle');
    });
  });

  it('validated vaut false par défaut et accepte true (validation PO)', () => {
    expect(schema.parse(valid).validated).toBe(false);
    expect(schema.parse({ ...valid, validated: true }).validated).toBe(true);
  });

  it('author n’accepte que « Thibaut Monier »', () => {
    expect(fields({ ...valid, author: 'Quelqu’un' })).toEqual(['author']);
  });
});
