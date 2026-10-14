import { z } from 'astro/zod';
import type { NavItem } from '../lib/navigation.ts';

// Navigation pilotée par configuration (arbitrage A4). Une entrée dont la page n'existe pas encore reste
// `enabled: false` : aucun lien mort n'est rendu. L'US qui crée la page passe le drapeau à `true`.
//   - parcours : US-005   - mentions-legales, vie-privee : US-029   - blog : US-009 (sprint 3)
const internalHref = z
  .string()
  .regex(/^\/(?:[a-z0-9-]+\/)*$/, "href interne avec barre finale (ex. '/contact/')");

const item = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  href: internalHref,
  label: z.string().min(1),
  enabled: z.boolean(),
});

export const navSchema = z.strictObject({ main: z.array(item), footer: z.array(item) });

export type Nav = z.infer<typeof navSchema>;

// Liens que le site ne peut pas perdre : leur retrait ou désactivation fait échouer le build.
const REQUIRED = {
  main: ['accueil', 'contact'],
  footer: ['mentions-legales', 'vie-privee'],
} as const;

export function parseNav(input: unknown): Nav {
  const nav = navSchema.parse(input);
  for (const [section, ids] of Object.entries(REQUIRED) as [
    keyof typeof REQUIRED,
    readonly string[],
  ][]) {
    for (const id of ids) {
      const found = nav[section].find((entry) => entry.id === id);
      if (!found)
        throw new Error(
          `Navigation « ${section} » : lien obligatoire « ${id} » absent de src/config/nav.ts`,
        );
      if (section === 'main' && !found.enabled) {
        throw new Error(
          `Navigation « ${section} » : le lien obligatoire « ${id} » ne peut pas être désactivé`,
        );
      }
    }
  }
  return nav;
}

const main: NavItem[] = [
  { id: 'accueil', href: '/', label: 'Accueil', enabled: true },
  { id: 'parcours', href: '/parcours/', label: 'Parcours', enabled: true },
  { id: 'contact', href: '/contact/', label: 'Contact', enabled: true },
];

const footer: NavItem[] = [
  { id: 'mentions-legales', href: '/mentions-legales/', label: 'Mentions légales', enabled: false },
  { id: 'vie-privee', href: '/vie-privee/', label: 'Vie privée', enabled: false },
];

export const nav = parseNav({ main, footer });
