import { z } from 'astro/zod';
import { countWords } from '../../lib/text.ts';
import { PROOF_COUNT, invalidProofMessage, isWellFormedProofLink } from '../../lib/proofs.ts';
import { rejectPii, requiredIn, slug } from './common.ts';

const MAX_VALUE_PROP_WORDS = 25;

const field = (name: string) => z.string(requiredIn('home', name));
const text = (name: string) => field(name).min(1).superRefine(rejectPii);

// Contrat du motif de contact (US-008) : valeur transmise par `/contact/?motif=<motif>`.
export const motifs = ['mission', 'poste', 'autre'] as const;

const cta = z.strictObject({
  label: text('ctas.label').max(40),
  motif: z.enum(motifs),
});

const proof = z
  .strictObject({
    id: slug,
    value: text('proofs.value').max(12),
    label: text('proofs.label').max(90),
    link: field('proofs.link'),
    source: text('proofs.source').max(60),
  })
  .superRefine((p, ctx) => {
    if (!isWellFormedProofLink(p.link)) {
      ctx.addIssue({ code: 'custom', path: ['link'], message: invalidProofMessage(p.id) });
    }
  });

const hasUnique = (values: readonly string[]) => new Set(values).size === values.length;

export const homeSchema = z.strictObject({
  name: text('name'),
  headline: text('headline').max(90),
  valueProp: text('valueProp').refine((v) => countWords(v) <= MAX_VALUE_PROP_WORDS, {
    error: (issue) =>
      `valueProp : ${MAX_VALUE_PROP_WORDS} mots maximum (reçu : ${countWords(String(issue.input))})`,
  }),
  availability: text('availability').max(120),
  metaTitle: text('metaTitle').max(60),
  metaDescription: text('metaDescription').max(160),
  ctas: z
    .array(cta, requiredIn('home', 'ctas'))
    .length(2)
    .refine((items) => hasUnique(items.map((c) => c.motif)), 'ctas : motifs distincts requis'),
  proofs: z
    .array(proof, requiredIn('home', 'proofs'))
    .length(PROOF_COUNT)
    .refine((items) => hasUnique(items.map((p) => p.id)), 'proofs : identifiants uniques requis'),
});

export type Home = z.infer<typeof homeSchema>;
