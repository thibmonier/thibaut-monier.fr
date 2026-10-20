# Changelog

- Format [Keep a Changelog](https://keepachangelog.com/). Zone `[Unreleased]` en ajout seul.

## [Unreleased]

### Removed

- Mention d'origine des articles (`OriginalNotice`) et champ `originalUrl` / `originalPublishedAt` du frontmatter et du schéma du blog.
- Table de redirections 301 de l'ancien site : `src/data/redirects.yaml`, `src/lib/redirects.ts`, `scripts/build-redirects.ts`, contrôles `redirects.content` et `redirects.dist`, cible `make redirects`, étapes et artefact `redirections-nginx` de la CI, guide `docs/guides/redirections-blog.md`.
- Outil de migration ponctuelle de l'ancien blog (`src/lib/blog-migration.ts`, `scripts/migrate-blog.ts`) et ses tests.
- Liens vers l'ancien site dans les corps d'articles (texte conservé), citations d'un tiers dans trois articles, pieds « Prochain article » vers des contenus inexistants.
- Références à l'ancien site dans les commentaires de `Header.astro`, `ThemeToggle.astro` et `global.css`.

### Fixed

- Licence de Caveman corrigée dans deux articles : dépôt entièrement sous Apache 2.0 depuis la version 3.0.0 (relevé du 20 octobre 2026).
- Numéros de série périmés retirés ou remplacés par le nom de la série.
- Faute « products » (`esn-agence-freelance-augmente-qui-survit-a-l-ia`), « genère » (`recruter-et-evaluer-un-developpeur-a-l-ere-de-l-ia`) et « survive » (`ce-que-le-client-doit-savoir-sur-l`).
- Estimation « 30 % à 60 % du coût classique » présentée comme une estimation personnelle et non comme une mesure.
- Articles reformulés à la première personne du singulier là où le texte parlait au nom d'une agence.

### Changed

- Refonte visuelle sans changer la structure ni le contenu : palette et jeton `card`, utilitaires `card`, `btn`, `chip`, `glow` et `text-gradient`, variante `dark:` calée sur `data-theme`, en-tête collant translucide, hero avec nom en dégradé, cartes et boutons harmonisés, icônes Lucide (`Icon.astro`), apparition au défilement (`reveal.ts`, désactivée sans JavaScript ou en mouvement réduit).

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
- US-007 : CV PDF `thibaut-monier-cv.pdf` généré au build par Typst 0.15.1 (2 pages A4, PDF/UA balisé, polices Inter TTF), collection `profile` et son schéma, `cv-data.ts` (liste blanche), `build-cv.ts` (échec franc, aucun PDF obsolète), contrôle de build `cv-pdf` (texte sans donnée personnelle, taille, pages, métadonnées, fidélité à la source), poppler-utils et Typst dans l'étape `deps` du Dockerfile, revalidation et `noindex` du PDF dans nginx, lien « Télécharger mon CV (PDF, 2 pages) » sur `/parcours/` et `/contact/`, guide `docs/guides/cv-pdf.md`.
- US-006 : page `/competences/` (réalisations et compétences filtrables par domaine, références clients anonymisées par défaut, filtre en amélioration progressive de moins de 3 Ko, lien partageable `?domaine=`), collections `skills` et `achievements`, `filters.ts`, contrôle de contenu des références croisées et des clients citables, entrée « Compétences » de la navigation, guide `docs/guides/competences.md`.
- Blog migré (US-009) : 28 articles d'Agentic Agency sous `/blog/<slug>/`, 22 images, index, composants d'article (FAQ de 3 articles, note d'auteur, temps de lecture), publication programmée, outil de migration idempotent `scripts/migrate-blog.ts`, contrôles `blog.content`, `blog-schedule.dist` et lecteur unique de la collection.
- Canonical autoréférente, mention d'origine et table de redirections (US-010) : `src/data/redirects.yaml` (95 entrées), `make redirects` (fichier nginx hors `dist/`), contrôles `canonical.dist`, `redirects.content`, `redirects.dist` et `orphans.dist`.
- Navigation du blog (US-011) : liste paginée (12 articles par page), 5 catégories, 19 tags, 6 séries avec encart « article N sur M », lien « Retour au blog » sur la 404.
- Recherche plein texte (US-012) : page `/recherche/` en `noindex`, interface maison sur l'API JavaScript de Pagefind chargée à la première interaction, contrôle `pagefind.dist` (budget de 500 Ko).
- Données structurées JSON-LD (`Person`, `ProfilePage`, `SoftwareSourceCode`, `ItemList`, `BlogPosting`, `FAQPage`, `BreadcrumbList`) produites par un module unique, avec contrôle de build (liste blanche de `Person`, poids, types attendus).
- Sitemap (`/sitemap-index.xml`), `robots.txt` et `llms.txt` générés au build ; contrôles de cohérence du sitemap, de longueur et d'unicité des titres et descriptions, et d'absence de domaine en dur.
- Flux RSS `/rss.xml` (20 articles les plus récents), lien de découverte et lien « S'abonner (RSS) » dans le pied de page, contrôle de build.
- Images Open Graph (1200 × 630) générées au build par `astro-og-canvas`, balises `og:image` et `twitter:*`, contrôle de build.
- Mesure d'audience Umami sans cookie : chargeur différé, contrat fermé des événements (ADR-0011), contrôle de build, respect de Do Not Track et de Global Privacy Control.
- Intégration du sprint 3 : suppression après `build:search` des interfaces Pagefind jamais chargées (`pagefind-ui*`, `pagefind-modular-ui*`, `pagefind-component-ui*`, `scripts/prune-pagefind.ts`) et contrôle `pagefind.dist` étendu (`pagefind.js` obligatoire, aucune interface résiduelle).
- Remédiation de la revue DoD du sprint 3 : job CI `quality` qui génère `agentic-agency.nginx.conf` dans Docker et le publie en artefact `redirections-nginx` (non déployé, au moins 56 règles pour les 28 articles), contrôle de fumée étendu au blog, à un article, à une catégorie, à `/recherche/`, au flux RSS (type `application/rss+xml`), aux sitemaps, `robots.txt`, `llms.txt` et à une image Open Graph (PNG), scénarios e2e inter-US `tests/e2e/sprint-003.spec.ts`.

### Changed

- Navigation principale : entrées « Blog » et « Recherche ».
- Le job `external-links` vérifie aussi les liens externes des pages du blog.
- `buildTitle` n'ajoute le suffixe « — Thibaut Monier » que s'il tient dans 60 caractères.
- CSP : `connect-src` autorise `https://gateway.umami.is` (hôte réel de collecte relevé le 2026-10-15) au lieu de `cloud.umami.is` et `api-gateway.umami.dev`.
- nginx : `location` dédiées pour `/rss.xml`, les sitemaps, `robots.txt`, `llms.txt` (type et charset) et `/og/` (cache d'un jour).
- `/vie-privee/` : section « Mesure d'audience » complétée (événements, base légale, hébergement, conservation, refus).
- Lighthouse et axe ignorent aussi `/recherche/` (`noindex` voulu), comme `/contact/merci/`.
- Redirections : l'apostrophe est refusée dans `from` et `to` (elle ouvrirait une chaîne dans le `return 301` de nginx).
- Typographie : espace insécable (U+00A0) avant « : ; ? ! » dans les 19 titres d'articles concernés (titres uniquement ; les corps restent à décider par le PO, voir `contenu-a-valider.md`).

### Fixed

- Favicon SVG ajouté (`/favicon.ico` répondait 404 sur chaque page et polluait la console).
- Contrôle `jsonld` : une question de FAQ contenant une espace insécable avant « ? » n'est plus signalée à tort comme invisible (3 articles).
- Extraits de la recherche : les entités `&#x27;`, `&#39;` et `&nbsp;` de Pagefind sont décodées.

### Security

- Le script d'audience n'est chargé ni avec Do Not Track, ni avec Global Privacy Control, ni par un navigateur automatisé ; aucune donnée saisie n'entre dans un événement.
- CSP : `'wasm-unsafe-eval'` n'est plus servi qu'à `/recherche/` et `/pagefind/` (variable nginx `$csp_wasm`) ; Pagefind en a besoin pour son WebAssembly, aucune autre page n'en a besoin.
