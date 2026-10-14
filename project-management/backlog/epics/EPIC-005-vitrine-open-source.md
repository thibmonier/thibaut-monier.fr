# EPIC-005 : Vitrine open source

## Description
Rendre visibles et consultables en un seul endroit les preuves open source : les **20 plugins Sylius 2** (B2B, conformité UE, back-office, IA et intégrations), le **bundle Symfony tailsfadmin** (thème admin Tailwind v4, Packagist, v1.6) et les **contributions à career-ops** (3 PR mergées : #3496, #3808, #3866).

Valeur métier : la preuve d'expertise Sylius/B2B/conformité UE la plus forte du profil n'est aujourd'hui visible que dépôt par dépôt sur GitHub. La vitrine sert P-002 Marc (trouver le plugin ou l'expert), P-003 Julien (évaluer la maintenance et la compatibilité) et P-001 Claire (signal d'actualité technique). Objectif O3 : ≥ 300 visites par mois et ≥ 15 % de clics sortants vers GitHub et Packagist.

## User Stories associées
| ID | Titre | Points | Priorité | Dépend de |
|----|-------|--------|----------|-----------|
| US-019 | Catalogue des 20 plugins Sylius 2 filtrable par thème | 5 | Must | US-002 |
| US-020 | Fiche détaillée d'un plugin | 5 | Must | US-019 |
| US-021 | Données vivantes au build avec cache et repli | 3 | Should | US-020 |
| US-022 | Page du bundle Symfony tailsfadmin | 2 | Should | US-002 |
| US-023 | Étude de cas des contributions career-ops | 2 | Should | US-002 |
| | **Total** | **17** | | |

## Dépendances avec autres Epics
### Prérequis (bloquants)
| Epic | Raison |
|------|--------|
| EPIC-001 Socle et walking skeleton | Design system (US-002), layout, déploiement |

### Dépendants (bloqués par celui-ci)
| Epic | Raison |
|------|--------|
| EPIC-006 SEO, GEO et mesure | JSON-LD `SoftwareSourceCode` sur les fiches plugins ; suivi des clics sortants GitHub et Packagist |
| EPIC-007 Version anglaise | Traduction EN de la vitrine (US-028) |

### Liens souples
- EPIC-002 Profil et CV : les pages profil renvoient vers la vitrine (« 20 plugins open source ») ; les liens peuvent être posés avec des URL provisoires.

## Minimum Marketable Feature (MMF)
**MMF** : le catalogue filtrable des 20 plugins avec une fiche détaillée par plugin (liens GitHub et Packagist, matrice de compatibilité).
**Valeur** : un dirigeant ou un intégrateur trouve le plugin qui couvre son besoin et vérifie sa compatibilité sans quitter le site.
**US incluses** : US-019, US-020

## Estimation
- Taille : M
- Sprints estimés : 1 (Sprint 2, partagé avec la fin d'EPIC-002). Le contenu source existe déjà (catalogue du 2026-10-14) ; le risque est la saisie de 20 fiches : prévoir un import depuis les README plutôt qu'une rédaction manuelle (à confirmer en tech spec).
