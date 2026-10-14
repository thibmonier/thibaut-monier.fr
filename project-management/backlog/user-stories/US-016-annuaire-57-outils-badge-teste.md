# US-016 : Annuaire des 57 outils migré avec badge « testé »

## Epic parent
EPIC-004 : Labo d'outils

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead
**Je veux** parcourir l'annuaire des 57 outils, filtrer par catégorie et par contexte, et repérer ceux qui ont un test complet
**Afin de** trouver rapidement un outil d'une catégorie donnée et d'accéder directement au retour mesuré quand il existe

### Conversation
- Reprise à l'identique des 57 fiches (frontmatter : `name`, `description`, `url`, `context` cli|app|commande-native|shell, `platform`, `category`, `replaces`, `mustHave`, `pricing`, `tagline`). Les corps sont souvent vides : on ne les rédige pas ici (YAGNI).
- Redirections : l'URL actuelle de la « Boîte à outils » sur agentic-agency.fr doit être redirigée (voir EPIC-003 pour la table de redirections ; question ouverte n°2 du PRD sur le devenir du domaine).
- Le badge « testé » est-il dérivé automatiquement de l'existence d'un test lié ? Proposition : oui, par le slug, sans champ manuel.
- Vocabulaire des filtres : 21 catégories actuelles ; regrouper ou conserver ? À arbitrer avec le PO (conserver en première version).

### Validation INVEST
- [x] Independent : ne dépend que du schéma d'US-014
- [x] Negotiable : filtres et regroupements discutables
- [x] Valuable : annuaire utile et passerelle vers les tests
- [x] Estimable : migration mécanique + 1 page + 1 badge
- [x] Sized : 3 points
- [x] Testable : décomptes vérifiables (57 fiches, N badges)

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Annuaire complet avec badges
GIVEN les 57 fiches migrées et 3 tests complets publiés
WHEN P-004 ouvre la page de l'annuaire
THEN 57 outils sont listés, chacun avec nom, tagline, catégorie et contexte
AND exactement 3 outils portent le badge « Testé » avec un lien vers leur test
AND le compteur « 57 outils » est affiché
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Filtre par catégorie et par statut
GIVEN la catégorie « Terminal » contenant 2 outils, tous deux testés
WHEN P-004 filtre sur « Terminal » puis sur « Testés uniquement »
THEN 2 outils s'affichent
AND l'URL reflète les filtres (`?categorie=terminal&teste=1`) et la page se recharge dans le même état

Scenario: Fiche d'outil non testé
GIVEN un outil sans test complet
WHEN P-004 ouvre sa fiche
THEN la fiche affiche la description, le lien officiel, la tarification et la mention « Pas encore testé »
AND aucun lien vers un test n'est affiché
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Filtre sans résultat
GIVEN aucune fiche dans la catégorie « Affichage » avec le statut « testé »
WHEN P-004 applique ces deux filtres
THEN le message « Aucun outil ne correspond à ces filtres. » s'affiche avec un bouton « Réinitialiser les filtres »

Scenario: Fiche migrée invalide
GIVEN une fiche dont le champ `context` vaut « web »
WHEN le build est lancé
THEN le build échoue avec le message « Outil « {slug} » invalide : context doit valoir cli, app, commande-native ou shell »
```

### Critères techniques (site statique)
- [ ] 57 fiches validées au build par le schéma (aucune fiche perdue : test de décompte en CI)
- [ ] Page d'annuaire et gabarit de fiche ; filtrage progressif (fonctionne sans JavaScript pour les liens de catégories, enrichi par JS)
- [ ] Responsive (grille 1 à 3 colonnes), WCAG 2.2 AA : filtres étiquetés, résultats annoncés (`aria-live="polite"`)
- [ ] SEO : une URL par fiche, `title` et `description` issus du frontmatter, breadcrumb ; redirections des anciennes URL testées en CI
- [ ] Performance : Lighthouse ≥ 95 sur l'annuaire (57 entrées, aucun JS bloquant)

## Notes techniques (à confirmer en tech spec)
- Copie des fichiers depuis `blog/src/content/tools/` ; lien outil → test résolu au build par le slug.
- La recherche plein texte (Pagefind, EPIC-003) peut indexer l'annuaire sans développement ici.

## Estimation
- **Story Points** : 3
- **MoSCoW** : Should

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-014 | Modèle de test d'outil structuré | Lien fiche → test et schéma de la collection |

### US dépendantes (BLOQUÉES)
Aucune.

## Sprint assigné
Sprint 4
