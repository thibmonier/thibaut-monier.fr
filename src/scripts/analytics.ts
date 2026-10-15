// Mesure d'audience (US-026, ADR-0011) : charge Umami en différé et mesure les clics par délégation.
// Sans cookie ni stockage ; aucune requête sans identifiant, ni avec DNT ou GPC.
import { eventForLink, shouldLoadAnalytics, trackEvent } from '../lib/analytics-events.ts';

const SCRIPT_URL = 'https://cloud.umami.is/script.js';

interface PrivacySignals extends Navigator {
  globalPrivacyControl?: boolean;
  msDoNotTrack?: string;
}

function onClick(event: MouseEvent): void {
  const link =
    event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link) return;
  const found = eventForLink({ href: link.href, dataEvent: link.dataset['event'] });
  if (found) trackEvent(found.name, found.props);
}

function boot(): void {
  const websiteId =
    document.querySelector('meta[name="analytics-website-id"]')?.getAttribute('content') ?? '';
  const nav = navigator as PrivacySignals;
  const allowed = shouldLoadAnalytics({
    websiteId,
    dnt: nav.doNotTrack ?? nav.msDoNotTrack ?? null,
    gpc: nav.globalPrivacyControl,
    automated: nav.webdriver,
  });
  if (!allowed) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = SCRIPT_URL;
  script.dataset['websiteId'] = websiteId;
  script.dataset['doNotTrack'] = 'true';
  document.head.append(script);
  document.addEventListener('click', onClick);
}

boot();
