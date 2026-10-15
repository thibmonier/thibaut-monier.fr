import { describe, expect, it } from 'vitest';
import { buildOpenGraph, buildTitle, canonicalUrl } from '../../../src/lib/seo.ts';

describe('buildTitle', () => {
  it('suffixe le nom du site', () => {
    expect(buildTitle('Contact', 'Thibaut Monier')).toBe('Contact — Thibaut Monier');
  });

  it('ne suffixe pas deux fois le titre de la 404', () => {
    expect(buildTitle('Page introuvable — Thibaut Monier', 'Thibaut Monier')).toBe(
      'Page introuvable — Thibaut Monier',
    );
  });

  it('ne duplique pas le nom du site', () => {
    expect(buildTitle('Thibaut Monier — direction technique', 'Thibaut Monier')).toBe(
      'Thibaut Monier — direction technique',
    );
  });

  it('ne dépasse jamais 60 caractères', () => {
    const title = buildTitle(
      `Un titre de page beaucoup trop long pour tenir ${'x'.repeat(30)}`,
      'Thibaut Monier',
    );
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith('…')).toBe(true);
  });
});

describe('canonicalUrl', () => {
  it('produit une URL absolue avec barre finale', () => {
    expect(canonicalUrl('/contact', 'https://thibaut-monier.fr')).toBe(
      'https://thibaut-monier.fr/contact/',
    );
    expect(canonicalUrl('/', 'https://thibaut-monier.fr/')).toBe('https://thibaut-monier.fr/');
  });

  it('ignore la requête et le fragment', () => {
    expect(canonicalUrl('/blog/?page=2#haut', 'https://thibaut-monier.fr')).toBe(
      'https://thibaut-monier.fr/blog/',
    );
  });

  it('laisse intacts les chemins de fichiers', () => {
    expect(canonicalUrl('/rss.xml', 'https://thibaut-monier.fr')).toBe(
      'https://thibaut-monier.fr/rss.xml',
    );
  });
});

describe('buildOpenGraph', () => {
  const og = buildOpenGraph({
    title: 'Contact — Thibaut Monier',
    description: 'Me contacter.',
    url: 'https://thibaut-monier.fr/contact/',
    siteName: 'Thibaut Monier',
    locale: 'fr_FR',
  });
  const get = (property: string) => og.find((tag) => tag.property === property)?.content;

  it('fournit les propriétés Open Graph de base', () => {
    expect(get('og:title')).toBe('Contact — Thibaut Monier');
    expect(get('og:description')).toBe('Me contacter.');
    expect(get('og:url')).toBe('https://thibaut-monier.fr/contact/');
    expect(get('og:site_name')).toBe('Thibaut Monier');
    expect(get('og:locale')).toBe('fr_FR');
    expect(get('og:type')).toBe('website');
  });
});

describe('buildTitle : suffixe seulement s’il tient dans 60 caractères', () => {
  it('omet le suffixe quand le titre seul tient mais pas avec le suffixe', () => {
    const title = 'x'.repeat(50);
    expect(buildTitle(title, 'Thibaut Monier')).toBe(title);
  });

  it('ajoute le suffixe quand l’ensemble tient', () => {
    expect(buildTitle('Contact', 'Thibaut Monier')).toBe('Contact — Thibaut Monier');
  });
});

describe('buildOpenGraph : image', () => {
  it('ajoute les propriétés de l’image quand elle est fournie', () => {
    const og = buildOpenGraph({
      title: 'T',
      description: 'D',
      url: 'https://x.fr/a/',
      siteName: 'S',
      locale: 'fr_FR',
      image: { url: 'https://x.fr/og/a.png', alt: 'Texte alternatif' },
    });
    const get = (property: string) => og.find((tag) => tag.property === property)?.content;
    expect(get('og:image')).toBe('https://x.fr/og/a.png');
    expect(get('og:image:width')).toBe('1200');
    expect(get('og:image:height')).toBe('630');
    expect(get('og:image:alt')).toBe('Texte alternatif');
  });
});
