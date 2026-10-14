import { z } from 'astro/zod';
import { rejectPii, requiredIn, safeText, slug } from './common.ts';

const MIN_FEATURED_ACHIEVEMENTS = 2;
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const required = (name: string) => requiredIn('experiences', name);
const text = (name: string) => z.string(required(name)).min(1);
const period = (name: string) => z.string(required(name)).regex(YEAR_MONTH);

// Contrat du modèle de contenu §3.1 : `strictObject` (une clé inconnue comme `phone` échoue) et liste blanche
// `safeText` sur tous les textes publiés. Aucun champ téléphone, adresse, âge ou naissance.
export const experienceSchema = z
  .strictObject({
    company: text('company'),
    role: text('role'),
    start: period('start'),
    end: period('end').nullable().default(null), // null = poste en cours
    location: z.string().max(40).optional(), // ville ou « remote », jamais d'adresse
    context: text('context').max(280).superRefine(rejectPii),
    achievements: z.array(safeText.max(300), required('achievements')).min(1).max(8),
    skills: z.array(slug).default([]),
    featured: z.boolean(required('featured')),
    summaryOnly: safeText.max(160).optional(), // bloc « Avant 2016 »
    clientsCited: z.boolean().default(false), // accord de citation des clients
    order: z.number().int().optional(), // départage deux postes terminés à la même date
  })
  .refine((e) => !e.end || e.end >= e.start, { path: ['end'], message: 'end précède start' })
  .refine((e) => e.featured || Boolean(e.summaryOnly), {
    path: ['summaryOnly'],
    message: 'summaryOnly requis si non featured',
  })
  .refine((e) => !e.featured || e.achievements.length >= MIN_FEATURED_ACHIEVEMENTS, {
    path: ['achievements'],
    message: `au moins ${MIN_FEATURED_ACHIEVEMENTS} réalisations pour une expérience featured`,
  });

export type Experience = z.infer<typeof experienceSchema>;
