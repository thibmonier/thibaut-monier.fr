# Task Board : Sprint 003 - Blog migré et SEO

> Statuts : 🔲 À faire | 🔄 En cours | 👀 Review | ✅ Done | 🚫 Bloqué. Mis à jour par l'orchestrateur seul (jamais par un worker).

## Résumé

| Statut | Tâches | Heures |
|--------|--------|--------|
| 🔲 À faire | 5 | 15,5h |
| 🔄 En cours | 10 | 23,5h |
| 👀 Review | 6 | 15h |
| ✅ Done | 121 | 355h |
| 🚫 Bloqué | 0 | 0h |

| Lot | Worker | Tâches | Heures |
|-----|--------|--------|--------|
| Phase 0 | orchestrateur | 24 | 62h |
| A | W1 | 55 | 161,5h |
| B | W2 | 54 | 158h |
| Phase 4 | orchestrateur | 9 | 27,5h |

Limite de travail en cours : 1 tâche par worker, 2 workers au plus (disque), `make preflight` avant chaque lot.

## 🔲 À faire

### US-009 : Migration des 28 articles d'Agentic Agency (lot A)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-009-29 | [REV] | Relecture éditoriale des 28 articles par lots et validation PO | 3h | A |

### Phase 4 : intégration (orchestrateur)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-900-20 | [DOC] | Phase 4 : fusion des lots, CHANGELOG, index des guides et des ADR | 3h | Phase 4 |
| T-900-25 | [OPS] | Phase 4 : mesure de la durée de la CI et ajustements | 3h | Phase 4 |
| T-900-26 | [OPS] | Phase 4 : porte du sprint, build à blanc Railway et runner, déploiement | 4h | Phase 4 |
| T-900-28 | [OPS] | Phase 4 : actions en production avec le PO (Search Console, Rich Results, Umami) | 2,5h | Phase 4 |

## 🔄 En cours

### US-009 : Migration des 28 articles d'Agentic Agency (lot A)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-009-12 | [CONTENT] | Images : copie, provenance et licences (CR-6) | 3h | A |

### US-012 : Recherche plein texte côté client (Pagefind) (lot A)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-012-09 | [TEST] | Vérification GREEN d'US-012 | 2,5h | A |

### US-013 : Flux RSS (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-013-10 | [DOC] | Guide du flux RSS et fragment de CHANGELOG | 1h | B |

### US-024 : SEO technique et données structurées (JSON-LD, sitemap, llms.txt) (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-024-17 | [DOC] | Guide du SEO technique, variables et fragment de CHANGELOG | 1,5h | B |

### US-025 : Images Open Graph générées au build (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-025-09 | [CONTENT] | Revue visuelle des images générées | 1,5h | B |
| T-025-12 | [DOC] | Guide des images Open Graph, ADR-0012 et fragment de CHANGELOG | 2h | B |

### US-026 : Analytics sans cookie et mesure des conversions (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-026-11 | [DOC] | Guide d'analytics, variable et fragment de CHANGELOG | 1,5h | B |
| T-026-12 | [TEST] | Vérification GREEN d'US-026 | 2h | B |

### Phase 4 : intégration (orchestrateur)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-900-21 | [OPS] | Phase 4 : ci.yml final (artefact de redirections, garde du dépôt, Lighthouse séparé, durées) | 3,5h | Phase 4 |
| T-900-27 | [REV] | Phase 4 : revue DoD indépendante transverse | 5h | Phase 4 |

## 👀 Review

### US-013 : Flux RSS (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-013-01 | [CONTENT] | Décisions du flux RSS | 1,5h | B |

### US-024 : SEO technique et données structurées (JSON-LD, sitemap, llms.txt) (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-024-01 | [CONTENT] | Décisions SEO technique : types JSON-LD, sitemap, llms.txt | 2,5h | B |

### US-025 : Images Open Graph générées au build (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-025-01 | [CONTENT] | Décisions Open Graph : bibliothèque, gabarit, couverture | 2h | B |

### US-026 : Analytics sans cookie et mesure des conversions (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-026-01 | [CONTENT] | ADR-0011 : chargement d'Umami et contrat des événements (avant le code) | 3h | B |
| T-026-10 | [CONTENT] | Vérifier et compléter la section mesure d'audience de /vie-privee/ | 2h | B |

### Phase 4 : intégration (orchestrateur)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-900-24 | [TEST] | Phase 4 : scénarios e2e inter-US du sprint 3 | 4h | Phase 4 |

## ✅ Done

Phase 0 (2026-10-14, worker W0) : preuves E25 consignées dans le rapport de phase 0. Lots A et B : CI verte du run 38698008560 (603 e2e exécutés / 3 ignorés, Lighthouse ≥ 0,95), revue `dod-review.md` du 2026-10-15.

### Phase 0 : retour de rétro, socle et contrats (orchestrateur)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-009-01 | [CONTENT] | Inventaire de la source et décisions de migration | 3h | Phase 0 |
| T-009-02 | [TEST] | Écrire les tests unitaires RED : schéma blog (contrat C1) | 3h | Phase 0 |
| T-009-03 | [FE-WEB] | Schéma blog et collection enregistrée (contrat C1, C2) | 3h | Phase 0 |
| T-009-04 | [TEST] | Écrire les tests unitaires RED : lib/blog.ts (contrat C3) | 3h | Phase 0 |
| T-009-05 | [FE-WEB] | lib/blog.ts et blog-source.ts : un seul lecteur de la collection (contrat C3) | 4h | Phase 0 |
| T-009-06 | [TEST] | Écrire les tests RED du plugin rehype des blocs défilants | 1,5h | Phase 0 |
| T-009-07 | [FE-WEB] | Plugin rehype des blocs défilants et configuration Markdown d'Astro | 2,5h | Phase 0 |
| T-010-01 | [CONTENT] | Relever les URL d'origine sur agentic-agency.fr (lecture seule) | 2h | Phase 0 |
| T-010-02 | [TEST] | Écrire les tests unitaires RED : lib/redirects.ts (contrat C6) | 3,5h | Phase 0 |
| T-010-03 | [FE-WEB] | src/lib/redirects.ts : schéma, couverture et génération nginx | 3h | Phase 0 |
| T-024-02 | [FE-WEB] | Contrat C5 : types de métadonnées de page et props de BaseLayout (sans comportement) | 2h | Phase 0 |
| T-900-01 | [OPS] | Contrôle no-global-prune (prompts, scripts, Makefile, workflows) | 3h | Phase 0 |
| T-900-02 | [OPS] | Cible make preflight (disque, sans prune global) | 2h | Phase 0 |
| T-900-03 | [DOC] | Créer contenu-a-valider.md (28 articles par lots de 5, sprints 1 et 2) | 2h | Phase 0 |
| T-900-04 | [OPS] | Liste d'exceptions e2e versionnée et compte exécutés/ignorés dans la CI | 4h | Phase 0 |
| T-900-05 | [DOC] | Guide worktrees-agents et section « Pièges d'environnement » | 3h | Phase 0 |
| T-900-06 | [OPS] | Zones anti-conflit : mk/, changelog.d/, propriété des fichiers | 1,5h | Phase 0 |
| T-900-07 | [OPS] | Dépendances du sprint en une passe et vérifications natives (Pagefind, MIME nginx) | 4h | Phase 0 |
| T-900-08 | [OPS] | Chaîne de build : étape Pagefind après le build, avant les contrôles dist | 1,5h | Phase 0 |
| T-900-09 | [TEST] | Écrire les tests RED du module d'URL absolue (site-url) | 1,5h | Phase 0 |
| T-900-10 | [FE-WEB] | Module unique d'URL absolue : src/lib/site-url.ts | 1,5h | Phase 0 |
| T-900-11 | [OPS] | CI : variables factices PUBLIC_SITE_URL et PUBLIC_UMAMI_WEBSITE_ID | 1,5h | Phase 0 |
| T-900-12 | [TEST] | Écrire les tests RED de l'échantillonnage des gabarits répétés | 2,5h | Phase 0 |
| T-900-13 | [FE-WEB] | Échantillonnage dans axe, matrice responsive et Lighthouse (délai proportionnel) | 3,5h | Phase 0 |

### US-009 : Migration des 28 articles d'Agentic Agency (lot A)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-009-08 | [TEST] | Écrire les tests RED : bibliothèque de migration des articles | 4h | A |
| T-009-09 | [FE-WEB] | Bibliothèque et script de migration idempotent | 5h | A |
| T-009-10 | [TEST] | Écrire les tests RED : contrôles de contenu du blog | 4h | A |
| T-009-11 | [OPS] | Contrôle de contenu blog.content.check.ts | 5h | A |
| T-009-13 | [CONTENT] | Lot 1 de 5 articles (pilotes) : normalisation et relecture | 4h | A |
| T-009-14 | [CONTENT] | Lot 2 de 5 articles : série « L'agence digitale augmentée » et outils | 3h | A |
| T-009-15 | [CONTENT] | Lot 3 de 5 articles : série « Les métiers à l'ère agentic » | 3h | A |
| T-009-16 | [CONTENT] | Lot 4 de 5 articles : série « Transformer l'agence » | 3h | A |
| T-009-17 | [CONTENT] | Lot 5 de 5 articles : méthode SDD, outils et risques | 3h | A |
| T-009-18 | [CONTENT] | Lot 6 de 3 articles : série « Les nouveaux risques projet » | 2h | A |
| T-009-19 | [CONTENT] | Rédiger la FAQ de 3 articles | 3h | A |
| T-009-20 | [TEST] | Écrire les tests e2e RED du blog (article, index, FAQ, 404) | 4h | A |
| T-009-21 | [FE-WEB] | Composants ArticleCard, Faq et AuthorNote | 3,5h | A |
| T-009-22 | [FE-WEB] | ArticleLayout et styles de lecture | 5h | A |
| T-009-23 | [FE-WEB] | Routes /blog/ et /blog/[slug]/ | 4h | A |
| T-009-24 | [FE-WEB] | Navigation : ajouter Blog et adapter les tests qui supposaient le blog absent | 1h | A |
| T-009-25 | [OPS] | Contrôle dist de la publication programmée | 2,5h | A |
| T-009-26 | [TEST] | Vérification GREEN d'US-009 et liste d'échantillonnage | 3h | A |
| T-009-27 | [DOC] | Guide du blog et fragment de CHANGELOG | 2h | A |
| T-009-28 | [REV] | Revue de code d'US-009 | 3h | A |
| T-009-30 | [OPS] | Étendre le contrôle des liens externes de la CI aux articles | 2h | A |

### US-010 : Canonical sur le nouveau domaine et table de correspondance prête pour les redirections (lot A)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-010-04 | [CONTENT] | Table de correspondance versionnée (articles et index) | 3h | A |
| T-010-05 | [TEST] | Écrire les tests RED : contrôles canonical, redirections et pages orphelines | 4h | A |
| T-010-06 | [OPS] | Contrôles canonical, redirects (content et dist) et pages orphelines | 5,5h | A |
| T-010-07 | [OPS] | build-redirects.ts et cible make redirects (artefact non déployé) | 2,5h | A |
| T-010-08 | [TEST] | Écrire les tests e2e RED : canonical autoréférent et mention d'origine | 2,5h | A |
| T-010-09 | [FE-WEB] | Composant OriginalNotice dans ArticleLayout | 2h | A |
| T-010-10 | [TEST] | Vérification GREEN d'US-010 | 2h | A |
| T-010-11 | [DOC] | Guide redirections-blog | 1,5h | A |
| T-010-12 | [REV] | Revue d'US-010 | 2h | A |

### US-011 : Navigation du blog : catégories, tags, séries, pagination (lot A)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-011-01 | [CONTENT] | Décisions de navigation : tags, taille de page, séries | 2,5h | A |
| T-011-02 | [TEST] | Écrire les tests unitaires RED : taxonomies du blog | 3h | A |
| T-011-03 | [FE-WEB] | src/lib/blog-taxonomy.ts | 3h | A |
| T-011-04 | [TEST] | Écrire les tests e2e RED : navigation du blog | 3,5h | A |
| T-011-05 | [FE-WEB] | Composants Pagination, TaxonomyList, SeriesNav et TagList | 5h | A |
| T-011-06 | [FE-WEB] | Routes : index paginé, catégories, tags, séries | 5h | A |
| T-011-07 | [FE-WEB] | ArticleLayout : encart de série, catégorie et tags liés | 2,5h | A |
| T-011-08 | [FE-WEB] | Page 404 : lien « Retour au blog » et tests de la 404 | 1h | A |
| T-011-09 | [TEST] | Vérification GREEN d'US-011 | 2,5h | A |
| T-011-10 | [DOC] | Guide de navigation du blog | 1h | A |
| T-011-11 | [REV] | Revue d'US-011 | 2h | A |

### US-012 : Recherche plein texte côté client (Pagefind) (lot A)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-012-01 | [CONTENT] | Décisions de la recherche : page dédiée, périmètre, interface | 1,5h | A |
| T-012-02 | [TEST] | Écrire les tests unitaires RED : lib/search.ts | 3h | A |
| T-012-03 | [FE-WEB] | lib/search.ts et script de recherche chargé à la demande | 5h | A |
| T-012-04 | [TEST] | Écrire les tests e2e RED : recherche | 4h | A |
| T-012-05 | [FE-WEB] | Marquage Pagefind dans ArticleLayout et titre focalisable | 1,5h | A |
| T-012-06 | [FE-WEB] | Page /recherche/, composant SearchBox et entrée de navigation | 4h | A |
| T-012-07 | [TEST] | Écrire les tests RED du contrôle dist de l'index Pagefind | 2h | A |
| T-012-08 | [OPS] | Contrôle dist de l'index Pagefind | 2,5h | A |
| T-012-10 | [DOC] | ADR-0013 : recherche Pagefind avec interface maison | 1,5h | A |
| T-012-11 | [DOC] | Guide de la recherche et fragment de CHANGELOG | 1h | A |
| T-012-12 | [REV] | Revue d'US-012 | 2h | A |

### US-013 : Flux RSS (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-013-02 | [TEST] | Écrire les tests unitaires RED : lib/rss.ts | 3h | B |
| T-013-03 | [FE-WEB] | lib/rss.ts et endpoint /rss.xml | 3,5h | B |
| T-013-04 | [TEST] | Écrire les tests RED du contrôle dist du flux | 2h | B |
| T-013-05 | [OPS] | Contrôle dist rss.dist.check.ts | 3h | B |
| T-013-06 | [FE-WEB] | Découverte automatique et lien « S'abonner (RSS) » du pied de page | 2h | B |
| T-013-07 | [OPS] | nginx : type de contenu et cache de /rss.xml | 2h | B |
| T-013-08 | [TEST] | Écrire les tests e2e RED : flux RSS | 3h | B |
| T-013-09 | [TEST] | Vérification GREEN d'US-013 | 2h | B |
| T-013-11 | [REV] | Revue d'US-013 | 1,5h | B |

### US-024 : SEO technique et données structurées (JSON-LD, sitemap, llms.txt) (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-024-03 | [TEST] | Écrire les tests unitaires RED : générateurs JSON-LD et fil d'Ariane | 5h | B |
| T-024-04 | [FE-WEB] | Générateurs JSON-LD typés : src/lib/jsonld/ | 6h | B |
| T-024-05 | [FE-WEB] | Composant JsonLd, intégration à Seo et fil d'Ariane automatique | 4h | B |
| T-024-06 | [FE-WEB] | Brancher JSON-LD sur les pages existantes (accueil, parcours, fiches, catalogue) | 4h | B |
| T-024-07 | [TEST] | Écrire les tests RED du contrôle dist JSON-LD | 3h | B |
| T-024-08 | [OPS] | Contrôle dist jsonld.dist.check.ts | 4h | B |
| T-024-09 | [TEST] | Écrire les tests RED du contrôle des métadonnées | 2h | B |
| T-024-10 | [OPS] | Contrôle dist des métadonnées | 2,5h | B |
| T-024-11 | [CONTENT] | Corriger les titres et descriptions hors limites des pages existantes | 3h | B |
| T-024-12 | [TEST] | Écrire les tests RED : sitemap, robots.txt, llms.txt et garde-fous | 5h | B |
| T-024-13 | [FE-WEB] | Sitemap, robots.txt, llms.txt et leurs contrôles | 7h | B |
| T-024-14 | [OPS] | nginx : robots.txt, llms.txt et sitemaps (type, charset, cache) | 2h | B |
| T-024-15 | [TEST] | Écrire les tests e2e RED : SEO technique | 4h | B |
| T-024-16 | [TEST] | Vérification GREEN d'US-024 | 3h | B |
| T-024-18 | [REV] | Revue d'US-024 | 2,5h | B |

### US-025 : Images Open Graph générées au build (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-025-02 | [TEST] | Écrire les tests unitaires RED : lib/og.ts | 4h | B |
| T-025-03 | [FE-WEB] | lib/og.ts : registre des pages et URL des images | 4h | B |
| T-025-04 | [FE-WEB] | Endpoint d'images /og/[...route].png et gabarit | 5h | B |
| T-025-05 | [FE-WEB] | Seo.astro : balises og:image, twitter:* et texte alternatif | 2h | B |
| T-025-06 | [TEST] | Écrire les tests RED du contrôle dist des images Open Graph | 3h | B |
| T-025-07 | [OPS] | Contrôle dist og.dist.check.ts | 3h | B |
| T-025-08 | [TEST] | Écrire les tests e2e RED : partage et images Open Graph | 2,5h | B |
| T-025-10 | [OPS] | Durée de génération, cache et nginx pour /og/ | 2h | B |
| T-025-11 | [TEST] | Vérification GREEN d'US-025 | 2h | B |
| T-025-13 | [REV] | Revue d'US-025 | 1,5h | B |

### US-026 : Analytics sans cookie et mesure des conversions (lot B)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-026-02 | [TEST] | Écrire les tests unitaires RED : lib/analytics-events.ts | 4h | B |
| T-026-03 | [FE-WEB] | src/lib/analytics-events.ts : seul lecteur de la configuration et du contrat | 4h | B |
| T-026-04 | [TEST] | Écrire les tests RED du contrôle de contrat des événements | 2,5h | B |
| T-026-05 | [OPS] | Contrôle de contrat analytics-events.content.check.ts | 3h | B |
| T-026-06 | [FE-WEB] | Analytics.astro, chargeur différé et délégation des clics | 5h | B |
| T-026-07 | [FE-WEB] | Marquage des liens et de l'envoi du formulaire | 3h | B |
| T-026-08 | [TEST] | Écrire les tests e2e RED : audience sans cookie et événements | 4,5h | B |
| T-026-09 | [OPS] | CSP et domaines d'Umami : confirmation et test d'en-têtes | 1,5h | B |
| T-026-13 | [REV] | Revue d'US-026 | 2h | B |

### Phase 4 : intégration (orchestrateur)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-900-22 | [TEST] | Phase 4 : tests RED du contrôle de fumée étendu | 1,5h | Phase 4 |
| T-900-23 | [OPS] | Phase 4 : contrôle de fumée étendu (OK_PATHS) | 1h | Phase 4 |

## 🚫 Bloqué

Aucune tâche.

## Preuves de clôture (remédiation du 2026-10-15, W4)

| Tâches | Preuve |
|--------|--------|
| T-900-04, T-900-11 | CI run 38698008560 : reporter strict, résumé « 603 exécutés / 3 ignorés (0 hors liste d'exceptions) », variables factices dans `ci.yml` |
| T-013-09, T-024-16, T-025-11 | CI run 38698008560 (e2e `rss.spec.ts`, `seo.spec.ts`, `og.spec.ts`, contrôles `og`, `sitemap`, `jsonld` du build, Lighthouse ≥ 0,95) et code relu dans `dod-review.md` (tableau par user story). T-025-11 : la revue visuelle T-025-09 reste 🔄, le « maximum 3 lignes » n'est pas automatisé |
| T-009-28, T-010-12, T-011-11, T-012-12 | Relecture du lot A (3 constats importants corrigés : `aria-live` du message de recherche, apostrophe interdite dans `to` des redirections, préfixe de slug dans `blog-schedule.test.ts`) et `dod-review.md` |
| T-013-11, T-024-18, T-025-13, T-026-13 | `dod-review.md` (lot B : relecture du code, des tests et des journaux CI, aucun bloquant) |
| T-900-22, T-900-23 | `tests/unit/checks/smoke.test.ts` (RED constaté, puis vert) ; fumée réelle verte contre l'image nginx locale servant le `dist/` courant |
| T-900-24 | `tests/e2e/sprint-003.spec.ts` écrit, lint et types verts ; exécution confirmée par la CI (pas de Chromium Linux local) |
| Reste ouvert | T-900-21 (garde du dépôt, job Lighthouse séparé, `REQUIRE_VALIDATED_CONTENT`), T-900-25 (mesures), T-900-26 et T-900-28 (production, PO), T-900-27 (seconde passe) |

## Jalons

| Date | Jalon |
|------|-------|
| 2026-11-12 | Planning, fin de la phase 0 (S0), création des worktrees |
| 2026-11-17 | Jalon n°1 : US-009 et US-010 déployées ensemble (S1) |
| 2026-11-18 | Revue DoD indépendante à mi-sprint, validation PO des contenus (jalon n°2) |
| 2026-11-19 | Affinage |
| 2026-11-25 | Sprint Review (démo en production) et rétrospective |
