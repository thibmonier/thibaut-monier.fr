# EPIC-003 : Blog migré

## Description

Rapatrier sous le nom propre de Thibaut Monier les 28 articles du blog d'Agentic Agency sans perdre l'audience acquise : contenu, images, frontmatter et FAQ conservés, redirections 301 exhaustives et testées, navigation (catégories, tags, séries), recherche plein texte et flux RSS. Valeur : l'autorité SEO profite à la personne qu'on recrute, et P-004 Sophie retrouve une lecture agréable, abonnable et cherchable. Risque majeur à maîtriser : la perte de trafic organique (objectif O4 : ≥ 90 % à M+2).

## User Stories associées

| ID | Titre | Points | Priorité | Dépend de |
|----|-------|--------|----------|-----------|
| US-009 | Migration des 28 articles | 5 | Must | US-002 |
| US-010 | Canonical sur le nouveau domaine et table de correspondance | 2 | Must | US-009 |
| US-011 | Navigation blog : catégories, tags, séries, pagination | 3 | Should | US-009 |
| US-012 | Recherche plein texte (Pagefind) | 2 | Should | US-009 |
| US-013 | Flux RSS | 2 | Should | US-009 |

Total : 14 points.

## Dépendances avec autres Epics

### Prérequis (bloquants)
| Epic | Raison |
|------|--------|
| EPIC-001 | Layout, CI (test de la table de redirections) |

### Dépendants (bloqués par celui-ci)
| Epic | Raison |
|------|--------|
| EPIC-006 | US-024 (BlogPosting, FAQPage, sitemap) exige US-009 |
| EPIC-004 | Le labo réutilise la navigation et la recherche du blog |

## Minimum Marketable Feature (MMF)

**MMF** : les 28 articles sont lisibles à leurs nouvelles URL sur thibaut-monier.fr, chacun avec une canonical autoréférente ; la table de correspondance est prête pour de futures redirections (agentic-agency.fr reste intact).

**US incluses** : US-009, US-010

(US-011, US-012 et US-013 sont des enrichissements Should.)

## Estimation

- Taille : L
- Sprints estimés : 1 (Sprint 3), à sécuriser par une préparation de la table de redirections dès l'affinage du Sprint 2

## Hypothèses et points à confirmer en tech spec

- Source : dépôt `blog/` (Astro, `src/content/blog`), frontmatter title, description, pubDate, updatedDate, author, image, imageAlt, excerpt, tags, category, series, draft, faq.
- Catégories existantes : Business, Méthode, Métiers, Outils, Pilotage.
- Devenir d'agentic-agency.fr à décider avant la mise en place des redirections (question ouverte n°2).
