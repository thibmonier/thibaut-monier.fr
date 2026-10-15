import type { Crumb } from './page-meta.ts';

// Segments qui ont une page : seuls ceux-là deviennent des maillons. `/blog/categorie/` ou
// `/open-source/sylius/` n'en ont pas : ils sont ignorés. Le libellé d'une catégorie ne se déduit pas
// du chemin : les pages du blog passent leur fil d'Ariane explicite (contrat C5).
const KNOWN: Record<string, string> = {
  '/parcours/': 'Parcours',
  '/competences/': 'Compétences',
  '/open-source/': 'Open source',
  '/contact/': 'Contact',
  '/mentions-legales/': 'Mentions légales',
  '/vie-privee/': 'Vie privée',
  '/blog/': 'Blog',
  '/recherche/': 'Recherche',
};

/** Fil d'Ariane dérivé du chemin ; le dernier maillon est la page courante (sans `href`). */
export function deriveBreadcrumb(pathname: string, title: string): Crumb[] {
  if (pathname === '/') return [{ label: 'Accueil' }];
  const segments = pathname.split('/').filter(Boolean);
  const trail: Crumb[] = [{ label: 'Accueil', href: '/' }];
  for (let depth = 1; depth < segments.length; depth += 1) {
    const prefix = `/${segments.slice(0, depth).join('/')}/`;
    const label = KNOWN[prefix];
    if (label) trail.push({ label, href: prefix });
  }
  trail.push({ label: title });
  return trail;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** Maillons du JSON-LD : le dernier pointe vers la page courante ; un maillon intermédiaire sans lien est retiré. */
export function toBreadcrumbItems(crumbs: Crumb[], currentPath: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  crumbs.forEach((crumb, index) => {
    const last = index === crumbs.length - 1;
    const path = crumb.href ?? (last ? currentPath : undefined);
    if (path !== undefined) items.push({ name: crumb.label, path });
  });
  return items;
}
