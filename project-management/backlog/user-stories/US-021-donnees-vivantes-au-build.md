# US-021 : Données vivantes au build avec cache et repli

## Epic parent
EPIC-005 : Vitrine open source

## Persona concerné
**P-003** : Julien - Lead dev et intégrateur Sylius/Symfony

## User Story

### Carte
**En tant que** P-003 : Julien, lead développeur Sylius
**Je veux** voir sur chaque fiche la dernière version, la date de release, les étoiles GitHub et les téléchargements Packagist
**Afin de** m'assurer que le plugin est maintenu avant de l'installer en production

### Conversation
- Arbitrage sprint 2 (2026-10-14) : conformément à l'ADR-0006, le build lit uniquement le JSON commité `src/data/oss-metrics.json` (build Railway sans réseau, aucun jeton dans l'image) ; la collecte s'exécute via `make metrics` et le workflow hebdomadaire `metrics.yml`, qui ouvre une pull request (E13). Jeton à portée limitée dédié ou réouverture manuelle de la PR pour déclencher la CI : choix en T-021-01. Contrôle des liens sortants : job CI séparé `external-links` (E14).
- Sources : API GitHub (étoiles, dernière release) et API Packagist (téléchargements, dernière version). Authentification GitHub : jeton en lecture seule en CI, sinon requêtes anonymes (limite de débit). Hypothèse H5 du PRD.
- Règle absolue du PRD : **le build n'échoue jamais pour une métrique**. Chaque métrique a un repli (dernière valeur connue en cache, sinon masquage).
- Fraîcheur : valeurs figées à la date du build ; afficher « données au {date} ». La collecte hebdomadaire planifiée suffit (arbitrage E13).
- Faut-il aussi alimenter la page tailsfadmin (US-022) ? Oui, si triviale, avec la même fonction (DRY).

### Validation INVEST
- [x] Independent : se greffe sur la fiche d'US-020
- [x] Negotiable : métriques et fréquence discutables
- [x] Valuable : réduit la défiance sur la maintenance
- [x] Estimable : un module de collecte + un cache
- [x] Sized : 3 points
- [x] Testable : appels simulés (succès, échec, limite de débit)

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Métriques affichées
GIVEN les API GitHub et Packagist disponibles
WHEN la collecte s'exécute (`make metrics` ou le workflow hebdomadaire)
THEN `src/data/oss-metrics.json` contient version, date de release, étoiles et téléchargements pour chaque plugin publié
AND le temps total de collecte pour 20 plugins reste ≤ 60 secondes
AND le build suivant lit ce JSON sans appel réseau et chaque fiche affiche les métriques avec la mention « Données au 2026-10-14 »
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: API indisponible avec cache
GIVEN l'API Packagist répond 503 et le JSON commité datant de 2 jours contient les téléchargements
WHEN la collecte s'exécute
THEN la valeur précédente est conservée avec sa date dans le JSON
AND le build lit le JSON, affiche « Données au {date de la valeur} » et réussit (code de sortie 0)
AND un avertissement figure dans le journal de la collecte

Scenario: Limite de débit GitHub atteinte
GIVEN la collecte sans jeton et la limite de 60 requêtes par heure atteinte
WHEN la collecte se poursuit
THEN les métriques GitHub manquantes gardent leur valeur précédente du JSON commité
AND aucune requête supplémentaire n'est émise après le premier code 403
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Pas de cache et pas d'API
GIVEN l'API GitHub injoignable et aucune valeur précédente dans le JSON
WHEN la collecte s'exécute
THEN la métrique est absente du JSON et le journal contient « Métrique « stars » indisponible pour « {slug} » : bloc masqué »
AND le build lit le JSON, la fiche s'affiche sans bloc de métriques et le build réussit

Scenario: Réponse malformée
GIVEN l'API Packagist renvoie un JSON sans le champ `downloads`
WHEN la collecte s'exécute
THEN la métrique de téléchargements est omise du JSON pour ce plugin seulement
AND les autres plugins gardent leurs métriques
```

### Critères techniques (site statique)
- [ ] Module de collecte (`make metrics`, workflow `metrics.yml` hebdomadaire ouvrant une PR) avec délai d'attente (≤ 10 s par appel), nouvelles tentatives limitées (2) ; le JSON commité sert de cache
- [ ] Le build (`astro build`) lit uniquement `src/data/oss-metrics.json`, sans réseau ; il n'échoue jamais pour une métrique
- [ ] Jeton GitHub lu uniquement dans une variable de la collecte, jamais écrit dans le HTML, le JSON, les journaux ni l'image Docker
- [ ] Plugin non publié sur Packagist (`sylius-agentic-feeds-plugin`) : aucune métrique de téléchargements, sans avertissement bloquant
- [ ] Composant `LiveStats` : chiffres avec libellés textuels (pas de badge image seul), WCAG 2.2 AA
- [ ] SEO : aucune métrique dans les données structurées (éviter les données périmées)
- [ ] Performance : aucun appel réseau côté visiteur, zéro impact sur Lighthouse
- [ ] Tests unitaires du module avec appels simulés

## Notes techniques (à confirmer en tech spec)
- Collecte hebdomadaire par workflow planifié qui ouvre une PR du JSON ; pas de cron de build quotidien sans commit.
- Les étoiles et téléchargements sont des données publiques ; aucune donnée personnelle collectée.

## Estimation
- **Story Points** : 3
- **MoSCoW** : Should

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-020 | Fiche détaillée d'un plugin | Emplacement des métriques et liens vers les dépôts |

### US dépendantes (BLOQUÉES)
Aucune.

## Sprint assigné
Sprint 2
