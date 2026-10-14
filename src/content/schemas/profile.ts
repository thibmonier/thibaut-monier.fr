import { z } from 'astro/zod';
import { httpsUrl, safeText } from './common.ts';

// Contenu public du CV (US-007, modèle de contenu §3.2). `strictObject` : une clé inconnue (phone, age...)
// fait échouer le build ; `safeText` applique la liste blanche de données personnelles (arbitrage A1).
export const profileLinkKinds = ['linkedin', 'github', 'packagist', 'rss'] as const;

export const profileSchema = z.strictObject({
  name: z.literal('Thibaut Monier'),
  title: z.string().min(1).max(80),
  tagline: safeText.min(1).max(240),
  summary: safeText.min(1).max(600),
  email: z.email().optional(), // adresse publique dédiée uniquement (non reprise dans le PDF, voir cv-pdf.md)
  links: z.array(z.strictObject({ kind: z.enum(profileLinkKinds), url: httpsUrl })).default([]),
});

export type Profile = z.infer<typeof profileSchema>;
