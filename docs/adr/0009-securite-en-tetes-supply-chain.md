# ADR-0009 : En-têtes de sécurité, CSP et supply chain (écarts assumés)

## Statut
Accepté (2026-10-14, validé par le PO)

## Contexte
La règle 11 du projet (sécurité, version 1.2.0) impose les « en-têtes obligatoires 2026 », dont **COEP `require-corp`**, ainsi que la signature des artefacts avec Sigstore/cosign. Le site est statique et charge deux tiers depuis le navigateur (script Umami ; appel `fetch` à Web3Forms). Railway construit l'image à partir du Dockerfile (ADR-0002). Détail : `project-management/architecture/security.md`.

## Décision
1. **CSP Level 3 stricte, sans `unsafe-inline`** : scripts et styles externalisés (`build.inlineStylesheets: "never"`, `vite.build.assetsInlineLimit: 0`), empreintes (hash) seulement en dernier recours, `'wasm-unsafe-eval'` pour Pagefind, limité à `/recherche/` et `/pagefind/` (variable `$csp_wasm`, `map` de `nginx.conf`), domaines Umami et Web3Forms en liste blanche (à confirmer à l'implémentation : `cloud.umami.is` et `api.web3forms.com`).
2. **En-têtes servis par un snippet nginx unique**, inclus dans chaque `location`. Un `add_header` placé dans un `location` annule ceux du `server`, défaut présent dans le `nginx.conf` du blog.
3. **COEP non activé** (écart à la règle 11). `require-corp` exige que chaque ressource tierce (script Umami) renvoie les en-têtes CORP ou CORS adaptés : le risque de blocage est réel. `credentialless` n'est pas garanti sur tous les navigateurs. Le site n'a aucun besoin d'isolation cross-origin (pas de `SharedArrayBuffer`). COOP `same-origin` et CORP `same-origin` **restent actifs**.
4. **Pas de signature cosign en V1** (écart à la règle 11) : Railway reconstruit l'image à partir des sources, donc une signature ne serait jamais vérifiée au déploiement. **Mesures retenues à la place** :
   - images de base fixées par digest ;
   - actions GitHub épinglées par SHA ;
   - `permissions:` minimales ;
   - SBOM CycloneDX et scan Trivy de l'image en CI ;
   - `npm ci` avec lockfile ;
   - Renovate.
   Cible : **SLSA niveau 2**.
5. **Évolution prévue** : publier l'image signée sur GHCR et faire déployer Railway **par digest**, si le PO veut atteindre le niveau 3.

## Alternatives considérées
- Appliquer COEP `credentialless` : rejeté tant que la prise en charge par Safari n'est pas confirmée et que l'utilité est nulle.
- Héberger Umami localement (même origine) : supprimerait le tiers, mais consommerait du crédit Railway et ajouterait une base de données à maintenir (ADR-0004).

## Conséquences
- ✅ CSP stricte compatible avec les services retenus ; en-têtes vérifiés par un test end-to-end sur `preview`.
- ⚠️ Deux écarts tracés par rapport à la règle 11, à réexaminer à chaque revue sécurité (semestrielle).
