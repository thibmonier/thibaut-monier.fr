# Sprint Review : Sprint 001 « Walking skeleton »

> Préparée le 2026-10-14 (workflow:review, adapté site statique Astro/Docker/Railway : pas de Symfony ni Flutter). Branche `feature/sprint-001-walking_skeleton`, PR n°1 ouverte (https://github.com/thibmonier/thibaut-monier.fr/pull/1), HEAD `5aeff95`. Production : https://web-production-70714.up.railway.app

**Sprint Goal** : « Mettre en production un site minimal mais complet où un recruteur ou un client comprend le positionnement, parcourt le parcours professionnel et peut prendre contact. »

## 1. Atteinte du Sprint Goal : PARTIELLEMENT (⚠️)

| Volet du goal | État | Preuve |
|---------------|------|--------|
| En production | ✅ | HTTPS 200 sur `/`, `/parcours/`, `/contact/`, `/mentions-legales/`, `/vie-privee/` ; 404 sur URL inconnue ; redirection http vers https ; en-têtes de sécurité conformes ; `make smoke` OK |
| Comprendre le positionnement | ✅ | Accueil à double parcours (Recruter / Missionner) |
| Parcourir le parcours professionnel | ✅ | Frise de 7 expériences (arbitrage A2), dépliage clavier, impression A4. Contenu à valider par le PO |
| Prendre contact | ⚠️ | Le formulaire est codé et testé en CI, mais **absent en production** (clé Web3Forms non définie) : seul le repli « service indisponible + LinkedIn » est servi. Bouton RDV masqué (URL Calendly absente) |

Le site fonctionne de bout en bout techniquement. Le goal n'est pleinement atteint qu'après les actions PO de la section 6 (clé Web3Forms, e-mail de repli, Calendly, domaine).

## 2. Incrément démontrable

- URL : https://web-production-70714.up.railway.app
- Pages : `/` (accueil), `/parcours/` (frise), `/contact/` et `/contact/merci/`, `/mentions-legales/`, `/vie-privee/`, 404 personnalisée.
- Transverse : thème clair/sombre sans flash, menu mobile accessible, JavaScript désactivable, mouvement réduit, impression.
- Défauts connus en production : `/favicon.ico` en 404 (corrigé en `04138ba`, déploiement depuis `main` à venir) ; canonical vers `https://thibaut-monier.fr/` (domaine non résolu) ; pas de sitemap ni `robots.txt` (US-024, sprint 3).
- Correction B2 vérifiée en production : plus aucun « à vérifier » dans les mentions légales.

## 3. User stories livrées (24 points planifiés)

| ID | Titre | Pts | Démo | Statut |
|----|-------|-----|------|--------|
| US-001 | Squelette du site publié en production | 5 | ✅ | ✅ Livré, done-pending-po |
| US-002 | Design system et layout | 3 | ✅ | ✅ Done |
| US-003 | Pipeline CI qualité | 3 | ✅ | ✅ Done |
| US-004 | Accueil : proposition de valeur et double parcours | 3 | ✅ | ✅ Done |
| US-005 | Parcours professionnel en frise | 5 | ✅ | ✅ Done (contenu à valider) |
| US-008 | Contact : motif, anti-spam, prise de RDV | 3 | ⚠️ | ✅ Done (formulaire non actif en prod, clé PO) |
| US-029 | Mentions légales et vie privée | 2 | ✅ | ✅ Livré, done-pending-po |

**Livré côté équipe : 24/24 points (100 %).** Acceptés sans réserve : 17 points (US-002, 003, 004, 005, 008). En attente d'acceptation PO : 7 points (US-001, US-029). Aucune story reportée.

## 4. Métriques

| Métrique | Valeur |
|----------|--------|
| Points planifiés / livrés | 24 / 24 (7 en attente PO) |
| Vélocité (calibrage, sans historique) | 24 (17 acceptés) |
| Taux de complétion | 100 % (71 % accepté) |
| Tests unitaires (Vitest) | 271 |
| Tests e2e (Playwright) | 215 passés, 3 ignorés voulus (2 scénarios « sans clé », 1 PDF desktop seulement), 0 flaky |
| Couverture | ~97 % (lignes 96,8 %, seuils 80/75) |
| Lighthouse | 100 sur les pages |
| CI | verte sur la PR (quality, dockerfile, supply-chain, e2e, GitGuardian) ; durée ~5 à 8 min (3 min 25 s à 7 min 51 s) |
| Runs CI sur la branche | 8 : 1 échec, 1 annulé, 6 succès |
| Tâches | 90 planifiées, 236,5 h estimées ; reste des tâches PO et revues (voir task-board) |

Burndown détaillé non produit : le sprint a été exécuté en un seul jour calendaire par lots (W1 à W4), la courbe n'apporte pas d'information. À recalibrer en rétrospective (236,5 h estimées pour 10 jours).

## 5. Incidents et enseignements

| Incident | Effet | Traitement |
|----------|-------|------------|
| Disque saturé | Image Playwright impossible en local ; e2e, axe et Lighthouse validés avec un Chromium Alpine | La CI reste la référence ; nettoyage disque à prévoir |
| Worktrees parallèles | Livraisons « non commitées » en W1-W3, fusion par lots (`1afc6c5`) | Fusions faites ; limiter les worktrees (3-5 max) |
| Railway et cache mounts Docker | Build incompatible | `8e8d5b9` : montages de cache retirés |
| Option `--no-build` absente de Compose sur le runner | CI e2e en échec | `df211d9` : option retirée |
| **47 tests ignorés détectés par la revue DoD** | CI verte à tort (variables de build non transmises) ; score DoD 45/100, 4 stories « Non done » | B1 corrigé (`af34b69`) : `build-args` et mode strict `E2E_EXPECT_FULL_CONFIG=1`. Résultat : 215 passés, 3 ignorés voulus |
| Marqueur « à vérifier » publié dans les mentions légales | Défaut légal en production | B2 corrigé (`5aeff95`) : marqueur retiré, contrôle `placeholders.dist.check.ts` bloquant |

Enseignement : une CI verte ne prouve rien si des tests sont ignorés ; le mode strict l'empêche désormais. Le plan « une PR par US » n'a pas été suivi (PR unique avec fusions), à arbitrer à la fusion.

## 6. Actions PO en attente

1. Valider les stories **US-001 et US-029** (done-pending-po) et la production (DoD §10).
2. Fusionner la PR n°1 sur `main` ; activer *Wait for CI* sur Railway et déployer depuis `main` (corrige le favicon).
3. Domaine et DNS, ou `PUBLIC_SITE_URL` provisoire (canonical, redirection du formulaire).
4. Clé Web3Forms sur Railway et GitHub (active le formulaire) ; URL Calendly ; adresse e-mail de repli ; secrets `RAILWAY_TOKEN` et `SMOKE_URL`.
5. Coordonnées de l'hébergeur (facture Railway) et relecture juridique des mentions ; durée de conservation (T-029-01, T-008-01).
6. Valider les contenus : chiffres des preuves de l'accueil (T-004-01), frise (T-005-01).
7. Arbitrages A1 à A5 de `tasks/README.md` à confirmer ; décider du lien « Blog » (absent, A4).
8. Umami (US-026) : la politique de vie privée mentionne Umami alors que le script n'est pas intégré (à reformuler).

## 7. Mise à jour du backlog et de la vélocité

- Statuts `.bmad/sprint-status.yaml` : US-002/003/004/005/008 `done` ; US-001/029 `done-pending-po` ; sprint en `review`.
- Vélocité de référence pour le sprint 2 : 24 planifiés/livrés (17 acceptés), capacité du sprint 2 : 25 points.
- À aligner : US-002 (3 liens de nav, A4), US-005 (`start`/`end`), US-008 (repli LinkedIn) ; `task-board.md` encore à 0/90 dans l'en-tête.
- Reports vers le sprint 2 (non bloquants, issus de la revue DoD) : test « < 1 s » fragile (`home.spec.ts`), espaces insécables avant « : », CSP plus large que le besoin, contrôle de fumée à étendre (`/vie-privee/`, console), `subject` figé sans JavaScript, axe sur `/404`, preuves US-003 (PR d'échec volontaire, gain de cache, `enforce_admins`).
- Nouvelles demandes issues de la review : à consigner pendant la session.

## 8. Démo proposée (60 min)

| Durée | Contenu |
|-------|---------|
| 5 min | Rappel du goal, de l'état de la PR et de la CI verte |
| 8 min | US-001 : production en HTTPS, en-têtes, 404, redirection, smoke |
| 7 min | US-002 : thème clair/sombre, menu mobile au clavier, JS désactivé |
| 7 min | US-004 : accueil, « Me recruter » vers contact avec motif pré-sélectionné |
| 8 min | US-005 : frise, dépliage clavier, impression A4 |
| 8 min | US-008 : formulaire (build local avec clé factice) puis repli en production |
| 4 min | US-029 : mentions légales, vie privée, aucun cookie |
| 8 min | US-003 : pipeline CI, 215 e2e, Lighthouse 100, Trivy et SBOM ; incident des 47 tests ignorés |
| 5 min | Actions PO, priorités du sprint 2 (preuves, profil, open source) |

Scénario : accueil → « Me recruter » → contact (motif « Poste ») → parcours → mentions légales ; bascule thème sombre et mobile 375 x 667 ; vérifier `make smoke URL=https://web-production-70714.up.railway.app`.

**Feedback à collecter** : le positionnement est-il clair en 10 secondes ? Les preuves de l'accueil sont-elles les bonnes ? Contenu de la frise acceptable (confidentialité) ? Priorités du sprint 2 ?
