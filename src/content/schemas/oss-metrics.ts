import { z } from 'astro/zod';

// Contrat de src/data/oss-metrics.json (content-model.md §3.8, ADR-0006). Aucune métrique
// n'est obligatoire : le build lit ce fichier sans réseau et masque ce qui manque.
const count = z.number().int().nonnegative();

const metric = z.strictObject({
  fetchedAt: z.coerce.date(),
  github: z
    .strictObject({
      stars: count,
      pushedAt: z.coerce.date(),
      latestRelease: z.strictObject({ tag: z.string(), publishedAt: z.coerce.date() }).nullable(),
    })
    .optional(),
  packagist: z
    .strictObject({ downloadsTotal: count, downloadsMonthly: count, latestVersion: z.string() })
    .optional(),
});

export const ossMetricsSchema = z.strictObject({
  generatedAt: z.coerce.date(),
  entries: z.record(z.string().regex(/^[\w.-]+\/[\w.-]+$/), metric), // « owner/repo »
});

export type OssMetrics = z.infer<typeof ossMetricsSchema>;
export type OssMetric = z.infer<typeof metric>;
