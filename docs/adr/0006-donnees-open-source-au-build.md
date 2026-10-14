# ADR-0006 : Données open source récupérées au build, avec cache et repli

## Statut
Accepté (2026-10-14, validé par le PO)

## Contexte
La vitrine (US-019 à US-022) affiche pour 20 plugins Sylius et tailsfadmin : dernière version, date de release, étoiles et téléchargements Packagist. Le site est statique et le build ne doit **jamais échouer à cause d'une métrique** (US-021). Quotas : `GITHUB_TOKEN` en Actions, 1 000 requêtes/h ; GitHub sans authentification, 60/h ; Packagist, cache de 12 h côté serveur.

## Décision
- **Contenu éditorial** (problème résolu, fonctionnalités, compatibilité, dépendances entre plugins, captures) : **saisi** dans une collection `plugins` (MDX + frontmatter typé). Il est amorcé une fois depuis `sylius_plugins/docs/2026-10-14-catalogue-plugins.md` et les README, puis relu. La relation « requiert / complété par » est vérifiée contre les `composer.json` réels.
- **Métriques vivantes** : un script `scripts/fetch-oss-metrics.ts`, exécuté **avant** `astro build` :
  - GitHub REST : `GET /repos/thibmonier/{repo}` (étoiles, `pushed_at`) et `GET /repos/thibmonier/{repo}/releases/latest` (tag, date) ;
  - Packagist : `GET https://packagist.org/packages/{vendor}/{package}.json` (téléchargements total et mensuel, dernière version) ;
  - soit environ 63 requêtes par build, dans le quota.
- **Cache et repli** : le résultat est écrit dans `src/data/oss-metrics.json`, **commité**. En cas d'échec (réseau, quota, 5xx), on garde la valeur précédente avec sa date `fetchedAt`, et le build continue avec un avertissement. L'interface affiche « au <date> ».
- **Rafraîchissement** : par le cron quotidien de redéploiement (ADR-0002) ; une PR automatique hebdomadaire met à jour le JSON commité.
- **Jeton** : `GITHUB_TOKEN` en Actions, et un PAT en lecture seule (public repos) en variable de build Railway si le build Railway récupère aussi les métriques. Sinon, Railway utilise le JSON commité (option recommandée : le build Railway ne fait aucun appel réseau).

## Alternatives considérées
- **Appels côté client** (navigateur vers l'API GitHub) : quota de 60/h par visiteur, plus du JS, de la latence et une CSP à élargir. Rejeté.
- **Badges shields.io** : images tierces, peu accessibles, et une requête tierce par badge. Rejeté pour les fiches, mais acceptable dans les README.
- **Saisie manuelle des métriques** : obsolescence garantie. Rejeté.

## Conséquences
- ✅ Builds reproductibles et hors ligne (JSON commité).
- ✅ Aucun appel tiers depuis le navigateur pour ces données.
- ⚠️ Les métriques peuvent avoir jusqu'à 24 h de retard : acceptable, et affiché.
