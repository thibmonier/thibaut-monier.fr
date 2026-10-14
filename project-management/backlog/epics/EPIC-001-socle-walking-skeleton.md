# EPIC-001 : Socle et walking skeleton

## Description

Mettre en production, dès le premier sprint, un site minimal mais complet de bout en bout : contenu, schéma, page, déploiement continu, HTTPS, en-têtes de sécurité et contrôle qualité automatisé. La valeur est double : tout le contenu suivant arrive sur une chaîne de livraison déjà éprouvée, et le site est lui-même une preuve de rigueur technique (Lighthouse ≥ 95, WCAG 2.2 AA), argument central pour P-001 Claire (recrutement d'un CTO/COO) et P-004 Sophie.

## User Stories associées

| ID | Titre | Points | Priorité | Dépend de |
|----|-------|--------|----------|-----------|
| US-001 | Squelette du site publié en production | 5 | Must | — |
| US-002 | Design system et layout | 3 | Must | US-001 |
| US-003 | Pipeline CI qualité | 3 | Must | US-001 |
| US-029 | Mentions légales et politique de vie privée | 2 | Must | US-002 |

Total : 13 points.

## Dépendances avec autres Epics

### Prérequis (bloquants)
Aucun.

### Dépendants (bloqués par celui-ci)
| Epic | Raison |
|------|--------|
| EPIC-002 Profil et CV | Layout, tokens et pipeline nécessaires |
| EPIC-003 Blog migré | Layout, schémas de contenu et CI (table de redirections) |
| EPIC-004 Labo d'outils | Socle de contenu typé |
| EPIC-005 Vitrine open source | Socle de contenu typé |
| EPIC-006 SEO, GEO et mesure | Layout et déploiement |
| EPIC-007 Version anglaise | i18n-ready posé dans US-002 |

## Minimum Marketable Feature (MMF)

**MMF** : un site en HTTPS, accessible publiquement, déployé automatiquement à chaque fusion sur la branche principale, avec une page d'accueil minimale, un layout accessible (thème clair/sombre) une CI qui bloque toute régression de qualité, et les mentions légales et la politique de vie privée obligatoires.

**US incluses** : US-001, US-002, US-003, US-029

## Estimation

- Taille : M
- Sprints estimés : 1 (Sprint 1, Walking Skeleton)

## Hypothèses et points à confirmer en tech spec

- Stack envisagée : Astro + MDX + Tailwind v4, image Docker nginx, hébergement Railway.
- Nom de domaine non arrêté (question ouverte n°1 du PRD) : un domaine provisoire peut servir en Sprint 1.
