# US-013 : Flux RSS

## Epic parent
EPIC-003 : Blog migré

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead qui pratique l'agentic engineering
**Je veux** m'abonner au blog avec mon lecteur RSS
**Afin de** suivre chaque nouvel article sans effort, sans compte ni newsletter

### Conversation
- Flux unique (tous les articles) ou aussi un flux par catégorie ? Un flux unique suffit au départ (YAGNI).
- Contenu du flux : extrait (`excerpt`) ou article complet ? Impact sur la fréquentation du site.
- Adresse du flux de l'ancien site : à rediriger en 301 (lien avec US-010).
- Les contenus programmés dans le futur ne doivent jamais apparaître.

### Validation INVEST
- [x] Independent : ne dépend que de la migration
- [x] Negotiable : extrait ou contenu complet
- [x] Valuable : fidélisation de l'audience technique
- [x] Estimable : fonctionnalité standard
- [x] Sized : 2 points (≤ 8)
- [x] Testable : validation du format du flux

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Flux valide listant les articles récents
GIVEN 28 articles publiés
WHEN P-004 ajoute "/rss.xml" à son lecteur
THEN le flux est un document RSS 2.0 valide
AND il contient les 20 articles les plus récents avec titre, lien absolu, date de publication, description et catégorie
```

### Scénarios alternatifs
```gherkin
Scenario: Découverte automatique
GIVEN n'importe quelle page du site
WHEN P-004 la colle dans son lecteur RSS
THEN la balise link rel="alternate" type="application/rss+xml" permet de trouver le flux sans saisir son adresse

Scenario: Article programmé exclu
GIVEN un article dont la date de publication est dans le futur
WHEN le flux est généré
THEN cet article n'y figure pas
```

### Scénarios d'erreur
```gherkin
Scenario: Caractères spéciaux dans un titre
GIVEN un titre contenant "&", "<" et des guillemets
WHEN le flux est généré
THEN le XML reste valide, caractères échappés, validé par le contrôle de la CI

Scenario: Article sans description
GIVEN un article sans "excerpt" ni "description"
WHEN le build s'exécute
THEN le build échoue avec le message "Flux RSS : description manquante pour <slug>"
```

### Critères techniques (site statique)
- [ ] Endpoint statique `/rss.xml` généré depuis la collection `blog` au build
- [ ] Balise `<link rel="alternate" type="application/rss+xml">` dans le layout, lien visible « S'abonner (RSS) » dans le pied de page
- [ ] Responsive et WCAG 2.2 AA pour le lien d'abonnement (libellé explicite, cible ≥ 24 px)
- [ ] SEO : URL absolues, `lastBuildDate`, `language` `fr`
- [ ] Performance : flux < 100 Ko, `Content-Type: application/rss+xml` servi par nginx
- [ ] Validation du flux dans la CI (US-003)

## Notes techniques (à confirmer en tech spec)
- Paquet `@astrojs/rss` ; tri par `pubDate` décroissant ; filtrage identique à celui de la liste du blog.
- Ancienne adresse du flux ajoutée à la table de redirections d'US-010 si elle existait.

## Estimation
- **Story Points** : 2
- **MoSCoW** : Should

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-009 | Migration des 28 articles | Contenu du flux |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| — | Aucune |

## Sprint assigné
Sprint 3
