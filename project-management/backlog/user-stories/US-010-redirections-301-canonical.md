# US-010 : Canonical sur le nouveau domaine et table de correspondance prête pour les redirections

## Epic parent
EPIC-003 : Blog migré

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead qui pratique l'agentic engineering
**Je veux** que chaque article migré déclare thibaut-monier.fr comme version de référence, et que le lien vers l'article d'origine soit tracé
**Afin de** citer et partager une URL stable et faisant autorité, et de permettre plus tard une bascule sans perte quand agentic-agency.fr sera redirigé

### Conversation
- **Décision PO du 2026-10-14** : agentic-agency.fr reste intact (on n'y touche pas pour le moment). Le nouveau site fait foi (canonical vers lui-même). Le **contenu dupliqué entre les deux domaines est un risque accepté** jusqu'à ce que le sort d'Agentic Agency soit tranché.
- Les redirections 301 sur agentic-agency.fr sont **hors périmètre** : elles feront l'objet d'une future story quand l'ancien site évoluera. La table de correspondance livrée ici est prête à être appliquée telle quelle.
- Périmètre de la table : les 28 URL d'articles, plus les index (blog, catégories, tags, RSS) ; la Boîte à outils est traitée en EPIC-004.
- Soumettre le nouveau domaine et son sitemap à la Search Console (pas d'outil de changement d'adresse tant que l'ancien site n'est pas redirigé).

### Validation INVEST
- [x] Independent : seule la migration (US-009) est requise
- [x] Negotiable : format de la table et périmètre des index
- [x] Valuable : URL de référence stables, bascule future sans perte (risque SEO du PRD)
- [x] Estimable : 28 entrées et un test CI
- [x] Sized : 2 points (≤ 8)
- [x] Testable : couverture à 100 % vérifiée en CI

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Canonical autoréférent sur chaque article migré
GIVEN les 28 articles migrés publiés sur thibaut-monier.fr
WHEN P-004 consulte le code d'un article
THEN la balise link rel="canonical" contient l'URL absolue de cet article sur thibaut-monier.fr
AND il n'existe qu'une seule balise canonical par page
```

### Scénarios alternatifs
```gherkin
Scenario: Table de correspondance complète et prête à l'emploi
GIVEN la table versionnée « ancienne URL agentic-agency.fr -> nouvelle URL »
WHEN la CI construit le site
THEN les 28 articles ont une entrée dont la cible répond 200 dans le site construit
AND un fichier de redirections au format serveur (nginx) est généré en artefact, sans être déployé

Scenario: Mention de la première publication
GIVEN un article migré
WHEN P-004 lit le pied de l'article
THEN la mention « Initialement publié sur Agentic Agency le <date> » s'affiche
AND la date correspond au pubDate d'origine
```

### Scénarios d'erreur
```gherkin
Scenario: Article migré absent de la table
GIVEN un article migré sans entrée dans la table de correspondance
WHEN le test de couverture s'exécute en CI
THEN le job échoue avec le message "Correspondance manquante : <slug> (couverture 27/28)"
AND la fusion est bloquée

Scenario: Canonical pointant hors du nouveau domaine
GIVEN un article dont la canonical pointe vers agentic-agency.fr ou une URL relative
WHEN le contrôle SEO s'exécute en CI
THEN le job échoue avec le message "Canonical invalide : <URL> (attendu https://thibaut-monier.fr/…)"
```

### Critères techniques (site statique)
- [ ] Table de correspondance versionnée, schéma validé au build
- [ ] Test CI : 100 % des 28 articles couverts, cibles en 200 dans le site construit
- [ ] Fichier de redirections nginx généré en artefact CI (non déployé)
- [ ] SEO : canonical absolu sur chaque article, sitemap à jour, aucune page orpheline
- [ ] Mention de la première publication accessible (texte, pas seulement icône)

## Notes techniques (à confirmer en tech spec)
- Domaine : thibaut-monier.fr (variante .com à arbitrer en tech spec ; la seconde redirige vers la première).
- Le contrôle de canonical s'exécute dans le workflow créé en US-003.
- Future story (hors backlog actuel) : appliquer le fichier de redirections sur agentic-agency.fr et déclarer le changement d'adresse dans la Search Console.

## Estimation
- **Story Points** : 2
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-009 | Migration des 28 articles | Articles et nouvelles URL |
| US-003 | Pipeline CI qualité | Emplacement des tests (livrée au Sprint 1) |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-024 | SEO technique et données structurées (sitemap cohérent) |

## Sprint assigné
Sprint 3
