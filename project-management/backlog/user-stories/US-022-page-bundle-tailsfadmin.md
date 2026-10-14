# US-022 : Page du bundle Symfony tailsfadmin

## Epic parent
EPIC-005 : Vitrine open source

## Persona concerné
**P-003** : Julien - Lead dev et intégrateur Sylius/Symfony

## User Story

### Carte
**En tant que** P-003 : Julien, lead développeur Symfony
**Je veux** une page présentant le bundle tailsfadmin : ce qu'il apporte, comment l'installer et le configurer, et où trouver la démo et le code
**Afin de** savoir en 2 minutes si ce thème d'administration Tailwind v4 convient à mon projet Symfony

### Conversation
- Contenu : thème admin basé sur TailAdmin, bundle réutilisable (Symfony UX, Stimulus, AssetMapper, Tailwind CSS v4), paquet `tailsfadmin/tailsfadmin-bundle` sur Packagist, version courante 1.6 (à vérifier au moment de la rédaction), CI et licence MIT.
- Installation : `composer require tailsfadmin/tailsfadmin-bundle` (activation automatique par Flex), puis assets/importmap, thème CSS hôte, menu de sidebar en YAML, layout de page : résumer en 4 étapes et renvoyer au README pour le détail (pas de duplication, règle Single Source of Truth).
- Une capture de l'application de démo suffit (liée à une démo en ligne si elle existe : question ouverte).
- Architecture : mentionner la structure en monorepo avec ADR (preuve de rigueur) sans la recopier.

### Validation INVEST
- [x] Independent : ne dépend que du design system
- [x] Negotiable : niveau de détail discutable
- [x] Valuable : preuve Symfony/front moderne, appui pour P-001 et P-003
- [x] Estimable : une page courte
- [x] Sized : 2 points
- [x] Testable : sections et liens vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Page du bundle
GIVEN la page tailsfadmin renseignée avec description, installation en 4 étapes, une capture et les liens
WHEN P-003 ouvre `/open-source/tailsfadmin/`
THEN le nom, la version courante et la licence sont visibles sans défilement
AND la commande `composer require tailsfadmin/tailsfadmin-bundle` est copiable
AND les liens GitHub, Packagist et README s'ouvrent en un clic
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Métriques disponibles
GIVEN le module de données vivantes d'US-021 opérationnel
WHEN P-003 ouvre la page
THEN la dernière version Packagist, les étoiles et la date de release s'affichent avec la mention « Données au {date} »

Scenario: Visiteur non technique
GIVEN P-001 (Claire) arrivée depuis la page profil
WHEN elle ouvre la page
THEN un encadré « En bref » de 2 phrases sans jargon présente l'intérêt du bundle avant le détail technique
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Métriques indisponibles
GIVEN l'API Packagist injoignable au build et sans cache
WHEN le build est lancé
THEN la page s'affiche sans bloc de métriques et le build réussit

Scenario: Lien sortant cassé
GIVEN un lien Packagist renvoyant 404
WHEN la vérification de liens de la CI s'exécute
THEN la CI échoue avec le message « Lien cassé sur /open-source/tailsfadmin/ : {url} (404) »
```

### Critères techniques (site statique)
- [ ] Contenu en MDX, métadonnées validées par le schéma (réutilisation du gabarit de fiche d'US-020 si possible, DRY)
- [ ] Responsive, WCAG 2.2 AA ; la capture a une alternative textuelle décrivant l'écran
- [ ] SEO : title, description, JSON-LD `SoftwareSourceCode` (à confirmer avec EPIC-006), lien depuis la page d'ensemble de la vitrine
- [ ] Performance : Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Entrée de la collection `projects` (ADR-0008), et non de `plugins` : la vitrine Sylius garde son décompte de 20 plugins.
- Peut être une entrée de la collection `plugins` avec un type « bundle », évitant un second schéma ; le catalogue des 20 plugins ne doit pas l'inclure dans son décompte (le filtre par thème d'US-019 compte 20).

## Estimation
- **Story Points** : 2
- **MoSCoW** : Should

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system | Composants de page |

### US dépendantes (BLOQUÉES)
Aucune. (Lien souple avec US-021 pour les métriques.)

## Sprint assigné
Sprint 2
