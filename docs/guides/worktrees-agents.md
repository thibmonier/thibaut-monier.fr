# Worktrees et agents

Procédure des sprints menés avec plusieurs agents (workers) en parallèle. Reprise des actions S1-3 et S1-6 de la rétrospective du sprint 1 (T-900-05). Contraintes d'environnement : disque limité, volumes Docker d'autres projets à protéger. Décisions : ADR-0003 (Docker uniquement).

## Règles absolues

1. **Aucune commande `git` pour un worker.** Il n'ouvre ni branche, ni commit, ni `stash`, ni `checkout`. L'orchestrateur crée les worktrees et commite.
2. **Aucun nettoyage Docker global**, dans un prompt, un script, un `Makefile` ou un workflow : pas de `system prune`, `volume prune`, `container prune`, `image prune -a`, `builder prune -a`. Des volumes MySQL d'autres projets ont déjà été perdus ainsi. Autorisé : `docker compose -p <projet> down -v` et `docker builder prune -f`. Le contrôle `no-global-prune` (voir [qualite-ci.md](qualite-ci.md)) fait échouer `make checks` si une de ces commandes apparaît dans le dépôt.
3. **Deux workers au plus** ; un seul sous 3 Go libres ; arrêt de tout build sous 1,5 Go (`make preflight` affiche le plafond). Un seul build d'image à la fois.
4. **Pas d'image Playwright en local** (disque) : les e2e se vérifient avec un Chromium système via `PW_CHROMIUM_PATH` contre `preview`, ou dans la CI.
5. Source du blog `/Users/tmonier/Projects/blog/` en **lecture seule** (montage `:ro` dans le conteneur, jamais d'écriture).
6. **Un seul rapport** en fin de mission, puis arrêt.

## Avant de lancer un lot : `make preflight`

```bash
make preflight                      # échoue sous 5 Go libres, Docker arrêté ou branche non propre
make preflight PREFLIGHT_MIN_GB=3   # seuil explicite
```

Il affiche l'espace libre, le plafond de workers et `docker system df` (lecture seule). Relever `df -h` avant et après chaque lot de tâches ; sous 3 Go libres, arrêter et prévenir l'orchestrateur.

## Création des worktrees (orchestrateur seul)

Les worktrees partent de la **branche du sprint**, pas de `main`.

```bash
git worktree add ../tm-w1 feature/sprint-003-blog_migre_seo   # lot A
git worktree add ../tm-w2 feature/sprint-003-blog_migre_seo   # lot B
```

Un worktree ne peut pas porter deux fois la même branche : créer une branche par worker si nécessaire (`git worktree add -b feature/sprint-003-lot-a ../tm-w1 feature/sprint-003-blog_migre_seo`). Chaque worktree reçoit son projet Compose et ses ports (ci-dessous). À la fin, l'orchestrateur fusionne dans la branche du sprint et supprime le worktree (`git worktree remove ../tm-w1`).

## Projet Compose et ports

Deux worktrees sur la même machine entrent en collision sur le nom de projet (conteneurs, réseaux, volumes `node_modules`) et sur les ports. Chaque worker exporte son nom de projet et utilise ses ports :

| Worker | Lot | `COMPOSE_PROJECT_NAME` | `dev` | `preview` |
|--------|-----|------------------------|-------|-----------|
| W1 | A | `tm-w1` | 4322 | 8081 |
| W2 | B | `tm-w2` | 4323 | 8082 |
| Orchestrateur (phase 0) | - | `tm-p0` | 4321 | 8080 |

```bash
export COMPOSE_PROJECT_NAME=tm-w1
make preflight
make test          # le Makefile utilise `docker compose`, donc le nom de projet exporté
```

Les ports se surchargent dans un `compose.override.yaml` **non versionné** (listé dans `.gitignore`) à la racine du worktree. `!override` remplace la liste de ports au lieu de l'allonger :

```yaml
# compose.override.yaml (W1)
services:
  dev:
    ports: !override
      - '4322:4321'
  preview:
    ports: !override
      - '8081:8080'
```

Le service `e2e` partage la pile réseau de `preview` : `E2E_BASE_URL` (`http://localhost:8080` dans le conteneur) n'est pas à changer. Nettoyage de fin de lot, limité au projet :

```bash
docker compose -p tm-w1 --profile tools --profile e2e down -v --remove-orphans
docker builder prune -f
```

## Propriété des fichiers

Un fichier a un seul écrivain (leçon n°2 de la rétro du sprint 2). Besoin hors périmètre : le signaler dans le rapport, ne rien contourner. Table de référence : « Zones de fichiers partagées » et « Lots de travail » de `project-management/sprints/sprint-003-blog_migre_seo/tasks/README.md`.

| Zone | Écrivain |
|------|----------|
| `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, `playwright.config.ts`, `src/content.config.ts`, `Makefile` (une ligne) | phase 0 (orchestrateur) |
| `Dockerfile`, `compose.yaml`, `.dockerignore` | personne (gelés) |
| `CHANGELOG.md`, `README.md`, `docs/guides/README.md`, `docs/adr/README.md` | phase 4 (orchestrateur) |
| Cibles de lot | un fichier `mk/<nom>.mk` par lot (`.PHONY` déclaré dans chaque fichier) |
| Journal des changements d'un lot | un fragment `changelog.d/lot-a.md` ou `lot-b.md`, assemblé en phase 4 |
| `tests/e2e/skip-allowlist.json` | phase 0 seule (demande à l'orchestrateur) |
| `src/layouts/BaseLayout.astro`, `src/components/seo/`, `nginx.conf`, `nginx/snippets/` | lot B |
| `src/content/blog/`, `src/pages/blog/`, `src/config/nav.ts` | lot A |

Ne jamais modifier un contrat C1 à C11 : le demander à l'orchestrateur.

## Gabarit de prompt

Le gabarit de référence est dans `tasks/README.md` (« Gabarit de prompt pour un worker »). Il contient au minimum : le périmètre en écriture (colonne « Propriété exclusive » du lot), l'absence d'accès à `git`, la lecture seule de la source du blog, l'interdiction des nettoyages Docker globaux, `COMPOSE_PROJECT_NAME` et les ports du worktree, le plafond d'un build à la fois, `PW_CHROMIUM_PATH`, les alias de shell (ci-dessous) et la consigne « un seul rapport puis arrêt ».

## Pièges du poste

Voir la section « Pièges d'environnement » de [qualite-ci.md](qualite-ci.md) : alias interactifs (`ls`, `cat`, `grep`, `du`, `df`), `command curl`, pas de `--mount=type=cache` sans `id` sur Railway, pas de `--no-build`.
