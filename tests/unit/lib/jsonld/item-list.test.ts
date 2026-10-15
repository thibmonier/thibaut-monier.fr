import { describe, expect, it } from 'vitest';
import { buildItemList } from '../../../../src/lib/jsonld/item-list.ts';

describe('buildItemList', () => {
  it('numérote les éléments à partir de 1 avec des URL absolues', () => {
    const list = buildItemList(
      [
        { name: 'A', path: '/open-source/sylius/a/' },
        { name: 'B', path: '/open-source/sylius/b/' },
      ],
      'https://thibaut-monier.fr',
    );
    expect(list).toEqual({
      '@type': 'ItemList',
      numberOfItems: 2,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'A',
          url: 'https://thibaut-monier.fr/open-source/sylius/a/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'B',
          url: 'https://thibaut-monier.fr/open-source/sylius/b/',
        },
      ],
    });
  });
});
