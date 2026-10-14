# EPIC-002 : Profil et CV

## Description

Présenter le profil de Thibaut Monier de façon lisible en moins de deux minutes : proposition de valeur, double parcours (« Me confier une mission » / « Me recruter »), parcours professionnel en frise, compétences filtrables avec références clients, CV PDF transmissible et page de contact qualifiante. La thèse « prouver plutôt qu'affirmer » s'appuie sur une source de données unique (collection de contenu) qui alimente les pages et le PDF. Valeur : convertir les visites de P-001 Claire (poste) et P-002 Marc (mission) en prises de contact étiquetées.

## User Stories associées

| ID | Titre | Points | Priorité | Dépend de |
|----|-------|--------|----------|-----------|
| US-004 | Page d'accueil : proposition de valeur et double parcours | 3 | Must | US-002 |
| US-005 | Parcours professionnel en frise | 5 | Must | US-002 |
| US-006 | Compétences et réalisations filtrables | 3 | Should | US-005 |
| US-007 | CV PDF généré au build | 5 | Must | US-005 |
| US-008 | Page contact avec motif et anti-spam | 3 | Must | US-002 |

Total : 19 points.

## Dépendances avec autres Epics

### Prérequis (bloquants)
| Epic | Raison |
|------|--------|
| EPIC-001 | Layout, design tokens, pipeline CI |

### Dépendants (bloqués par celui-ci)
| Epic | Raison |
|------|--------|
| EPIC-006 | US-024 (JSON-LD Person/ProfilePage) exige US-005 ; US-026 exige US-007 et US-008 |

## Minimum Marketable Feature (MMF)

**MMF** : un visiteur comprend en moins de 2 minutes qui est Thibaut Monier, ce qu'il prouve, peut télécharger un CV propre et le contacter en précisant son motif.

**US incluses** : US-004, US-005, US-007, US-008

(US-006 est un enrichissement Should, livrable après la MMF.)

## Estimation

- Taille : L
- Sprints estimés : 2 (Sprint 1 : US-004, US-005, US-008 ; Sprint 2 : US-006, US-007)

## Hypothèses et points à confirmer en tech spec

- Une collection de contenu unique (expériences) alimente la frise, les compétences et le PDF.
- Liste blanche de champs publics : téléphone, âge et adresse précise du CV source ne sont jamais publiés.
- Outil de prise de RDV et service de réception du formulaire : questions ouvertes (PRD §10).
