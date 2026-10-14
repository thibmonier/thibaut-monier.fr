// Dictionnaire d'interface (français, langue source). Les textes éditoriaux restent dans le contenu.
export const fr = {
  skipLink: 'Aller au contenu',
  nav: {
    main: 'Navigation principale',
    menu: 'Menu',
  },
  theme: {
    toggle: 'Thème sombre',
  },
  footer: {
    label: 'Liens du site',
    social: 'Réseaux',
    rights: 'Tous droits réservés',
  },
  // US-029
  legal: {
    updated: 'Mis à jour le',
    editor: 'Éditeur du site',
    director: 'Directeur de la publication',
    host: 'Hébergeur',
    contactVia: 'Contact : via le',
    contactForm: 'formulaire de contact',
    hostAddress: 'Adresse',
    hostPhone: 'Téléphone',
  },
  // US-008
  contact: {
    title: 'Contact',
    intro:
      'Décrivez votre besoin en quelques lignes : je réponds sous 48 h ouvrées. Vous préférez échanger directement ? Réservez un créneau.',
    name: 'Nom',
    email: 'E-mail',
    motif: 'Motif',
    message: 'Message',
    submit: 'Envoyer',
    sending: 'Envoi en cours…',
    unavailableTitle: 'Formulaire momentanément indisponible',
    unavailable:
      'Le formulaire est indisponible pour le moment. Vous pouvez me joindre via LinkedIn.',
    privacyIntro:
      'Les données saisies servent uniquement à répondre à votre demande. Elles sont transmises par e-mail via Web3Forms (États-Unis, aucun stockage) et conservées au plus 12 mois.',
    privacyMore: 'En savoir plus',
    thanksTitle: 'Message envoyé',
    backHome: "Retour à l'accueil",
    linkedin: 'Me joindre sur LinkedIn',
  },
} as const;

type Widen<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dictionary = Widen<typeof fr>;
