# Task Board : Sprint 002 - Preuves : profil complet et open source

> Statuts : 🔲 À faire | 🔄 En cours | 👀 Review | ✅ Done | 🚫 Bloqué. Mis à jour par l’orchestrateur.

## Résumé

| Statut | Tâches | Heures |
|--------|--------|--------|
| 🔲 À faire | 109 | 303h |
| 🔄 En cours | 0 | 0h |
| 👀 Review | 0 | 0h |
| ✅ Done | 0 | 0h |
| 🚫 Bloqué | 0 | 0h |

## 🔲 À faire

### Phase 0 (prérequis et décisions, en parallèle)

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-900-00 | [OPS] | Phase 0 : prérequis hors backlog (publication Packagist et dépôts) | 1,5h | 0 |
| T-007-01 | [CONTENT] | Cadrer le CV public et trancher les choix de forme | 1,5h | 1 |
| T-006-01 | [CONTENT] | Arbitrages et sélection des réalisations | 2h | 1 |
| T-019-01 | [CONTENT] | Trancher les décisions du catalogue (slugs, thèmes, hub, captures) | 2h | 2 |
| T-021-01 | [CONTENT] | Décisions : jeton, rythme de rafraîchissement, liste des dépôts | 1h | 3 |
| T-023-01 | [CONTENT] | Vérifier les faits au jour de la rédaction et rédiger le résumé | 3h | 3 |
| T-022-01 | [CONTENT] | Rassembler les faits du bundle et planifier la capture | 3h | 3 |

### US-007 : CV PDF téléchargeable généré au build

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-007-02 | [TEST] | Écrire les tests unitaires RED : assemblage des données du CV, schéma profile, contrôle de confidentialité du PDF | 3,5h | 1 |
| T-007-03 | [TEST] | Écrire les tests e2e RED : lien de téléchargement et en-têtes du PDF | 3,5h | 1 |
| T-007-04 | [OPS] | Dockerfile : binaire Typst et extraction de texte dans l’image des dépendances | 3h | 1 |
| T-007-05 | [FE-WEB] | Schéma `profile`, enregistrement de la collection et assemblage des données du CV (`cv-data`) | 4h | 1 |
| T-007-06 | [CONTENT] | Rédiger `profile.yaml` (titre, accroche, résumé, liens) | 1h | 1 |
| T-007-07 | [CONTENT] | Ajouter les polices Inter statiques (TTF) du CV et leur licence | 1h | 1 |
| T-007-08 | [FE-WEB] | Gabarit Typst `cv/cv.typ` : structure et contenu sur 2 pages A4 | 5h | 1 |
| T-007-09 | [FE-WEB] | Gabarit Typst : charte du site, métadonnées et balisage du PDF | 4h | 1 |
| T-007-10 | [OPS] | Intégrer la génération au build : `build-cv.ts`, script npm, cible `make cv` | 3,5h | 1 |
| T-007-11 | [OPS] | Contrôle de build `cv-pdf` sur `dist/` (texte, pages, taille, métadonnées) | 3,5h | 1 |
| T-007-12 | [OPS] | nginx : revalidation et en-têtes dédiés du PDF | 1,5h | 1 |
| T-007-13 | [FE-WEB] | Composant `CvDownload` et intégration à `/parcours/` et `/contact/` | 3h | 1 |
| T-007-14 | [TEST] | Vérification GREEN : `make ci` et contrôle manuel du PDF | 3h | 1 |
| T-007-15 | [DOC] | Guide du CV PDF, amendement d’ADR-0005, CHANGELOG | 2h | 1 |
| T-007-16 | [REV] | Revue d’US-007 | 2h | 1 |

### US-006 : Compétences et réalisations filtrables par domaine

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-006-02 | [TEST] | Écrire les tests unitaires RED : schémas et `filters.ts` | 3h | 1 |
| T-006-03 | [TEST] | Écrire les tests e2e RED de `/competences/` | 4h | 1 |
| T-006-04 | [FE-WEB] | Schémas `skills` et `achievements`, `filters.ts`, enregistrement des collections | 3,5h | 1 |
| T-006-05 | [OPS] | Contrôle de contenu `achievements` | 2,5h | 1 |
| T-006-06 | [CONTENT] | Rédiger `skills.yaml` | 2,5h | 1 |
| T-006-07 | [CONTENT] | Rédiger `achievements.yaml` (10 à 15 réalisations) | 4h | 1 |
| T-006-08 | [FE-WEB] | Composants `AchievementCard` et `DomainFilter` | 4h | 1 |
| T-006-09 | [FE-WEB] | Script de filtrage `skill-filter.ts` (< 3 Ko) | 3h | 1 |
| T-006-10 | [FE-WEB] | Page `/competences/`, entrée de navigation et SEO | 3h | 1 |
| T-006-11 | [TEST] | Vérification GREEN | 2h | 1 |
| T-006-12 | [DOC] | Guide « ajouter une réalisation ou une compétence » | 1,5h | 1 |
| T-006-13 | [REV] | Revue d’US-006 | 2h | 1 |

### US-019 : Catalogue des 20 plugins Sylius 2 filtrable par thème

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-019-02 | [OPS] | Ajouter `@astrojs/mdx` (et `sharp` si nécessaire) et l’intégration Astro | 2,5h | 2 |
| T-019-03 | [TEST] | Écrire les tests unitaires RED : schéma core et `plugins.ts` | 3,5h | 2 |
| T-019-04 | [TEST] | Écrire les tests e2e RED du catalogue | 4h | 2 |
| T-019-05 | [FE-WEB] | Schéma `plugins` (noyau), collection et `lib/plugins.ts` | 3,5h | 2 |
| T-019-06 | [OPS] | Contrôle de contenu `plugins` (décompte, thèmes, slugs, références) | 3h | 2 |
| T-019-07 | [CONTENT] | Renseigner le noyau des 20 plugins (nom, accroche, thème, dépôt, paquet) | 4h | 2 |
| T-019-08 | [FE-WEB] | Composants `PluginCard` et `PluginGrid` (groupés par thème) | 3,5h | 2 |
| T-019-09 | [FE-WEB] | Filtre par thème et recherche (`ThemeFilter`, `plugin-filter.ts`) | 4,5h | 2 |
| T-019-10 | [FE-WEB] | Page `/open-source/` (catalogue), entrée de navigation et SEO | 3h | 2 |
| T-019-11 | [TEST] | Vérification GREEN | 2h | 2 |
| T-019-12 | [DOC] | Guide « ajouter ou modifier un plugin » | 1,5h | 2 |
| T-019-13 | [REV] | Revue d’US-019 | 2h | 2 |
| T-019-14 | [CONTENT] | Phase 4 : re-pointer la preuve « plugins-sylius » de l’accueil vers `/open-source/` | 0,5h | 4 |

### US-020 : Fiche détaillée d’un plugin

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-020-01 | [TEST] | Écrire les tests unitaires RED : schéma étendu, dépendances, installation | 4h | 2 |
| T-020-02 | [TEST] | Écrire les tests e2e RED des fiches | 4,5h | 2 |
| T-020-03 | [FE-WEB] | Étendre le schéma `plugins` (champs optionnels) et les libs `plugin-deps`, `install` | 4h | 2 |
| T-020-04 | [OPS] | Étendre le contrôle de contenu : références, dépendances, messages de l’US | 2,5h | 2 |
| T-020-05 | [TEST] | Écrire les tests RED du contrôle dist des images de plugins | 2h | 3 |
| T-020-06 | [OPS] | Contrôle dist des images et script d’optimisation des captures (`sharp`) | 4,5h | 3 |
| T-020-07 | [CONTENT] | Revoir et sélectionner les captures (49 fichiers, 5,1 Mo), rédiger les textes alternatifs | 3h | 2 |
| T-020-08 | [OPS] | Optimiser et enregistrer les captures retenues | 1,5h | 2 |
| T-020-09 | [FE-WEB] | Composants `CompatMatrix` et `PluginDeps` | 3,5h | 2 |
| T-020-10 | [FE-WEB] | Composant `InstallSnippet` et script de copie (< 1 Ko) | 3h | 2 |
| T-020-11 | [FE-WEB] | Composant `Gallery` (captures optimisées) | 2,5h | 2 |
| T-020-12 | [FE-WEB] | `PluginLayout` et page `/open-source/sylius/[slug]/` | 4h | 2 |
| T-020-13 | [CONTENT] | Fiches B2B (1/2) : Company Accounts, Order Hold, Purchase Approval, Trade Credit, Quote Request | 5,5h | 2 |
| T-020-14 | [CONTENT] | Fiches B2B (2/2) : Quick Order, Tier Pricing, Container Fill, B2B MCP | 5h | 2 |
| T-020-15 | [CONTENT] | Fiches conformité UE : Factur-X, GPSR, Withdrawal | 3h | 2 |
| T-020-16 | [CONTENT] | Fiches back-office : Admin Order Creation, Audit Log, Bulk Actions, Command Palette, Timeline | 5h | 2 |
| T-020-17 | [CONTENT] | Fiches IA et intégrations : Agentic Feeds, AI Catalog Copilot, Webhook Outbox | 3h | 2 |
| T-020-18 | [FE-WEB] | Resserrer le schéma : champs de fiche obligatoires | 1h | 2 |
| T-020-19 | [TEST] | Vérification GREEN : `make ci`, axe sur 20 fiches, Lighthouse | 3,5h | 2 |
| T-020-20 | [DOC] | Compléter le guide des plugins (fiche, captures, dépendances) | 1,5h | 2 |
| T-020-21 | [REV] | Revue d’US-020 : code et relecture éditoriale des 20 fiches | 4h | 2 |

### US-021 : Données vivantes au build avec cache et repli

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-021-02 | [TEST] | Écrire les tests unitaires RED : collecte, repli et schéma des métriques | 5h | 3 |
| T-021-03 | [TEST] | Écrire les tests e2e RED : bloc de métriques d’une fiche | 2,5h | 2 |
| T-021-04 | [FE-WEB] | Schéma `oss-metrics`, lib de lecture et de présentation | 3h | 3 |
| T-021-05 | [OPS] | Script `fetch-oss-metrics.ts` : collecte, délais, repli, cible `make metrics` | 6h | 3 |
| T-021-06 | [OPS] | Première collecte réelle et enregistrement du JSON | 1,5h | 3 |
| T-021-07 | [FE-WEB] | Composant `LiveStats` et branchement dans `PluginLayout` | 3,5h | 2 |
| T-021-08 | [OPS] | Workflow `metrics.yml` : collecte planifiée et PR automatique | 3,5h | 3 |
| T-021-09 | [OPS] | Contrôle de contenu `oss-metrics` (schéma, péremption, clés manquantes) | 2h | 3 |
| T-021-10 | [TEST] | Vérification GREEN | 2h | 2 |
| T-021-11 | [DOC] | Guide des données open source et variables | 1,5h | 2 |
| T-021-12 | [REV] | Revue d’US-021 (sécurité du jeton et des permissions) | 2h | 2 |

### US-023 : Étude de cas des contributions career-ops

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-023-02 | [TEST] | Écrire les tests unitaires RED : schéma `projects` (contribution) et comptage de mots | 3h | 3 |
| T-023-03 | [TEST] | Écrire les tests e2e RED de l’étude de cas | 3,5h | 3 |
| T-023-04 | [FE-WEB] | Schéma `projects`, collection et lib `projects.ts` | 3h | 3 |
| T-023-05 | [OPS] | Contrôle de contenu `projects` | 2,5h | 3 |
| T-023-06 | [TEST] | Écrire les tests RED du contrôle de liens externes de la vitrine | 2h | 3 |
| T-023-07 | [OPS] | Contrôle externe bloquant et job CI `external-links` | 4h | 3 |
| T-023-08 | [CONTENT] | Rédiger l’étude de cas `career-ops.mdx` | 4h | 3 |
| T-023-09 | [FE-WEB] | Composant `ContributionCard` et `ProjectLayout` | 4h | 3 |
| T-023-10 | [FE-WEB] | Page `/open-source/career-ops/` | 2h | 3 |
| T-023-11 | [TEST] | Vérification GREEN | 1,5h | 3 |
| T-023-12 | [DOC] | Guide des pages de projets open source | 1h | 3 |
| T-023-13 | [REV] | Revue d’US-023 | 1,5h | 3 |
| T-023-14 | [FE-WEB] | Phase 4 : mention « Contributeur career-ops » sur `/parcours/` | 1,5h | 4 |
| T-023-15 | [CONTENT] | Phase 4 : re-pointer la preuve « pr-career-ops » de l’accueil vers l’étude de cas | 0,5h | 4 |

### US-022 : Page du bundle Symfony tailsfadmin

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-022-02 | [TEST] | Écrire les tests unitaires RED : schéma `projects` (bundle) | 2h | 3 |
| T-022-03 | [TEST] | Écrire les tests e2e RED de la page tailsfadmin | 3h | 3 |
| T-022-04 | [FE-WEB] | Étendre le schéma `projects` pour les bundles | 2h | 3 |
| T-022-05 | [CONTENT] | Produire et optimiser la capture de la démo | 1,5h | 3 |
| T-022-06 | [CONTENT] | Rédiger `tailsfadmin.mdx` | 3h | 3 |
| T-022-07 | [FE-WEB] | Page `/open-source/tailsfadmin/` | 3,5h | 3 |
| T-022-08 | [TEST] | Vérification GREEN | 1,5h | 3 |
| T-022-09 | [DOC] | Compléter le guide des projets et CHANGELOG | 1h | 3 |
| T-022-10 | [REV] | Revue d’US-022 | 1,5h | 3 |
| T-022-11 | [FE-WEB] | Phase 4 : section « Autres projets » sur `/open-source/` | 2,5h | 4 |

### T-900 : transverse

| ID | Type | Tâche | Estimation | Lot |
|----|------|-------|------------|-----|
| T-900-01 | [OPS] | Phase 4 : contrôle de fumée étendu (PDF, vitrine, compétences) | 2h | 4 |
| T-900-02 | [TEST] | Phase 4 : scénarios e2e inter-US | 3,5h | 4 |
| T-900-03 | [TEST] | Phase 4 : porte du sprint (`/gate:validate-sprint 002`) et budgets | 3h | 4 |
| T-900-04 | [OPS] | Phase 4 : build Railway (Typst, poppler, images) et déploiement | 2,5h | 4 |
| T-900-05 | [DOC] | Phase 4 : README, index des guides, CHANGELOG, mise à jour du modèle de contenu | 1,5h | 4 |
| T-900-06 | [REV] | Phase 4 : revue transverse et validation du PO sur la production | 2h | 4 |

## 🔄 En cours

_(aucune tâche)_

## 👀 Review

_(aucune tâche)_

## ✅ Done

_(aucune tâche)_

## 🚫 Bloqué

_(aucune tâche)_

## Charge par lot

| Lot | Tâches | Heures |
|-----|--------|--------|
| Phase 0 : décisions et prérequis (PO, parallèle) | 1 | 1,5h |
| Lot 1 : CV et compétences (W1) | 29 | 82h |
| Lot 2 : Catalogue et fiches Sylius (W2) | 37 | 114,5h |
| Lot 3 : Projets et collecte des métriques (W3) | 32 | 85,5h |
| Phase 4 : intégration | 10 | 19,5h |

## Lot 2 (W2) : état en fin de session

- ✅ US-019 : T-019-01 à T-019-12 ; 👀 T-019-13 (revue) ; T-019-14 reste en phase 4.
- ✅ US-020 : toutes les tâches du lot 2 sauf T-020-21 (👀 revue) ; T-020-05 et T-020-06 (contrôle dist des images, `optimize-captures.ts`) restent au lot 3 : les captures ont été optimisées avec `sharp` par un script jetable hors dépôt.
- ✅ US-021 (affichage) : T-021-03, T-021-07, T-021-10, T-021-11 ; 👀 T-021-12. La collecte (T-021-01, 02, 04, 05, 06, 08, 09) reste au lot 3.

