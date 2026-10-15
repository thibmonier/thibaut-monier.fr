# ADR-0013 : Recherche plein texte avec Pagefind et une interface maison

## Statut
Accepté (2026-10-15, sprint 3, US-012)

## Contexte
Le blog compte 28 articles et doit offrir une recherche plein texte en moins de 10 secondes, sans serveur ni service tiers (ADR-0004 : outils gratuits, site statique sur nginx). La CSP (ADR-0009) interdit `unsafe-inline` pour les scripts et les styles et autorise déjà `'wasm-unsafe-eval'` (WebAssembly de Pagefind). Pagefind 1.5.2 est une dépendance déclarée en phase 0 (`pagefind`, script `build:search` après `astro build`).

## Décision
1. **Moteur** : Pagefind indexe `dist/` après le build ; seules les pages portant `data-pagefind-body` (les articles, 28 pages) entrent dans l'index.
2. **Interface maison** sur l'API JavaScript de `/pagefind/pagefind.js`, sur une page dédiée `/recherche/` en `noindex`, liée depuis la navigation. L'interface par défaut (`pagefind-ui`) n'est pas utilisée : sa compatibilité avec une CSP sans style en ligne n'est pas établie (écart E19), et une interface maison s'aligne sur le design system, l'accessibilité (champ étiqueté, région `aria-live`, clavier) et les jetons du site.
3. **Chargement différé** : l'index n'est importé qu'à la première interaction (focus du champ), pas au chargement de la page ; anti-rebond de 150 ms.
4. **Sécurité** : l'extrait, qui vient du contenu, est nettoyé (`<mark>` seul conservé) avant insertion ; le reste est construit avec `textContent` ; aucun cookie ni stockage local.
5. **Pertinence** : un filtre côté client (`isRelevant`) écarte les résultats approximatifs de Pagefind (par exemple « zzzzqq » ramène une page qui surligne « Z »).
6. **Contrôle de build** : `pagefind.dist.check.ts` exige un index non vide, une page par article publié et 500 Ko au plus de fichiers d'index.

## Alternatives considérées
- **`pagefind-ui`** : rapide à mettre en place, mais styles à intégrer par attributs `style`, compatibilité CSP non prouvée et rendu étranger au design system. Rejeté.
- **Fenêtre modale de recherche** : piège de focus à maintenir, comportement mobile plus complexe. Rejeté au profit d'une page.
- **Autre moteur côté client (Lunr, MiniSearch, Fuse)** : index à générer et à charger en entier (pas de découpage en fragments), dépendance de plus. Rejeté.
- **Service hébergé (Algolia, Meilisearch Cloud)** : dépendance externe et données hors du site, contraire à ADR-0004. Rejeté.

## Conséquences
- L'index n'existe qu'après `npm run build` : les tests de recherche tournent sur `preview`, jamais sur `astro dev`.
- Index de 229 Ko pour 28 articles, chargé à la demande ; module de la page de moins de 4 Ko de code du projet.
- Pagefind produit aussi des fichiers d'interface jamais chargés (environ 400 Ko dans `dist/pagefind/`) : leur suppression après `build:search` est une optimisation possible hors du lot A.
- `nginx.conf` (lot B) sert `/pagefind/` avec `Cache-Control: no-cache` ; les fichiers `.pagefind` (WebAssembly) sont servis sans type `application/wasm`, ce que Pagefind accepte (instanciation depuis un tableau d'octets) : aucune règle nginx n'est nécessaire au sprint 3.
- Le filtre de pertinence est une heuristique à revoir si le corpus grossit ou change de langue.
