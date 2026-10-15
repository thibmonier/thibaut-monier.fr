# Revue indépendante de la Definition of Done : Sprint 003

> Revue du 2026-10-15 (tâche T-900-27), branche `feature/sprint-003-blog_migre_seo`, PR #3, HEAD `c964f3b`. Référentiel : `project-management/definition-of-done.md`, stories US-009, 010, 011, 012, 013, 024, 025, 026, ADR-0011 à 0013, « Arbitrages de l'orchestrateur et du PO » et écarts E27 à E33 de `tasks/README.md`. Relecture du code, des tests et des journaux CI ; aucune commande Git, aucun build Docker, aucun test relancé. Aucun fichier modifié hors ce rapport.

## Verdict global

**Done sous réserve PO et sous réserve de 4 écarts majeurs. Aucun bloquant.** Le code est conforme aux 8 stories : tous les scénarios Gherkin ont une preuve (test unitaire, test e2e ou contrôle de build), la CI du run 38698008560 est verte, et aucun problème de sécurité ni de donnée personnelle n'a été trouvé. Les écarts majeurs concernent la complétude du processus (artefact de redirections absent de la CI, suivi des tâches contradictoire, phase 4 non réalisée, revues de 4 stories non tracées), pas le comportement du site.

**Score : 88/100.**

## Preuves exécutées

| Vérification | Résultat |
|--------------|----------|
| CI, run 38698008560 (HEAD `c964f3b`) | `quality`, `dockerfile`, `supply-chain`, `e2e`, `external-links`, `ci` : tous `success` |
| Contrôles de build | `Contrôles content : OK`, `Contrôles dist : OK` dans les 4 builds ; `Blog : articles validés 0/28` (attendu, validation PO en attente) |
| Vitest | 91 fichiers, **990 tests** verts ; couverture lignes 96,3 %, instructions 95,75 % |
| Playwright | **603 exécutés / 3 ignorés (0 hors liste d'exceptions)**. Les 3 ignorés sont `contact.spec.ts` `[sans-clé]` (desktop et mobile) et `parcours.spec.ts` impression (mobile), tous dans `tests/e2e/skip-allowlist.json` ; `analytics.spec.ts:61` échoue en CI si la variable manque au lieu de s'ignorer |
| Lighthouse | 26 pages échantillonnées, médiane de 3, ≥ 0,95 sur les 4 axes (minimum 0,99 en performance) |
| `dist/` local | 90 URL dans le sitemap, toutes avec `lastmod`, ni `/recherche/` ni `/merci/` ni 404 ; `robots.txt` référence le sitemap ; `llms.txt` : 55 liens ; `rss.xml` : 20 `<item>` ; aucune occurrence de « Operations Director » ; JSON-LD `Person` limité à nom, intitulé, URL, `sameAs`, pays |
| Contrôle transverse du dépôt | « Operations Director » absent de `src/content/` et de `dist/` (il n'apparaît que dans les détecteurs `src/lib/blog-migration.ts`, `scripts/checks/lib/blog.ts`, leurs tests et la fixture) ; aucun domaine en dur hors `astro.config.mjs` et de la liste blanche motivée (`src/content/legal/`, `src/lib/contact.ts`) ; `.env`, `.env.*` ignorés par Git ; aucun secret trouvé dans `src/`, `scripts/`, `.github/`, `nginx/` |

Limite : la lecture de `.env.local` et de `.env.example` a été refusée par l'environnement ; leur contenu n'est pas vérifié (le motif d'ignorance Git de `.env.*` l'est).

## Tableau par user story

Légende : F = Fait, P = Partiel, NF = Non fait, R = Réservé PO.

| US | Verdict | Gherkin (preuve) | DoD : points ouverts |
|----|---------|------------------|----------------------|
| US-009 Migration des 28 articles | **Done sous réserve PO** | F : 28 pages, carte complète (`blog.spec.ts:15`) ; FAQ repliable au clavier (`blog.spec.ts:68`) ; pied biographique et « Operations Director » (`blog.spec.ts:31`, contrôle `blog.content.check.ts`) ; publication programmée (`blog-schedule.dist.check.ts`, `src/lib/blog.ts:24`) ; frontmatter et image manquante (`scripts/checks/lib/blog.ts`, `tests/unit/checks/blog.test.ts`) | R : validation PO des 28 articles (0/28), des 3 FAQ (`validated: false`), licences des 22 images (CR-6, `docs/guides/blog.md:114`). P : typographie (m1). Revue T-009-28 encore en « Review », T-009-29 à faire |
| US-010 Canonical et redirections | **Done sous réserve** | F : canonical autoréférente (`blog-canonical.spec.ts:18`), mention d'origine avec date (`:48`), couverture 28/28 et messages exacts (`redirects.content.check.ts`, `canonical.dist.check.ts`), table de 95 entrées avec deux formes d'URL (`src/data/redirects.yaml`). **P : « fichier nginx généré en artefact CI » : aucune étape de `ci.yml` ne l'exécute** (M1) | M1 ; m4 |
| US-011 Navigation du blog | **Done** | F : catégorie, pagination 12/3 pages, `/blog/page/1/` et `/blog/page/9/` en 404 avec « Retour au blog », tag rare non lié sans page, série « article N sur M », filtre repliable sous 768 px (`blog-navigation.spec.ts`, aucun skip) | Revue T-011-11 en « Review » |
| US-012 Recherche Pagefind | **Done** | F : « tokens » en moins de 300 ms, « methode » sans accent, clavier et focus, « zzzzqq », index indisponible, JS désactivé, aucune requête avant interaction, `noindex` (`search.spec.ts`), budget de 500 Ko et index non vide (`pagefind.dist.check.ts`) | P : `/recherche/` exclue de Lighthouse (m2). Revue T-012-12 en « Review » |
| US-013 Flux RSS | **Done sous réserve** | F : RSS valide, 20 articles, programmés exclus, découverte automatique, lien de pied de page à 24 px, type et charset nginx (`rss.spec.ts`, `rss.dist.check.ts`, `nginx.conf` `location = /rss.xml`), message « description manquante pour <slug> » (`src/lib/rss.ts`) | M4 : T-013-09 (GREEN) et T-013-11 (revue) non faites |
| US-024 SEO technique | **Done sous réserve** | F : JSON-LD par type, `BreadcrumbList` partout, sitemap sans `noindex` avec `lastmod`, `robots.txt`, `llms.txt` ≥ 10 liens (`seo.spec.ts`), messages « datePublished requis » et « propriété interdite 'telephone' » (`scripts/checks/lib/jsonld.ts:46`, `src/lib/jsonld/person.ts:34`), titres ≤ 60 et unicité (`meta.dist.check.ts`), domaine en dur (`no-hardcoded-domain.content.check.ts`) | M4 : T-024-16 et T-024-18 non faites. R : Search Console, Rich Results (T-900-28) |
| US-025 Images Open Graph | **Done sous réserve** | F : PNG 1200 × 630 et < 300 Ko (`scripts/checks/lib/og.ts:5,60`), `og:image:width/height/alt`, `twitter:card`, titre tronqué à 90 caractères avec ellipse, émojis retirés, police introuvable (`src/pages/og/[...route].ts`, `tests/unit/lib/og.test.ts`), images jamais chargées par les visiteurs (`og.spec.ts:83`). Le « maximum 3 lignes » repose sur la revue visuelle T-025-09 (statut Done), non automatisée | M4 : T-025-11 et T-025-13 non faites. m5 (ADR-0012 « Proposé ») |
| US-026 Analytics sans cookie | **Done sous réserve PO** | F : aucun script sans identifiant, DNT et GPC respectés, événements `contact_submit` (motif seul), `cv_download`, `rdv_click`, `outbound_*` une fois par clic, script bloqué sans erreur, aucun cookie ni stockage, CSP exacte (`analytics.spec.ts`, `src/lib/analytics-events.ts`, `src/scripts/analytics.ts`) ; section vie privée complétée (`src/content/legal/vie-privee.md:24-33`) | R : enregistrement réel dans Umami en production (T-900-28), compte Umami, exactitude de l'hébergement « États-Unis et UE ». M4 : T-026-13 non faite. m5 (ADR-0011 « Proposé ») |

## DoD transverse (sections 1 à 10)

| Section | Verdict | Remarque |
|---------|---------|----------|
| 1 Code | P | Lint, formatage, `astro check` : 0 erreur en CI. Revues de code non tracées pour 4 stories (M4). Squash merge en attente |
| 2 Contenu | P | Schéma strict et build qui échoue : F. Aucune donnée personnelle (téléphone, âge, adresse) : F. Typographie : P (m1). Images : `alt` renseigné ; licences R |
| 3 Tests | F | 990 unitaires, 603 e2e, CI verte, aucun skip hors liste. La preuve Gherkin de la PR est le présent tableau. Scénarios inter-US (T-900-24) non écrits |
| 4 Accessibilité | F | Axe sur les pages découvertes par exploration (donc `/recherche/` comprise), échantillonnage des gabarits répétés, clair et sombre ; clavier et `aria-live` testés. Aucune violation |
| 5 Performance et SEO | P | Lighthouse ≥ 0,95 sur 26 pages, mais `/recherche/` non mesurée (m2). `title`, `description`, canonical, Open Graph, JSON-LD, sitemap : F |
| 6 Sécurité | F | CSP sans `unsafe-inline`, HSTS, COOP, CORP, nosniff, Referrer-Policy, Permissions-Policy sur chaque `location` (`nginx/snippets/security-headers.conf`). Redirections sans injection : `from` et `to` valident `" ' \ ; { } $`, espaces, contrôles, `?`, `#` et domaine (`src/lib/redirects.ts:17-59`), origine fixée par `originOf`. Réserve : m3 |
| 7 Responsive | F | Matrice 360, 768 et 1280 px sur les pages échantillonnées, sans défilement horizontal ; tableaux et code défilants testés |
| 8 Documentation | P | CHANGELOG, README, 6 guides, ADR-0011 à 0013 et index à jour. Une inexactitude mineure (m2) |
| 9 Environnements | F | Tout passe par Docker, versions fixées, lockfile |
| 10 Déploiement | R | Non déployé : phase 4 (T-900-26 à T-900-28) non réalisée |

## Écarts classés

### Bloquants (0)

Aucun.

### Majeurs (4)

**M1. L'artefact de redirections nginx n'est pas produit par la CI** (US-010, scénario « Table de correspondance complète et prête à l'emploi », critère technique « Fichier de redirections nginx généré en artefact CI »). `scripts/build-redirects.ts` et `make redirects` (`mk/lot-a.mk:4`) existent, mais `.github/workflows/ci.yml` ne les appelle pas et n'envoie aucun artefact. La tâche T-900-21 (« artefact de redirections ») est à faire. Correction : ajouter au job `quality` ou `e2e` une étape qui exécute `node scripts/build-redirects.ts reports/redirects` avec `PUBLIC_SITE_URL`, puis l'inclure dans `rapports-qualite`, ou un `upload-artifact` dédié ; ajouter une assertion « fichier non vide, 28 articles × 2 formes ».

**M2. Le suivi des tâches se contredit.** `task-board.md:5-11` annonce 117 tâches à faire et 23 terminées, alors que les fichiers `tasks/US-*-tasks.md` marquent presque tout en ✅ (US-009 : 27 faites, 1 en revue, 1 à faire ; US-010, 011, 012 : toutes faites sauf la revue) et que la CI prouve la livraison. Le tableau Kanban et les statuts de lot A et B (« À faire ») sont périmés. Correction : l'orchestrateur resynchronise le board depuis les fichiers de tâches (`/project:sync-backlog`) et recalcule le résumé.

**M3. La phase 4 n'est pas réalisée.** T-900-21 à T-900-26 sont à faire. Conséquences vérifiables : `OK_PATHS` du contrôle de fumée (`scripts/checks/lib/smoke.ts:4-13`) ne contient aucune page du blog, ni `/recherche/`, `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`, `/llms.txt` ; aucun scénario e2e inter-US (T-900-24) ; Lighthouse reste dans le job `e2e` (environ 15 min sur un plafond de 30) ; aucune mesure de durée de CI (T-900-25). Correction : réaliser T-900-22/23 (étendre `OK_PATHS`) avant le déploiement ; sans cela, le contrôle de fumée de la DoD §10 ne couvre pas le périmètre du sprint.

**M4. Revues et vérifications GREEN non tracées pour 4 stories.** DoD §1 (revue) et §3 (preuve Gherkin) : T-013-09 et T-013-11, T-024-16 et T-024-18, T-025-11 et T-025-13, T-026-13 sont à faire ; les revues T-009-28, T-010-12, T-011-11, T-012-12 restent en « Review ». Le code est conforme (voir le tableau ci-dessus), il manque la clôture formelle. Correction : clôturer ces tâches en s'appuyant sur ce rapport pour la preuve Gherkin, ou faire relire les 4 stories concernées.

### Mineurs (8)

- **m1. Typographie française.** Espace ordinaire avant `:`, `;`, `?`, `!` dans 19 titres d'articles (`title:` du frontmatter) et environ 507 endroits des corps ; aucune espace insécable (DoD §2). Le guide `docs/guides/blog.md:193` ne couvre que description, titre SEO, texte alternatif et FAQ, et ces champs sont conformes. Correction : étape de normalisation dans `blog-migration.ts` (ou plugin de rendu) insérant l'espace insécable avant `: ; ? !` hors code ; étendre aux `title`.
- **m2. `/recherche/` exclue de Lighthouse** (`scripts/checks/lib/dist-routes.ts:5`), donc le critère « Lighthouse ≥ 95 » d'US-012 n'est pas mesuré sur sa page propre. Correction : retirer `/recherche/` de `EXCLUDED` (une page `noindex` se mesure), ou documenter la dérogation. Le CHANGELOG dit que « Lighthouse et axe » l'ignorent : c'est inexact pour axe, qui l'atteint par exploration.
- **m3. `'wasm-unsafe-eval'` dans le `script-src` de toutes les pages** (`nginx/snippets/security-headers.conf:5`), alors que seule `/recherche/` charge le module WebAssembly de Pagefind. Correction : limiter à une `location = /recherche/` avec sa propre CSP, ou consigner explicitement le compromis dans l'ADR-0009.
- **m4. La mention d'origine pointe vers `agentic-agency.fr`**, qui répond 401 (`src/components/blog/OriginalNotice.astro`) : un lecteur tombe sur une page d'authentification. Conforme à la story, mais décision à confirmer par le PO (lien conservé ou texte seul tant que l'ancien site n'est pas public).
- **m5. ADR-0011 et ADR-0012 au statut « Proposé »** (`docs/adr/README.md:15-16`). À passer en « Accepté » après décision du PO.
- **m6. Statuts en attente de preuve : T-900-04 et T-900-11** sont en « Review » « jusqu'à la preuve CI ». La preuve existe (« Tests e2e : 603 exécutés / 3 ignorés (0 hors liste d'exceptions) », variables factices présentes dans `ci.yml:16-24`) : à passer en Done.
- **m7. Intitulés de profil hétérogènes** : JSON-LD `jobTitle` « Directeur de projets IT, delivery manager et architecte e-commerce » contre la note d'auteur « COO/CTO, delivery manager et architecte e-commerce » (`src/components/blog/AuthorNote.astro`). À harmoniser.
- **m8. `PUBLIC_SITE_URL: https://thibaut-monier.fr` en clair dans `ci.yml:17`.** Valeur de repli identique à `astro.config.mjs`, hors du périmètre du contrôle de domaine en dur. Accepté, à signaler dans `docs/guides/seo-technique.md`.

### Réserves PO (actions humaines)

1. Valider les 6 lots d'articles de `contenu-a-valider.md` (0/28 validés ; jalon n°2 au 2026-11-18), les 3 FAQ, l'ordre des 6 séries, les descriptions, titres SEO, textes alternatifs et tags.
2. Déclarer l'origine et la licence des 22 couvertures (CR-6).
3. Décider du sort du lien vers l'ancien site (m4) et valider ADR-0011 et ADR-0012.
4. Créer le compte Umami Hobby, renseigner `PUBLIC_UMAMI_WEBSITE_ID`, vérifier l'enregistrement des événements en production ; relire la section vie privée (hébergement États-Unis et UE).
5. Search Console (soumission du sitemap), Rich Results, domaine et DNS, variables Railway, déploiement, contrôle de fumée et validation PO sur la production, squash merge de la PR #3 (DoD §10 et §1).

## Ordre de correction recommandé

M1, puis M3 (extension de `OK_PATHS`), puis M2 et M4 (administratif), m6 en même temps. Les mineurs m1 à m3 peuvent rejoindre le sprint 4 sans empêcher la fusion.

---

## Seconde passe (2026-10-15)

> Seconde passe de la tâche T-900-27, après la remédiation (commits `e41bea1` à `095eb39`). Relecture du code, de la configuration nginx, des fichiers de tâches et du journal de la CI du run 38713520394 (HEAD `095eb39`) ; aucun build, aucun e2e local, aucune commande Git. Seul ce fichier est modifié.

### Preuves de la seconde passe

| Vérification | Résultat |
|--------------|----------|
| CI, run 38713520394 | `dockerfile`, `supply-chain`, `quality`, `external-links`, `e2e`, `ci` : `success` |
| Playwright | « Tests e2e : 615 exécutés / 3 ignorés (0 hors liste d'exceptions) » (603 + 12 : les 4 scénarios de `tests/e2e/sprint-003.spec.ts` en desktop et mobile) |
| Artefact de redirections | étape « Génération des redirections nginx » (`ci.yml:80-87`) ; artefact `redirections-nginx` « successfully uploaded » (2190 octets) dans le job `quality` |
| Contrôles de build | `Contrôles content : OK` et `Contrôles dist : OK` dans les builds de `quality` et de `supply-chain` |
| Tests unitaires | `tests/unit/checks/smoke.test.ts` : 16 tests verts dans le journal ; suite non relancée par ce relecteur |

### Écarts de la première passe

| Écart | Nouveau statut | Preuve et reste à faire |
|-------|----------------|-------------------------|
| **M1** Artefact de redirections | **Corrigé** | `ci.yml:70-92` : génération dans Docker, `test -s`, `grep -c '^location = ' ≥ 56` (28 articles × 2 formes), `upload-artifact` `redirections-nginx`, `if-no-files-found: error`. Publication constatée dans le journal |
| **M2** Board contradictoire | **Corrigé** | `task-board.md:5-11` : 5 à faire, 10 en cours, 6 en revue, 121 terminées (142 tâches). Recomptage des lignes `tasks/*.md` par statut : 5 / 10 / 6 / 121 / 0, identique. Détail ci-dessous (nouvel écart m9) |
| **M3** Phase 4 | **Partiellement corrigé** | T-900-22/23 faites : `OK_PATHS` (`scripts/checks/lib/smoke.ts:4-22`) couvre `/blog/`, `/blog/page/2/`, un article, une catégorie, `/recherche/`, `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`, `/llms.txt`, une image Open Graph, avec type de contenu exigé pour le RSS et le PNG. T-900-24 faite (`sprint-003.spec.ts` : navigation, recherche vers article, RSS, absence de cookie ; exécuté en CI). **Reste ouvert** : T-900-21 en partie (garde du dépôt, job Lighthouse séparé : Lighthouse reste dans `e2e`, `ci.yml:99,142`, `REQUIRE_VALIDATED_CONTENT`), T-900-25 (mesure de durée), T-900-26 (porte du sprint, build à blanc Railway, déploiement), T-900-28 |
| **M4** Revues et GREEN non tracés | **Corrigé (réserve de forme)** | T-009-28, T-010-12, T-011-11, T-012-12, T-013-09, T-013-11, T-024-16, T-024-18, T-025-11, T-025-13, T-026-13 sont passées à ✅. Réserve : T-013-11 et T-026-13 sont closes alors que leurs prédécesseurs T-013-10 et T-026-11/12 sont encore en cours (voir m9) ; la preuve Gherkin cite le présent rapport |
| **m1** Typographie | **Partiellement corrigé** | Les 19 titres concernés ont une espace insécable avant `: ; ? !` (28 titres, 19 avec insécable, 0 espace ordinaire restante) ; slugs et noms de fichiers de `src/content/blog/fr/` inchangés ; `CHANGELOG.md:46`. **Reste** : environ 420 lignes de corps avec espace ordinaire (contre environ 507), laissées au PO (`contenu-a-valider.md`). Relève du PO |
| **m2** `/recherche/` hors Lighthouse | **Toujours ouvert** | `scripts/checks/lib/dist-routes.ts:5` exclut encore `/recherche/` ; dérogation commentée, mais l'inexactitude du CHANGELOG sur axe n'est pas revérifiée ici. Mineur, sprint 4 |
| **m3** CSP `wasm-unsafe-eval` globale | **Corrigé** | `nginx.conf:35-38` : `map $uri $csp_wasm` ne renvoie `'wasm-unsafe-eval'` que pour `^/(recherche\|pagefind)/` ; `security-headers.conf:7` interpole `$csp_wasm`. Compromis consigné dans ADR-0009 §1 |
| **m4** Lien vers l'ancien site (401) | **Toujours ouvert, relève du PO** | `OriginalNotice.astro` inchangé |
| **m5** ADR-0011 et ADR-0012 « Proposé » | **Toujours ouvert, relève du PO** | `docs/adr/README.md:15-16` |
| **m6** T-900-04 et T-900-11 en « Review » | **Corrigé** | Les deux sont ✅ (`technical-tasks.md:12`) ; le décompte exécutés/ignorés est dans le journal |
| **m7** Intitulés de profil hétérogènes | **Toujours ouvert** | `AuthorNote.astro:13` (« COO/CTO ») contre `jobTitle` JSON-LD. Mineur |
| **m8** `PUBLIC_SITE_URL` en clair dans `ci.yml` | **Partiellement corrigé** | Documenté dans `docs/guides/seo-technique.md:74` (repli et effet), valeur CI inchangée et acceptée |

### Régressions

Aucune régression constatée.

- **En-têtes de sécurité** : `security-headers.conf` est inclus au niveau `server` (`nginx.conf:59`) et dans chacune des 13 `location` qui déclarent un `add_header` (`/`, `_astro`, `pagefind`, `rss.xml`, sitemaps, `robots`/`llms`, `og`, CV, médias, `404.html`, `50x.html`). Le `map` porte sur `$uri` (évalué après réécriture vers `index.html`), son motif exige la barre oblique finale : `/recherche/` et `/pagefind/` seulement, `default ""` ailleurs.
- **Typographie** : seul le champ `title:` change ; les slugs viennent des noms de fichiers, inchangés ; `redirects.yaml` non touché ; contrôles de build verts.
- **Fumée étendue** : élargie sans régression, tests unitaires verts. La fumée réelle contre l'image n'a pas été rejouée par ce relecteur (déclarée verte dans `technical-tasks.md:308`).

### Avis sur l'ADR-0009 précisé

Mineur, pas une réserve PO. L'ADR est déjà « Accepté », la précision restreint une dérogation sans en créer de nouvelle, et la décision reste dans son périmètre (CSP, écarts assumés). Un nouvel ADR aurait fragmenté la source de vérité (règle DRY de la documentation). Condition : mentionner la précision dans le CHANGELOG ou la date de mise à jour de l'ADR.

### Nouvel écart

- **m9. Statuts hétérogènes dans `tasks/*.md`** : 10 tâches encore « En cours » (dont T-009-12, T-012-09, T-013-10, T-024-17, T-025-09, T-025-12, T-026-11, T-026-12 ; les deux autres sont dans `technical-tasks.md`) et 6 « Review » (dont T-013-01, T-024-01, T-025-01, T-026-01, T-026-10), alors que les stories correspondantes sont closes par leurs revues et que la CI est verte. T-025-09 (revue visuelle) et T-026-12 (GREEN d'US-026) étaient comptées faites en première passe. Les revues T-013-11 et T-026-13 devancent leurs prédécesseurs. À solder par l'orchestrateur avant la porte du sprint. Mineur.

### Score et verdict

| Critère | Première passe | Seconde passe |
|---------|----------------|---------------|
| Bloquants | 0 | 0 |
| Majeurs | 4 | 1 partiel (M3, phase 4 : déploiement, mesure de durée, Lighthouse séparé) |
| Mineurs | 8 | 5 ouverts ou partiels (m1, m2, m4, m5, m7, m8) et m9 nouveau |
| Score | 88/100 | **95/100** |

**Verdict final : Done sous réserve PO.** Le code, la CI et la sécurité sont conformes ; M1, M2 et M4 sont corrigés, m3 et m6 aussi. Restent hors de portée de l'équipe de développement : validation des 28 articles, des 3 FAQ et des licences d'images, décision sur m4 et sur les ADR-0011/0012, typographie des corps (m1), Umami, Search Console, DNS, déploiement et contrôle de fumée en production (T-900-26 et T-900-28, DoD §10). M3 (partie déploiement et mesure) doit être soldé avant la fusion.
