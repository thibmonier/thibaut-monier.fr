import { z } from 'astro/zod';
import { DOMAIN_IDS } from '../../lib/filters.ts';
import { slug } from './common.ts';

// Domaine hors liste : message en français qui cite la valeur fautive et les valeurs permises.
export const domain = z.enum(DOMAIN_IDS, {
  error: (issue) => `Domaine « ${String(issue.input)} » hors liste (${DOMAIN_IDS.join(', ')})`,
});

// Compétences (US-006, modèle de contenu §3.2) : `src/data/cv/skills.yaml`, loader `file()`.
export const skillSchema = z.strictObject({
  id: slug,
  label: z.string().min(1).max(80),
  domain,
  level: z.enum(['expert', 'avance', 'pratique']).optional(),
});

export type Skill = z.infer<typeof skillSchema>;
