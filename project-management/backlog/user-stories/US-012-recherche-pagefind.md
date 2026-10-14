# US-012 : Recherche plein texte côté client (Pagefind)

## Epic parent
EPIC-003 : Blog migré

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead qui pratique l'agentic engineering
**Je veux** chercher un mot (par exemple « tokens ») dans tout le contenu du blog
**Afin de** trouver en moins de 10 secondes l'article pertinent pour mon problème, sans parcourir les 28 articles

### Conversation
- Périmètre : articles seuls au départ ; le labo et les fiches plugins rejoindront l'index avec leurs EPICs.
- Interface : page dédiée `/recherche` ou fenêtre modale depuis l'en-tête ?
- Index généré au build ; poids acceptable pour le chargement différé du module de recherche.
- Les contenus `draft` ou futurs doivent rester exclus de l'index.

### Validation INVEST
- [x] Independent : ne dépend que de la migration
- [x] Negotiable : interface et périmètre
- [x] Valuable : réduit le temps de recherche
- [x] Estimable : outil standard
- [x] Sized : 2 points (≤ 8)
- [x] Testable : requêtes types et résultats attendus

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Recherche d'un terme présent
GIVEN un index de recherche construit sur les 28 articles
WHEN P-004 saisit "tokens" dans le champ de recherche
THEN les résultats s'affichent en moins de 300 ms après la dernière frappe
AND chaque résultat montre le titre, un extrait avec le terme surligné et la catégorie
```

### Scénarios alternatifs
```gherkin
Scenario: Recherche sans accents
GIVEN un article contenant le mot "méthode"
WHEN P-004 saisit "methode"
THEN cet article apparaît dans les résultats

Scenario: Navigation au clavier
GIVEN une liste de résultats affichée
WHEN P-004 utilise les flèches puis Entrée
THEN l'article choisi s'ouvre et le focus est placé sur son titre
```

### Scénarios d'erreur
```gherkin
Scenario: Aucun résultat
GIVEN le terme "zzzzqq"
WHEN P-004 lance la recherche
THEN le message "Aucun résultat pour « zzzzqq ». Essayez un autre mot ou parcourez les catégories." s'affiche avec un lien vers le blog

Scenario: Module de recherche indisponible
GIVEN l'échec du chargement de l'index
WHEN P-004 ouvre la recherche
THEN le message "La recherche est momentanément indisponible." s'affiche
AND un lien vers la liste complète du blog reste visible
```

### Critères techniques (site statique)
- [ ] Index Pagefind généré au build après la construction du site ; échec du build si l'index est vide
- [ ] Page `/recherche` et composant de recherche chargé à la demande
- [ ] Responsive : champ pleine largeur sur mobile
- [ ] WCAG 2.2 AA : champ étiqueté, résultats annoncés (`aria-live="polite"`), contrastes
- [ ] SEO : page `/recherche` en `noindex`
- [ ] Performance : index chargé uniquement à la première interaction ; poids de l'index < 500 Ko ; Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Pagefind exécuté comme post-build sur `dist/` ; attribut `data-pagefind-body` sur le corps d'article, `data-pagefind-ignore` ailleurs.
- Lien d'accès dans l'en-tête défini en lien avec le layout d'US-002.

## Estimation
- **Story Points** : 2
- **MoSCoW** : Should

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-009 | Migration des 28 articles | Contenu à indexer |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| — | Aucune |

## Sprint assigné
Sprint 3
