import { z } from 'astro/zod';
import { httpsUrl } from '../content/schemas/common.ts';
import { nav } from './nav.ts';

const siteSchema = z.strictObject({
  name: z.string().min(1),
  lang: z.literal('fr'),
  locale: z.string().regex(/^[a-z]{2}_[A-Z]{2}$/),
  social: z.strictObject({ linkedin: httpsUrl, github: httpsUrl }),
});

// Configuration du site, validée au chargement : une valeur invalide fait échouer le build.
export const site = {
  ...siteSchema.parse({
    name: 'Thibaut Monier',
    lang: 'fr',
    locale: 'fr_FR',
    social: {
      linkedin: 'https://www.linkedin.com/in/thibautmonier/',
      github: 'https://github.com/thibmonier',
    },
  }),
  nav,
};
