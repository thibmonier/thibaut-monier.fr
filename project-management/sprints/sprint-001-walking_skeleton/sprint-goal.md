# Sprint 001 : Walking skeleton

## Informations

| Attribut | Valeur |
|----------|--------|
| Numéro | 1 |
| Début (proposé) | 2026-10-15 |
| Fin (proposée) | 2026-10-28 |
| Durée | 10 jours ouvrés |
| Capacité | 24 points (contributeur unique, aucune vélocité historique : sprint 1 = calibrage) |
| Branche | `feature/sprint-001-walking_skeleton` |
| Dépôt | https://github.com/thibmonier/thibaut-monier.fr |

## Objectif du sprint (Sprint Goal)
> Mettre en production un site minimal mais complet où un recruteur ou un client comprend le positionnement, parcourt le parcours professionnel et peut prendre contact.

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
| US-001 | Squelette du site publié en production | 5 | Must | — | 🔲 |
| US-002 | Design system et layout | 3 | Must | US-001 | 🔲 |
| US-003 | Pipeline CI qualité | 3 | Must | US-001 | 🔲 |
| US-004 | Page d'accueil à double parcours | 3 | Must | US-002 | 🔲 |
| US-005 | Parcours professionnel en frise | 5 | Must | US-002 | 🔲 |
| US-008 | Page contact avec motif et RDV | 3 | Must | US-002 | 🔲 |
| US-029 | Mentions légales et vie privée | 2 | Must | US-002 | 🔲 |

**Total : 24 points**

## Ordre d'exécution
1. 🏁 US-001 (fondation : dépôt git, build, déploiement)
2. US-003 (CI branchée tôt, filet de sécurité)
3. US-002 (design system)
4. US-004, US-005, US-008, US-029 (parallélisables)

## Incrément livrable
Le site est en ligne en HTTPS : accueil avec la proposition de valeur et les deux parcours, frise des 7 expériences, formulaire de contact fonctionnel, mentions légales et politique de vie privée. C'est déjà utilisable dans une candidature.

## Definition of Done (rappel)
- [ ] Revue de code (auto-revue + CI verte, contributeur unique)
- [ ] Tests passants, couverture ≥ 80 % sur le code testable
- [ ] Qualité : lint, formatage, vérification de types Astro, build sans erreur
- [ ] Accessibilité et performance contrôlées (Lighthouse)
- [ ] Documentation et ADR mis à jour si décision d'architecture
- [ ] Déployable en production (conteneur Docker, Railway)

## Risques identifiés
| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Domaine non acheté pendant le sprint | Moyenne | Faible | Sous-domaine `*.up.railway.app` provisoire, bascule DNS ultérieure |
| Clés Web3Forms / Umami / Calendly absentes | Moyenne | Faible | Variables optionnelles avec repli (formulaire et RDV dégradés, mesure désactivée) |
| Vélocité inconnue (24 pts, premier sprint) | Moyenne | Moyen | US-004/005/008/029 parallélisables, priorité Must à reporter si besoin |
| Configuration Docker/Railway plus longue que prévu | Moyenne | Moyen | Traiter US-001 en premier, ADR 0001-0009 déjà acceptés |

## Rétrospective — Directive fondamentale
> « Peu importe ce que nous découvrons, nous comprenons et croyons sincèrement que tout le monde a fait le meilleur travail possible, compte tenu de ce qui était connu à ce moment-là, de ses compétences et capacités, des ressources disponibles et de la situation. »

### Format : étoile de mer (Starfish)
- 🟢 Continuer
- 🔴 Arrêter
- 🟡 Commencer
- ⬆️ Plus de
- ⬇️ Moins de
