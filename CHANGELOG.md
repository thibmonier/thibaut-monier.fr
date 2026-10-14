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
- Finitions du sprint 1 : contrôle de fumée post-déploiement (`make smoke URL=...`, étape dans `scheduled.yml` si `SMOKE_URL` est définie), workflow manuel de repli `deploy.yml`, job CI `supply-chain` (SBOM CycloneDX en artefact, scan Trivy de l'image de production), guides `docs/guides/qualite-ci.md` et index, README (déploiement Railway, variables), scénarios e2e transverses (toutes les pages à 360/768/1280 px, sans JavaScript, mouvement réduit, console sans violation CSP) et scénario accueil vers contact.
- US-007 : CV PDF `thibaut-monier-cv.pdf` généré au build par Typst 0.15.1 (2 pages A4, PDF/UA balisé, polices Inter TTF), collection `profile` et son schéma, `cv-data.ts` (liste blanche), `build-cv.ts` (échec franc, aucun PDF obsolète), contrôle de build `cv-pdf` (texte sans donnée personnelle, taille, pages, métadonnées, fidélité à la source), poppler-utils et Typst dans l'étape `deps` du Dockerfile, revalidation et `noindex` du PDF dans nginx, lien « Télécharger mon CV (PDF, 2 pages) » sur `/parcours/` et `/contact/`, guide `docs/guides/cv-pdf.md`.
- US-006 : page `/competences/` (réalisations et compétences filtrables par domaine, références clients anonymisées par défaut, filtre en amélioration progressive de moins de 3 Ko, lien partageable `?domaine=`), collections `skills` et `achievements`, `filters.ts`, contrôle de contenu des références croisées et des clients citables, entrée « Compétences » de la navigation, guide `docs/guides/competences.md`.

### Fixed

- Favicon SVG ajouté (`/favicon.ico` répondait 404 sur chaque page et polluait la console).
