import { describe, expect, it, vi } from 'vitest';
import {
  EVENTS,
  assertEventPayload,
  eventForLink,
  motifValue,
  shouldLoadAnalytics,
  trackEvent,
} from '../../../src/lib/analytics-events.ts';

describe('EVENTS', () => {
  it('est la liste fermée du contrat (ADR-0011)', () => {
    expect(Object.keys(EVENTS).sort()).toEqual([
      'contact_submit',
      'cv_download',
      'outbound_github',
      'outbound_linkedin',
      'outbound_packagist',
      'rdv_click',
    ]);
    expect(EVENTS.contact_submit).toEqual(['motif']);
    expect(EVENTS.outbound_github).toEqual(['repo']);
    expect(EVENTS.cv_download).toEqual([]);
  });
});

describe('eventForLink', () => {
  it('donne la priorité à data-event', () => {
    expect(eventForLink({ href: 'https://github.com/a/b', dataEvent: 'cv_download' })).toEqual({
      name: 'cv_download',
    });
  });

  it('ignore un data-event inconnu', () => {
    expect(eventForLink({ href: 'https://exemple.fr/', dataEvent: 'inconnu' })).toBeNull();
  });

  it('déduit outbound_github du motif d’URL, sous-chemin compris', () => {
    expect(eventForLink({ href: 'https://github.com/thibmonier/factur-x' })).toEqual({
      name: 'outbound_github',
      props: { repo: 'thibmonier/factur-x' },
    });
    expect(eventForLink({ href: 'https://github.com/thibmonier/factur-x/tree/main/docs' })).toEqual(
      {
        name: 'outbound_github',
        props: { repo: 'thibmonier/factur-x' },
      },
    );
  });

  it('un lien GitHub de profil n’a pas de propriété repo', () => {
    expect(eventForLink({ href: 'https://github.com/thibmonier' })).toEqual({
      name: 'outbound_github',
    });
  });

  it('déduit outbound_packagist et outbound_linkedin', () => {
    expect(eventForLink({ href: 'https://packagist.org/packages/tmonier/factur-x' })).toEqual({
      name: 'outbound_packagist',
      props: { package: 'tmonier/factur-x' },
    });
    expect(eventForLink({ href: 'https://www.linkedin.com/in/thibautmonier/' })).toEqual({
      name: 'outbound_linkedin',
    });
  });

  it('ne confond pas un domaine voisin et ne mesure pas les autres liens', () => {
    expect(eventForLink({ href: 'https://evilgithub.com/a/b' })).toBeNull();
    expect(eventForLink({ href: 'https://exemple.fr/' })).toBeNull();
    expect(eventForLink({ href: '/contact/' })).toBeNull();
    expect(eventForLink({ href: 'pas une url' })).toBeNull();
  });
});

describe('assertEventPayload', () => {
  it('accepte une charge conforme', () => {
    expect(() => assertEventPayload('contact_submit', { motif: 'poste' })).not.toThrow();
    expect(() => assertEventPayload('rdv_click')).not.toThrow();
  });

  it.each(['email', 'message', 'name'])('refuse la propriété « %s »', (property) => {
    expect(() => assertEventPayload('contact_submit', { motif: 'poste', [property]: 'x' })).toThrow(
      `Événement contact_submit : propriété interdite '${property}'`,
    );
  });

  it('refuse un événement inconnu', () => {
    expect(() => assertEventPayload('page_vue', {})).toThrow('Événement page_vue : nom inconnu');
  });

  it('refuse une propriété sur un événement qui n’en a pas', () => {
    expect(() => assertEventPayload('rdv_click', { x: '1' })).toThrow(
      "Événement rdv_click : propriété interdite 'x'",
    );
  });
});

describe('shouldLoadAnalytics', () => {
  const id = '00000000-0000-4000-8000-0000000000a1';

  it('charge avec un identifiant et sans signal de refus', () => {
    expect(shouldLoadAnalytics({ websiteId: id })).toBe(true);
  });

  it('ne charge rien sans identifiant', () => {
    expect(shouldLoadAnalytics({})).toBe(false);
    expect(shouldLoadAnalytics({ websiteId: '' })).toBe(false);
  });

  it('ne charge pas pour un navigateur automatisé', () => {
    expect(shouldLoadAnalytics({ websiteId: id, automated: true })).toBe(false);
    expect(shouldLoadAnalytics({ websiteId: id, automated: false })).toBe(true);
  });

  it('respecte DNT, sous toutes ses formes, et GPC', () => {
    for (const dnt of ['1', 'yes', true])
      expect(shouldLoadAnalytics({ websiteId: id, dnt })).toBe(false);
    for (const dnt of ['0', 'unspecified', null, undefined, false])
      expect(shouldLoadAnalytics({ websiteId: id, dnt })).toBe(true);
    expect(shouldLoadAnalytics({ websiteId: id, gpc: true })).toBe(false);
  });
});

describe('motifValue', () => {
  it('borne le motif aux valeurs du formulaire', () => {
    expect(motifValue('poste')).toBe('poste');
    expect(motifValue('mission')).toBe('mission');
    expect(motifValue('autre')).toBe('autre');
  });

  it('remplace tout texte libre par « autre »', () => {
    expect(motifValue('marc@exemple.fr')).toBe('autre');
    expect(motifValue('')).toBe('autre');
  });
});

describe('trackEvent', () => {
  it('appelle umami.track avec la charge validée', () => {
    const track = vi.fn();
    trackEvent('contact_submit', { motif: 'poste' }, { umami: { track } });
    expect(track).toHaveBeenCalledWith('contact_submit', { motif: 'poste' });
  });

  it('ne fait rien quand le script est absent ou bloqué', () => {
    expect(() => trackEvent('rdv_click', undefined, {})).not.toThrow();
  });

  it('avale une erreur du script sans la propager', () => {
    const track = vi.fn(() => {
      throw new Error('script en échec');
    });
    expect(() => trackEvent('rdv_click', undefined, { umami: { track } })).not.toThrow();
  });
});
