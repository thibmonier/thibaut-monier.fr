import { z } from 'astro/zod';
import { httpsUrl, safeText } from './common.ts';

// Contrat C1 : schéma de la collection `blog`. Lecteur unique : ce fichier (voir tasks/README.md).
export const BLOG_CATEGORIES = ['Business', 'Méthode', 'Métiers', 'Outils', 'Pilotage'] as const;
export const MAX_SEO_TITLE = 60;
const ORIGINAL_HOST = 'agentic-agency.fr';

const faqEntry = z.strictObject({ question: safeText.min(1), answer: safeText.min(1) });

const originalUrl = httpsUrl.refine((value) => new URL(value).hostname === ORIGINAL_HOST, {
  message: `originalUrl doit être une URL https de ${ORIGINAL_HOST}`,
});

/** Le champ `image` est injecté (`image()` d'Astro en collection, `z.string()` en test), comme `createProjectSchema`. */
export function createBlogSchema(image: z.ZodType) {
  return z
    .strictObject({
      title: safeText.min(1).max(100), // maximum relevé dans la source : 86
      seoTitle: safeText.min(20).max(MAX_SEO_TITLE).optional(), // <title> ; obligatoire si title > 60 caractères
      description: safeText.min(50).max(160), // meta description et extrait
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.literal('Thibaut Monier').default('Thibaut Monier'),
      image: image.optional(),
      imageAlt: safeText.min(1).optional(),
      excerpt: safeText.optional(), // sinon description (RSS)
      tags: z.array(safeText.min(1)).default([]),
      category: z.enum(BLOG_CATEGORIES),
      series: safeText.optional(),
      seriesOrder: z.number().int().positive().optional(),
      draft: z.boolean().default(false),
      validated: z.boolean().default(false), // validation du PO du lot d'articles (écart E22)
      faq: z.array(faqEntry).min(1).optional(),
      originalUrl: originalUrl.optional(),
      originalPublishedAt: z.coerce.date().optional(),
    })
    .superRefine((post, ctx) => {
      const need = (present: boolean, field: string, message: string) => {
        if (!present) ctx.addIssue({ code: 'custom', path: [field], message });
      };
      need(
        post.title.length <= MAX_SEO_TITLE || post.seoTitle !== undefined,
        'seoTitle',
        `seoTitle requis quand title dépasse ${MAX_SEO_TITLE} caractères`,
      );
      need(
        post.image === undefined || post.imageAlt !== undefined,
        'imageAlt',
        'imageAlt requis avec image',
      );
      need(
        post.imageAlt === undefined || post.image !== undefined,
        'image',
        'image requise avec imageAlt',
      );
      need(
        post.series === undefined || post.seriesOrder !== undefined,
        'seriesOrder',
        'seriesOrder requis avec series',
      );
      need(
        post.seriesOrder === undefined || post.series !== undefined,
        'series',
        'series requis avec seriesOrder',
      );
      need(
        post.originalUrl === undefined || post.originalPublishedAt !== undefined,
        'originalPublishedAt',
        'originalPublishedAt requis avec originalUrl',
      );
      need(
        post.updatedDate === undefined || post.updatedDate >= post.pubDate,
        'updatedDate',
        'updatedDate ne peut pas précéder pubDate',
      );
    });
}

export type BlogData = z.infer<ReturnType<typeof createBlogSchema>>;
