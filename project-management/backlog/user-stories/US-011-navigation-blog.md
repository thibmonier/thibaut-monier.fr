# US-011 : Navigation du blog : catégories, tags, séries, pagination

## Epic parent
EPIC-003 : Blog migré

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead qui pratique l'agentic engineering
**Je veux** parcourir le blog par catégorie, tag et série, avec une pagination claire
**Afin de** retrouver en moins de 3 clics les articles d'une même thématique ou de lire une série dans l'ordre

### Conversation
- Catégories existantes : Business, Méthode, Métiers, Outils, Pilotage. Les tags sont-ils normalisés (casse, pluriel) avant migration ?
- Taille de page : 9 ou 12 articles ? Avec 28 articles, la pagination est utile mais modeste.
- Une série affiche-t-elle l'ordre de lecture et les liens précédent/suivant dans chaque article ?
- Pages de tag à faible volume (1 article) : indexables ou en `noindex` pour éviter le contenu mince ?

### Validation INVEST
- [x] Independent : ne dépend que de la migration
- [x] Negotiable : taille de page, gestion des tags rares
- [x] Valuable : découvrabilité du contenu
- [x] Estimable : routes statiques générées
- [x] Sized : 3 points (≤ 8)
- [x] Testable : compteurs et liens vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Filtrage par catégorie
GIVEN le blog contenant 28 articles répartis dans 5 catégories
WHEN P-004 ouvre la page "/blog/categorie/methode"
THEN seuls les articles de la catégorie "Méthode" sont listés, du plus récent au plus ancien
AND le titre de la page indique le nombre d'articles, par exemple "Méthode (N articles)"
```

### Scénarios alternatifs
```gherkin
Scenario: Pagination
GIVEN 28 articles et une taille de page de 12
WHEN P-004 ouvre "/blog"
THEN 12 articles s'affichent avec une navigation "Page 1 sur 3"
AND "/blog/page/2" affiche les articles 13 à 24

Scenario: Lecture d'une série
GIVEN un article appartenant à une série de 4 articles
WHEN P-004 l'ouvre
THEN un encart "Série : <nom> (article 2 sur 4)" propose les liens "Précédent" et "Suivant"
```

### Scénarios d'erreur
```gherkin
Scenario: Page de pagination inexistante
GIVEN 3 pages de blog
WHEN P-004 ouvre "/blog/page/9"
THEN le statut HTTP est 404
AND la page affiche "Cette page n'existe pas" avec un lien "Retour au blog"

Scenario: Catégorie sans article
GIVEN une catégorie du schéma sans aucun article publié
WHEN le build s'exécute
THEN aucune page vide n'est générée pour cette catégorie
AND elle n'apparaît pas dans le filtre
```

### Critères techniques (site statique)
- [ ] Routes statiques `/blog/categorie/[categorie]`, `/blog/tag/[tag]`, `/blog/serie/[serie]`, `/blog/page/[n]` générées depuis la collection
- [ ] Composants `Pagination`, `TaxonomyList`, `SeriesNav`
- [ ] Responsive : liste de filtres repliable sous 768 px
- [ ] WCAG 2.2 AA : `nav` étiquetée, page courante en `aria-current`, liens explicites
- [ ] SEO : canonical par page, `rel="prev"`/`rel="next"` facultatif, pages de tag à un article en `noindex` (à confirmer)
- [ ] Performance : aucun JavaScript requis, Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Utilitaire `getStaticPaths` avec la pagination native d'Astro ; slugification des tags sans accents.
- Ordre de série : champ `series` + numéro d'ordre à ajouter au schéma si absent du frontmatter existant.

## Estimation
- **Story Points** : 3
- **MoSCoW** : Should

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-009 | Migration des 28 articles | Collection et taxonomies |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| — | Aucune |

## Sprint assigné
Sprint 3
