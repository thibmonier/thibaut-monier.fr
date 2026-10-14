# US-020 : Fiche détaillée d'un plugin

## Epic parent
EPIC-005 : Vitrine open source

## Persona concerné
**P-003** : Julien - Lead dev et intégrateur Sylius/Symfony

## User Story

### Carte
**En tant que** P-003 : Julien, lead développeur Sylius
**Je veux** une fiche par plugin avec le problème résolu, les fonctionnalités, la matrice de compatibilité, les dépendances, l'installation et les liens GitHub et Packagist
**Afin de** décider en moins de 2 minutes si je l'installe sur ma boutique Sylius 2, sans lire tout le README

### Conversation
- Structure de la fiche : problème résolu (3 phrases), fonctionnalités clés (5 à 8 puces, pas le README complet), compatibilité (PHP, Sylius, Symfony, bases de données), dépendances (obligatoires et optionnelles), installation (`composer require` + activation du bundle + migrations), captures, liens, licence.
- Exemple de matrice pour Company Accounts : PHP 8.2+ (Sylius 2.2) et 8.3+ (Sylius 2.3) ; Sylius 2.2.9+ et 2.3 ; Symfony 6.4 et 7.4 (2.2), 6.4, 7.4 et 8.0 (2.3, Symfony 8 exige PHP 8.4) ; MySQL, MariaDB, PostgreSQL.
- Dépendances entre plugins : Order Hold sert de noyau à Purchase Approval et à Trade Credit ; Company Accounts est requis ou optionnel pour plusieurs plugins B2B. Représentation : liste « Nécessite / Complété par » plutôt qu'un graphe interactif (YAGNI). À valider contre les `composer.json` réels.
- Captures : fournies pour les plugins disposant d'une interface ; les autres affichent un extrait de configuration.

### Validation INVEST
- [x] Independent : seul le catalogue (US-019) est requis
- [x] Negotiable : sections et ordre discutables
- [x] Valuable : preuve d'expertise Sylius (O3)
- [x] Estimable : un gabarit, 20 contenus
- [x] Sized : 5 points
- [x] Testable : sections obligatoires vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Lecture de la fiche Purchase Approval
GIVEN la fiche renseignée avec compatibilité, dépendances et liens
WHEN P-003 ouvre `/open-source/purchase-approval/`
THEN la matrice de compatibilité PHP, Sylius, Symfony est visible sans défilement sur desktop (1440 × 900)
AND la section Dépendances liste « Nécessite : Company Accounts, Order Hold » avec un lien vers chaque fiche
AND les liens GitHub et Packagist s'ouvrent dans un nouvel onglet avec `rel="noopener"`
AND la commande `composer require` est copiable en un clic
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Plugin sans dépendance
GIVEN la fiche Tier Pricing sans dépendance déclarée
WHEN P-003 ouvre la fiche
THEN la section Dépendances affiche « Aucune dépendance sur un autre plugin de la collection »

Scenario: Navigation entre fiches liées
GIVEN la fiche Trade Credit déclarant Order Hold comme dépendance
WHEN P-003 clique sur « Order Hold »
THEN la fiche Order Hold s'ouvre avec, en bas, la liste « Utilisé par » incluant Trade Credit et Purchase Approval
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Dépendance vers un plugin inexistant
GIVEN une fiche dont la dépendance vaut « sylius-inconnu »
WHEN le build est lancé
THEN le build échoue avec le message « Plugin « {slug} » : la dépendance « sylius-inconnu » n'existe pas dans la collection »

Scenario: Matrice de compatibilité incomplète
GIVEN une fiche sans version minimale de PHP
WHEN le build est lancé
THEN le build échoue avec le message « Plugin « {slug} » invalide : compatibilité.php est requis »
```

### Critères techniques (site statique)
- [ ] Schéma étendu : problème, fonctionnalités, compatibilité (php, sylius, symfony, bases), dépendances, installation, captures, liens ; références croisées validées au build
- [ ] Gabarit de fiche et composant `CompatibilityMatrix` (tableau sémantique)
- [ ] Responsive : matrice défilable sans casser la page ; WCAG 2.2 AA (bouton copier étiqueté, annonce « Commande copiée »)
- [ ] SEO : title unique, meta description, JSON-LD `SoftwareSourceCode` et `BreadcrumbList` (à confirmer avec EPIC-006), canonical
- [ ] Performance : Lighthouse ≥ 95, captures optimisées ≤ 200 Ko

## Notes techniques (à confirmer en tech spec)
- La page de fiche accueille les métriques vivantes d'US-021 via un emplacement optionnel (la fiche doit s'afficher sans elles).
- Les contenus peuvent être pré-remplis depuis les README par un script d'import, puis relus à la main.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Must

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-019 | Catalogue des plugins | Schéma `plugins` et URL des fiches |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-021 | Données vivantes au build |
| US-028 | Traduction EN profil et vitrine |

## Sprint assigné
Sprint 2
