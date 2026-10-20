# Guide qualité et CI

Tout s'exécute dans Docker (ADR-0003) : aucun Node sur le poste. Décisions : ADR-0007 (outils et seuils), ADR-0009 (supply chain).

## Commandes

| Commande | Contrôle | Bloquant si |
|----------|----------|-------------|
| `make lint` | ESLint, Prettier (vérification) | une règle ou le formatage est violé (`make format` corrige) |
| `make check` | `astro check` (types) | une erreur de type |
| `make test` | Vitest et couverture de `src/lib/`, `src/content/schemas/`, `scripts/checks/lib/` | < 80 % lignes, fonctions, instructions ou < 75 % branches |
| `make checks` | build complet : contrôles de contenu, `astro build`, contrôles de `dist/` | un contrôle remonte une erreur (liens internes, ancres, données personnelles, preuves, décompte) |
| `make e2e` | Playwright et axe (WCAG 2.2 AA, thèmes clair et sombre) contre `preview` | un scénario ou une violation axe `serious`/`critical` |
| `make lighthouse` | Lighthouse 13.5, 3 exécutions par page, médiane | un axe (performance, accessibilité, bonnes pratiques, SEO) sous 0,95 |
| `make smoke URL=...` | contrôle de fumée d'un site déployé | un statut ou un en-tête inattendu |
| `make preflight` | disque libre (8 Go par défaut), Docker démarré, branche propre | un des trois contrôles échoue (voir Préflight) |
| `make ci` | enchaîne exactement les étapes de la CI | l'une d'elles |

## Ajouter un contrôle (sans modifier `run.ts`)

Déposer un fichier dans `scripts/checks/` :

- `<nom>.content.check.ts` : exécuté **avant** le build, sur les sources (`src/`) ;
- `<nom>.dist.check.ts` : exécuté **après** le build, sur `dist/`.

L'exécuteur (`run.ts`, `lib/runner.ts`) les découvre seul. Contrôles de dépôt (aucune page) : `no-global-prune.content.check.ts` (voir ci-dessous). Un contrôle exporte une fonction qui renvoie la liste de ses erreurs ; la logique va dans `scripts/checks/lib/` avec son test unitaire dans `tests/unit/checks/` (TDD). Exemples : `legal-pii.content.check.ts`, `internal-links.dist.check.ts`. Les pages sont découvertes en suivant les liens depuis `/` : aucune liste de pages à maintenir (`tests/e2e/helpers/routes.ts`, `scripts/checks/lib/dist-routes.ts`).

Scénarios transverses sur toutes les pages (`tests/e2e/pages-matrix.spec.ts`) : responsive à 360, 768 et 1280 px, JavaScript désactivé, mouvement réduit, aucune violation CSP ni erreur de console.

## Aucun nettoyage Docker global (`no-global-prune`)

Règle (rétro du sprint 2, T-900-01) : des volumes MySQL d'autres projets ont été perdus par un nettoyage Docker global. Le contrôle `scripts/checks/no-global-prune.content.check.ts` (logique dans `scripts/checks/lib/no-global-prune.ts`, test `tests/unit/checks/no-global-prune.test.ts`) parcourt tout le dépôt monté (Makefile, `mk/`, scripts, workflows, guides, prompts de sprint, agents) et échoue si une ligne contient `docker system prune`, `docker volume prune`, `docker container prune`, `docker image prune -a` ou `docker builder prune -a` (ainsi que `buildx prune -a`).

- **Autorisé** : `docker compose -p <projet> down -v` et `docker builder prune -f`.
- Dans les fichiers exécutables (Makefile, `.mk`, scripts, workflows, YAML, JSON) : aucune exception.
- Dans la documentation (`.md`) : citer la commande pour l'interdire est toléré si la ligne porte un terme d'interdiction (« interdit », « jamais », « ne pas », « aucun »…).
- Le build Docker n'a ni `.github` ni `project-management` (`.dockerignore`) : le contrôle les ignore s'ils sont absents. Il s'exécute dans `make checks` (dépôt monté dans le conteneur `tools`) ; la CI du dépôt complet l'exécute dans un job dédié en phase 4 (`T-900-21`).

## Préflight (`make preflight`)

`mk/preflight.mk` appelle `scripts/preflight.sh` (testé par `tests/unit/checks/preflight.test.ts`).

| Contrôle | Échec si |
|----------|----------|
| Espace libre | sous `PREFLIGHT_MIN_GB` (8 Go par défaut depuis l'action 4 de la rétro du sprint 3) |
| Docker | `docker info` échoue |
| Branche | `git status --porcelain` n'est pas vide |

Affiche aussi le plafond de workers (2 dès 3 Go libres, 1 en dessous, 0 sous 1,5 Go : arrêter tout build) et `docker system df`. En cas d'échec, seul un nettoyage limité au projet est suggéré (`docker compose -p <projet> down -v`, `docker builder prune -f`). Variables : `PREFLIGHT_MIN_GB`, `PREFLIGHT_SKIP_GIT=1`, `PREFLIGHT_SKIP_DOCKER=1` (essais).

## E2E stricts : liste d'exceptions (`skip-allowlist`)

Un `test.skip` n'est toléré que s'il figure dans `tests/e2e/skip-allowlist.json` (fichier, fragment du titre, projets, raison, date). Le reporter `tests/e2e/reporters/strict-skips.ts` (logique dans `scripts/checks/lib/strict-skips.ts`, test `tests/unit/checks/strict-skips.test.ts`) fait échouer Playwright si un test ignoré n'y est pas et écrit « N exécutés / M ignorés » sur la sortie standard, dans `reports/e2e-summary.md` et dans le résumé de l'étape CI (`$GITHUB_STEP_SUMMARY`). Seul l'orchestrateur modifie la liste. Au sprint 2, 3 ignorés attendus : `[sans-clé]` du formulaire de contact sur desktop et mobile (clé Web3Forms factice en CI) et l'impression PDF sur mobile (parcours). Le mode strict `E2E_EXPECT_FULL_CONFIG=1` est inchangé.

## Échantillonnage des gabarits répétés

Le blog ajoute environ 62 pages aux 30 existantes ; axe (2 thèmes × 2 projets), la matrice responsive et Lighthouse (3 exécutions) n'en testent que quelques-unes par famille répétée (écart E21). `scripts/checks/lib/sample-routes.ts` (`sampleRoutes`, test `tests/unit/checks/sample-routes.test.ts`) lit `tests/e2e/sample-routes.json` : `families` (préfixe, `max` = 2 par défaut), `articles` (liste vide = tous les articles testés, sinon seulement ceux-ci), `include` (routes toujours conservées). Une route listée mais absente de `dist/` est une erreur. Toutes les pages uniques et les familles sans règle (fiches plugins, catégories) restent testées. Les délais restent proportionnels au nombre de pages réellement testées. Jamais de skip pour gagner du temps.

## Pièges d'environnement

- **Alias interactifs** du poste : `ls`, `cat`, `grep`, `du`, `df` sont détournés (outils graphiques). Utiliser `command ls`, `command cat`, `command grep`, des chemins absolus, `mv -f`. `curl` : `command curl --max-time 15 -sI <url>`.
- **`--mount=type=cache` sans `id` interdit** dans le `Dockerfile` : Railway exige un `id` lié au service (ADR-0002) ; la CI s'appuie sur le cache de couches.
- **Pas de `--no-build`** sur Railway : l'étape `runtime` doit rester la dernière du `Dockerfile` et être construite entière.
- **Aucune écriture hors `dist/`** pendant `npm run build` (le build Railway n'a pas de volume).
- **Disque** : `make preflight` avant chaque lot ; jamais de prune global ; pas d'image Playwright en local (`PW_CHROMIUM_PATH` ou CI).
- **Astro 7 et Markdown** : le rendu par défaut est Sätteri ; `markdown.rehypePlugins` exige `@astrojs/markdown-remark` (non installé). Les plugins sont des plugins HAST de `satteri()` (voir `astro.config.mjs` et `src/lib/rehype-article-blocks.ts`).
- **`PUBLIC_SITE_URL` avec schéma** (`https://...`) en local, en CI et sur Railway : sans schéma, la canonical et le sitemap sont faux.
- **Fichiers `.env*`** : `.claude/settings.json` en interdit la lecture (`permissions.deny`) et l'écriture (hook `PreToolUse`), `.env.example` compris ; l'orchestrateur ou le PO le lit et le modifie à la main.
- **Cache GHA** : un changement du `Dockerfile` ou de `package-lock.json` invalide le cache BuildKit (`scope=test`, `runtime`, `e2e`) ; le premier run qui suit est nettement plus long.
- **`make prepush`** avant chaque push : il rejoue le job `quality` dans Docker (contexte limité par `.dockerignore`).
- Fichiers de phase 0 : `package.json` et `package-lock.json` ne sont écrits que par l'orchestrateur (`--save-exact --ignore-scripts`).

## Vérifications natives du sprint 3 (T-900-07, relevées le 2026-10-14)

| Vérification | Résultat |
|--------------|----------|
| Versions installées (exactes, `npm view` du jour) | `pagefind` 1.5.2, `@astrojs/rss` 4.0.19, `@astrojs/sitemap` 3.7.4, `astro-og-canvas` 0.13.2 (+ `canvaskit-wasm`, sans binaire natif) ; `@astrojs/markdown-satteri` 0.4.3 et `satteri` 0.10.5 déclarés en direct (déjà présents en transitif, nécessaires à la config Markdown) |
| Pagefind sur `node:26-alpine` (musl) | `docker compose -p tm-p0 run --rm tools npx pagefind --version` affiche `pagefind 1.5.2` (arm64) ; le binaire `@pagefind/linux-x64` du lockfile est une build `x86_64-unknown-linux-musl` (runner CI) |
| Chargement avec Astro 7.3.8 | `@astrojs/sitemap`, `@astrojs/rss`, `astro-og-canvas`, `canvaskit-wasm` s'importent ; `astro check` : 0 erreur |
| Chaîne de build | `build` = `checks:content` → `astro build` → `build:cv` → `build:search` (`pagefind --site dist`) → `checks:dist` ; sur les 32 pages actuelles l'indexation prend 0,06 s et produit `dist/pagefind/pagefind.js` ; aucun contrôle de `dist/` ne gêne |
| Types MIME de l'image nginx épinglée 1.30.5 (`/etc/nginx/mime.types`) | `wasm` → `application/wasm` (déjà correct : aucune correction nginx en phase 0) ; `xml` → `text/xml` (pas `application/rss+xml`) ; `txt` → `text/plain` ; `png` → `image/png` ; `rss` → `application/rss+xml` ; aucun `charset` dans `mime.types` ni dans `nginx.conf` |
| Conséquence pour le lot B | `location` dédiées avec `default_type` et `charset utf-8` pour `/rss.xml` (T-013-07), `robots.txt`, `llms.txt` et les sitemaps (T-024-14) ; le `.wasm` n'exige rien |

## Pipeline GitHub Actions (`.github/workflows/ci.yml`)

| Job | Contenu |
|-----|---------|
| `quality` | cible Docker `test` (npm ci, build et contrôles, lint, types, Vitest) ; export de `dist/` |
| `e2e` | images `runtime` et `e2e`, Playwright et axe |
| `lighthouse` | images `runtime` et `e2e`, Lighthouse (en parallèle de `e2e`, depuis l'action 2 de la rétro du sprint 3) |
| `dockerfile` | Hadolint (image épinglée par digest) |
| `supply-chain` | SBOM CycloneDX (artefact `sbom-cyclonedx`, 30 jours), scan Trivy de l'image `runtime` : échec sur HIGH ou CRITICAL **avec correctif disponible** (`ignore-unfixed`) |
| `ci` | statut unique requis pour la protection de `main` et pour *Wait for CI* de Railway |

Toutes les actions sont épinglées par SHA complet (le tag est en commentaire), `permissions: contents: read`, Renovate propose les mises à jour. Trivy : `aquasecurity/trivy-action` v0.36.0, postérieure à la compromission de mars 2026 des anciens tags. Pas de signature cosign (ADR-0009).

**Lire un échec** : l'onglet Actions affiche l'étape en rouge ; les rapports Playwright et axe sont dans l'artefact `rapports-qualite`, ceux de Lighthouse dans `rapports-lighthouse` (14 jours) ; le job `ci` publie la durée de chaque job dans le résumé du run (budget : 20 min) ; localement, `reports/` après `make e2e` ou `make lighthouse`. Reproduire avec la commande `make` correspondante. Une vulnérabilité Trivy sans correctif n'échoue pas la CI ; si elle bloque quand même un jour, documenter une exception dans un fichier `.trivyignore` avec date et justification.

## Contrôle de fumée post-déploiement

`scripts/checks/smoke.ts` (logique testée dans `scripts/checks/lib/smoke.ts`) vérifie sur un site déployé : statut 200 sur `/`, `/parcours/`, `/contact/`, `/mentions-legales/` ; 404 réel (pas de faux 200) sur une URL inconnue ; en-têtes CSP, HSTS et `nosniff` présents sur chaque réponse ; `POST /` refusé en 405. Le code de sortie vaut 0 (succès), 1 (échec) ou 2 (usage).

```bash
make smoke URL=https://thibaut-monier.fr
make preview && make smoke URL=http://preview:8080   # le conteneur d'outils rejoint le réseau de compose
```

`scheduled.yml` l'exécute après le redéploiement quotidien (jusqu'à 10 min de tentatives, le redéploiement étant asynchrone) **si** la variable GitHub `SMOKE_URL` est définie ; sinon le job est ignoré. Les en-têtes détaillés (valeurs de la CSP, COOP, CORP) restent vérifiés par `tests/e2e/headers.spec.ts`.

## Mesures de durée de la CI (T-003-10)

Relevé du 2026-10-14 sur les 4 runs verts de la PR du sprint 1 (`gh run view --json jobs`). Durées en secondes des jobs, avant ajout du job `supply-chain`.

| Run | `quality` | `e2e` | `dockerfile` | Total des jobs | Durée du run |
|-----|-----------|-------|--------------|----------------|--------------|
| 57821de | 94 s | 254 s | 12 s | 6 min 0 s | 7 min 23 s |
| 51184a0 | 63 s | 225 s | 9 s | 4 min 57 s | 4 min 59 s |
| 1afc6c5 (dernier) | 87 s | 360 s | 7 s | 7 min 34 s | 7 min 51 s |
| df211d9 (1er vert) | 45 s | 148 s | 12 s | 3 min 25 s | 3 min 25 s |

Détail du dernier run, étape par étape : build `test` 64 s ; image `runtime` 61 s ; image `e2e` 114 s ; Playwright et axe 48 s ; Lighthouse 103 s.

- **Durée < 8 min : tenue** sur les 4 runs (maximum 7 min 51 s, file d'attente comprise). La marge est faible : dans le dernier run, la construction des images `runtime` et `e2e` pèse 175 s sur les 360 s du job `e2e`.
- **Gain ≥ 30 % du second passage : non démontré proprement.** Les runs portent sur des commits différents et le premier run vert est déjà un passage à cache chaud. Un test propre exigerait de purger le cache (`gh cache delete --all`) puis de relancer deux fois le même commit (`gh run rerun`).
- Leviers si la durée dérive : ne plus reconstruire l'image `runtime` dans `e2e` (réutiliser celle de `supply-chain`), réduire `LIGHTHOUSE_RUNS` à 2 sur les PR.
- Le job `supply-chain` s'exécute en parallèle de `e2e` : il n'allonge pas le chemin critique, mais sa durée réelle reste à relever au premier run.
