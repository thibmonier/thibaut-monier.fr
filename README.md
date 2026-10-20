# thibaut-monier.fr

Site statique de Thibaut Monier (direction technique et delivery augmenté par IA) : profil, parcours, contact, puis blog et labo d'outils.

Astro 7.3.8, TypeScript 6.0.3, Tailwind 4.3.3, nginx 1.30.6, déployé sur Railway. **Tout est dockerisé** : seul Docker est requis sur le poste (aucun Node, aucun gestionnaire de paquets).

## Démarrage rapide

```bash
make dev        # http://localhost:4321, rechargement à chaud
make preview    # http://localhost:8080, image de production réelle (nginx, vrais en-têtes)
```

Sur macOS, si les modifications de fichiers ne sont pas détectées : `CHOKIDAR_USEPOLLING=1 make dev`.

## Commandes

| Commande          | Rôle                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| `make dev`        | Serveur de développement (`dev`)                                           |
| `make preview`    | Image `runtime` servie par nginx (`preview`)                               |
| `make lint`       | ESLint et Prettier (vérification)                                          |
| `make check`      | `astro check` (types)                                                      |
| `make test`       | Vitest avec couverture (80 % lignes, 75 % branches sur `src/lib/`)         |
| `make checks`     | Build complet : contrôles de contenu, `astro build`, contrôles de `dist/`  |
| `make e2e`        | Playwright et axe (WCAG 2.2 AA) contre `preview`                           |
| `make lighthouse` | Lighthouse mobile : 3 exécutions, médiane, seuil 0,95 sur les 4 axes       |
| `make smoke URL=` | Contrôle de fumée d'un site déployé (statuts, en-têtes, 404, 405)          |
| `make ci`         | Enchaîne exactement les étapes de la CI                                    |
| `make shell`      | Shell dans le conteneur d'outils (`docker compose run --rm tools npm ...`) |
| `make clean`      | Arrête tout, supprime volumes et sorties de build                          |

Détail des contrôles, de la CI et des seuils : [`docs/guides/qualite-ci.md`](docs/guides/qualite-ci.md). Pour viser l'image locale : `make preview && make smoke URL=http://preview:8080` (le conteneur d'outils rejoint le réseau de compose).

Métriques open source : `GITHUB_TOKEN=$(gh auth token) make metrics` relève GitHub et Packagist dans `src/data/oss-metrics.json` (le build ne lit que ce fichier) ; `make external-links` (après `make checks`) vérifie les liens externes de `/open-source/`. Voir [`docs/guides/projets-open-source.md`](docs/guides/projets-open-source.md).

Ajouter une dépendance : `docker compose run --rm tools npm install <paquet>` (versions exactes, `.npmrc` : `save-exact=true`).

## Configuration

Variables de build publiques, toutes optionnelles (voir `.env.example`) :

| Variable                  | Rôle                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `PUBLIC_SITE_URL`         | URL canonique ; défaut `https://thibaut-monier.fr` (à surcharger tant que le DNS n'est pas en place)    |
| `PUBLIC_UMAMI_WEBSITE_ID` | Mesure d'audience Umami Cloud ; vide, aucun script ni aucune requête (guide `docs/guides/analytics.md`) |
| `PUBLIC_WEB3FORMS_KEY`    | Clé publique du formulaire de contact                                                                   |
| `PUBLIC_CALENDLY_URL`     | Prise de rendez-vous                                                                                    |

## Déploiement (Railway)

Railway construit la dernière étape (`runtime`) du `Dockerfile` à chaque push sur `main`, une fois la CI verte (option _Wait for CI_ de Railway à activer sur le statut `ci`). Détails : ADR-0002.

- **Variables** : les quatre `PUBLIC_*` ci-dessus se définissent comme variables du service Railway (elles sont inlinées au build, donc publiques par conception). Pour la CI, `PUBLIC_WEB3FORMS_KEY` et `PUBLIC_CALENDLY_URL` reçoivent des valeurs factices dans `ci.yml`.
- **Redéploiement quotidien** : `scheduled.yml` (06:00 UTC) publie les contenus datés. Il demande le secret GitHub `RAILWAY_TOKEN` et les variables `RAILWAY_SERVICE_ID` et `RAILWAY_ENVIRONMENT_ID`.
- **Contrôle de fumée** : après ce redéploiement, si la variable GitHub `SMOKE_URL` est définie (par exemple `https://thibaut-monier.fr`). À la main : `make smoke URL=https://thibaut-monier.fr`.
- **Déploiement manuel de repli** : workflow `deploy.yml` (`workflow_dispatch`, secret `RAILWAY_TOKEN`), à n'utiliser que si le déploiement depuis GitHub est indisponible.
- **Retour arrière** : dans Railway, onglet Deployments, redéployer la version précédente (aucune migration, aucun état).

## Architecture

- `Dockerfile` multi-étapes : `base`, `deps`, `dev`, `typst`, `build`, `test`, `dist`, `e2e`, `runtime` (dernière étape, celle que Railway construit). Images de base épinglées par tag et digest.
- `compose.yaml` : `dev` (:4321), `preview` (:8080), `tools` et `e2e` (profils).
- `nginx.conf` et `nginx/snippets/security-headers.conf` : CSP stricte sans `unsafe-inline`, HSTS, COOP, CORP, pas de COEP (ADR-0009).
- `scripts/checks/` : exécuteur de contrôles. Déposer `<nom>.content.check.ts` (avant le build) ou `<nom>.dist.check.ts` (sur `dist/`) suffit, sans modifier `run.ts`.
- `.github/workflows/` : `ci.yml` (PR et `main` : qualité, e2e, Hadolint, Trivy et SBOM), `scheduled.yml` (redéploiement quotidien à 06:00 UTC si `RAILWAY_TOKEN` est défini, puis contrôle de fumée si `SMOKE_URL` l'est), `deploy.yml` (déploiement manuel de repli).
- Blog (28 articles, flux `/rss.xml`, recherche Pagefind), SEO technique (JSON-LD, sitemap, `llms.txt`), images Open Graph et mesure d'audience : voir l'index des guides, [`docs/guides/README.md`](docs/guides/README.md).
- Guides : `docs/guides/`. Décisions : `docs/adr/`. Spécification : `project-management/tech-spec.md`.

## Versions (relevé du 2026-10-14)

Node 26.11.1, npm 11.19, Astro 7.3.8, TypeScript 6.0.3 (la 7 n'est pas prise en charge par `@astrojs/check`, voir ADR-0001), Tailwind 4.3.3, Vitest 5.0.4, Playwright 1.64.1, axe 4.13.0, Lighthouse 13.5.0, ESLint 10.12.0, Prettier 3.9.10. Renovate propose les mises à jour chaque semaine.

## Contribuer

GitHub Flow, branches `feature/US-XXX-...`, Conventional Commits, squash merge, CI verte obligatoire. Tests écrits avant le code (TDD).
