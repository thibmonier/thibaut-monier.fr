# Guide du design system

## Jetons
Source unique : `src/data/tokens.json` (`color` avec `light` et `dark`, `font`, `space`), validée par `tokensSchema`. Après modification, lancer `docker compose run --rm tools npm run tokens` pour régénérer `src/styles/tokens.css` (le test `tokens.test.ts` échoue sinon). Les contrastes sont testés (`contrast.test.ts`, 4,5:1 pour le texte, 3:1 pour les composants) dans les deux thèmes.

**Ajouter un jeton couleur** : ajouter `{ "light": "#...", "dark": "#..." }` sous `color`, régénérer, puis utiliser `bg-<nom>`, `text-<nom>`, `border-<nom>`. Si le jeton porte du texte, ajouter sa paire dans `contrast.test.ts`.

## Thème
`prefers-color-scheme` par défaut, `data-theme` (posé par `/theme-init.js` ou `ThemeToggle`) prioritaire. Voir ADR-0010. Aucun script ni style inline (CSP).

La variante Tailwind `dark:` est redéfinie dans `global.css` (`@custom-variant dark`) pour suivre la même règle : `data-theme="dark"`, ou préférence système sombre sans `data-theme="light"`. Ne pas utiliser `media` directement.

## Utilitaires (`src/styles/global.css`)
À préférer aux longues listes de classes :

| Utilitaire | Usage |
|------------|-------|
| `card` / `card-link` | Carte sur jeton `card` ; `card-link` ajoute le survol pour une carte cliquable |
| `btn` + `btn-primary` / `btn-secondary` | Boutons et liens d'action (cible ≥ 24 px) |
| `chip` | Pastille de filtre ou d'étiquette |
| `glow` | Halo décoratif (fond de `BaseLayout`) |
| `text-gradient` | Texte en dégradé (nom du hero), teintes 600 en clair pour le contraste AA |

## Icônes
`src/components/ui/Icon.astro` : icônes Lucide copiées à la main (sans dépendance), toujours décoratives (`aria-hidden`). Ajouter une icône : coller le contenu du SVG Lucide sous une nouvelle clé de `ICONS`.

## Apparition au défilement
Ajouter la classe `reveal` à un bloc ; `src/scripts/reveal.ts` (importé par `BaseLayout`) pose `is-revealed` à l'entrée dans la vue. Sans JavaScript (variante `js`) ou avec `prefers-reduced-motion`, le contenu est visible immédiatement.

## Polices (auto-hébergées, WOFF2 latin, `font-display: swap`)
| Famille | Fichier | Licence |
|---------|---------|---------|
| Inter (variable) | `public/fonts/inter-latin-wght-normal.woff2` | SIL OFL 1.1 |
| JetBrains Mono (variable) | `public/fonts/jetbrains-mono-latin-wght-normal.woff2` | SIL OFL 1.1 |

Sources : paquets Fontsource 5.2.8. La police principale est préchargée dans `BaseLayout`.

## Composants
`src/layouts/BaseLayout.astro` (props `title`, `description`, `noindex?`, `canonical?`), `src/components/ui/{Header,Footer,SkipLink,ThemeToggle}.astro`, `src/components/seo/Seo.astro` (contrat TSDoc dans le fichier). Les scripts interactifs vivent dans `src/scripts/` et sont importés par le composant.

**Ajouter un composant** : créer `src/components/ui/<Nom>.astro`, styler avec les classes Tailwind issues des jetons, tester l'accessibilité (axe, clavier), ne jamais écrire de `<script>` ou `<style>` inline dans le HTML final.

## Navigation
`src/config/nav.ts` : chaque entrée a un drapeau `enabled`. Passer à `true` quand la page existe (Parcours : US-005 ; mentions légales et vie privée : US-029 ; Blog : US-009 ; Recherche : US-012). Les entrées `accueil` et `contact` (en-tête) ne peuvent pas être retirées.

## i18n
`src/i18n/{fr,en,utils}.ts` : `en.ts` est un squelette (chaîne vide = repli sur le français).
