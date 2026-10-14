# ADR-0003 : Environnements entièrement dockerisés

## Statut
Accepté (2026-10-14, validé par le PO)

## Contexte
Le PO l'exige (CT-1) : « Si le projet est basé sur Docker, alors tout est dockerisé, pas une seule partie. » Chaque évolution doit être visible en environnement de développement avant le déploiement. L'existant (`../blog`) n'a qu'un Dockerfile de production.

## Décision
Un **`Dockerfile` multi-étapes unique** et un **`compose.yaml`** couvrent tous les usages. **Aucun outil n'est requis sur le poste hormis Docker** et un éditeur.

```
Dockerfile
├── base     node:26-alpine (digest fixé), WORKDIR /app, utilisateur node
├── deps     npm ci (cache BuildKit sur ~/.npm)
├── dev      base + deps ; CMD astro dev --host 0.0.0.0 --port 4321
├── typst    ghcr.io/typst/typst:0.15.1 (binaire seul, copié dans build)
├── build    deps + sources + binaire typst ; npm run build
│            (astro build → typst compile → pagefind → contrôles)
├── test     build + Vitest ; image séparée mcr.microsoft.com/playwright:v1.64.1-noble pour l'end-to-end
└── runtime  nginxinc/nginx-unprivileged:1.30.5-alpine + nginx.conf + dist/
```

| Service compose | Usage | Commande |
|-----------------|-------|----------|
| `dev` | Développement avec rechargement à chaud (sources montées, `node_modules` en volume nommé) | `docker compose up dev` → http://localhost:4321 |
| `preview` | **Image de production** construite en local, servie par nginx avec les vrais en-têtes et les vraies redirections | `docker compose up --build preview` → http://localhost:8080 |
| `tools` (profil) | `npm` ponctuel : lint, format, check, ajout de dépendance, `npm view` | `docker compose run --rm tools npm run lint` |
| `e2e` (profil) | Playwright et axe contre `preview` | `docker compose run --rm e2e` |

Un **`Makefile`** sert de raccourci, sans rien exiger d'autre que Docker : `make dev`, `make preview`, `make lint`, `make test`, `make e2e`, `make ci` (enchaîne tout comme la CI).

**CI (GitHub Actions)** : elle construit et exécute **les mêmes cibles** (`docker buildx build --target test`, puis le service `e2e` contre `preview`). Elle n'installe pas Node sur le runner. Le cache BuildKit est en mode GitHub Actions.

**Railway** construit la cible `runtime` du même Dockerfile (ADR-0002).

## Alternatives considérées
- **Node local et Docker en production seulement** (modèle actuel du blog) : contraire à l'exigence du PO.
- **Dev Containers (VS Code)** : compatible, mais propre à un éditeur. On pourra ajouter un `devcontainer.json` qui réutilise la cible `dev`, sans en dépendre.
- **Hooks git (husky)** : ils supposent un Node local. Ils sont remplacés par `make ci` et la CI bloquante.

## Conséquences
- ✅ Parité stricte : `preview` correspond à l'image de production, au bit près.
- ✅ Intégration d'un nouveau contributeur en une commande : `docker compose up dev`.
- ⚠️ Rechargement à chaud sur macOS avec des fichiers montés : activer le polling Vite (`CHOKIDAR_USEPOLLING` ou `server.watch.usePolling`) si les événements de fichiers ne remontent pas.
- ⚠️ L'image Playwright est volumineuse : elle n'est utilisée que pour l'end-to-end, jamais dans l'image de production.
