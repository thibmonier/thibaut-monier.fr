// Filtre des réalisations par domaine (US-006) : fonctions pures, partagées par le rendu Astro, les
// schémas, le contrôle de contenu et le script du navigateur (qui fournit la liste des domaines du DOM).
export const DOMAIN_IDS = [
  'delivery',
  'architecture',
  'e-commerce',
  'donnees-migrations',
  'ia-appliquee',
] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];

export const DOMAIN_LABELS: Record<DomainId, string> = {
  delivery: 'Delivery',
  architecture: 'Architecture',
  'e-commerce': 'E-commerce',
  'donnees-migrations': 'Données et migrations',
  'ia-appliquee': 'IA appliquée',
};

export const ALL_LABEL = 'Tous les domaines';
export const CONFIDENTIAL_LABEL = 'Référence confidentielle';
export const UNKNOWN_DOMAIN_MESSAGE = 'Domaine inconnu, affichage de toutes les réalisations';
export const EMPTY_MESSAGE = 'Aucune réalisation pour ce domaine pour le moment';
export const PARAM = 'domaine';

export function parseDomainParam(
  search: string,
  valid: readonly string[] = DOMAIN_IDS,
): { domain: string | null; unknown: boolean } {
  const value = new URLSearchParams(search).get(PARAM);
  if (!value) return { domain: null, unknown: false };
  return valid.includes(value)
    ? { domain: value, unknown: false }
    : { domain: null, unknown: true };
}

export function filterByDomain<T extends { domains: readonly string[] }>(
  items: readonly T[],
  domain: string | null,
): T[] {
  return domain === null ? [...items] : items.filter((item) => item.domains.includes(domain));
}

export const countLabel = (count: number): string => `${count} réalisation${count > 1 ? 's' : ''}`;

export function statusMessage({ unknown, count }: { unknown: boolean; count: number }): string {
  if (unknown) return UNKNOWN_DOMAIN_MESSAGE;
  return count === 0 ? EMPTY_MESSAGE : '';
}

export const clientsLabel = (clients: readonly string[]): string =>
  clients.length === 0 ? CONFIDENTIAL_LABEL : clients.join(', ');

export const buildSearch = (domain: string | null): string =>
  domain === null ? '' : `?${PARAM}=${domain}`;
