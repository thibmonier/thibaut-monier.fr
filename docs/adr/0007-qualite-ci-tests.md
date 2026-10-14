# ADR-0007 : Chaîne qualité, tests et CI

## Statut
Accepté (2026-10-14, validé par le PO)

## Contexte
La DoD exige : Lighthouse ≥ 95 sur les 4 axes, WCAG 2.2 AA, couverture ≥ 80 % sur `src/lib/`, aucun lien cassé, et un build qui échoue sur un schéma invalide. Tout s'exécute dans Docker (ADR-0003). `@lhci/cli` n'a rien publié depuis juin 2025 (risque R-09).

## Décision

| Niveau | Outil (version) | Portée | Seuil bloquant |
|--------|-----------------|--------|----------------|
| Statique | ESLint 10.12, eslint-plugin-astro 3.2, typescript-eslint 8.71, Prettier 3.9 | Tout le code | 0 erreur |
| Types et contenu | `astro check` (TypeScript 6.0.3), schémas Zod des collections | Code et contenu | 0 erreur ; build en échec si le schéma est invalide |
| Unitaire | Vitest 5.0.4 (couverture v8) | `src/lib/` : transformations, filtres, liste blanche, métriques OSS, contrat d'événements | ≥ 80 % de lignes, ≥ 75 % de branches |
| Contrôles de build | Scripts Node | PDF sans données interdites ; table de correspondance couvrant 100 % des articles ; canonical absolue ; liens internes | 100 % |
| End-to-end | Playwright 1.64.1 (image `mcr.microsoft.com/playwright:v1.64.1-noble`) contre `preview` | Parcours de conversion : accueil, parcours, CV, contact, plugins | Scénarios Gherkin clés au vert |
| Accessibilité | @axe-core/playwright 4.13 | Toutes les pages types | 0 violation `serious` ou `critical` |
| Performance et SEO | **Lighthouse 13.5** (CLI, piloté par un script Node dans l'image Playwright, Chromium inclus) | 6 pages types, profil mobile | ≥ 95 sur les 4 axes |
| Liens externes | lychee (image Docker), hebdomadaire et non bloquant en PR | Contenu | Rapport |

**Workflows GitHub Actions**
1. `ci.yml` (PR et `main`) : build de la cible `test` (lint, check, Vitest, build, contrôles), puis `preview` et `e2e` (Playwright, axe, Lighthouse). Statut requis pour la fusion et pour le déploiement Railway (*Wait for CI*).
2. `scheduled.yml` (cron quotidien à 06:00 UTC) : redéploiement Railway (publication programmée, alerte « test de plus de 6 mois »).
3. `metrics.yml` (hebdomadaire) : met à jour `oss-metrics.json` par PR automatique (ADR-0006).
4. Renovate (application GitHub) : PR de dépendances validées par `ci.yml`.

**Pratique TDD** : les tests de `src/lib/` et les contrôles de build sont écrits avant le code (règle 07 du projet). Les scénarios Gherkin des US deviennent des tests Playwright quand ils touchent un parcours.

## Alternatives considérées
- **@lhci/cli 0.15.1** : fonctionne, mais sa maintenance est ralentie. On préfère la CLI `lighthouse`, maintenue par Google, avec des assertions maison (environ 30 lignes).
- **unlighthouse** : utile pour un audit global, pas pour des seuils bloquants simples. Gardé pour des audits ponctuels.
- **Cypress** : Playwright est déjà requis pour axe et Lighthouse. Un seul outil.

## Conséquences
- ✅ `make ci` en local reproduit exactement la CI.
- ✅ Les régressions de performance, d'accessibilité et de SEO sont bloquées avant la production.
- ⚠️ Temps de CI estimé entre 4 et 6 min (cache BuildKit) ; Lighthouse est exécuté 3 fois par page et on retient la médiane, pour limiter les résultats instables.
