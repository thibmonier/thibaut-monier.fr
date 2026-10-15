import { postPath } from '../blog.ts';
import type { ArticleMeta } from '../page-meta.ts';
import { absoluteUrl } from '../site-url.ts';
import type { JsonLdObject, Site } from './types.ts';

export interface BlogPostingInput {
  headline: string;
  description: string;
  /** Chemin ou URL absolue : le repli sur l'image Open Graph est décidé par l'appelant (`Seo`). */
  image: string;
  article: ArticleMeta;
  author: { name: string; path: string };
}

const isAbsolute = (value: string): boolean => /^https?:\/\//i.test(value);

export function buildBlogPosting(input: BlogPostingInput, site?: Site): JsonLdObject {
  const { article } = input;
  return {
    '@type': 'BlogPosting',
    headline: input.headline,
    description: input.description,
    datePublished: article.publishedAt.toISOString(),
    dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: input.author.name,
      url: absoluteUrl(input.author.path, site),
    },
    image: isAbsolute(input.image) ? input.image : absoluteUrl(input.image, site),
    keywords: article.tags.join(', '),
    articleSection: article.category,
    wordCount: article.wordCount,
    inLanguage: 'fr',
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(postPath(article.slug), site) },
  };
}
