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
- Sources : API GitHub (étoiles, dernière release) et API Packagist (téléchargements, dernière version). Authentification GitHub : jeton en lecture seule en CI, sinon requêtes anonymes (limite de débit). Hypothèse H5 du PRD.
- Règle absolue du PRD : **le build n'échoue jamais pour une métrique**. Chaque métrique a un repli (dernière valeur connue en cache, sinon masquage).
- Fraîcheur : valeurs figées à la date du build ; afficher « données au {date} ». Un build quotidien planifié suffit (à confirmer en tech spec).
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
WHEN le build est lancé
THEN chaque fiche affiche version, date de release, étoiles et téléchargements
AND la mention « Données au 2026-10-14 » est présente
AND le temps total de collecte pour 20 plugins reste ≤ 60 secondes
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: API indisponible avec cache
GIVEN l'API Packagist répond 503 et un cache datant de 2 jours contient les téléchargements
WHEN le build est lancé
THEN la fiche affiche la valeur du cache avec la mention « Données au {date du cache} »
AND le build se termine avec le code de sortie 0 et un avertissement dans le journal

Scenario: Limite de débit GitHub atteinte
GIVEN le build sans jeton et la limite de 60 requêtes par heure atteinte
WHEN la collecte se poursuit
THEN les métriques GitHub manquantes sont lues depuis le cache
AND aucune requête supplémentaire n'est émise après le premier code 403
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Pas de cache et pas d'API
GIVEN l'API GitHub injoignable et aucun cache
WHEN le build est lancé
THEN la fiche s'affiche sans bloc de métriques
AND le journal contient « Métrique « stars » indisponible pour « {slug} » : bloc masqué »
AND le build réussit

Scenario: Réponse malformée
GIVEN l'API Packagist renvoie un JSON sans le champ `downloads`
WHEN le build est lancé
THEN la métrique de téléchargements est masquée pour ce plugin seulement
AND les autres plugins gardent leurs métriques
```

### Critères techniques (site statique)
- [ ] Module de collecte au build avec délai d'attente (≤ 10 s par appel), nouvelles tentatives limitées (2) et cache fichier réutilisé en CI
- [ ] Jeton GitHub lu uniquement dans une variable de build, jamais écrit dans le HTML ni les journaux
- [ ] Composant `LiveStats` : chiffres avec libellés textuels (pas de badge image seul), WCAG 2.2 AA
- [ ] SEO : aucune métrique dans les données structurées (éviter les données périmées)
- [ ] Performance : aucun appel réseau côté visiteur, zéro impact sur Lighthouse
- [ ] Tests unitaires du module avec appels simulés

## Notes techniques (à confirmer en tech spec)
- Build planifié (cron CI) quotidien pour rafraîchir sans commit ; cache persisté entre builds.
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
