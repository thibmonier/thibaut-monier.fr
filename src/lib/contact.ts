// Logique pure du formulaire de contact (validation, anti-spam, charge Web3Forms, lecture des réponses).
// Partagée par le script d'amélioration progressive et testée sans navigateur.

export const MOTIFS = ['mission', 'poste', 'autre'] as const;
export type Motif = (typeof MOTIFS)[number];
export const DEFAULT_MOTIF: Motif = 'mission';

/** Délai minimal entre l'ouverture de la page et l'envoi (ADR-0004). */
export const MIN_FILL_MS = 3000;
export const MAX_MESSAGE_LENGTH = 5000;

export const CONTACT_MESSAGES = {
  nameRequired: 'Veuillez renseigner votre nom.',
  emailRequired: 'Veuillez renseigner votre adresse e-mail.',
  emailInvalid: 'Veuillez saisir une adresse e-mail valide.',
  motifInvalid: 'Veuillez choisir un motif.',
  messageRequired: 'Veuillez écrire votre message.',
  messageTooLong: `Votre message dépasse ${MAX_MESSAGE_LENGTH} caractères.`,
  success: 'Merci, votre message est bien envoyé. Réponse sous 48 h ouvrées.',
  failure: "L'envoi a échoué. Écrivez-moi directement à l'adresse ci-dessous.",
  rejected: "Votre message n'a pas pu être envoyé. Vérifiez les champs puis réessayez.",
} as const;

const SUBJECT_LABEL: Record<Motif, string> = {
  mission: 'Mission',
  poste: 'Poste',
  autre: 'Autre',
};

export interface ContactValues {
  name: string;
  email: string;
  motif: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

export function isMotif(value: unknown): value is Motif {
  return typeof value === 'string' && (MOTIFS as readonly string[]).includes(value);
}

export function parseMotif(value: string | null | undefined): Motif {
  return isMotif(value) ? value : DEFAULT_MOTIF;
}

function emailError(email: string): string | undefined {
  if (email === '') return CONTACT_MESSAGES.emailRequired;
  return EMAIL.test(email) ? undefined : CONTACT_MESSAGES.emailInvalid;
}

function messageError(message: string): string | undefined {
  if (message === '') return CONTACT_MESSAGES.messageRequired;
  return message.length > MAX_MESSAGE_LENGTH ? CONTACT_MESSAGES.messageTooLong : undefined;
}

// Les erreurs sont ordonnées comme les champs du formulaire (le premier reçoit le focus).
export function validateContact(values: ContactValues): ContactErrors {
  const candidates: ContactErrors = {
    name: values.name.trim() === '' ? CONTACT_MESSAGES.nameRequired : undefined,
    email: emailError(values.email.trim()),
    motif: isMotif(values.motif) ? undefined : CONTACT_MESSAGES.motifInvalid,
    message: messageError(values.message.trim()),
  };
  return Object.fromEntries(
    Object.entries(candidates).filter(([, message]) => message !== undefined),
  );
}

export function isBot(input: { trap: boolean; openedAt: number; now: number }): boolean {
  return input.trap || input.now - input.openedAt < MIN_FILL_MS;
}

export function subjectFor(motif: string): string {
  return `[${SUBJECT_LABEL[parseMotif(motif)]}] Nouveau message depuis thibaut-monier.fr`;
}

export function buildPayload(values: ContactValues, accessKey: string) {
  return {
    access_key: accessKey,
    name: values.name.trim(),
    email: values.email.trim(),
    motif: values.motif,
    message: values.message.trim(),
    botcheck: '',
    subject: subjectFor(values.motif),
  };
}

export type ContactOutcome =
  { kind: 'success' } | { kind: 'rejected'; message: string } | { kind: 'unavailable' };

export function interpretResponse(status: number, body: unknown): ContactOutcome {
  const parsed = (body ?? {}) as { success?: unknown; message?: unknown };
  if (status >= 500) return { kind: 'unavailable' };
  if (status === 200 && parsed.success === true) return { kind: 'success' };
  const message =
    typeof parsed.message === 'string' && parsed.message !== ''
      ? parsed.message
      : CONTACT_MESSAGES.rejected;
  return { kind: 'rejected', message };
}
