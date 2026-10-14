# US-003 : Pipeline CI qualité

## Epic parent
EPIC-001 : Socle et walking skeleton

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead qui pratique l'agentic engineering
**Je veux** que chaque modification du site soit contrôlée automatiquement (lint, build avec schémas, liens, Lighthouse)
**Afin de** pouvoir constater que le site, lui-même une preuve, applique la rigueur qu'il revendique (Lighthouse ≥ 95, schémas typés, aucun lien mort)

### Conversation
- Outil de CI : GitHub Actions ? Les rapports Lighthouse sont-ils publiés (artefact ou badge dans le README) ?
- Seuil de 95 sur chaque axe, bloquant dès le Sprint 1 : sur combien de pages (accueil seule au départ, puis pages types) ?
- Vérification des liens : internes seulement (bloquant) et externes (avertissement) pour éviter les échecs sporadiques.
- Persona : P-004 est le lecteur qui vérifiera cette rigueur ; le bénéficiaire direct est aussi le PO.

### Validation INVEST
- [x] Independent : ne dépend que du squelette
- [x] Negotiable : choix des outils (lint, vérificateur de liens)
- [x] Valuable : empêche les régressions dès le Sprint 1
- [x] Estimable : outils standards
- [x] Sized : 3 points (≤ 8)
- [x] Testable : un échec volontaire doit bloquer la fusion

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Pull request conforme validée par la CI
GIVEN une pull request sans erreur de lint, au schéma de contenu valide et sans lien cassé
WHEN la CI s'exécute
THEN les étapes lint, format, build, liens et Lighthouse passent en moins de 8 minutes
AND Lighthouse affiche ≥ 95 sur Performance, Accessibilité, Bonnes pratiques et SEO
```

### Scénarios alternatifs
```gherkin
Scenario: Cache de dépendances
GIVEN une exécution précédente réussie sur la même version du verrou de dépendances
WHEN la CI s'exécute de nouveau
THEN les dépendances sont restaurées depuis le cache et la durée totale baisse d'au moins 30 %

Scenario: Lien externe indisponible
GIVEN un lien externe qui répond 503
WHEN la vérification des liens s'exécute
THEN un avertissement est publié dans le rapport
AND la CI n'échoue pas pour ce seul motif
```

### Scénarios d'erreur
```gherkin
Scenario: Schéma de contenu invalide
GIVEN un fichier de contenu dont un champ obligatoire est absent
WHEN le build s'exécute
THEN le build échoue avec un message citant le fichier et le champ, par exemple "Content validation failed: <fichier> : champ 'title' requis"
AND la fusion est bloquée

Scenario: Score Lighthouse sous le seuil
GIVEN une modification qui fait tomber l'accessibilité à 92
WHEN Lighthouse CI s'exécute
THEN l'étape échoue avec le message "Accessibility score 0.92 < 0.95"
AND la fusion est bloquée
```

### Critères techniques (site statique)
- [ ] Le build exécute la validation des schémas de contenu (échec = build rouge)
- [ ] Vérification des liens internes et des ancres sur le site construit
- [ ] Lint et formatage (JS/TS, Astro, CSS, Markdown) en mode vérification
- [ ] Lighthouse CI bloquant à 0,95 sur les 4 axes, sur la page d'accueil et une page type
- [ ] Contrôle d'accessibilité automatisé (axe) sans violation sérieuse
- [ ] Protection de la branche principale : CI verte requise avant fusion

## Notes techniques (à confirmer en tech spec)
- GitHub Actions ; `@lhci/cli` avec `lighthouserc` versionné ; vérificateur de liens sur le dossier `dist`.
- Les futurs contrôles (table de redirections US-010) se branchent dans le même workflow.
- Versions d'actions et d'outils épinglées (règle de sécurité chaîne d'approvisionnement).

## Estimation
- **Story Points** : 3
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-001 | Squelette du site publié en production | Code et build à contrôler |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-010 | Canonical et table de correspondance (tests en CI) |

## Sprint assigné
Sprint 1
