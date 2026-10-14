# Pages de projets open source et collecte des métriques

Couvre `/open-source/career-ops/` (étude de cas, US-023), `/open-source/tailsfadmin/` (bundle, US-022) et la collecte des métriques (US-021, partie collecte). L'affichage des métriques sur les fiches de plugins est décrit dans `donnees-open-source.md` (lot catalogue).

## Ajouter ou modifier une page de projet

Une page = un fichier `src/content/projects/fr/<slug>.md` (Markdown ; `.mdx` est accepté par le loader dès que l'intégration MDX est installée) et un dossier `src/pages/open-source/<slug>/index.astro`. Le slug ne change plus après publication (ADR-0008).

Le front matter est validé par `src/content/schemas/projects.ts` (schéma strict, `safeText` sur tous les textes : aucune donnée personnelle). Deux genres :

| `kind` | Champs propres | Contrôles |
| --- | --- | --- |
| `contribution` | `result`, `contributions[]` (numéro, type `pr` ou `issue`, titre, `problem`, `fix`, `tests`, `technical`, `url`, `mergedAt`, `status`) | au moins une contribution ; `tests` non vide, sinon « Étude de cas « career-ops » : la PR #{numéro} n'a pas de tests de non-régression décrits » |
| `bundle` | `packagist`, `license`, `version`, `inBrief` (2 phrases au plus), `readmeUrl`, `installSteps` (exactement 4), `demoUrl` (si une démo en ligne existe), `screenshot` (facultative) | tous requis sauf `demoUrl` et `screenshot` |

Règles communes : `title` de 43 caractères au plus (le titre de page reste sous 60), `description` de 50 à 160 caractères, `summary` de 200 au plus, `verifiedAt` (date de vérification des faits datés).

**Budget de lecture** : 900 mots visibles au plus (résumé, rôle, résultat, trois blocs par contribution, corps), calculés par `src/lib/projects.ts`. Les encadrés techniques (`technical`, ou un bloc `<details>` du corps) sont exclus. Les accents graves de `technical` produisent du `<code>`.

Le contrôle `scripts/checks/projects.content.check.ts` (phase `content` du build) vérifie le schéma, le budget, les liens https du corps, les données personnelles, le nom de fichier (slug) et le décompte (2 projets).

## Vérifier les faits d'une étude de cas

Faits relevés avec `gh` le 2026-10-14 (à refaire à chaque modification) :

| Fait | Source | Valeur |
| --- | --- | --- |
| PR #3496, #3808, #3866 | `gh pr view <n> -R career-ops-hq/career-ops --json state,mergedAt` | toutes mergées : 2026-09-02, 2026-09-05, 2026-09-05 |
| Issues liées #3495, #3807, #3865 | `gh issue view <n> -R career-ops-hq/career-ops` | toutes fermées |
| Étoiles du dépôt | `gh api repos/career-ops-hq/career-ops --jq .stargazers_count` | 74 527 (page : « plus de 74 000 ») |
| Appartenance à l'équipe Contributors | `gh api orgs/career-ops-hq/teams/contributors/memberships/thibmonier` | membre actif |
| « 128 URL et 61 archétypes perdus sur 224 rapports » | description de la PR #3808 | exact |
| « 5 langues sur 12 » | titre de l'issue #3865 | exact |

Rien du CV source n'est repris au-delà de ces faits publics. Les données de l'outil de l'auteur citées dans les PR (nombre de candidatures suivies) ne sont volontairement pas reprises.

## Bundle tailsfadmin : sources

Relevé le 2026-10-14 depuis le dépôt local, Packagist et GitHub (lecture seule) :

- version courante : **v1.6.2** (tag et Packagist) ; licence MIT ; paquet `tailsfadmin/tailsfadmin-bundle` ;
- prérequis : `composer.json` de v1.6.2 exige **PHP >= 8.2** et Symfony 7.3 ou 8 (le README parle de PHP 8.5 pour la démo : la page suit `composer.json`) ;
- pas de démo en ligne (champ `homepage` GitHub vide) : pas de `demoUrl` ;
- aucune capture de la démo fournie : la page est publiée **sans image** (E18). Pour en ajouter une : optimiser la capture (WebP, 200 Ko au plus, sans EXIF) sous `src/assets/projects/tailsfadmin/` et renseigner `screenshot: { src, alt }` (alternative textuelle d'au moins 10 caractères décrivant l'écran) ;
- les 4 étapes d'installation résument le README (paquet, assets, thème CSS, menu et layout) et y renvoient : ne pas recopier le détail (source de vérité unique) ;
- le CHANGELOG du dépôt date v1.6.2 du 2026-11-09 alors que le tag date du 2026-09-14 : la page ne cite aucune date de release.

## Collecte des métriques (US-021)

Le build ne lit **que** `src/data/oss-metrics.json` (commité) : aucun appel réseau, aucun jeton dans l'image, jamais d'échec pour une métrique (ADR-0006). La collecte est un script séparé.

```bash
GITHUB_TOKEN=$(gh auth token) make metrics   # ≈ 15 s pour 21 dépôts, 42 requêtes GitHub et 20 Packagist
make metrics                                  # sans jeton : 60 requêtes GitHub par heure, suffisant une fois
```

Le jeton est lu dans l'environnement du poste et transmis au conteneur `tools` par `compose.yaml` ; il n'est écrit nulle part (ni `.env`, ni JSON, ni journaux : les messages d'erreur sont expurgés).

Comportement (testé avec un client simulé, `tests/unit/oss-metrics/fetch.test.ts`) :

- délai de 10 s par appel, 2 reprises (erreurs réseau et 5xx), jamais de reprise sur un 4xx ;
- après le premier 403 de GitHub, plus aucune requête GitHub ; Packagist continue ;
- métrique inconnue : valeur précédente conservée (la date `fetchedAt` de l'entrée est alors celle de la valeur conservée, jamais rajeunie), avertissement dans le journal ; sans valeur précédente, la métrique est omise (« Métrique « stars » indisponible pour « {slug} » : bloc masqué ») ;
- réponse Packagist sans `downloads` : bloc Packagist omis pour ce dépôt seul ; plugin non publié (`sylius-agentic-feeds-plugin`, vérifié le 2026-10-14) : aucune requête Packagist ni avertissement ;
- code de sortie 0 même en panne réseau.

Liste des 21 dépôts : `scripts/lib/oss-targets.ts` (20 plugins Sylius 2, Punchout cXML exclu, et tailsfadmin ; vendor Packagist `tmonier`, sauf tailsfadmin). Ajouter un plugin au catalogue demande d'ajouter sa ligne ici : le contrôle `oss-metrics` avertit des clés absentes ou orphelines.

Contrôle de contenu `oss-metrics` : n'échoue que si le schéma est invalide ; avertit si `fetchedAt` dépasse 7 jours ou si une clé attendue manque (V10).

### Décisions (T-021-01, écart E13)

| Sujet | Décision |
| --- | --- |
| Rythme | Hebdomadaire (lundi 05:00 UTC) et `workflow_dispatch` ; pas de cron de build quotidien |
| Jeton CI | `GITHUB_TOKEN` du workflow (1 000 requêtes/h), passé au conteneur par son nom ; permissions du job `contents: write`, `pull-requests: write`, `actions: write`, rien au niveau du workflow |
| Isolation | Dépendances installées sans jeton ni scripts (`npm ci --ignore-scripts`), puis collecte avec jeton dans un second conteneur ; checkout sans `persist-credentials` ; push avec en-tête d'authentification passé par l'environnement |
| PR sans CI | Une PR ouverte avec `GITHUB_TOKEN` ne déclenche pas `pull_request`. `metrics.yml` lance `ci.yml` par `workflow_dispatch` (exception documentée de GitHub) sur la branche `chore/metrics-<date>` : les statuts s'attachent au commit. Repli manuel : Actions > ci > Run workflow, ou fermer puis rouvrir la PR. Pas de jeton personnel à gérer |
| Aucune modification | Si le JSON est identique, aucune branche ni PR |
| Liste des dépôts | 21 clés `owner/repo` figées dans `oss-targets.ts` |

Le workflow n'a pas pu être exécuté hors GitHub : première exécution manuelle à faire (Actions > metrics > Run workflow) et à vérifier avant de s'y fier.

## Liens externes de la vitrine

`make external-links` (après `make checks`) et le job CI `external-links` parcourent les pages de `dist/open-source/` : **404 et 410 font échouer** (« Lien cassé sur /open-source/career-ops/ : {url} (404) »), 429, 5xx, autres 4xx et délais d'attente restent des avertissements (2 reprises). Le contrôle est hors du build Docker et de Railway : un site tiers en panne ne bloque jamais un déploiement (E14). Le contrôle des liens externes du build (avertissements seulement) reste inchangé.

## Hors périmètre de ce lot

- JSON-LD (`Article`, `SoftwareSourceCode`) : reporté à US-024 (E15).
- Mentions depuis `/parcours/`, l'accueil et le hub `/open-source/` : phase 4 (T-023-14, T-023-15, T-022-11). Tant que le hub n'existe pas, le fil d'Ariane affiche « Open source » sans lien (il devient un lien dès que l'entrée de navigation `open-source` est activée).
