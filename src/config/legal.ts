import { legalConfigSchema } from '../content/schemas/legal.ts';

// Informations légales (LCEN) validées au chargement. Guide : docs/guides/pages-legales.md.
// À VÉRIFIER avant mise en production : raison sociale, adresse et contact officiels de l'hébergeur
// (les pages railway.com/legal n'exposent pas ces données de façon exploitable).
export const legalConfig = legalConfigSchema.parse({
  editor: { name: 'Thibaut Monier', contactUrl: '/contact/' },
  publicationDirector: 'Thibaut Monier',
  host: {
    name: 'Railway Corp.',
    address: 'Adresse du siège de Railway Corp. : à vérifier avant publication',
    website: 'https://railway.com/',
  },
});
