# EPIC-007 : Version anglaise

## Description
Ouvrir le site à l'audience internationale, en priorité l'écosystème Sylius, majoritairement anglophone. Le français reste servi sans préfixe ; l'anglais est servi sous `/en/`. L'architecture i18n est prévue dès le socle (F6.1) ; cet Epic en assure l'**activation** et la traduction des pages à plus forte valeur : profil et vitrine open source.

Valeur métier : lever le critère d'abandon n°1 de P-003 Julien (« pas de version anglaise ») et ouvrir des missions ou des postes hors France.

## User Stories associées
| ID | Titre | Points | Priorité | Dépend de |
|----|-------|--------|----------|-----------|
| US-027 | Infrastructure i18n FR/EN activée | 5 | Could | US-004 |
| US-028 | Traduction EN des pages profil et vitrine open source | 5 | Could | US-027, US-005, US-020 |
| | **Total** | **10** | | |

## Dépendances avec autres Epics
### Prérequis (bloquants)
| Epic | Raison |
|------|--------|
| EPIC-002 Profil et CV | Les pages à traduire (US-004, US-005) doivent exister et être stabilisées |
| EPIC-005 Vitrine open source | Les fiches plugins (US-020) sont la cible principale de la traduction |

### Dépendants (bloqués par celui-ci)
Aucun.

### Liens souples
- EPIC-001 : le socle doit prévoir la structure de routage i18n (F6.1 en P1) afin que l'activation ne demande pas de refonte. À vérifier en tech spec.
- EPIC-006 : hreflang, sitemap multilingue et JSON-LD `inLanguage` sont couverts par US-027 pour la partie routage ; les images Open Graph EN relèvent d'EPIC-006.

## Minimum Marketable Feature (MMF)
**MMF** : les pages profil et la vitrine open source disponibles en anglais sous `/en/`, avec sélecteur de langue et balises hreflang.
**Valeur** : un intégrateur anglophone évalue un plugin dans sa langue ; le site devient partageable hors France.
**US incluses** : US-027, US-028

## Estimation
- Taille : M
- Sprints estimés : 1 (Sprint 5). Epic « Could » : à sacrifier en premier si le Sprint 4 déborde. Décision à prendre : traduction manuelle, assistée par IA avec relecture, ou mixte (le coût principal est la relecture).
