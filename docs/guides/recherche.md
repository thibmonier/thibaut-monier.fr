# Recherche plein texte

Recherche dans les articles du blog (US-012), côté client, avec Pagefind 1.5.2. Décision d'architecture : [ADR-0013](../adr/0013-recherche-pagefind-interface-maison.md) ; sécurité : ADR-0009.

## Décisions (T-012-01, 2026-10-15)

Prises par l'agent selon les arbitrages du 2026-10-14 (aucune attente du PO).

| Sujet | Décision |
|-------|----------|
| Interface | Page dédiée `/recherche/` (pas de fenêtre modale : aucun piège de focus à maintenir), lien « Recherche » dans la navigation principale (`src/config/nav.ts`). |
| Périmètre | Articles du blog seulement : `data-pagefind-body` sur l'`<article>` de `ArticleLayout`. Le labo et les fiches plugins rejoindront l'index avec leurs EPICs. Un article `draft` ou futur n'a pas de page dans `dist/` : il n'est pas indexé. |
| Moteur d'interface | Interface maison sur l'API JavaScript de `/pagefind/pagefind.js`, pas `pagefind-ui` (écart E19 : la compatibilité de l'interface par défaut avec une CSP sans style en ligne n'est pas établie). |
| Indexation | `data-pagefind-meta="category"` et `data-pagefind-filter="category"` sur le lien de catégorie ; `data-pagefind-ignore` sur l'encart de série, la liste des tags, la note d'auteur et la mention d'origine. |
| Page | `noindex`, sans canonical, un seul h1 ; repli sans JavaScript : le formulaire est masqué (variante `js`) et un texte propose « Parcourir le blog ». |
| Pertinence | Pagefind tolère les approximations ; `isRelevant` écarte les résultats dont le mot surligné ne partage pas 3 lettres de début avec la requête (voir ci-dessous). |

## Fonctionnement

1. À la première interaction avec le champ (focus), `src/scripts/search.ts` importe `/pagefind/pagefind.js` puis appelle `init()` (chargement du module WebAssembly) : aucune requête vers `/pagefind/` avant. En cas d'échec : état « indisponible » et lien vers `/blog/`.
2. Chaque saisie passe par un anti-rebond de 150 ms (`createDebouncer`), pour afficher les résultats moins de 300 ms après la dernière frappe (mesuré : environ 190 à 220 ms sur le build local).
3. Au plus 20 résultats sont affichés : titre (lien vers `<url>#article-titre`, le h1 de l'article porte `tabindex="-1"` et reçoit le focus), extrait avec les mots surlignés (`mark`), catégorie. Le nombre de résultats est annoncé dans une région `aria-live="polite"`.
4. Clavier : flèche bas depuis le champ, flèches haut et bas entre les résultats, Entrée suit le lien, flèche haut depuis le premier résultat revient au champ.
5. L'extrait vient du contenu et est inséré en HTML : `cleanExcerpt` échappe tout sauf `<mark>` et `</mark>` (test avec un extrait hostile). Aucun cookie, aucun stockage local.
6. Messages exacts : « Aucun résultat pour « <requête> ». Essayez un autre mot ou parcourez les catégories. » (le mot « catégories » est un lien vers `/blog/`) et « La recherche est momentanément indisponible. »

La logique pure (`src/lib/search.ts` : nettoyage, anti-rebond avec horloge injectée, machine d'états, messages, navigation clavier, pertinence) est testée sous Node sans Pagefind.

## Tester en local

L'index n'existe qu'après le build : il se teste sur `preview` (image de production), jamais sur `astro dev`.

```bash
export COMPOSE_PROJECT_NAME=tm-w1
make preview                                   # build complet puis nginx sur http://localhost:8081 avec compose.override.yaml
```

Puis ouvrir `/recherche/`. Les scénarios automatisés sont dans `tests/e2e/search.spec.ts` (Chromium système avec `PW_CHROMIUM_PATH`, ou la CI).

## Ajouter un contenu à l'index

Placer `data-pagefind-body` sur le conteneur du contenu à indexer (dès qu'un `data-pagefind-body` existe, Pagefind n'indexe que les pages qui en portent), `data-pagefind-ignore` sur les éléments de navigation qu'il contient, et aligner le contrôle `pagefind.dist.check.ts` (nombre de pages attendu).

## Budget de poids

Relevé du 2026-10-15 sur le build local (28 articles) :

| Élément | Poids | Contrôle |
|---------|-------|----------|
| Fichiers d'index (`fragment/`, `index/`, `filter/`, `*.pf_meta`, `pagefind-entry.json`) | 229 Ko | bloquant, budget 500 Ko (`pagefind.dist.check.ts`) |
| `pagefind.js` / `pagefind-worker.js` | 44,5 Ko / 40,3 Ko | mesurés à part |
| Module WebAssembly (`wasm.fr.pagefind`) | 70,6 Ko | mesuré à part |
| Script de la page (`SearchBox…js`) | 5,4 Ko servis dont 3,8 Ko de code du projet (2,4 Ko gzip) ; le reste est l'aide de préchargement ajoutée par Vite à tout `import()` | moins de 5 Ko de code du projet |

`pagefind-ui*.js/css`, `pagefind-modular-ui*`, `pagefind-component-ui*` et `pagefind-highlight.js` (environ 400 Ko) sont produits par Pagefind mais jamais chargés par le site ; ils pourraient être supprimés après `build:search` (hors périmètre du lot A : `package.json`).

## Pertinence (écart A2)

Pagefind renvoie un résultat pour une requête absurde : « zzzzqq » surligne le « Z » de « colonnes X, Y, Z » dans `la-spec-est-le-nouveau-code`. Le critère « aucun résultat » de l'US exige un message vide : `isRelevant` ne garde un résultat que si un mot surligné de l'extrait partage au moins 3 lettres de début avec un mot de la requête (la requête entière si elle est plus courte), accents et casse ignorés. « token » trouve donc « tokens », « methode » trouve « Méthode », « ia » trouve « IA ».

## Dépannage

- `/recherche/` répond mais la recherche est « indisponible » : l'index est absent (`astro dev`, ou build sans `npm run build:search`), ou `/pagefind/` est bloqué. `make build` régénère l'index et le contrôle `pagefind.dist` échoue s'il manque.
- `Refused to compile or instantiate WebAssembly module` dans la console : la CSP doit contenir `'wasm-unsafe-eval'` (déjà le cas, ADR-0009 ; `nginx/snippets/security-headers.conf` appartient au lot B).
- Les fichiers `/pagefind/` sont servis avec `Cache-Control: no-cache` (non hachés, donc revalidés) : `nginx.conf` (lot B) a déjà la `location ^~ /pagefind/`.
