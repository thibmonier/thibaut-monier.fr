# Sprint 002 : Preuves : profil complet et open source

## Objectif du sprint (Sprint Goal)
> Rendre les preuves d'expertise consultables (CV PDF, compétences, 20 plugins Sylius, tailsfadmin, contributions career-ops) pour transformer une visite en prise de contact.

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
| US-006 | Compétences et réalisations filtrables | 3 | Should | US-005 | 🔲 |
| US-007 | CV PDF généré au build | 5 | Must | US-005 | 🔲 |
| US-019 | Catalogue des plugins Sylius | 5 | Must | US-002 | 🔲 |
| US-020 | Fiche détaillée d'un plugin | 5 | Must | US-019 | 🔲 |
| US-021 | Données vivantes GitHub/Packagist | 3 | Should | US-020 | 🔲 |
| US-022 | Page tailsfadmin | 2 | Should | US-002 | 🔲 |
| US-023 | Étude de cas career-ops | 2 | Should | US-002 | 🔲 |

**Total : 25 points**

## Ordre d'exécution
1. US-007 (CV PDF, priorité recrutement)
2. US-019 → US-020 → US-021
3. US-006, US-022, US-023

## Incrément livrable
Un recruteur télécharge un CV PDF à jour ; un intégrateur filtre les 20 plugins et trouve compatibilité et installation ; tailsfadmin et career-ops sont présentés.

## Rétrospective — Directive fondamentale
> « Peu importe ce que nous découvrons, nous comprenons et croyons sincèrement que tout le monde a fait le meilleur travail possible, compte tenu de ce qui était connu à ce moment-là, de ses compétences et capacités, des ressources disponibles et de la situation. »

### Format : étoile de mer (Starfish)
- 🟢 Continuer
- 🔴 Arrêter
- 🟡 Commencer
- ⬆️ Plus de
- ⬇️ Moins de
