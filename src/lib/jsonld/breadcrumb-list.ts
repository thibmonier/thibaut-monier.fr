import { absoluteUrl } from '../site-url.ts';
import type { JsonLdObject, Site } from './types.ts';

export function buildBreadcrumbList(
  crumbs: { name: string; path: string }[],
  site?: Site,
): JsonLdObject {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path, site),
    })),
  };
}
