const MAX_TITLE = 60;

// Titre de page : « Page — Site », sans doublon du nom du site, tronqué à 60 caractères.
export function buildTitle(pageTitle: string, siteName: string): string {
  const title = pageTitle.includes(siteName) ? pageTitle : `${pageTitle} — ${siteName}`;
  return title.length <= MAX_TITLE ? title : `${title.slice(0, MAX_TITLE - 1).trimEnd()}…`;
}

// URL canonique absolue : sans requête ni fragment, avec barre finale sauf pour un fichier (rss.xml).
export function canonicalUrl(pathname: string, site: string | URL): string {
  const url = new URL(pathname, site);
  const last = url.pathname.split('/').pop() ?? '';
  const path = last.includes('.') || url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  return new URL(path, url.origin).href;
}

export interface OpenGraphInput {
  title: string;
  description: string;
  url: string;
  siteName: string;
  locale: string;
  type?: string;
}

export interface MetaTag {
  property: string;
  content: string;
}

export function buildOpenGraph(input: OpenGraphInput): MetaTag[] {
  return [
    { property: 'og:title', content: input.title },
    { property: 'og:description', content: input.description },
    { property: 'og:url', content: input.url },
    { property: 'og:site_name', content: input.siteName },
    { property: 'og:locale', content: input.locale },
    { property: 'og:type', content: input.type ?? 'website' },
  ];
}
