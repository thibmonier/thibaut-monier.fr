# Sprint 1 : checklist de démarrage (Walking skeleton)

Stack : Astro (site statique), Docker (développement et production), Railway (hébergement), GitHub Actions (CI). Date de préparation : 2026-10-14.

## Calcul de capacité

| Élément | Valeur |
|---------|--------|
| Période proposée | 2026-10-15 au 2026-10-28 (10 jours ouvrés) |
| Équipe | 1 contributeur (Thibaut) + assistant IA |
| Facteur de focus | 60 % (équipe débutante, premier sprint) |
| Vélocité historique | Aucune (calibrage) |
| Engagement | 24 points (7 US) |

## 1. Prérequis techniques

| Statut | Élément | Remarque |
|--------|---------|----------|
| ✅ | Dépôt GitHub public `thibmonier/thibaut-monier.fr` | Créé |
| ✅ | Branche `feature/sprint-001-walking_skeleton` | Créée |
| ✅ | ADR 0001 à 0009 | Acceptés |
| ✅ | Railway CLI connecté | Le service sera créé pendant US-001 |
| ✅ | Calendly choisi | Décision du 2026-10-14 |
| 🔲 | Service Railway créé sur `*.up.railway.app` | Pendant US-001 |
| 🔲 | Dockerfile (dev avec rechargement à chaud, prod nginx) | Pendant US-001 |
| 🔲 | Workflow GitHub Actions | US-003 |

## 2. Actions du Product Owner (non bloquantes)

| Statut | Action | Variable | Repli si absent |
|--------|--------|----------|-----------------|
| 🔲 | Acheter le domaine thibaut-monier.fr ou .com, configurer le DNS | — | Sous-domaine `*.up.railway.app`, `site` Astro provisoire |
| 🔲 | Créer le compte Umami Cloud (région UE si possible) | `PUBLIC_UMAMI_WEBSITE_ID` | Script de mesure désactivé |
| 🔲 | Créer la clé Web3Forms | `PUBLIC_WEB3FORMS_KEY` | Formulaire désactivé, lien `mailto:` affiché |
| 🔲 | Créer le type d'événement Calendly « Échange découverte (30 min) » | `PUBLIC_CALENDLY_URL` | Bouton RDV masqué, contact par formulaire/e-mail |
| 🔲 | Fournir les contenus : textes d'accueil, 7 expériences, mentions légales (identité, hébergeur) | — | Contenus provisoires marqués à valider |

Échéances utiles : clé Web3Forms et URL Calendly avant US-008 ; mentions légales complètes avant US-029 ; domaine avant la mise en avant publique.

## 3. Sprint précédent et backlog

- [x] Sprint précédent : sans objet (sprint 1)
- [ ] Backlog priorisé par le PO (7 US Must, 24 points)
- [x] Définition of Ready vérifiée pour chaque US (voir ci-dessous)
- [x] Gate `/gate:validate-sprint 1` exécuté (voir gate-report.md)

### Definition of Ready

| US | Description et critères Gherkin | Estimée | Dépendances | Maquettes | Bloqueur |
|----|--------------------------------|---------|-------------|-----------|----------|
| US-001 (5) | ✅ | ✅ | — | Sans objet | Aucun (domaine provisoire) |
| US-003 (3) | ✅ | ✅ | US-001 | Sans objet | Aucun |
| US-002 (3) | ✅ | ✅ | US-001 | Design system à définir dans la story | Aucun |
| US-004 (3) | ✅ | ✅ | US-002 | Contenus à fournir | Contenu |
| US-005 (5) | ✅ | ✅ | US-002 | Données des 7 expériences | Contenu |
| US-008 (3) | ✅ | ✅ | US-002 | Clés Web3Forms et Calendly (repli prévu) | Optionnel |
| US-029 (2) | ✅ | ✅ | US-002 | Informations légales | Contenu |

## 4. Cérémonies (contributeur unique)

| Cérémonie | Date proposée | Durée |
|-----------|---------------|-------|
| Planning partie 1 (QUOI) | 2026-10-15 | 1 h |
| Planning partie 2 (COMMENT, `/project:decompose-tasks 001`) | 2026-10-15 | 1 h |
| Daily asynchrone (`/common:daily-standup`) | Quotidien | 5 min |
| Affinage | 2026-10-22 | 30 min |
| Sprint Review (démo en production) | 2026-10-28 | 1 h |
| Rétrospective (Starfish) | 2026-10-28 | 45 min |

## 5. Checklist finale

### Avant le Planning
- [x] Dépôt, branche, ADR, hébergement et outil de RDV prêts
- [ ] Capacité validée par le PO
- [x] Definition of Ready contrôlée

### Pendant le Planning
- [ ] Sprint Goal accepté
- [ ] Scope engagé (24 points)
- [ ] Dépendances confirmées (voir `sprint-dependencies.md`)
- [ ] Découpage en tâches avec estimations (0,5 à 8 h)

### Après le Planning
- [ ] `task-board.md` créé
- [ ] Daily planifié
- [ ] Variables d'environnement documentées dans `.env.example` (optionnelles avec repli)

## Prochaine étape

1. `/project:decompose-tasks 001`
2. `/sprint:next-story` (US-001 en premier)
3. `/sprint:dev US-001`
