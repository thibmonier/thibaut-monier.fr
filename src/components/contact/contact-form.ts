// Amélioration progressive du formulaire (ADR-0004, arbitrage A3) : sans JavaScript, le formulaire
// s'envoie nativement vers Web3Forms ; ici on ajoute validation en ligne, anti-spam et états.
import { motifValue, trackEvent } from '../../lib/analytics-events.ts';
import {
  CONTACT_MESSAGES,
  buildPayload,
  interpretResponse,
  isBot,
  parseMotif,
  subjectFor,
  validateContact,
  type ContactErrors,
  type ContactValues,
} from '../../lib/contact.ts';

const FIELDS = ['name', 'email', 'motif', 'message'] as const;

function init(form: HTMLFormElement): void {
  const openedAt = Date.now();
  form.noValidate = true;
  const el = (name: string) =>
    form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  const alertBox = form.querySelector<HTMLElement>('[data-alert]') as HTMLElement;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]') as HTMLButtonElement;
  const submitLabel = submit.textContent ?? '';

  const requested = new URLSearchParams(location.search).get('motif');
  if (requested) el('motif').value = parseMotif(requested);
  const syncSubject = () => {
    el('subject').value = subjectFor(el('motif').value);
  };
  el('motif').addEventListener('change', syncSubject);
  syncSubject();

  const mailto = form.querySelector<HTMLAnchorElement>('[data-mailto]');
  if (mailto) {
    const address = `${mailto.dataset.user}@${mailto.dataset.domain}`;
    mailto.href = `mailto:${address}`;
    mailto.textContent = address;
  }

  const read = (): ContactValues => ({
    name: el('name').value,
    email: el('email').value,
    motif: el('motif').value,
    message: el('message').value,
  });

  const showErrors = (errors: ContactErrors) => {
    for (const name of FIELDS) {
      const target = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`) as HTMLElement;
      const message = errors[name];
      target.textContent = message ?? '';
      target.hidden = !message;
      if (message) el(name).setAttribute('aria-invalid', 'true');
      else el(name).removeAttribute('aria-invalid');
    }
  };

  const showAlert = (message: string) => {
    (alertBox.querySelector('[data-alert-message]') as HTMLElement).textContent = message;
    alertBox.hidden = false;
  };

  const done = (motif: string) =>
    location.assign(`/contact/merci/?motif=${encodeURIComponent(motif)}`);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    alertBox.hidden = true;
    const values = read();
    const errors = validateContact(values);
    showErrors(errors);
    const first = FIELDS.find((name) => errors[name]);
    if (first) {
      el(first).focus();
      return;
    }
    // Faux succès : on ne renseigne pas le robot (aucune requête).
    if (isBot({ trap: (el('botcheck') as HTMLInputElement).checked, openedAt, now: Date.now() })) {
      done(values.motif);
      return;
    }
    submit.disabled = true;
    submit.textContent = submit.dataset.sending ?? submitLabel;
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildPayload(values, el('access_key').value)),
      });
      const body: unknown = await response.json().catch(() => null);
      const outcome = interpretResponse(response.status, body);
      if (outcome.kind === 'success') {
        trackEvent('contact_submit', { motif: motifValue(values.motif) });
        done(values.motif);
        return;
      }
      showAlert(outcome.kind === 'rejected' ? outcome.message : CONTACT_MESSAGES.failure);
    } catch {
      showAlert(CONTACT_MESSAGES.failure);
    }
    submit.disabled = false;
    submit.textContent = submitLabel;
  });
}

const form = document.querySelector<HTMLFormElement>('form[data-contact-form]');
if (form) init(form);
