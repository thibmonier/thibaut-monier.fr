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
} as const;

type Widen<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dictionary = Widen<typeof fr>;
