import { z } from 'astro/zod';
import { httpsUrl, safeText, slug } from './common.ts';
import { domain } from './skills.ts';

// Réalisations (US-006, modèle de contenu §3.2) : `src/data/cv/achievements.yaml`, loader `file()`.
// `clients` vide = « Référence confidentielle » (arbitrage E12) ; `year` = année de fin ou de livraison.
export const achievementSchema = z.strictObject({
  id: slug,
  title: safeText.min(1).max(120),
  domains: z.array(domain).min(1),
  clients: z.array(safeText.min(1)).default([]),
  year: z.number().int().min(2000).max(2100),
  proofUrl: httpsUrl.optional(),
  experienceId: slug.optional(),
  skills: z.array(slug).default([]),
});

export type Achievement = z.infer<typeof achievementSchema>;
