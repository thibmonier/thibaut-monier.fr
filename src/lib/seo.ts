const MAX_TITLE = 60;

// Titre de page : « Page — Site », sans doublon du nom du site. Le suffixe n'est ajouté que s'il tient dans
// 60 caractères ; sinon le titre seul, tronqué à 60 caractères au besoin (écart E2).
export function buildTitle(pageTitle: string, siteName: string): string {
  const suffixed = pageTitle.includes(siteName) ? pageTitle : `${pageTitle} — ${siteName}`;
  const title = suffixed.length <= MAX_TITLE ? suffixed : pageTitle;
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
  /** Image de partage (URL absolue) et son texte alternatif. */
  image?: { url: string; alt: string };
}

export interface MetaTag {
  property: string;
  content: string;
}

export function buildOpenGraph(input: OpenGraphInput): MetaTag[] {
  const tags: MetaTag[] = [
    { property: 'og:title', content: input.title },
    { property: 'og:description', content: input.description },
    { property: 'og:url', content: input.url },
    { property: 'og:site_name', content: input.siteName },
    { property: 'og:locale', content: input.locale },
    { property: 'og:type', content: input.type ?? 'website' },
  ];
  if (input.image) {
    tags.push(
      { property: 'og:image', content: input.image.url },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: input.image.alt },
    );
  }
  return tags;
}

export interface NameTag {
  name: string;
  content: string;
}

export function buildTwitterCard(input: {
  title: string;
  description: string;
  image: string;
}): NameTag[] {
  return [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: input.title },
    { name: 'twitter:description', content: input.description },
    { name: 'twitter:image', content: input.image },
  ];
}
