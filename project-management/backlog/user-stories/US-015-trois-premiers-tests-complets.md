# US-015 : Publier les 3 premiers tests complets selon le protocole

## Epic parent
EPIC-004 : Labo d'outils

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead
**Je veux** lire trois tests d'outils complets, avec scénarios rejouables, mesures et limites assumées
**Afin de** choisir un outil sur la base d'un retour mesuré plutôt que d'une liste de liens, et de reproduire le test chez moi

### Conversation
- Choix des trois candidats parmi les 57 fiches existantes. Critère : outil mesurable, utilisé au quotidien, avec des alternatives réelles et une diversité de contextes. Propositions :
  1. **ripgrep** (CLI, Recherche) : remplace `grep` ; temps et volume de sortie sur un dépôt réel (par exemple le dépôt `blog`), commande reproductible.
  2. **Ghostty** (app, Terminal) : démarrage à froid, latence d'affichage, mémoire résidente, configuration.
  3. **iTerm2** (app, Terminal) : mêmes scénarios que Ghostty, ce qui rend possible le comparatif d'US-018 (deux tests dans la même catégorie « Terminal »).
  Réserves : OrbStack (Conteneurs, face à Docker Desktop), Atuin (Shell), eza et lsd (Fichiers, autre paire comparable). Les articles « Caveman » et « CodeGraph » ne figurent pas dans les 57 fiches : s'ils doivent devenir des tests complets, il faut d'abord créer leurs fiches (hors périmètre).
- Calibrage de la profondeur : l'article « Réduire la facture token » (≈ 165 lignes, argumentation, mesures, nuance sur la source académique) sert de référence de rigueur, pas de longueur. Chaque test fait environ 1 200 à 2 000 mots, hors code.
- Indépendance : mentionner explicitement l'absence de lien commercial et les outils payants (pricing visible).
- Les mesures sont prises sur la machine de l'auteur ; matériel et version OS doivent figurer dans l'environnement.

### Validation INVEST
- [x] Independent : seule la structure d'US-014 est requise
- [x] Negotiable : candidats modifiables
- [x] Valuable : objectif O5 (≥ 3 tests au lancement)
- [x] Estimable : 3 tests de taille comparable
- [x] Sized : 5 points (charge surtout éditoriale)
- [x] Testable : chaque test passe la validation de schéma

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Trois tests complets en ligne
GIVEN US-014 déployée et trois fichiers de test renseignés avec les 11 sections du protocole
WHEN P-004 ouvre l'index du labo
THEN 3 tests sont listés avec outil, version testée, date de test et note globale
AND chaque test comporte ≥ 2 scénarios reproductibles, ≥ 1 mesure chiffrée avec unité et ≥ 2 limites
AND chaque date de test est postérieure ou égale au 2026-10-01
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Reproduction d'un scénario
GIVEN un test affichant la commande exacte, la version de l'outil et le jeu de données utilisé
WHEN P-004 exécute la commande dans le même environnement (versions indiquées)
THEN l'ordre de grandeur de la mesure obtenue est le même que celui publié (écart de ±25 % toléré, indiqué dans le test)

Scenario: Verdict nuancé
GIVEN un outil dont un scénario a échoué ou dont un gain annoncé n'est pas confirmé
WHEN P-004 lit la section Résultats et Verdict
THEN l'échec ou l'écart figure explicitement avec la mention « non confirmé » ou « échec »
AND la note globale en tient compte
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Test publié sans mesure
GIVEN un test dont aucun résultat n'est chiffré
WHEN le build est lancé
THEN le build échoue avec le message « Test « {slug} » invalide : au moins 1 résultat chiffré avec unité est requis »

Scenario: Outil inconnu de l'annuaire
GIVEN un test dont le slug d'outil ne correspond à aucune fiche de l'annuaire
WHEN le build est lancé
THEN le build échoue avec le message « Test « {slug} » : fiche d'outil « {outil} » introuvable dans l'annuaire »
```

### Critères techniques (site statique)
- [ ] Contenu en MDX versionné, conforme au schéma d'US-014 (aucune dérogation)
- [ ] Page d'index du labo : liste des tests, tri par date de test décroissante
- [ ] Responsive, WCAG 2.2 AA ; blocs de code avec contraste ≥ 4,5:1 et défilement horizontal clavier-accessible
- [ ] SEO : title unique ≤ 60 caractères, description ≤ 160, canonical, URL stable `/labo/{slug}/` (à confirmer en tech spec)
- [ ] Performance : Lighthouse ≥ 95 ; aucune image > 200 Ko sans `srcset`

## Notes techniques (à confirmer en tech spec)
- Les commandes de mesure sont stockées dans un bloc de code ; un script d'aide (hors build) peut rejouer les mesures, mais n'est pas requis (YAGNI).
- Prévoir un lien vers la fiche d'annuaire et vers le dépôt officiel de l'outil.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Must

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-014 | Modèle de test d'outil structuré | Schéma et gabarit à respecter |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-018 | Comparatifs entre outils d'une même catégorie |

## Sprint assigné
Sprint 4
