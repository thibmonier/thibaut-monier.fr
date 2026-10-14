import { z } from 'astro/zod';
import { detectPii } from '../../lib/privacy.ts';

export const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const httpsUrl = z.url({ protocol: /^https$/ });
export const repoRef = z.strictObject({ owner: z.string().min(1), name: z.string().min(1) });

// Contrôle de liste blanche : téléphone, âge, naissance, adresse (arbitrage A1).
export function rejectPii(value: string, ctx: z.RefinementCtx): void {
  for (const type of detectPii(value)) {
    ctx.addIssue({ code: 'custom', message: `Donnée personnelle interdite détectée : ${type}` });
  }
}

export const safeText = z.string().superRefine(rejectPii);

// Message d'erreur de champ manquant, en français, citant le champ et la collection.
export const requiredIn = (collection: string, field: string) => ({
  error: (issue: { input?: unknown }) =>
    issue.input === undefined
      ? `Champ '${field}' requis dans la collection ${collection}`
      : undefined,
});
