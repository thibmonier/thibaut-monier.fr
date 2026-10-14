import { z } from 'astro/zod';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

// Jetons de design partagés avec Typst (ADR-0005, US-007) : chaque couleur existe en clair et en sombre.
export const tokensSchema = z.strictObject({
  color: z.record(z.string().regex(/^[a-z][a-z0-9-]*$/), z.strictObject({ light: hex, dark: hex })),
  font: z.strictObject({ sans: z.string().min(1), mono: z.string().min(1) }),
  space: z.record(z.string().regex(/^[a-z0-9-]+$/), z.string().min(1)),
});

export type Tokens = z.infer<typeof tokensSchema>;
