# EPIC-004 : Labo d'outils

## Description
Transformer la « Boîte à outils » d'Agentic Agency (57 fiches, souvent limitées à des métadonnées et à un lien) en **laboratoire de tests approfondis**. Chaque test suit un protocole standard imposé par le schéma de contenu : contexte et besoin, environnement (versions, OS, date), installation, scénarios reproductibles, résultats observés ou mesurés, limites, verdict, note multicritère, alternatives, date de dernière revérification.

Valeur métier : démontrer la rigueur d'évaluation (argument clé pour un poste de direction technique, objectif O5) et répondre à la frustration n°1 de P-004 Sophie : des avis sans date, sans version et sans limites.

## User Stories associées
| ID | Titre | Points | Priorité | Dépend de |
|----|-------|--------|----------|-----------|
| US-014 | Modèle de test d'outil structuré | 5 | Must | US-002 |
| US-015 | Publier les 3 premiers tests complets selon le protocole | 5 | Must | US-014 |
| US-016 | Annuaire des 57 outils migré avec badge « testé » | 3 | Should | US-014 |
| US-017 | Médias de démonstration dans les tests | 3 | Should | US-014 |
| US-018 | Comparatifs entre outils d'une même catégorie | 3 | Could | US-015 |
| | **Total** | **19** | | |

## Dépendances avec autres Epics
### Prérequis (bloquants)
| Epic | Raison |
|------|--------|
| EPIC-001 Socle et walking skeleton | Design system (US-002), layout et pipeline de déploiement nécessaires aux pages du labo |

### Dépendants (bloqués par celui-ci)
| Epic | Raison |
|------|--------|
| EPIC-006 SEO, GEO et mesure | Les pages de test portent des données structurées (à confirmer en tech spec : `Review` ou `TechArticle`) ; les URL du labo alimentent le sitemap et llms.txt |

### Liens souples
- EPIC-003 Blog migré : les articles de la série « La boîte à outils agentic » pourront renvoyer vers les tests (liens croisés).

## Minimum Marketable Feature (MMF)
**MMF** : un modèle de test validé au build et **3 tests complets** publiés, consultables depuis une page d'index du labo.
**Valeur** : objectif O5 atteint (≥ 3 tests au lancement) ; différenciation immédiate face aux listes d'outils habituelles.
**US incluses** : US-014, US-015

## Estimation
- Taille : M
- Sprints estimés : 1 (Sprint 4). Risque principal : le temps de production éditoriale des 3 tests (protocole exécuté réellement, mesures prises), pas le développement. À lancer dès le Sprint 3 en préparation de contenu.
