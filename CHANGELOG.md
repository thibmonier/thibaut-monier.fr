# Changelog

Format [Keep a Changelog](https://keepachangelog.com/). Zone `[Unreleased]` en ajout seul.

## [Unreleased]

### Added

- US-001 : socle Astro 7.3.8 / TypeScript 6.0.3 / Tailwind 4.3.3 entièrement dockerisé (Dockerfile multi-étapes, `compose.yaml`, `Makefile`), nginx durci (CSP stricte, HSTS, COOP, CORP), accueil minimale et 404, schéma de contenu `home`, `privacy.ts` et schémas communs, Renovate.
- US-003 : contrôles de qualité (ESLint, Prettier, `astro check`, Vitest avec couverture, liens internes et ancres sur `dist/`, axe, Lighthouse 13.5 en médiane de 3), exécuteur de contrôles à découverte automatique, workflows `ci.yml` et `scheduled.yml`.
- US-002 : design system et layout (`BaseLayout`, `Header` avec menu mobile accessible, `Footer`, `SkipLink`, `ThemeToggle`, composant `Seo`), jetons de design `src/data/tokens.json` convertis en CSS Tailwind 4, thème clair et sombre sans flash (`/theme-init.js` externe), Inter et JetBrains Mono auto-hébergées, navigation pilotée par `src/config/nav.ts`, dictionnaire `src/i18n/`.
- US-029 : pages `/mentions-legales/` et `/vie-privee/` (collection `legal` en Markdown, `src/config/legal.ts` validé par schéma, composant `LegalDocument`), liens légaux du pied de page activés, contrôle de build des données personnelles.
- US-008 : page `/contact/` (formulaire accessible en amélioration progressive vers Web3Forms, motif pré-sélectionné par `?motif=`, anti-spam par champ piège et délai de 3 s, lien Calendly en nouvel onglet), page `/contact/merci/`, mention RGPD renvoyant vers `/vie-privee/#formulaire`.
- US-004 : page d'accueil à double parcours (`Hero`, `CtaPair`, `ProofList`), schéma `home` étendu (headline, valueProp de 25 mots au plus, 2 appels à l'action avec motif de contact, 4 preuves sourcées), `proofs.ts`, `text.ts` et contrôle de build `proof-links`.
- US-005 : parcours professionnel en frise (`/parcours/`, 7 expériences, bloc « Avant 2016 » repliable, impression sur 2 pages A4), collection `experiences` et son schéma, `experiences.ts`, contrôle de contenu des expériences (données personnelles, règle des 10 ans, décompte).
