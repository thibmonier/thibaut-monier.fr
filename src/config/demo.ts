import { httpsUrl } from '../content/schemas/common.ts';

// Démo publique « Fournitures Pro » : boutique B2B Sylius 2.3 qui installe 23 des 24 plugins. Source unique de
// l'URL : le hub, les fiches (champ `inDemo`) et les tests la lisent ici. Les identifiants de démonstration
// ne sont jamais recopiés sur le site : `accountsUrl` renvoie vers la page qui les publie.
const BASE = 'https://sylius-b2b.thibaut-monier.fr';

export const demo = {
  name: 'Fournitures Pro',
  url: httpsUrl.parse(BASE),
  accountsUrl: httpsUrl.parse(`${BASE}/demo/accounts`),
  resetTime: '3 h',
} as const;
