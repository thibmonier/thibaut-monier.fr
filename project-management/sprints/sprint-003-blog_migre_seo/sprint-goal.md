# Sprint 003 : Blog migré et SEO

## Objectif du sprint (Sprint Goal)
> Rapatrier les articles d'Agentic Agency sur le nom propre, avec le nouveau domaine comme référence, et rendre tout le site lisible par les moteurs classiques et IA.

## Cérémonies (adaptées à un contributeur unique)
| Cérémonie | Durée |
|-----------|-------|
| Sprint Planning partie 1 (QUOI) | 1 h |
| Sprint Planning partie 2 (COMMENT : /project:decompose-tasks) | 1 h |
| Daily (point de suivi asynchrone, /common:daily-standup) | 5 min/jour |
| Affinage du backlog | 5 à 10 % du sprint |
| Sprint Review (démo en production) | 1 h |
| Rétrospective | 45 min |

## User stories sélectionnées
| ID | Titre | Points | Priorité | Dépend de | Statut |
|----|-------|--------|----------|-----------|--------|
| US-009 | Migration des 28 articles | 5 | Must | US-002 | 🔲 |
| US-010 | Canonical et table de correspondance | 2 | Must | US-009 | 🔲 |
| US-011 | Navigation blog | 3 | Should | US-009 | 🔲 |
| US-012 | Recherche plein texte | 2 | Should | US-009 | 🔲 |
| US-013 | Flux RSS | 2 | Should | US-009 | 🔲 |
| US-024 | SEO technique et JSON-LD | 5 | Must | US-005, US-009, US-020 | 🔲 |
| US-025 | Images Open Graph | 3 | Should | US-002 | 🔲 |
| US-026 | Analytics sans cookie et conversions | 3 | Should | US-007, US-008 | 🔲 |

**Total : 25 points**

## Ordre d'exécution
1. US-009 → US-010 (à déployer ensemble)
2. US-011, US-012, US-013
3. US-024, US-025, US-026

## Incrément livrable
Les 28 articles sont servis sur le nouveau domaine, chaque article déclare le nouveau domaine comme canonique (agentic-agency.fr reste intact), et le site expose sitemap, llms.txt et JSON-LD complet ; les conversions sont mesurées.

## Rétrospective — Directive fondamentale
> « Peu importe ce que nous découvrons, nous comprenons et croyons sincèrement que tout le monde a fait le meilleur travail possible, compte tenu de ce qui était connu à ce moment-là, de ses compétences et capacités, des ressources disponibles et de la situation. »

### Format : étoile de mer (Starfish)
- 🟢 Continuer
- 🔴 Arrêter
- 🟡 Commencer
- ⬆️ Plus de
- ⬇️ Moins de
