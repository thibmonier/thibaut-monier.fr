# Revue indépendante de la Definition of Done : Sprint 001

> Revue du 2026-10-14, branche `feature/sprint-001-walking_skeleton` (HEAD `5c6f200`, arbre propre). Référentiel : `project-management/definition-of-done.md`, stories US-001 à US-029 du sprint, arbitrages A1 à A5 de `tasks/README.md` (ils font foi). Aucun code modifié.

## Verdict

| US | Titre | Verdict | Motif principal |
|----|-------|---------|-----------------|
| US-001 | Squelette publié en production | **Done sous réserve PO** | Production servie depuis la branche, pas depuis `main` via la CI ; domaine et *Wait for CI* non configurés |
| US-002 | Design system et layout | **Done** | Scénarios couverts et exécutés en CI ; écarts documentaires seulement |
| US-003 | Pipeline CI qualité | **Non done** | La CI est verte alors que 47 tests sont ignorés : les `build-args` ne sont pas transmis (B1) |
| US-004 | Accueil à double parcours | **Non done** | Le scénario « Me recruter → motif Poste pré-sélectionné » n'est jamais exécuté en CI (B1) |
| US-005 | Parcours en frise | **Done sous réserve PO** | Validation du contenu par le PO en attente (T-005-01) ; récit de la story à aligner |
| US-008 | Contact | **Non done** | Tous les scénarios du formulaire sont ignorés en CI (B1) ; formulaire absent en production (clé PO) |
| US-029 | Mentions légales et vie privée | **Non done** | Marqueur « à vérifier avant publication » publié en production, téléphone de l'hébergeur absent (B2) |

**Score : 45/100.** 1 story Done, 2 Done sous réserve, 4 Non done. Deux correctifs bloquants (B1, B2) suffisent à faire passer US-003, US-004, US-008 et US-029 au moins en « Done sous réserve PO ».

Le critère « Validation PO sur la production » (DoD §10) est en attente pour toutes les stories. Il n'est pas répété dans le détail ci-dessous.

## Preuves exécutées

| Vérification | Résultat |
|--------------|----------|
| `make lint` | 0 erreur, 0 avertissement (ESLint et Prettier) |
| `make check` (`astro check`) | OK |
| `make test` (Vitest) | 27 fichiers, 265 tests, couverture : lignes 96,79 %, branches 93,25 % (seuils 80/75) |
| `make checks` (build et contrôles) | `Contrôles content : OK`, 7 pages, `Contrôles dist : OK` ; avertissements non bloquants : CNIL 503, LinkedIn 405 |
| `docker build --target test .` | OK (`BUILD_EXIT=0`) |
| CI GitHub, run 38593144544 (HEAD) | succès, mais e2e : **171 passed, 47 skipped** |
| CI, runs 38586693852 et 38588033403 | 42 puis 43 ignorés, 0 flaky, 0 échec |
| `make smoke URL=https://web-production-70714.up.railway.app` | `Contrôle de fumée : OK` |
| Production, `/usr/bin/curl` | 200 sur `/`, `/parcours/`, `/contact/`, `/contact/merci/`, `/mentions-legales/`, `/vie-privee/` ; 404 sur `/page-inexistante` ; `http://` renvoie 301 vers `https://` ; CSP, HSTS (63072000), nosniff, Referrer-Policy, Permissions-Policy, COOP et CORP présents ; `server: railway-hikari` (pas de version) |
| Production, défauts | `/favicon.ico` 404 (corrigé en `04138ba`, pas encore déployé) ; pas de `/sitemap-index.xml` ni de `/robots.txt` ; formulaire de contact absent (clé non définie) ; canonical vers `https://thibaut-monier.fr/`, domaine qui ne résout pas (`dig` vide) |
| Données personnelles en production | Aucun téléphone, âge ou adresse détecté sur les 5 pages publiques |
| Build `runtime` local avec une clé factice | `form[data-contact-form]`, `botcheck` et le lien RDV `target="_blank"` sont rendus ; `redirect` vaut `https://thibaut-monier.fr/contact/merci/` |

Limite de la revue : les tests Playwright n'ont pas été exécutés en local (pas d'image Playwright, disque limité). Le comportement des scénarios ignorés en CI n'a donc été vérifié **nulle part**.

## Détail par story

### US-001 : Done sous réserve PO

| Scénario | Couverture |
|----------|-----------|
| Nominal : 200 en HTTPS, nom, titre, lien contact | `tests/e2e/skeleton.spec.ts:4-14` ; production 200. Le délai « < 10 min après fusion » n'est pas mesuré : aucun déploiement n'est encore parti de `main` |
| Nominal : LCP < 1,5 s en 4G simulée | Non mesuré directement. Indice indirect : Lighthouse mobile à 1 en performance sur toutes les pages (CI) |
| Redirection HTTP vers HTTPS | `tests/e2e/headers.spec.ts:68-82` (via `X-Forwarded-Proto`) ; production 301 constatée |
| En-têtes de sécurité | `tests/e2e/headers.spec.ts:3-37` ; production conforme |
| URL inexistante | `tests/e2e/skeleton.spec.ts:33-45` ; production 404 |
| Échec de build bloquant le déploiement | Non couvert : dépend de *Wait for CI* de Railway (action PO, T-001-14) |

Écarts relevés :
- DoD §10 : `main` ne contient que `5194b65` (docs). La production (commit `1afc6c5`) a été déployée depuis la branche, sans passer par la CI sur `main`. Réserve PO : fusion de la PR, activation de *Wait for CI*.
- La canonical et l'`og:url` pointent vers `https://thibaut-monier.fr/`, qui ne résout pas (`astro.config.mjs:5`, `PUBLIC_SITE_URL` absent sur Railway). Réserve PO : DNS, ou `PUBLIC_SITE_URL` provisoire.
- Le contrôle de fumée ne vérifie ni la console ni `/vie-privee/` (`scripts/checks/lib/smoke.ts:4`). Il n'est automatisé qu'après le redéploiement programmé (`.github/workflows/scheduled.yml:36-38`), pas après un déploiement sur `main`.

### US-002 : Done

| Scénario | Couverture |
|----------|-----------|
| Layout commun, `aria-current`, pied de page | `tests/e2e/layout.spec.ts:17`, `:31`, `:57`, `:78` (3 liens, arbitrage A4) |
| Thème sombre sans flash, contraste | `tests/e2e/layout.spec.ts:111-215` ; axe en clair et en sombre (`tests/e2e/a11y.spec.ts:16`) ; `tests/unit/lib/contrast.test.ts` |
| Menu mobile, piège du focus, Échap, cibles ≥ 24 px | `tests/e2e/layout.spec.ts:217-272` |
| JavaScript désactivé | `tests/e2e/layout.spec.ts:274-300`, `tests/e2e/pages-matrix.spec.ts:34` |
| Mouvement réduit | `tests/e2e/layout.spec.ts:302-322`, `tests/e2e/pages-matrix.spec.ts:57` |

Écarts non bloquants : la story annonce encore « 4 liens (…, Blog, …) » (`US-002-design-system-layout.md:37`), alors que l'arbitrage A4 n'en garde que 3. La story est à mettre à jour.

### US-003 : Non done

| Scénario | Couverture |
|----------|-----------|
| PR conforme, < 8 min, Lighthouse ≥ 95 | CI en 7 min 51 s (run 38588033403) ; Lighthouse à 1 partout. **Mais la CI est verte avec 47 tests ignorés** (B1) |
| Cache de dépendances, gain ≥ 30 % | Non démontré (T-003-10 encore en revue) |
| Lien externe 503 en avertissement | `tests/unit/checks/links.test.ts:33-37` ; constaté au build (CNIL 503) |
| Schéma invalide | `tests/unit/content/*-schema.test.ts` ; message `Champ '<x>' requis dans la collection <y>` (`src/content/schemas/common.ts:22`) |
| Lighthouse sous le seuil | `tests/unit/checks/lighthouse-assert.test.ts` (cas 0,92) |
| Fusion bloquée | Protection de `main` active (statut `ci` requis, `strict`) ; `enforce_admins: false` ; pas de PR d'échec volontaire en preuve (T-003-09) |

**B1, défaut bloquant.** `.github/workflows/ci.yml:15-18` déclare `PUBLIC_WEB3FORMS_KEY` et `PUBLIC_CALENDLY_URL` en `env:` de workflow. Mais `docker/build-push-action` (`:32-44`, `:66-73`) ne reçoit aucun `build-args`, et les `ARG` du `Dockerfile:32-35` restent donc vides. L'image `preview` testée n'a pas de formulaire, et le `beforeEach` de `tests/e2e/contact.spec.ts:29-36` ignore tous les scénarios du contact. Constat sur le run de HEAD : `47 skipped`, dont `contact.spec.ts:42` (envoi nominal), `:86` (scénario inter-US T-008-11) et `:99` (RDV). `README.md:52` et `ci.yml:15` affirment le contraire : incohérence entre doc et code.

### US-004 : Non done

| Scénario | Couverture |
|----------|-----------|
| Proposition de valeur et 4 preuves sans défilement | `tests/e2e/home.spec.ts:7-52` |
| « Me recruter » : contact avec « Poste » pré-sélectionné en < 1 s | Délai : `tests/e2e/home.spec.ts:67-73`. Pré-sélection : `tests/e2e/contact.spec.ts:86-94`, **ignoré en CI** (B1). En production, le formulaire est absent : aucun motif n'est affiché |
| Mobile 375 x 667 | `tests/e2e/home.spec.ts:84-109` |
| Preuve sans destination | `tests/unit/checks/proof-links.test.ts:55-60`, `tests/unit/content/home-schema.test.ts:91` |
| `headline` manquant | `tests/unit/content/home-schema.test.ts:36` |

Écarts non bloquants :
- Le test « < 1 s » (`home.spec.ts:67-73`) mesure `Date.now()` autour d'un clic et d'une navigation : il est fragile sur un runner chargé. Aucun cas flaky observé sur 4 runs (`retries: 1`, `playwright.config.ts:10`), mais le risque contredit l'objectif DoD « 0 test flaky ».
- Les chiffres des preuves (20 plugins, 3 PR, 12 modules) restent à valider par le PO (T-004-01 en revue).

### US-005 : Done sous réserve PO

| Scénario | Couverture |
|----------|-----------|
| Frise complète, ordre, champs, ≥ 2 réalisations | `tests/e2e/parcours.spec.ts:10-32` ; décompte de 7 (A2) : `scripts/checks/lib/experiences.ts:9`, `:66` |
| Dépliage clavier et toucher, `aria-expanded` | `tests/e2e/parcours.spec.ts:70-112` |
| Impression sur 2 pages A4 au plus | `tests/e2e/parcours.spec.ts:131-150` (projet desktop) |
| Expérience sans période | `tests/unit/checks/experiences-check.test.ts:70-72`, `tests/unit/content/experiences-schema.test.ts:35-39` |
| Donnée personnelle | `tests/unit/checks/experiences-check.test.ts:57-63`, `tests/unit/lib/privacy.test.ts` (A1) |

Écarts non bloquants : la story parle encore de `startDate` et de `endDate` (`US-005-parcours-professionnel-frise.md:60-62`, `:71`), alors que le schéma utilise `start` et `end`. Réserve PO : validation du contenu (T-005-01, T-005-12).

### US-008 : Non done

| Scénario | Couverture |
|----------|-----------|
| Envoi nominal avec motif | `tests/e2e/contact.spec.ts:42-60`, **ignoré en CI** |
| Motif pré-sélectionné | `:69-78`, ignoré en CI |
| Prise de RDV, `rel="noopener noreferrer"` | `:98-109`, ignoré en CI ; rendu vérifié en local avec une URL factice |
| Champ obligatoire manquant | `:111-129`, ignoré en CI |
| Envoi de robot | `:131-160`, ignoré en CI |
| Service indisponible, lien mailto | `:162-198`, ignoré en CI. Le **lien mailto n'existe jamais** : `fallbackEmail: undefined` est écrit en dur (`src/config/contact.ts:28`), et le repli est LinkedIn (`src/components/contact/ContactForm.astro:90-105`). Réserve PO : adresse de repli |

Écarts :
- Bloquant : B1 (aucun scénario exécuté).
- Réserve PO : clé Web3Forms absente en production. Le repli « indisponible + LinkedIn » fonctionne (constaté par curl), mais l'objectif de sprint « peut prendre contact » n'est servi que par ce repli.
- Non bloquant : la redirection sans JavaScript vise `https://thibaut-monier.fr/contact/merci/` (`ContactForm.astro:13`), un domaine non résolu ; à corriger avec `PUBLIC_SITE_URL` (réserve PO).
- Non bloquant : sans JavaScript, le champ caché `subject` reste `[Mission]` quel que soit le motif choisi (`ContactForm.astro:33`).

### US-029 : Non done

| Scénario | Couverture |
|----------|-----------|
| Mentions légales (éditeur, directeur, hébergeur avec raison sociale, adresse, téléphone) | `tests/e2e/legal.spec.ts:22-35` ne vérifie que le mot « Railway ». **Échec en production** : « Adresse : Adresse du siège de Railway Corp. : à vérifier avant publication », sans téléphone |
| Mention RGPD sous le formulaire | `tests/e2e/contact.spec.ts:220-225`, **ignoré en CI** (B1) ; le rendu de `PrivacyNotice.astro` est présent hors formulaire |
| Exercice des droits, CNIL, aucun cookie | `tests/e2e/legal.spec.ts:59-82` |
| Donnée personnelle interdite | `tests/unit/checks/legal-pii.test.ts:12-17` |
| Lien légal manquant | `tests/e2e/legal.spec.ts:4-20` (message « Liens légaux absents sur <URL> ») |

**B2, défaut bloquant.** `src/config/legal.ts:4-14` publie un marqueur de travail dans une page légale en production, et `host.phone` n'est pas renseigné. Les critères `US-029-mentions-legales-vie-privee.md:38` et LCEN (hébergeur : raison sociale, adresse, téléphone) ne sont pas remplis. Aucun contrôle n'empêche un « à vérifier » d'être publié.

Écarts non bloquants :
- `src/content/legal/vie-privee.md:24` affirme « Le site utilise Umami Cloud », alors qu'aucun script Umami n'est intégré (US-026 à venir). C'est une affirmation inexacte dans un document légal.
- La conformité légale de l'éditeur sans adresse ni téléphone, pour une activité professionnelle, reste une décision PO et juridique (`US-029…md:17`).

## Correctifs proposés

### Bloquants

| # | Correctif | Débloque |
|---|-----------|----------|
| B1 | Dans `ci.yml`, passer `build-args` (`PUBLIC_WEB3FORMS_KEY`, `PUBLIC_CALENDLY_URL`) à chaque `docker/build-push-action` qui construit `build`, `dist` ou `runtime` (lignes 32, 39, 66, 120). Faire échouer au lieu d'ignorer en CI : `test.skip` seulement si `!process.env.CI` dans `tests/e2e/contact.spec.ts:29-36`, `:104`, `:259`. Relancer la CI et exiger 0 test ignoré sur `contact.spec.ts`, hors `[sans-clé]` et impression mobile. Corriger `README.md:52` si besoin | US-003, US-004, US-008, US-029 (scénario RGPD) |
| B2 | Renseigner dans `src/config/legal.ts` l'adresse et le téléphone officiels de Railway Corp., et retirer le marqueur. Ajouter un contrôle de build qui rejette « à vérifier », « TODO » ou un téléphone hébergeur manquant dans les pages légales. Étendre `tests/e2e/legal.spec.ts:22-35` à l'adresse et au téléphone. Redéployer | US-029 |

### Non bloquants

1. `tests/e2e/home.spec.ts:67-73` : mesurer via `performance.getEntriesByType('navigation')` ou relâcher le seuil ; la performance est déjà couverte par Lighthouse (« 0 flaky »).
2. `src/content/legal/vie-privee.md:24` : reformuler Umami au futur ou retirer la section jusqu'à US-026.
3. Typographie (DoD §2), espace insécable avant « : » : `vie-privee.md:15-20`, `:24`, `:28` ; `src/i18n/fr.ts:22`, `:31` ; `src/pages/mentions-legales.astro:33`, `:35` ; `src/pages/parcours.astro:17`.
4. Aligner les stories sur les arbitrages : `US-002…md:37` (A4), `US-005…md:60-62` et `:71` (`start`), US-008 (repli LinkedIn tant qu'il n'y a pas d'adresse).
5. Sitemap absent (DoD §5) : prévu en US-024. Consigner l'exception ou ajouter l'intégration sitemap (ADR-0001 la liste déjà).
6. CSP plus large que le besoin actuel (`'wasm-unsafe-eval'`, origines Umami ; `nginx/snippets/security-headers.conf:5`). Elle est documentée en ADR-0009 mais ne respecte pas le moindre privilège avant Pagefind et US-026.
7. Contrôle de fumée : ajouter `/vie-privee/` et un contrôle de console ; le déclencher après chaque déploiement sur `main` (`smoke.ts:4`, `scheduled.yml:36`).
8. `task-board.md:22` et `:28` affichent encore 0/90 et 90 « À faire », ce qui contredit les mises à jour W1 à W4.
9. Sans JavaScript, `subject` reste figé à `[Mission]` (`ContactForm.astro:33`).
10. Preuves US-003 : PR d'échec volontaire (T-003-09), gain de cache ≥ 30 % (T-003-10), `enforce_admins` à activer.
11. Axe n'est pas exécuté sur `/404` ; `/contact/merci/` dépend de B1.
12. Processus : une PR unique pour le sprint, avec des commits de fusion, au lieu d'« une PR par US, squash merge ». À arbitrer à la fusion.

### Réserves PO (repli fonctionnel présent)

Domaine et DNS, ou `PUBLIC_SITE_URL` provisoire (canonical, redirection du formulaire) ; clé Web3Forms sur Railway (repli LinkedIn) ; URL Calendly (bouton masqué) ; adresse e-mail de repli (repli LinkedIn) ; *Wait for CI*, fusion sur `main` et redéploiement (favicon) ; Umami (US-026) ; validation des contenus T-004-01, T-005-01, T-029-01, T-008-01 ; validation PO sur la production.
