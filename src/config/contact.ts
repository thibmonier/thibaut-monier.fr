import { z } from 'astro/zod';
import { httpsUrl } from '../content/schemas/common.ts';
import { MOTIFS } from '../lib/contact.ts';

const motifLabels = { mission: 'Mission', poste: 'Poste', autre: 'Autre' } as const;

// Variables vides ou absentes = fonctionnalité désactivée avec repli (pas d'échec de build).
const optional = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

const contactSchema = z.strictObject({
  motifs: z.array(z.strictObject({ id: z.enum(MOTIFS), label: z.string().min(1) })).length(3),
  web3formsKey: z.string().min(1).optional(),
  rdvUrl: httpsUrl.optional(),
  rdvLabel: z.string().min(1),
  // Adresse e-mail publique de repli : à fournir par le PO (aucune valeur inventée).
  fallbackEmail: z.email().optional(),
});

export type ContactConfig = z.infer<typeof contactSchema>;

export function buildContactConfig(env: Record<string, unknown>): ContactConfig {
  return contactSchema.parse({
    motifs: MOTIFS.map((id) => ({ id, label: motifLabels[id] })),
    web3formsKey: optional(env.PUBLIC_WEB3FORMS_KEY),
    rdvUrl: optional(env.PUBLIC_CALENDLY_URL),
    rdvLabel: 'Réserver un créneau de 30 min',
    fallbackEmail: undefined,
  });
}

export const contact = buildContactConfig(import.meta.env);
