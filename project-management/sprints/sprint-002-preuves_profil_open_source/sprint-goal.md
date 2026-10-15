# Sprint 002 : Preuves : profil complet et open source

## Informations

| Attribut | Valeur |
|----------|--------|
| Numéro | 2 |
| Début | 2026-10-29 |
| Fin | 2026-11-11 |
| Durée | 10 jours ouvrés |
| Capacité | 25 points (référence sprint 1 : 24 points livrés, 7 US ; plage 24 pts ± 20 %, action 4 de la rétro) |
| Branche | `feature/sprint-002-preuves_profil_open_source` |
| Dépôt | https://github.com/thibmonier/thibaut-monier.fr |
| Prérequis | `pre-sprint-checklist.md` |

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

## Definition of Done (rappel)
- [ ] Revue de code (auto-revue + CI verte, contributeur unique) et revue DoD indépendante à mi-sprint
- [ ] Tests passants, couverture ≥ 80 % sur le code testable
- [ ] **0 test e2e ignoré non justifié** (liste d'exceptions versionnée avec raison et date ; nombre exécuté / ignoré affiché dans la CI)
- [ ] Qualité : lint, formatage, vérification de types Astro, build sans erreur
- [ ] Aucun marqueur de brouillon (« à vérifier », TODO, « lorem ») dans les pages construites
- [ ] Contenus rédigés depuis les sources validés par le PO (`contenu-a-valider.md`)
- [ ] Accessibilité et performance contrôlées (Lighthouse ≥ 95, axe sans violation)
- [ ] Vérification sur l'image Docker réellement construite (variables de build `PUBLIC_*` transmises)
- [ ] Documentation et ADR mis à jour si décision d'architecture
- [ ] Déployable en production (conteneur Docker, Railway) ; build à blanc Railway et runner avant le premier merge

## Risques identifiés
| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Espace disque insuffisant (5,0 Go libres le 2026-10-14, 98 % utilisé) : images Docker, Playwright, Typst | Élevée | Élevé | Vérification ≥ 5 Go avant implémentation (cible 10 Go, action 2 rétro), nettoyage limité au projet proposé (jamais de prune global), CI comme référence |
| Faux vert CI (tests e2e ignorés) | Moyenne | Élevé | Garde-fou « zéro test ignoré » (action 1), mode strict `E2E_EXPECT_FULL_CONFIG=1` |
| Génération du PDF Typst 0.15.1 lourde ou non reproductible en CI/Docker (US-007) | Moyenne | Moyen | ADR-0005 ; binaire épinglé dans l'image ; test de présence et de contenu du PDF |
| Limites de l'API GitHub/Packagist au build, `GITHUB_TOKEN` absent (US-021) | Moyenne | Moyen | ADR-0006 ; repli sur données figées versionnées ; échec de build évité |
| Sources de contenu modifiées ou confidentielles (CV, captures, catalogue, README tailsfadmin) | Moyenne | Moyen | Contenu validé par le PO avant publication ; copie des sources dans le dépôt, pas de lien vers des chemins locaux |
| Contenu publié non validé (leçon sprint 1) | Moyenne | Élevé | `contenu-a-valider.md`, test anti-marqueur bloquant |
| Compatibilité Railway / runner découverte tard | Moyenne | Moyen | Build à blanc dès le premier jour (action 6) |
| Actions PO du sprint 1 toujours en attente (clés, domaine) | Élevée | Faible | Variables optionnelles avec repli ; ne bloquent pas ce sprint |
| Worktrees parallèles mal initialisés | Moyenne | Faible | Guide `docs/guides/worktrees-agents.md` (action 3), base = branche du sprint |
