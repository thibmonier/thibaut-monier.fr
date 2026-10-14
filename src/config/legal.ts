import { legalConfigSchema } from '../content/schemas/legal.ts';

// Informations légales (LCEN) validées au chargement. Guide : docs/guides/pages-legales.md.
// Coordonnées de l'hébergeur (adresse, téléphone) : à renseigner par le PO depuis sa facture Railway
// (les pages railway.com/legal ne les exposent pas). Jamais de valeur provisoire : le contrôle
// placeholders.dist.check.ts bloque tout « à vérifier » publié.
export const legalConfig = legalConfigSchema.parse({
  editor: { name: 'Thibaut Monier', contactUrl: '/contact/' },
  publicationDirector: 'Thibaut Monier',
  host: {
    name: 'Railway Corp.',
    website: 'https://railway.com/',
  },
});
