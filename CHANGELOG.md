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
- US-019, US-020 : catalogue des 20 plugins Sylius 2 sur `/open-source/` (filtre par thème et recherche sans dépendance, `?theme=` partageable, rendu sans JavaScript) et fiches `/open-source/sylius/<slug>/` (matrice de compatibilité, dépendances « Nécessite / Complété par / Utilisé par », installation copiable, captures WebP), collection `plugins` en MDX (`@astrojs/mdx` 8.0.3), contrôle de contenu des plugins.
- US-021 (affichage) : bloc `LiveStats` des fiches lu depuis `src/data/oss-metrics.json`, masquage métrique par métrique.
- US-023 : étude de cas `/open-source/career-ops/` (collection `projects` et son schéma, `ContributionCard`, `ProjectLayout`, résumé de 3 lignes, quatre blocs par PR, encadrés techniques repliables, fil d'Ariane, impression), contrôle de contenu `projects` (tests de non-régression décrits, 900 mots hors encadrés, liens https, données personnelles), contrôle des liens externes de la vitrine (`make external-links`, job CI `external-links`, 404 et 410 bloquants).
- US-021 (collecte) : `make metrics` et script `fetch-oss-metrics.ts` (GitHub REST et Packagist, délai de 10 s, 2 reprises, arrêt GitHub après un 403, valeur précédente conservée avec sa date), `src/data/oss-metrics.json` commité (21 dépôts), schéma `oss-metrics`, contrôle de contenu (avertissements de péremption et de clés manquantes), workflow hebdomadaire `metrics.yml` (PR automatique, CI lancée par `workflow_dispatch`).
- US-022 : page `/open-source/tailsfadmin/` (bundle : « En bref », installation en 4 étapes renvoyant au README, métriques, liens GitHub, Packagist et README), schéma `projects` étendu aux bundles.

### Fixed

- Favicon SVG ajouté (`/favicon.ico` répondait 404 sur chaque page et polluait la console).
