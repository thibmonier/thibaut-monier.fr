# US-024 : SEO technique et données structurées

## Epic parent
EPIC-006 : SEO, GEO et mesure

## Persona concerné
**P-002** : Marc - Dirigeant e-commerce B2B qui cherche un expert en mission

## User Story

### Carte
**En tant que** P-002 : Marc, dirigeant e-commerce B2B qui cherche un expert en mission
**Je veux** trouver par Google (ou par un assistant IA) les fiches plugins, les articles et le profil de Thibaut avec des résultats enrichis
**Afin de** arriver directement sur la page qui répond à mon besoin (par exemple « Factur-X Sylius ») et contacter l'expert en moins de 2 minutes

### Conversation
- Types JSON-LD (PRD) : Person, ProfilePage (profil), BlogPosting (articles), SoftwareSourceCode (fiches plugins), ItemList (`/open-source/`), BreadcrumbList (toutes pages), FAQPage (articles avec FAQ, 3 articles à la livraison).
- Les fiches plugins sont livrées par US-020 (EPIC-005) : la story ne peut pas être terminée avant. Que faire si EPIC-005 glisse : livrer d'abord Person, ProfilePage, BlogPosting et FAQPage ?
- `llms.txt` : contenu minimal (présentation, liens clés vers profil, plugins, articles) ; mise à jour manuelle ou générée au build ?
- Arbitrage sprint 3 (2026-10-14) : URL absolues relatives à `PUBLIC_SITE_URL` (domaine provisoire accepté), avec contrôle interdisant tout domaine en dur ; `lastmod` = date du contenu, sinon date du build (E18) ; `<title>` : le suffixe de marque n'est ajouté que s'il tient dans 60 caractères (`seoTitle` sinon).

### Validation INVEST
- [x] Independent : bloquée seulement par des contenus existants (US-005, US-009, US-020)
- [x] Negotiable : liste des types, contenu de `llms.txt`
- [x] Valuable : acquisition organique et citations par les moteurs IA
- [x] Estimable : schémas connus
- [x] Sized : 5 points (≤ 8)
- [x] Testable : validation automatique du JSON-LD

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: JSON-LD valide sur chaque type de page
GIVEN le site construit
WHEN le validateur de données structurées analyse une page profil, un article avec FAQ et une fiche plugin
THEN la page profil expose Person et ProfilePage, l'article expose BlogPosting (et FAQPage pour les 3 articles à FAQ), la fiche plugin expose SoftwareSourceCode, la page "/open-source/" expose ItemList
AND toutes les pages exposent un BreadcrumbList
AND aucune erreur de validation n'est signalée
```

### Scénarios alternatifs
```gherkin
Scenario: Sitemap complet
GIVEN le site construit avec N pages indexables
WHEN P-002 (ou un robot) ouvre "/sitemap-index.xml"
THEN toutes les pages indexables y figurent avec URL absolue et `lastmod` (date du contenu, sinon date du build)
AND les pages en "noindex" en sont exclues

Scenario: Fichiers pour robots et moteurs IA
GIVEN le site déployé
WHEN un robot demande "/robots.txt" et "/llms.txt"
THEN robots.txt référence le sitemap et llms.txt répond 200 en texte brut avec au moins 10 liens vers les pages clés
```

### Scénarios d'erreur
```gherkin
Scenario: Donnée structurée invalide
GIVEN un article sans date de publication
WHEN le contrôle JSON-LD s'exécute en CI
THEN la CI échoue avec le message "JSON-LD BlogPosting invalide : datePublished requis (<slug>)"

Scenario: Donnée personnelle dans le JSON-LD
GIVEN un JSON-LD Person contenant "telephone", "birthDate" ou "address" précise
WHEN le contrôle s'exécute
THEN la CI échoue avec le message "JSON-LD Person : propriété interdite 'telephone'"
```

### Critères techniques (site statique)
- [ ] Schéma de contenu : champs nécessaires au JSON-LD (dates, auteur, résumé, version, dépôt) obligatoires et validés au build
- [ ] Composant `JsonLd` générique et générateurs par type ; `BreadcrumbList` dans le layout
- [ ] Sitemap, `robots.txt`, `llms.txt` générés au build ; canonical absolu partout
- [ ] Contrôle interdisant tout domaine en dur ; toutes les URL absolues dérivent de `PUBLIC_SITE_URL` (C4)
- [ ] Meta : `title` ≤ 60 caractères (suffixe de marque ajouté seulement s'il tient), `description` ≤ 160 caractères, unicité vérifiée en CI
- [ ] Liste blanche des propriétés de Person (nom, intitulé, URL, réseaux, localisation générale)
- [ ] Performance : JSON-LD inline < 5 Ko par page ; Lighthouse SEO = 100

## Notes techniques (à confirmer en tech spec)
- `@astrojs/sitemap` ; endpoints statiques pour `robots.txt` et `llms.txt` ; générateurs typés (type `schema-dts` envisageable).
- Validation JSON-LD en CI par script (forme et propriétés obligatoires) ; validation Rich Results en vérification manuelle.
- Pas de `hreflang` tant que EPIC-007 n'est pas activé.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-005 | Parcours professionnel en frise | Données Person/ProfilePage |
| US-009 | Migration des 28 articles | BlogPosting et FAQPage |
| US-020 | Fiche détaillée par plugin (EPIC-005) | SoftwareSourceCode |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| — | Aucune |

## Sprint assigné
Sprint 3
