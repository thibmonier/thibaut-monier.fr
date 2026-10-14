# US-017 : Médias de démonstration dans les tests

## Epic parent
EPIC-004 : Labo d'outils

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead
**Je veux** voir des captures, un enregistrement de terminal et une courte vidéo dans le test, avec une alternative textuelle
**Afin de** vérifier visuellement le comportement de l'outil et sa sortie réelle avant de l'installer

### Conversation
- Trois types de médias : capture (WebP/AVIF), enregistrement de terminal (format texte rejouable de type asciinema, ou à défaut GIF/vidéo), vidéo courte (≤ 60 s, sans son obligatoire).
- Hébergement : fichiers dans le dépôt (poids limité) ou lien vers un hébergeur ? Proposition : fichiers locaux, budget de poids par test.
- Alternative textuelle : obligatoire pour les captures (`alt`), transcription ou résumé pour les vidéos et enregistrements.
- Les enregistrements de terminal peuvent-ils être générés au build ? Non, YAGNI : ils sont produits avec l'outil de l'auteur et déposés.

### Validation INVEST
- [x] Independent : s'insère dans le gabarit d'US-014
- [x] Negotiable : formats et hébergement discutables
- [x] Valuable : prouve la réalité du test (confiance)
- [x] Estimable : 3 composants médias
- [x] Sized : 3 points
- [x] Testable : poids, `alt` et lecture clavier vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Test illustré
GIVEN un test contenant 2 captures, 1 enregistrement de terminal et 1 vidéo de 45 s
WHEN P-004 ouvre la page sur mobile (390 px)
THEN les captures sont servies en WebP ou AVIF avec `srcset`, chacune ≤ 200 Ko
AND l'enregistrement et la vidéo ne démarrent pas automatiquement
AND chaque média est suivi d'une légende et d'une alternative textuelle
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Préférence de mouvement réduit
GIVEN P-004 a activé `prefers-reduced-motion: reduce`
WHEN la page est chargée
THEN les GIF et animations sont remplacés par une image fixe avec un bouton « Lire l'animation »

Scenario: Agrandissement d'une capture
GIVEN une capture de 1 600 px de large
WHEN P-004 clique ou active la capture au clavier (Entrée)
THEN elle s'ouvre en grand dans une boîte de dialogue fermable avec Échap et le focus revient sur la capture
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Média sans alternative textuelle
GIVEN une capture déclarée sans champ `alt`
WHEN le build est lancé
THEN le build échoue avec le message « Test « {slug} » : le média « {fichier} » n'a pas d'alternative textuelle »

Scenario: Média trop lourd
GIVEN une vidéo de 12 Mo
WHEN le build est lancé
THEN le build échoue avec le message « Test « {slug} » : le média « {fichier} » dépasse 8 Mo (budget par vidéo) »
```

### Critères techniques (site statique)
- [ ] Schéma : champ `medias` (type, fichier, alt, légende, transcription) validé au build
- [ ] Composants `Capture`, `EnregistrementTerminal`, `VideoCourte`
- [ ] Images optimisées au build, dimensions explicites (CLS < 0,05), chargement différé hors écran
- [ ] WCAG 2.2 AA : contrôles clavier, sous-titres ou transcription pour toute vidéo avec voix, pas de lecture automatique
- [ ] SEO : `alt` pertinents ; JSON-LD `VideoObject` si vidéo (à confirmer avec EPIC-006)
- [ ] Performance : LCP < 1,5 s sur une page illustrée (4G mobile), Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Pipeline d'images natif du framework ; budget : 200 Ko par capture, 8 Mo par vidéo, 15 Mo par test.
- Lecteur d'enregistrement de terminal chargé à la demande (import dynamique) pour ne pas peser sur les pages sans média.

## Estimation
- **Story Points** : 3
- **MoSCoW** : Should

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-014 | Modèle de test d'outil structuré | Champ `medias` du schéma et gabarit de page |

### US dépendantes (BLOQUÉES)
Aucune.

## Sprint assigné
Sprint 4
