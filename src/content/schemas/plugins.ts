import { z } from 'astro/zod';
import { THEMES } from '../../lib/plugins.ts';
import { repoRef, safeText, slug } from './common.ts';

// Les messages d'erreur sont assemblés avec le slug du plugin par `formatPluginIssue` (src/lib/plugins.ts).
const required = {
  error: (issue: { input?: unknown }) => (issue.input === undefined ? 'est requis' : undefined),
};
const text = z.string(required).min(1, 'est requis');

const MAX_SCREENSHOTS = 4; // E17 : 4 captures au plus par fiche
const PACKAGE = /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/;

// Partie 1 (US-019) : noyau lu par le catalogue.
export const pluginCoreShape = {
  name: text,
  tagline: safeText.min(1, 'est requis').max(140, 'ne doit pas dépasser 140 caractères'),
  theme: z.enum(THEMES, {
    error: `doit valoir ${THEMES.slice(0, -1).join(', ')} ou ${THEMES.at(-1)}`,
  }),
  repo: repoRef,
  // Absent tant que le paquet n'est pas publié sur Packagist (agentic-feeds, E20).
  packagist: z.string().regex(PACKAGE).optional(),
  license: z.string().default('MIT'),
  draft: z.boolean().default(false),
};

const matrixRow = z.strictObject({
  sylius: text,
  php: text,
  symfony: z.array(z.string().min(1), required).min(1, 'est requis'),
});

// Partie 2 (US-020) : contenu de la fiche. Le corps MDX porte le problème résolu.
export const pluginExtensionShape = <I extends z.ZodType>(image: () => I) => ({
  features: z.array(safeText.max(200), required).min(5).max(8),
  compatibility: z.strictObject(
    {
      matrix: z.array(matrixRow, required).min(1, 'est requis'),
      databases: z.array(z.enum(['mysql', 'mariadb', 'postgresql']), required).min(1),
    },
    required,
  ),
  requires: z.array(slug).default([]), // `require` Composer entre plugins
  complements: z.array(slug).default([]), // `suggest` Composer entre plugins
  externalRequires: z.array(z.string().regex(PACKAGE)).default([]), // E6
  installSteps: z.array(z.string().min(1), required).min(2).max(8),
  screenshots: z
    .array(
      z.strictObject({ src: image(), alt: z.string().min(10, 'alt de 10 caractères au moins') }),
    )
    .max(MAX_SCREENSHOTS)
    .default([]),
  configExcerpt: z.string().max(800).optional(),
});

export function createPluginSchema<I extends z.ZodType>(image: () => I) {
  return z
    .strictObject({ ...pluginCoreShape, ...pluginExtensionShape(image) })
    .refine((p) => !p.requires.some((r) => p.complements.includes(r)), {
      path: ['complements'],
      message: 'requis et complémentaire à la fois',
    })
    .refine((p) => p.screenshots.length > 0 || Boolean(p.configExcerpt), {
      path: ['screenshots'],
      message: 'ou configExcerpt est requis',
    });
}
