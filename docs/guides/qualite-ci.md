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
| `make ci` | enchaîne exactement les étapes de la CI | l'une d'elles |

## Ajouter un contrôle (sans modifier `run.ts`)

Déposer un fichier dans `scripts/checks/` :

- `<nom>.content.check.ts` : exécuté **avant** le build, sur les sources (`src/`) ;
- `<nom>.dist.check.ts` : exécuté **après** le build, sur `dist/`.

L'exécuteur (`run.ts`, `lib/runner.ts`) les découvre seul. Un contrôle exporte une fonction qui renvoie la liste de ses erreurs ; la logique va dans `scripts/checks/lib/` avec son test unitaire dans `tests/unit/checks/` (TDD). Exemples : `legal-pii.content.check.ts`, `internal-links.dist.check.ts`. Les pages sont découvertes en suivant les liens depuis `/` : aucune liste de pages à maintenir (`tests/e2e/helpers/routes.ts`, `scripts/checks/lib/dist-routes.ts`).

Scénarios transverses sur toutes les pages (`tests/e2e/pages-matrix.spec.ts`) : responsive à 360, 768 et 1280 px, JavaScript désactivé, mouvement réduit, aucune violation CSP ni erreur de console.

## Pipeline GitHub Actions (`.github/workflows/ci.yml`)

| Job | Contenu |
|-----|---------|
| `quality` | cible Docker `test` (npm ci, build et contrôles, lint, types, Vitest) ; export de `dist/` |
| `e2e` | images `runtime` et `e2e`, Playwright et axe, Lighthouse |
| `dockerfile` | Hadolint (image épinglée par digest) |
| `supply-chain` | SBOM CycloneDX (artefact `sbom-cyclonedx`, 30 jours), scan Trivy de l'image `runtime` : échec sur HIGH ou CRITICAL **avec correctif disponible** (`ignore-unfixed`) |
| `ci` | statut unique requis pour la protection de `main` et pour *Wait for CI* de Railway |

Toutes les actions sont épinglées par SHA complet (le tag est en commentaire), `permissions: contents: read`, Renovate propose les mises à jour. Trivy : `aquasecurity/trivy-action` v0.36.0, postérieure à la compromission de mars 2026 des anciens tags. Pas de signature cosign (ADR-0009).

**Lire un échec** : l'onglet Actions affiche l'étape en rouge ; les rapports Playwright, axe et Lighthouse sont dans l'artefact `rapports-qualite` (14 jours) ; localement, `reports/` après `make e2e` ou `make lighthouse`. Reproduire avec la commande `make` correspondante. Une vulnérabilité Trivy sans correctif n'échoue pas la CI ; si elle bloque quand même un jour, documenter une exception dans un fichier `.trivyignore` avec date et justification.

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
