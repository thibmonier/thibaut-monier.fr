import { z } from 'astro/zod';
import { THEMES } from '../../lib/plugins.ts';
import { repoRef, safeText, slug } from './common.ts';

// Les messages d'erreur sont assemblés avec le slug du plugin par `formatPluginIssue` (src/lib/plugins.ts).
const required = {
  error: (issue: { input?: unknown }) => (issue.input === undefined ? 'est requis' : undefined),
};
const text = z.string(required).min(1, 'est requis');

export const PLUGIN_STATUSES = ['released', 'design'] as const;
export type PluginStatus = (typeof PLUGIN_STATUSES)[number];

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
  // `design` : plugin en conception, rien de livré (pas d'installation ni de matrice de compatibilité).
  status: z.enum(PLUGIN_STATUSES).default('released'),
  // Plugin installé dans la démo en ligne : la fiche affiche le lien « Voir dans la démo » (src/config/demo.ts).
  inDemo: z.boolean().default(false),
};

const matrixRow = z.strictObject({
  sylius: text,
  php: text,
  symfony: z.array(z.string().min(1), required).min(1, 'est requis'),
});

// Partie 2 (US-020) : contenu de la fiche. Le corps MDX porte le problème résolu.
export const pluginExtensionShape = <I extends z.ZodType>(image: () => I) => ({
  features: z.array(safeText.max(200), required).min(5).max(8),
  // Facultatives pour un plugin en conception ; exigées sinon (voir `createPluginSchema`).
  compatibility: z
    .strictObject(
      {
        matrix: z.array(matrixRow, required).min(1, 'est requis'),
        databases: z.array(z.enum(['mysql', 'mariadb', 'postgresql']), required).min(1),
      },
      required,
    )
    .optional(),
  requires: z.array(slug).default([]), // `require` Composer entre plugins
  complements: z.array(slug).default([]), // `suggest` Composer entre plugins
  externalRequires: z.array(z.string().regex(PACKAGE)).default([]), // E6
  installSteps: z.array(z.string().min(1), required).max(8).default([]),
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
    .superRefine((p, ctx) => {
      const issue = (path: string, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message });
      if (p.status === 'design') {
        if (p.compatibility) issue('compatibility', 'est sans objet pour un plugin en conception');
        if (p.installSteps.length > 0)
          issue('installSteps', 'est sans objet pour un plugin en conception');
        if (p.packagist) issue('packagist', 'est sans objet pour un plugin en conception');
        if (p.inDemo) issue('inDemo', 'est incompatible avec un plugin en conception');
        return;
      }
      if (!p.compatibility) issue('compatibility', 'est requis');
      if (p.installSteps.length < 2) issue('installSteps', 'doit compter 2 étapes au moins');
      if (p.screenshots.length === 0 && !p.configExcerpt) {
        issue('screenshots', 'ou configExcerpt est requis');
      }
    });
}
