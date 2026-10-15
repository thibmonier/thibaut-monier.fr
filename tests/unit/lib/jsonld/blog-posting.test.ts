import { describe, expect, it } from 'vitest';
import { buildBlogPosting } from '../../../../src/lib/jsonld/blog-posting.ts';
import type { ArticleMeta } from '../../../../src/lib/page-meta.ts';

const SITE = 'https://thibaut-monier.fr';
const article: ArticleMeta = {
  slug: 'la-spec',
  publishedAt: new Date('2026-09-22T00:00:00Z'),
  category: 'Méthode',
  tags: ['IA', 'Spec'],
  wordCount: 1500,
};
const input = {
  headline: 'La spec est le nouveau code',
  description: 'Pourquoi la spécification devient le livrable principal.',
  image: '/og/blog-la-spec.png',
  article,
  author: { name: 'Thibaut Monier', path: '/parcours/' },
};

describe('buildBlogPosting', () => {
  const post = buildBlogPosting(input, SITE);

  it('renseigne les propriétés attendues', () => {
    expect(post).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'La spec est le nouveau code',
      datePublished: '2026-09-22T00:00:00.000Z',
      dateModified: '2026-09-22T00:00:00.000Z',
      author: {
        '@type': 'Person',
        name: 'Thibaut Monier',
        url: 'https://thibaut-monier.fr/parcours/',
      },
      image: 'https://thibaut-monier.fr/og/blog-la-spec.png',
      keywords: 'IA, Spec',
      articleSection: 'Méthode',
      wordCount: 1500,
      inLanguage: 'fr',
      mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://thibaut-monier.fr/blog/la-spec/' },
    });
  });

  it('dateModified vaut updatedAt quand il existe', () => {
    const updated = buildBlogPosting(
      { ...input, article: { ...article, updatedAt: new Date('2026-10-01T00:00:00Z') } },
      SITE,
    );
    expect(updated['dateModified']).toBe('2026-10-01T00:00:00.000Z');
  });

  it('garde une image déjà absolue', () => {
    const post2 = buildBlogPosting({ ...input, image: 'https://cdn.exemple.fr/a.png' }, SITE);
    expect(post2['image']).toBe('https://cdn.exemple.fr/a.png');
  });

  it('reste sous 5 Ko', () => {
    expect(JSON.stringify(post).length).toBeLessThan(5000);
  });
});
