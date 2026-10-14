import { describe, expect, it } from 'vitest';
import {
  CONTACT_MESSAGES,
  MIN_FILL_MS,
  buildPayload,
  interpretResponse,
  isBot,
  parseMotif,
  validateContact,
} from '../../../src/lib/contact.ts';

const values = {
  name: 'Marc Durand',
  email: 'marc@exemple.fr',
  motif: 'mission',
  message: 'Bonjour, je cherche un CTO de transition.',
};

describe('validateContact', () => {
  it('ne signale aucune erreur pour une saisie valide', () => {
    expect(validateContact(values)).toEqual({});
  });

  it('exige l’e-mail avec le message exact', () => {
    expect(validateContact({ ...values, email: '  ' }).email).toBe(
      'Veuillez renseigner votre adresse e-mail.',
    );
  });

  it.each(['marc', 'marc@', 'marc@exemple', 'a b@exemple.fr'])(
    'refuse l’e-mail « %s »',
    (email) => {
      expect(validateContact({ ...values, email }).email).toBe(CONTACT_MESSAGES.emailInvalid);
    },
  );

  it('exige le nom, le message et un motif connu', () => {
    const errors = validateContact({ name: '', email: values.email, motif: 'x', message: '' });
    expect(errors.name).toBe(CONTACT_MESSAGES.nameRequired);
    expect(errors.message).toBe(CONTACT_MESSAGES.messageRequired);
    expect(errors.motif).toBe(CONTACT_MESSAGES.motifInvalid);
  });

  it('limite la longueur du message', () => {
    expect(validateContact({ ...values, message: 'a'.repeat(5001) }).message).toBe(
      CONTACT_MESSAGES.messageTooLong,
    );
  });
});

describe('parseMotif', () => {
  it.each(['mission', 'poste', 'autre'])('reconnaît « %s »', (m) => {
    expect(parseMotif(m)).toBe(m);
  });
  it('retombe sur le défaut pour une valeur inconnue ou absente', () => {
    expect(parseMotif('inconnu')).toBe('mission');
    expect(parseMotif(null)).toBe('mission');
    expect(parseMotif(undefined)).toBe('mission');
  });
});

describe('isBot', () => {
  it('détecte le champ piège rempli', () => {
    expect(isBot({ trap: true, openedAt: 0, now: 10_000 })).toBe(true);
  });
  it('détecte un envoi trop rapide (horloge injectée)', () => {
    expect(isBot({ trap: false, openedAt: 1000, now: 1000 + MIN_FILL_MS - 1 })).toBe(true);
  });
  it('accepte un envoi après le délai', () => {
    expect(isBot({ trap: false, openedAt: 1000, now: 1000 + MIN_FILL_MS })).toBe(false);
  });
});

describe('buildPayload', () => {
  it('construit la charge Web3Forms avec sujet préfixé et botcheck vide', () => {
    expect(buildPayload(values, 'KEY')).toEqual({
      access_key: 'KEY',
      name: 'Marc Durand',
      email: 'marc@exemple.fr',
      motif: 'mission',
      message: 'Bonjour, je cherche un CTO de transition.',
      botcheck: '',
      subject: '[Mission] Nouveau message depuis thibaut-monier.fr',
    });
  });
  it.each([
    ['poste', '[Poste]'],
    ['autre', '[Autre]'],
  ])('préfixe le sujet pour %s', (motif, prefix) => {
    expect(buildPayload({ ...values, motif }, 'K').subject.startsWith(prefix)).toBe(true);
  });
  it('supprime les espaces autour des valeurs', () => {
    expect(buildPayload({ ...values, name: '  Marc ' }, 'K').name).toBe('Marc');
  });
});

describe('interpretResponse', () => {
  it('200 avec success true : succès', () => {
    expect(interpretResponse(200, { success: true })).toEqual({ kind: 'success' });
  });
  it('4xx : message du service', () => {
    expect(interpretResponse(422, { success: false, message: 'Invalid email' })).toEqual({
      kind: 'rejected',
      message: 'Invalid email',
    });
  });
  it('4xx sans message : message générique', () => {
    expect(interpretResponse(400, null)).toEqual({
      kind: 'rejected',
      message: CONTACT_MESSAGES.rejected,
    });
  });
  it('200 avec success false : rejeté', () => {
    expect(interpretResponse(200, { success: false, message: 'Spam' }).kind).toBe('rejected');
  });
  it('5xx : service indisponible', () => {
    expect(interpretResponse(503, null)).toEqual({ kind: 'unavailable' });
  });
});
