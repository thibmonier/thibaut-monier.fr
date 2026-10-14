export interface NavItem {
  id: string;
  href: string;
  label: string;
  enabled: boolean;
}

const withTrailingSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

// Vrai pour l'URL exacte et ses sous-chemins ; l'accueil n'est actif que sur « / ».
export function isActive(currentPath: string, href: string): boolean {
  const current = withTrailingSlash(currentPath);
  const target = withTrailingSlash(href);
  return target === '/' ? current === '/' : current.startsWith(target);
}

export function enabledItems<T extends NavItem>(items: readonly T[]): T[] {
  return items.filter((item) => item.enabled);
}
