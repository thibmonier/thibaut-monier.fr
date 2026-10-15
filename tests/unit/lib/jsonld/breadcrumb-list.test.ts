import { describe, expect, it } from 'vitest';
import { buildBreadcrumbList } from '../../../../src/lib/jsonld/breadcrumb-list.ts';

describe('buildBreadcrumbList', () => {
  it('donne une position et une URL absolue à chaque maillon', () => {
    const list = buildBreadcrumbList(
      [
        { name: 'Accueil', path: '/' },
        { name: 'Contact', path: '/contact/' },
      ],
      'https://thibaut-monier.fr',
    );
    expect(list).toEqual({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://thibaut-monier.fr/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Contact',
          item: 'https://thibaut-monier.fr/contact/',
        },
      ],
    });
  });

  it('accepte l’accueil seul', () => {
    const list = buildBreadcrumbList([{ name: 'Accueil', path: '/' }], 'https://thibaut-monier.fr');
    expect(list['itemListElement']).toHaveLength(1);
  });
});
