import { absoluteUrl } from '../site-url.ts';
import type { JsonLdObject, Site } from './types.ts';

export function buildItemList(items: { name: string; path: string }[], site?: Site): JsonLdObject {
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path, site),
    })),
  };
}
