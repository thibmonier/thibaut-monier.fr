import { z } from 'astro/zod';
import { httpsUrl, requiredIn } from './common.ts';

const field = (name: string) => z.string(requiredIn('legal', name));

// Frontmatter des pages légales : la date de mise à jour est obligatoire (affichée et reprise en `dateModified`).
export const legalFrontmatterSchema = z.strictObject({
  title: field('title').min(1),
  description: field('description').min(1),
  updatedDate: z
    .custom<unknown>(
      (value) => value !== undefined,
      "Champ 'updatedDate' requis dans la collection legal",
    )
    .pipe(z.coerce.date()),
});

const contactUrl = z.union([z.string().regex(/^\/(?:[a-z0-9-]+\/)*$/), httpsUrl]);

// Aucune adresse ni téléphone pour l'éditeur (CR-3) : strictObject refuse ces clés.
// L'hébergeur est une personne morale : ses coordonnées publiques sont obligatoires (LCEN).
export const legalConfigSchema = z.strictObject({
  editor: z.strictObject({ name: z.string().min(1), contactUrl }),
  publicationDirector: z.string().min(1),
  host: z.strictObject({
    name: z.string().min(1),
    address: z.string().min(1),
    phone: z.string().min(1).optional(),
    website: httpsUrl.optional(),
  }),
});

export type LegalConfig = z.infer<typeof legalConfigSchema>;
