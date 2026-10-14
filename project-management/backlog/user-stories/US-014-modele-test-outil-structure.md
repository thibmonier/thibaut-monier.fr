# US-014 : Modèle de test d'outil structuré

## Epic parent
EPIC-004 : Labo d'outils

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead
**Je veux** que chaque test d'outil suive un protocole identique, avec versions, date de test, mesures, limites et note multicritère visibles
**Afin de** juger en moins de 3 minutes si un test est reproductible, récent et fiable, et de comparer deux outils sur des critères communs

### Conversation
- Quels champs sont obligatoires ? Proposition : contexte et besoin, environnement (outil + version, OS + version, matériel, date du test), installation, au moins 2 scénarios reproductibles (commande ou étapes, résultat attendu, résultat observé), résultats mesurés, limites (au moins 1), verdict, note multicritère, alternatives, date de dernière revérification.
- Quels critères de notation, sur 5 ? Proposition : installation, fiabilité, performance, documentation, maintenance du projet ; notes de 1 à 5 par pas de 0,5 ; note globale = moyenne arrondie à 0,5 (échelle retenue en revue de conception). Critères à confirmer avec le PO avant le Sprint 4 (les comparatifs d'US-018 en dépendent).
- Où vit le test par rapport à la fiche annuaire existante (frontmatter `name`, `description`, `url`, `context`, `platform`, `category`, `replaces`, `mustHave`, `pricing`, `tagline`) ? Décision (revue de conception) : une collection `toolTests` distincte, liée à la fiche par son slug (voir architecture/content-model.md).
- Seuil d'alerte de péremption : 6 mois après la date de revérification (règle du PRD).

### Validation INVEST
- [x] Independent : ne dépend que du design system (US-002)
- [x] Negotiable : liste des champs et des critères discutable
- [x] Valuable : socle de toute la crédibilité du labo (objectif O5)
- [x] Estimable : schéma + 1 gabarit de page + 1 composant
- [x] Sized : 5 points
- [x] Testable : validation de schéma et rendu vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Un test complet est validé et rendu
GIVEN un fichier de test contenant les 11 sections du protocole, 2 scénarios, 5 notes comprises entre 0 et 5 et deux dates au format AAAA-MM-JJ
WHEN P-004 ouvre la page du test après le build
THEN les sections s'affichent dans l'ordre du protocole
AND la note globale et les 5 notes par critère sont visibles sans défilement sur desktop
AND le bloc « Testé le 2026-10-14 · Revérifié le 2026-10-14 » apparaît sous le titre
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Test de plus de 6 mois
GIVEN un test dont la date de revérification date de plus de 183 jours à la date du build
WHEN P-004 ouvre la page
THEN un bandeau « Ce test n'a pas été revérifié depuis plus de 6 mois (dernière revérification : {date}). Versions et résultats peuvent avoir changé. » s'affiche au-dessus du contenu
AND le build n'échoue pas

Scenario: Outil sans alternative notable
GIVEN un test dont le champ alternatives contient une entrée « aucune alternative comparable » avec une justification
WHEN P-004 ouvre la page
THEN la section Alternatives affiche cette justification au lieu d'une liste vide
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Section obligatoire absente
GIVEN un test dont le champ « limites » est vide
WHEN le build est lancé
THEN le build échoue avec le message « Test « {slug} » invalide : champ « limites » manquant (au moins 1 entrée requise) »
AND aucune page n'est générée pour ce test

Scenario: Note hors bornes ou date incohérente
GIVEN un test avec une note « performance » à 6 ou une revérification antérieure à la date de test
WHEN le build est lancé
THEN le build échoue avec le message « Test « {slug} » invalide : note « performance » doit être comprise entre 0 et 5 » ou « la date de revérification précède la date de test »
```

### Critères techniques (site statique)
- [ ] Schéma de contenu typé (collection `toolTests`) validé au build ; le build échoue si le schéma est invalide
- [ ] Gabarit de page + composants : bloc d'environnement, tableau de scénarios, jauge de notes, bandeau de péremption
- [ ] Responsive : lisible de 320 px à 1440 px, tableaux de scénarios défilables sans casser la mise en page
- [ ] WCAG 2.2 AA : les notes ne reposent pas sur la couleur seule (valeur chiffrée + texte), bandeau annoncé par `role="note"`, contrastes ≥ 4,5:1
- [ ] SEO : title et meta description dérivés du schéma ; données structurées proposées (`Review` ou `TechArticle`, à confirmer en tech spec avec EPIC-006)
- [ ] Performance : Lighthouse ≥ 95 sur les 4 axes sur la page de test type

## Notes techniques (à confirmer en tech spec)
- Collection de contenu Astro avec schéma Zod ; les dates validées par `z.coerce.date()` avec contrainte croisée (`refine`).
- Le calcul « plus de 6 mois » se fait au build : une page non reconstruite ne s'alerte pas seule. Prévoir un build planifié hebdomadaire (cron CI) ; sinon calcul côté client en secours.
- Les champs `scenarios` en liste d'objets (`titre`, `etapes`, `attendu`, `observe`).

## Estimation
- **Story Points** : 5
- **MoSCoW** : Must

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system | Composants et styles de base |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-015 | Trois premiers tests complets |
| US-016 | Annuaire des 57 outils avec badge |
| US-017 | Médias de démonstration |

## Sprint assigné
Sprint 4
