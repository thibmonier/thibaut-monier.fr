# Task Board : Sprint 001 « Walking skeleton »

> Statuts : 🔲 À faire · 🔄 En cours · 👀 Review · ✅ Done · 🚫 Bloqué
> Mis à jour par l'orchestrateur (écrivain unique). État initial : tout est à faire.
> **Mise à jour W1 (2026-10-14)** : ✅ T-001-02 à T-001-12 et T-001-18 ; T-003-01 à T-003-07 (livrés, CI non encore exécutée sur GitHub). 🔄 T-001-13 (e2e et Lighthouse validés avec un Chromium Alpine faute de place disque pour l'image Playwright). Restent : T-001-01, 14 à 17, 19, 20 ; T-003-08 à 12.
> **Mise à jour W2 (2026-10-14)** : ✅ T-002-01 à T-002-09 et T-002-12 (US-002 livrée, non commitée). 🔄 T-002-11 (e2e, axe, Lighthouse verts avec un Chromium Alpine). 🔲 T-002-10 (remplacée par les drapeaux `enabled` de `src/config/nav.ts`, arbitrage A4) et T-002-13 (revue).

> **Mise à jour W3B (2026-10-14)** : ✅ T-029-02 à T-029-09, T-008-02 à T-008-09 et T-008-12 (US-029 et US-008 livrées, non commitées ; e2e, axe et Lighthouse verts avec un Chromium Alpine). 🔄 T-029-01 et T-008-01 (décisions PO : adresse Railway, adresse e-mail de repli, durée de conservation), T-029-10 et T-008-13 (revues), T-008-10 (variables Railway/GitHub, hors worktree), T-008-11 (attend US-004).

**Sprint Goal** : mettre en production un site minimal mais complet où un recruteur ou un client comprend le positionnement, parcourt le parcours professionnel et peut prendre contact.

## Métriques

| Indicateur | Valeur |
|------------|--------|
| User stories | 7 (24 points) |
| Tâches | 90 |
| Heures estimées | 236,5h |
| Chemin critique | 63h |
| Tâches terminées | 0 / 90 |

## Kanban

| 🔲 À faire | 🔄 En cours | 👀 Review | ✅ Done | 🚫 Bloqué |
|-----------|------------|----------|--------|----------|
| 90 | 0 | 0 | 0 | 0 |

### 🔲 À faire

#### Lot 1 : Socle et CI (82h)

**US-001 : Squelette du site publié en production** (5 pts, 47h)

| ID | Type | Tâche | Est. | Resp. | Dépend de |
|----|------|-------|------|-------|-----------|
| T-001-01 | [OPS] | Prérequis manuels : dépôt GitHub, service Railway, DNS, comptes tiers | 1,5h | PO | - |
| T-001-02 | [OPS] | Amorcer le projet Astro 7.3.8 en conteneur (package.json, lockfile, tsconfig, astro.config) | 3h | Dev | - |
| T-001-03 | [OPS] | Dockerfile multi-étapes (base, deps, dev, build, test, runtime) | 4h | Dev | T-001-02 |
| T-001-04 | [OPS] | compose.yaml (dev, preview, tools, e2e), Makefile de base et .env.example | 3h | Dev | T-001-03 |
| T-001-05 | [TEST] | Configurer Vitest et Playwright ; écrire les tests RED de `privacy` et des schémas communs | 3,5h | Dev | T-001-04 |
| T-001-06 | [FE-WEB] | Implémenter `privacy.ts` et les schémas communs Zod (GREEN) | 2,5h | Dev | T-001-05 |
| T-001-07 | [TEST] | Écrire les tests e2e RED du squelette et des en-têtes de sécurité | 3h | Dev | T-001-05 |
| T-001-08 | [TEST] | Écrire le test RED du schéma `home` minimal | 1h | Dev | T-001-05 |
| T-001-09 | [FE-WEB] | Créer `content.config.ts` et le schéma `home` minimal (GREEN) | 1,5h | Dev | T-001-06, T-001-08 |
| T-001-10 | [CONTENT] | Renseigner `home.yaml` minimal (nom, titre du profil, lien contact) | 0,5h | Dev | T-001-09 |
| T-001-11 | [FE-WEB] | Layout racine minimal, page d'accueil, 404 et page 50x | 3h | Dev | T-001-07, T-001-09, T-001-10 |
| T-001-12 | [OPS] | nginx.conf durci et snippet d'en-têtes de sécurité | 4h | Dev | T-001-03, T-001-07 |
| T-001-13 | [OPS] | Valider le squelette en préproduction locale (jalon J1) | 2h | Dev | T-001-04, T-001-11, T-001-12 |
| T-001-14 | [OPS] | Configurer Railway : build du Dockerfile, variables, domaine, « Wait for CI » | 3h | Dev | T-001-01, T-001-13, T-003-07 |
| T-001-15 | [OPS] | Script de contrôle de fumée post-déploiement | 2h | Dev | T-001-12 |
| T-001-16 | [OPS] | Premier déploiement en production et vérification des scénarios | 2,5h | Dev | T-001-14, T-001-15 |
| T-001-17 | [OPS] | Workflow de déploiement de repli `deploy.yml` (conditionnel) | 2h | Dev | T-001-14 |
| T-001-18 | [OPS] | Renovate : configuration et épinglage des digests | 1h | Dev | T-001-02 |
| T-001-19 | [DOC] | README, CHANGELOG et guide de développement | 2h | Dev | T-001-16 |
| T-001-20 | [REV] | Revue d'US-001 (DoD §1, §6, §9, §10) | 2h | Dev | T-001-18, T-001-19 |

**US-003 : Pipeline CI qualité** (3 pts, 35h)

| ID | Type | Tâche | Est. | Resp. | Dépend de |
|----|------|-------|------|-------|-----------|
| T-003-01 | [TEST] | Écrire les tests RED des scripts de contrôle (liens, ancres, Lighthouse, découverte des pages) | 3,5h | Dev | T-001-05 |
| T-003-02 | [OPS] | ESLint, Prettier et `astro check` en mode vérification | 3h | Dev | T-001-04 |
| T-003-03 | [OPS] | Exécuteur de contrôles et vérification des liens internes et des ancres (GREEN) | 4h | Dev | T-003-01 |
| T-003-04 | [OPS] | Script Lighthouse 13.5 : 3 exécutions, médiane, seuil 0,95 sur 4 axes | 5h | Dev | T-003-01, T-001-13 |
| T-003-05 | [TEST] | Test axe sur toutes les pages découvertes et assistant de découverte des routes | 2,5h | Dev | T-001-13 |
| T-003-06 | [OPS] | Makefile et scripts npm : cibles lint, test, build-check, lighthouse, e2e, ci | 2,5h | Dev | T-003-02, T-003-03, T-003-04, T-003-05 |
| T-003-07 | [OPS] | Workflow GitHub Actions `ci.yml` | 5h | Dev | T-003-06 |
| T-003-08 | [OPS] | Hadolint, Trivy et SBOM CycloneDX dans la CI | 2,5h | Dev | T-003-07 |
| T-003-09 | [OPS] | Protection de `main` et PR de test à échec volontaire | 3h | Dev | T-003-07 |
| T-003-10 | [OPS] | Mesurer la durée de la CI et le gain du cache | 1,5h | Dev | T-003-07 |
| T-003-11 | [DOC] | Guide qualité et CI, CHANGELOG | 1h | Dev | T-003-09, T-003-10 |
| T-003-12 | [REV] | Revue d'US-003 (DoD §1, §3, §6) | 1,5h | Dev | T-003-08, T-003-11 |

#### Lot 2 : Fondation UI (40,5h)

**US-002 : Design system et layout** (3 pts, 40,5h)

| ID | Type | Tâche | Est. | Resp. | Dépend de |
|----|------|-------|------|-------|-----------|
| T-002-01 | [CONTENT] | Décisions de design : palette, typographie, tokens clair et sombre | 3h | Dev | - |
| T-002-02 | [TEST] | Écrire les tests unitaires RED : contraste, tokens, SEO, navigation, thème, config du site | 4h | Dev | T-001-13 |
| T-002-03 | [TEST] | Écrire les tests e2e RED du layout (clavier, thème, no-JS, mouvement réduit) | 4h | Dev | T-001-13 |
| T-002-04 | [FE-WEB] | Implémenter les bibliothèques et la configuration du site (GREEN) | 4h | Dev | T-002-01, T-002-02 |
| T-002-05 | [FE-WEB] | Feuille de style globale Tailwind 4 : tokens, polices, focus, mouvement réduit | 4h | Dev | T-002-01, T-002-04 |
| T-002-06 | [FE-WEB] | Script d'initialisation du thème externe et `ThemeToggle` | 3h | Dev | T-002-04, T-002-05 |
| T-002-07 | [FE-WEB] | En-tête, menu mobile accessible et lien d'évitement | 5h | Dev | T-002-03, T-002-06 |
| T-002-08 | [FE-WEB] | Pied de page, composant `Seo` et `BaseLayout` final | 4h | Dev | T-002-07 |
| T-002-09 | [FE-WEB] | Configuration i18n Astro et dictionnaire d'interface minimal | 2h | Dev | T-002-04 |
| T-002-10 | [FE-WEB] | Pages d'attente pour les destinations de la navigation et du pied de page | 1,5h | Dev | T-002-08 |
| T-002-11 | [TEST] | Vérification GREEN : responsive, JS désactivé, mouvement réduit, axe, Lighthouse | 2,5h | Dev | T-002-09, T-002-10, T-003-06 |
| T-002-12 | [DOC] | Guide du design system et ADR-0010 | 1,5h | Dev | T-002-11 |
| T-002-13 | [REV] | Revue d'US-002 (DoD §1, §4, §5, §7) | 2h | Dev | T-002-12 |

#### Lot 3A : Accueil et parcours (58,5h)

**US-004 : Page d'accueil : proposition de valeur et double parcours** (3 pts, 22h)

| ID | Type | Tâche | Est. | Resp. | Dépend de |
|----|------|-------|------|-------|-----------|
| T-004-01 | [CONTENT] | Rédiger la proposition de valeur, les CTA et les 4 preuves | 2,5h | PO | - |
| T-004-02 | [TEST] | Écrire les tests unitaires RED : preuves, schéma `home`, nombre de mots | 2,5h | Dev | T-001-13 |
| T-004-03 | [TEST] | Écrire les tests e2e RED de la page d'accueil | 3h | Dev | T-001-13 |
| T-004-04 | [FE-WEB] | Étendre le schéma `home` et implémenter `proofs.ts` / `text.ts` (GREEN) | 3h | Dev | T-004-02 |
| T-004-05 | [OPS] | Contrôle de build `proof-links` sur `dist/` | 2h | Dev | T-004-02, T-003-03 |
| T-004-06 | [CONTENT] | Enregistrer les données de la page d'accueil dans `home.yaml` | 1h | Dev | T-004-01, T-004-04 |
| T-004-07 | [FE-WEB] | Composants `Hero`, `CtaPair`, `ProofList` et page d'accueil | 4h | Dev | T-004-03, T-004-06, T-002-08 |
| T-004-08 | [TEST] | Vérification GREEN : e2e, axe, Lighthouse, contrôle des preuves | 1,5h | Dev | T-004-07, T-004-05 |
| T-004-09 | [DOC] | Guide « modifier la page d'accueil » et CHANGELOG | 1h | Dev | T-004-08 |
| T-004-10 | [REV] | Revue d'US-004 (DoD §1, §2, §4, §5) | 1,5h | Dev | T-004-09 |

**US-005 : Parcours professionnel en frise** (5 pts, 36,5h)

| ID | Type | Tâche | Est. | Resp. | Dépend de |
|----|------|-------|------|-------|-----------|
| T-005-01 | [CONTENT] | Inventaire des expériences et décisions de contenu avec le PO | 2h | PO | - |
| T-005-02 | [CONTENT] | Rédiger les expériences détaillées (`featured`) en YAML | 5h | Dev | T-005-01 |
| T-005-03 | [CONTENT] | Rédiger les expériences antérieures à 2016 (`summaryOnly`) | 2h | Dev | T-005-01 |
| T-005-04 | [TEST] | Écrire les tests unitaires RED : tri, fenêtre de 10 ans, période, schéma, données interdites | 3,5h | Dev | T-001-13 |
| T-005-05 | [TEST] | Écrire les tests e2e RED de la page Parcours | 3,5h | Dev | T-001-13 |
| T-005-06 | [FE-WEB] | Implémenter le schéma `experiences` et `experiences.ts` (GREEN) | 4h | Dev | T-005-04, T-001-06 |
| T-005-07 | [OPS] | Contrôle de build des expériences : données personnelles, règle des 10 ans, décompte | 2,5h | Dev | T-005-04, T-003-03 |
| T-005-08 | [FE-WEB] | Composants `Timeline`, `ExperienceCard`, `EarlierCareer` et styles d'impression | 6h | Dev | T-005-05, T-005-06, T-002-08 |
| T-005-09 | [FE-WEB] | Page `/parcours/` (remplace la page d'attente) | 2,5h | Dev | T-005-08, T-005-02, T-005-03 |
| T-005-10 | [TEST] | Vérification GREEN : e2e, axe, Lighthouse, impression, responsive | 2,5h | Dev | T-005-09, T-005-07 |
| T-005-11 | [DOC] | Guide « ajouter ou modifier une expérience » et CHANGELOG | 1h | Dev | T-005-10 |
| T-005-12 | [REV] | Revue d'US-005 (code, contenu, confidentialité) | 2h | Dev | T-005-11 |

#### Lot 3B : Légal et contact (55,5h)

**US-029 : Mentions légales et politique de vie privée** (2 pts, 21h)

| ID | Type | Tâche | Est. | Resp. | Dépend de |
|----|------|-------|------|-------|-----------|
| T-029-01 | [CONTENT] | Cadrage factuel des pages légales avec le PO | 2h | PO | - |
| T-029-02 | [TEST] | Écrire les tests unitaires RED : config légale, frontmatter, données interdites | 2,5h | Dev | T-001-13 |
| T-029-03 | [TEST] | Écrire les tests e2e RED : contenus légaux et liens du pied de page | 3h | Dev | T-001-13, T-003-05 |
| T-029-04 | [FE-WEB] | Collection `legal`, configuration `legal.ts`, composant et pages (remplacent les pages d'attente) | 4h | Dev | T-029-02, T-002-08 |
| T-029-05 | [CONTENT] | Rédiger `mentions-legales.md` | 2h | Dev | T-029-01, T-029-04 |
| T-029-06 | [CONTENT] | Rédiger `vie-privee.md` (section `#formulaire`, droits, cookies) | 3h | Dev | T-029-01, T-029-04 |
| T-029-07 | [OPS] | Contrôle de build des pages légales : données personnelles interdites | 1,5h | Dev | T-029-02, T-003-03 |
| T-029-08 | [TEST] | Vérification GREEN : e2e, axe, Lighthouse, ancres | 1,5h | Dev | T-029-05, T-029-06, T-029-07, T-029-03 |
| T-029-09 | [DOC] | Guide « mettre à jour les informations légales » et CHANGELOG | 0,5h | Dev | T-029-08 |
| T-029-10 | [REV] | Revue d'US-029 (juridique, DoD §1, §2, §6) | 1h | Dev | T-029-09 |

**US-008 : Page contact avec motif, anti-spam et prise de RDV** (3 pts, 34,5h)

| ID | Type | Tâche | Est. | Resp. | Dépend de |
|----|------|-------|------|-------|-----------|
| T-008-01 | [CONTENT] | Décisions et textes du contact : motifs, messages, repli, mode d'envoi | 2h | PO | - |
| T-008-02 | [TEST] | Écrire les tests unitaires RED : validation, anti-spam, payload, gestion des réponses | 4h | Dev | T-001-13 |
| T-008-03 | [TEST] | Écrire les tests e2e RED du formulaire (Web3Forms simulé par `page.route`) | 4h | Dev | T-001-13 |
| T-008-04 | [FE-WEB] | Configuration du contact validée au build et `contact.ts` (GREEN) | 4h | Dev | T-008-01, T-008-02 |
| T-008-05 | [FE-WEB] | Composant `ContactForm` accessible et lien de RDV | 5h | Dev | T-008-03, T-008-04, T-002-08 |
| T-008-06 | [FE-WEB] | Script d'amélioration progressive : validation, envoi `fetch`, états | 4h | Dev | T-008-05 |
| T-008-07 | [FE-WEB] | Pages `/contact/` et `/contact/merci/` (remplacent la page d'attente) | 2,5h | Dev | T-008-05 |
| T-008-08 | [FE-WEB] | Mention RGPD courte sous le formulaire | 1h | Dev | T-008-05 |
| T-008-09 | [TEST] | Vérification GREEN : e2e, axe, Lighthouse, envoi réel unique | 2,5h | Dev | T-008-06, T-008-07, T-008-08, T-029-06 |
| T-008-10 | [OPS] | Variables de build, CSP et console propre | 1,5h | Dev | T-008-09, T-001-14 |
| T-008-11 | [TEST] | Scénario inter-US : de l'accueil au formulaire avec le motif « Poste » | 1h | Dev | T-008-07, T-004-07 |
| T-008-12 | [DOC] | Guide du contact et ADR-0011 | 1h | Dev | T-008-10 |
| T-008-13 | [REV] | Revue d'US-008 (DoD §1, §3, §4, §6) | 2h | Dev | T-008-11, T-008-12 |

### 🔄 En cours

_(aucune tâche)_

### 👀 Review

_(aucune tâche)_

### ✅ Done

_(aucune tâche)_

### 🚫 Bloqué

_(aucune tâche)_

## Récapitulatif par type

| Type | Tâches | Heures |
|------|--------|--------|
| [OPS] | 23 | 62h |
| [FE-WEB] | 21 | 70,5h |
| [CONTENT] | 11 | 25h |
| [TEST] | 21 | 59h |
| [DOC] | 7 | 8h |
| [REV] | 7 | 12h |
| **Total** | **90** | **236,5h** |

## Récapitulatif par US

| US | Points | Tâches | Heures | Lot |
|----|--------|--------|--------|-----|
| US-001 | 5 | 20 | 47h | 1 |
| US-003 | 3 | 12 | 35h | 1 |
| US-002 | 3 | 13 | 40,5h | 2 |
| US-004 | 3 | 10 | 22h | 3A |
| US-005 | 5 | 12 | 36,5h | 3A |
| US-029 | 2 | 10 | 21h | 3B |
| US-008 | 3 | 13 | 34,5h | 3B |
