# US-018 : Comparatifs entre outils d'une même catégorie

## Epic parent
EPIC-004 : Labo d'outils

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead
**Je veux** comparer côte à côte deux ou trois outils testés d'une même catégorie sur les critères communs
**Afin de** choisir entre eux en une lecture, sans ouvrir chaque test

### Conversation
- Un comparatif est généré automatiquement quand une catégorie compte ≥ 2 tests, ou déclaré à la main ? Proposition : déclaré (un fichier liste les outils comparés), contenu tiré des tests (une seule source de vérité).
- Critères comparés : les 5 notes du modèle, version testée, date de test, tarification, mesures communes quand les scénarios portent le même identifiant.
- Un comparatif rédigé (recommandation selon le profil d'usage) est-il attendu ? Oui, un court paragraphe par comparatif.
- Premier comparatif envisagé : Ghostty et iTerm2 (catégorie Terminal), si ce sont bien les candidats retenus en US-015.

### Validation INVEST
- [x] Independent : après US-015, aucun autre prérequis
- [x] Negotiable : critères et format discutables
- [x] Valuable : répond à l'objectif 2 de P-004 (comparer)
- [x] Estimable : un gabarit + une résolution de données
- [x] Sized : 3 points
- [x] Testable : tableau et erreurs vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Comparatif de deux outils
GIVEN deux tests publiés dans la catégorie « Terminal » et un comparatif déclaré les référençant
WHEN P-004 ouvre la page du comparatif
THEN un tableau affiche, pour chaque outil, les 5 notes, la note globale, la version testée et la date de test
AND chaque cellule renvoie vers la section correspondante du test complet
AND un paragraphe de recommandation par profil d'usage est présent
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Trois outils sur mobile
GIVEN un comparatif de 3 outils et un écran de 390 px
WHEN P-004 ouvre la page
THEN le tableau reste lisible par défilement horizontal avec la première colonne figée
AND un résumé en cartes empilées est proposé en alternative

Scenario: Mesures communes
GIVEN deux tests qui partagent un scénario d'identifiant « demarrage-a-froid » avec la même unité
WHEN P-004 ouvre le comparatif
THEN une ligne « Démarrage à froid » affiche les deux mesures et l'écart relatif en pourcentage
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Un seul outil testé
GIVEN un comparatif déclaré avec un outil dont le test n'existe pas
WHEN le build est lancé
THEN le build échoue avec le message « Comparatif « {slug} » : le test de « {outil} » est introuvable (2 tests minimum requis) »

Scenario: Catégories différentes
GIVEN un comparatif mêlant un outil « Terminal » et un outil « Shell »
WHEN le build est lancé
THEN le build échoue avec le message « Comparatif « {slug} » : les outils doivent appartenir à la même catégorie »
```

### Critères techniques (site statique)
- [ ] Collection `comparatifs` validée au build, données lues depuis les tests (aucune double saisie)
- [ ] Tableau sémantique (`<th scope>`, `<caption>`), responsive, WCAG 2.2 AA
- [ ] SEO : title du type « {A} contre {B} : comparatif testé », liens internes bidirectionnels test ↔ comparatif
- [ ] Performance : page sans JavaScript requis, Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Identifiant de scénario optionnel dans le schéma d'US-014 pour permettre les mesures communes (à prévoir dès US-014 pour éviter une migration de contenu).

## Estimation
- **Story Points** : 3
- **MoSCoW** : Could

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-015 | Trois premiers tests complets | Au moins deux tests dans la même catégorie |

### US dépendantes (BLOQUÉES)
Aucune.

## Sprint assigné
Sprint 4
