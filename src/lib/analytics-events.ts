import { MOTIFS, type Motif } from './contact.ts';

// Contrat C8 (ADR-0011) : seul lecteur de la configuration d'audience et de la liste des événements.
// Aucune propriété de saisie libre : le motif du formulaire est borné à ses trois valeurs.

/** Liste fermée : événement -> propriétés autorisées. */
export const EVENTS = {
  contact_submit: ['motif'],
  rdv_click: [],
  cv_download: [],
  outbound_github: ['repo'],
  outbound_packagist: ['package'],
  outbound_linkedin: [],
} as const satisfies Record<string, readonly string[]>;

export type EventName = keyof typeof EVENTS;
export type EventProps = Record<string, string>;
export interface AnalyticsEvent {
  name: EventName;
  props?: EventProps;
}

/** Identifiant Umami fourni au build (`PUBLIC_UMAMI_WEBSITE_ID`) : lu ici et nulle part ailleurs dans `src/`. */
export function configuredWebsiteId(env: Record<string, unknown> = import.meta.env): string {
  const value = env['PUBLIC_UMAMI_WEBSITE_ID'];
  return typeof value === 'string' ? value.trim() : '';
}

export const isEventName = (name: string): name is EventName => Object.hasOwn(EVENTS, name);

export function assertEventPayload(name: string, props: Record<string, unknown> = {}): void {
  if (!isEventName(name)) throw new Error(`Événement ${name} : nom inconnu`);
  const allowed: readonly string[] = EVENTS[name];
  for (const key of Object.keys(props)) {
    if (!allowed.includes(key)) throw new Error(`Événement ${name} : propriété interdite '${key}'`);
  }
}

const hostIs = (url: URL, host: string): boolean =>
  url.hostname === host || url.hostname === `www.${host}`;

function derive(href: string): AnalyticsEvent | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const segments = url.pathname.split('/').filter(Boolean);
  if (hostIs(url, 'github.com')) {
    const [owner, repo] = segments;
    return owner && repo
      ? { name: 'outbound_github', props: { repo: `${owner}/${repo}` } }
      : { name: 'outbound_github' };
  }
  if (hostIs(url, 'packagist.org')) {
    const [prefix, vendor, name] = segments;
    return prefix === 'packages' && vendor && name
      ? { name: 'outbound_packagist', props: { package: `${vendor}/${name}` } }
      : { name: 'outbound_packagist' };
  }
  if (hostIs(url, 'linkedin.com')) return { name: 'outbound_linkedin' };
  return null;
}

/** `data-event` explicite d'abord, sinon motif d'URL ; `null` si le lien n'est pas mesuré. */
export function eventForLink(link: {
  href: string;
  dataEvent?: string | null;
}): AnalyticsEvent | null {
  const derived = derive(link.href);
  if (link.dataEvent) {
    if (!isEventName(link.dataEvent)) return null;
    return derived?.name === link.dataEvent && derived.props
      ? { name: link.dataEvent, props: derived.props }
      : { name: link.dataEvent };
  }
  return derived;
}

/**
 * Aucun script sans identifiant, ni avec « Do Not Track », « Global Privacy Control » ou un navigateur automatisé
 * (`navigator.webdriver` : tests, Lighthouse), dont les visites ne sont pas des visiteurs.
 */
export function shouldLoadAnalytics(input: {
  websiteId?: string | undefined;
  dnt?: string | boolean | null | undefined;
  gpc?: boolean | undefined;
  automated?: boolean | undefined;
}): boolean {
  const dnt = input.dnt === true || input.dnt === '1' || input.dnt === 'yes';
  return Boolean(input.websiteId) && !dnt && input.gpc !== true && input.automated !== true;
}

export function motifValue(motif: string): Motif {
  return (MOTIFS as readonly string[]).includes(motif) ? (motif as Motif) : 'autre';
}

interface UmamiTarget {
  umami?: { track: (name: string, data?: EventProps) => void };
}

/** Envoie un événement ; un script absent, bloqué ou en échec ne produit aucune erreur. */
export function trackEvent(
  name: EventName,
  props?: EventProps,
  target: UmamiTarget = globalThis as UmamiTarget,
): void {
  assertEventPayload(name, props);
  try {
    target.umami?.track(name, props);
  } catch {
    // Mesure d'audience facultative : jamais d'effet sur la navigation ni sur le formulaire.
  }
}
