# EPIC-006 : SEO, GEO et mesure

## Description

Rendre le site découvrable par les moteurs de recherche et les moteurs de réponse IA, puis mesurer ce qui compte : données structurées JSON-LD, sitemap, robots.txt, llms.txt, images Open Graph par page et analytics sans cookie avec suivi des conversions (formulaire avec motif, RDV, CV, clics sortants). Valeur : P-002 Marc arrive par Google sur une fiche plugin, et le PO peut vérifier les objectifs O2 (≥ 4 contacts qualifiés par mois) et O3 (≥ 15 % de clics sortants).

## User Stories associées

| ID | Titre | Points | Priorité | Dépend de |
|----|-------|--------|----------|-----------|
| US-024 | SEO technique et données structurées | 5 | Must | US-005, US-009, US-020 |
| US-025 | Images Open Graph générées par page | 3 | Should | US-002 |
| US-026 | Mesure d'audience sans cookie et suivi des conversions | 3 | Should | US-007, US-008 |

Total : 11 points.

## Dépendances avec autres Epics

### Prérequis (bloquants)
| Epic | Raison |
|------|--------|
| EPIC-002 | Parcours (Person, ProfilePage), CV et formulaire à mesurer |
| EPIC-003 | Articles (BlogPosting, FAQPage) et redirections |
| EPIC-005 | Fiches plugins (SoftwareSourceCode) : US-020 |

### Dépendants (bloqués par celui-ci)
| Epic | Raison |
|------|--------|
| EPIC-004 | Les tests d'outils réutilisent les gabarits JSON-LD et Open Graph (enrichissement) |
| EPIC-007 | Balises hreflang à ajouter lors de l'activation de l'anglais |

## Minimum Marketable Feature (MMF)

**MMF** : sitemap, robots.txt, llms.txt et JSON-LD valides sur les pages profil, blog et fiches plugins, permettant l'indexation correcte du site et du blog migré.

**US incluses** : US-024

(US-025 et US-026 sont des enrichissements Should.)

## Estimation

- Taille : M
- Sprints estimés : 1 (Sprint 3)

## Hypothèses et points à confirmer en tech spec

- US-020 (fiche plugin) relève d'EPIC-005 et doit être livrée avant US-024 ; à vérifier au Sprint 2.
- Outil d'analytics sans cookie (Plausible, Umami ou Cloudflare Web Analytics) : question ouverte n°4.
- Nom de domaine définitif requis pour les URL absolues du sitemap, du canonical et du JSON-LD.
