# US-023 : Étude de cas des contributions career-ops

## Epic parent
EPIC-005 : Vitrine open source

## Persona concerné
**P-001** : Claire - DG d'une scale-up qui recrute

## User Story

### Carte
**En tant que** P-001 : Claire, DG qui recrute un CTO ou Delivery Manager
**Je veux** lire une étude de cas courte de trois correctifs acceptés dans un projet open source très suivi
**Afin de** vérifier, sans lire de code, que le candidat applique une pratique actuelle, rigoureuse et reconnue par des pairs

### Conversation
- Contexte : career-ops, projet open source d'automatisation de recherche d'emploi assistée par IA (Node.js), plus de 74 000 étoiles, dépôt `career-ops-hq/career-ops` ; Thibaut est membre de l'équipe Contributors. Chiffre d'étoiles à vérifier à la date de rédaction.
- Trois PR mergées en une semaine, chacune corrigeant un parsing silencieux :
  1. PR #3496 (issue #3495) : une chaîne passée à la place d'un tableau de lignes faisait échouer la détection d'en-têtes et vidait la population analysée sans erreur, d'où un verdict faux avec un code de sortie 0.
  2. PR #3808 (issue #3807) : en-têtes de rapport en français non reconnus (espace avant les deux-points, accent) ; 128 URL et 61 archétypes perdus sur 224 rapports.
  3. PR #3866 (issue #3865) : le champ archétype ne couvrait que 5 locales sur 12 ; graphies extraites des modes du dépôt plutôt que traduites.
- Pour chaque PR : problème, correctif, tests de non-régression, durcissements demandés en revue (refus des en-têtes éclatés sur deux lignes, garde contre la capture d'une ligne de tableau de scoring). Vérifier que les trois PR sont toujours en statut « mergée » et que les liens sont valides.
- Registre : accessible à un public non technique (« un défaut qui ne se voit pas » plutôt que « regex »), avec un encadré technique repliable.
- Le lien avec la thèse du site : un défaut silencieux est un risque de delivery ; la méthode (test avant correctif) est celle que le candidat demande à ses équipes.

### Validation INVEST
- [x] Independent : ne dépend que du design system
- [x] Negotiable : angle et longueur discutables
- [x] Valuable : preuve externe vérifiable (hypothèse H2 du PRD)
- [x] Estimable : une page de contenu structuré
- [x] Sized : 2 points
- [x] Testable : trois cas, liens et chiffres vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Étude de cas complète
GIVEN la page renseignée avec les 3 PR (#3496, #3808, #3866)
WHEN P-001 ouvre `/open-source/career-ops/`
THEN un résumé de 3 lignes (projet, rôle, résultat) est visible sans défilement
AND chaque PR présente quatre blocs : problème, correctif, tests de non-régression, lien vers la PR
AND le chiffre « 128 URL et 61 archétypes perdus sur 224 rapports » figure dans le cas n°2
AND la page se lit en moins de 4 minutes (≤ 900 mots hors encadrés techniques)
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Lecture non technique
GIVEN les encadrés techniques repliés par défaut
WHEN P-001 parcourt la page
THEN le texte visible ne contient aucun extrait de code
AND chaque encadré se déplie au clavier (Entrée ou Espace)

Scenario: Accès depuis la page profil
GIVEN la page profil contenant la mention « Contributeur career-ops »
WHEN P-001 clique sur cette mention
THEN l'étude de cas s'ouvre et un lien « Retour au profil » est présent en tête de page
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Lien de PR cassé
GIVEN un lien vers la PR #3808 renvoyant 404
WHEN la vérification de liens de la CI s'exécute
THEN la CI échoue avec le message « Lien cassé sur /open-source/career-ops/ : {url} (404) »

Scenario: PR sans test de non-régression renseigné
GIVEN une PR dont le bloc « tests » est vide
WHEN le build est lancé
THEN le build échoue avec le message « Étude de cas « career-ops » : la PR #{numéro} n'a pas de tests de non-régression décrits »
```

### Critères techniques (site statique)
- [ ] Schéma d'étude de cas (projet, rôle, liste de contributions avec numéro, problème, correctif, tests, lien) validé au build
- [ ] Composant `ContributionCard` et encadré repliable (`<details>`)
- [ ] Responsive, WCAG 2.2 AA (contrastes, focus, structure de titres h1 à h3)
- [ ] SEO : title, description, JSON-LD `Article` (à confirmer avec EPIC-006), lien depuis la page profil et la vitrine
- [ ] Performance : Lighthouse ≥ 95 ; aucun script tiers

## Notes techniques (à confirmer en tech spec)
- Liens sortants avec `rel="noopener noreferrer"` ; badge d'étoiles éventuel alimenté par US-021 (facultatif).
- Éviter toute information personnelle issue du CV source (téléphone, âge, adresse).

## Estimation
- **Story Points** : 2
- **MoSCoW** : Should

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system | Composants de page |

### US dépendantes (BLOQUÉES)
Aucune.

## Sprint assigné
Sprint 2
