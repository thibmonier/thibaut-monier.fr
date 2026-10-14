import type { Dictionary } from './fr.ts';

// Squelette anglais (ADR-0008) : chaîne vide = repli sur le français. Traduit au sprint 5 (US-027).
export const en: Dictionary = {
  skipLink: '',
  nav: { main: '', menu: '' },
  theme: { toggle: '' },
  footer: { label: '', social: '', rights: '' },
  // US-029
  legal: {
    updated: '',
    editor: '',
    director: '',
    host: '',
    contactVia: '',
    contactForm: '',
    hostAddress: '',
    hostPhone: '',
  },
  // US-008
  contact: {
    title: '',
    intro: '',
    name: '',
    email: '',
    motif: '',
    message: '',
    submit: '',
    sending: '',
    unavailableTitle: '',
    unavailable: '',
    privacyIntro: '',
    privacyMore: '',
    thanksTitle: '',
    backHome: '',
    linkedin: '',
  },
};
