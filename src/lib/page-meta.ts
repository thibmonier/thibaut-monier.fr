// Contrat C5 : métadonnées de page échangées entre `ArticleLayout` (lot A, fournit) et `Seo.astro` (lot B,
// consomme) via les props de `BaseLayout`. Types seulement, sans comportement : les workers ne modifient
// pas ce fichier (demande à l'orchestrateur).

/** Un maillon du fil d'Ariane ; le dernier (page courante) n'a pas de `href`. */
export interface Crumb {
  label: string;
  href?: string;
}

export interface ArticleMeta {
  slug: string;
  publishedAt: Date;
  updatedAt?: Date;
  category: string;
  tags: string[];
  wordCount: number;
  /** `src` absolue ou chemin : normalisé par `Seo` (via `absoluteUrl`). */
  image?: { src: string; alt: string };
  faq?: { question: string; answer: string }[];
}

export type OgType = 'website' | 'article' | 'profile';

/**
 * Props que `BaseLayout` accepte en plus de `title`, `description`, `noindex` et `canonical`.
 * Fil d'Ariane : explicite si fourni, sinon dérivé du chemin par `src/lib/breadcrumb.ts` (lot B).
 * Le libellé d'une catégorie ou d'une série ne se déduit pas du chemin (`methode` -> « Méthode ») :
 * les pages du blog (lot A) passent TOUJOURS `breadcrumb` explicite.
 */
export interface PageMetaProps {
  ogType?: OgType;
  article?: ArticleMeta;
  breadcrumb?: Crumb[];
}
