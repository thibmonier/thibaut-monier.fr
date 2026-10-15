# Redirections du blog

Table de correspondance entre les URL de l'ancien site (agentic-agency.fr) et celles du nouveau (US-010). Cette page est créée en phase 0 du sprint 3 (T-010-01 : constats, contrat C6) ; le lot A la complète (remplissage de la table, artefact nginx, T-010-04 et suivantes).

## Constats

Relevés du 2026-10-14, en lecture seule (requêtes `HEAD` uniquement, `command curl --max-time 15 -sI <url>`, aucune écriture).

| Requête | Réponse |
|---------|---------|
| `HEAD https://agentic-agency.fr/blog/la-spec-est-le-nouveau-code/` | `308`, `location: /blog/la-spec-est-le-nouveau-code` (barre finale retirée) |
| `HEAD https://agentic-agency.fr/blog/la-spec-est-le-nouveau-code` | `401`, `www-authenticate: Basic realm="Preview"` |
| `HEAD https://agentic-agency.fr/blog/` | `308`, `location: /blog` |
| `HEAD https://agentic-agency.fr/rss.xml` | `401` (même royaume `Preview`) |

Conclusions (arbitrage E15 du 2026-10-14) :

- agentic-agency.fr est protégé par authentification : il **n'est pas public**. Le risque de contenu dupliqué R-01 disparaît, la canonical du nouveau site reste autoréférente et aucune redirection `301` n'est appliquée à l'ancien site dans ce sprint.
- **Forme des URL d'origine : sans barre finale** (`/blog/<slug>`), déduite du dépôt source (`site: https://agentic-agency.fr/` dans son `astro.config.mjs`) et de la redirection `308` observée. Le `dist/` du dépôt source est périmé (4 pages de liste, 4 catégories, environ 22 articles dans son sitemap) et ne sert pas de référence.
- Routes du code source de l'ancien site : `/blog/<slug>/`, `/blog/category/<catégorie>/`, `/blog/tags/<tag brut, accents et espaces encodés>/`, pagination `/blog/<n>/` à 6 articles par page, `/rss.xml`.
- La table stocke la forme observée (sans barre finale) ; le générateur nginx émet les deux formes (avec et sans barre) pour tout chemin qui n'est pas un fichier.
- Les 28 URL d'articles se déduisent des 28 noms de fichier de `src/content/blog/` de la source : `/blog/<nom de fichier sans .md>`.
- Aucun contenu n'est attendu du PO pour cette tâche.

## Contrat C6 : `src/lib/redirects.ts`

`src/data/redirects.yaml` (liste vide en phase 0) ne contient que des chemins. Entrée : `{ from, to, kind }`, `kind` parmi `article`, `index`, `categorie`, `tag`, `page`, `flux`.

| Règle | Détail |
|-------|--------|
| `from` | chemin de l'ancien site, sans domaine, requête ni fragment, **sans barre finale** (sauf `/`) ; accents bruts ou encodés en pourcentage (décodés) ; ni caractère de contrôle ni `"`, `\`, `;`, `{`, `}`, `$` |
| `to` | chemin du nouveau site avec barre finale (sauf fichier : `/rss.xml`) ; ni espace ni `"`, `\`, `;`, `{`, `}`, `$`, `?`, `#` |
| Doublons | refusés (après décodage et sans barre finale) |
| `parseRedirects(yaml)` | table validée ; fichier vide ou commentaires seuls = table vide ; erreurs préfixées `redirects.yaml :` |
| `loadRedirects(root)` | seul lecteur de `src/data/redirects.yaml` |
| `coverage(slugs, table)` | `{ covered, total, errors }` ; message exact `Correspondance manquante : <slug> (couverture 27/28)` |
| `toNginx(table, origin)` | une ligne `location = "<from>" { return 301 <origine><to>; }` par forme d'URL ; l'origine vient de `site-url.ts` (E23), jamais du fichier |

Exemple d'entrée : `- { from: '/blog/tags/IA générative', to: /blog/tag/ia-generative/, kind: tag }`.

## Table de correspondance (`src/data/redirects.yaml`, T-010-04)

95 entrées, complétées à la main à partir de la liste des articles et des routes de la source (arbitrage E15 : forme sans barre finale) :

| Type | Entrées | Cible |
|------|---------|-------|
| `article` | 28 | `/blog/<slug>/` |
| `index` | 1 | `/blog/` |
| `page` | 4 | l'ancienne page `/blog/<n>/` (6 articles par page, n de 2 à 5) vers la page `ceil(n × 6 / 12)` de la liste à 12 articles : `/blog/<n>` 2 vers `/blog/`, 3 vers `/blog/page/2/`, 4 vers `/blog/page/2/`, 5 vers `/blog/page/3/` |
| `categorie` | 5 | `/blog/categorie/<slug>/` |
| `tag` | 56 (un par tag de la source, accents bruts) | la page du tag (`/blog/tag/<slug>/`) quand il compte 2 articles ou plus après normalisation (19 tags), sinon `/blog/` (E7) ; les synonymes normalisés pointent vers le tag retenu (« Méthodologie » vers `/blog/tag/methode/`) |
| `flux` | 1 | `/rss.xml` |

La Boîte à outils de l'ancien site (`/boite-a-outils…`, `/services…`, `/methode`) est exclue (EPIC-004).

## Contrôles

| Contrôle | Phase | Ce qu'il vérifie |
|----------|-------|------------------|
| `redirects.content.check.ts` | avant le build | schéma de la table (`loadRedirects`), couverture : « Correspondance manquante : <slug> (couverture 27/28) » |
| `redirects.dist.check.ts` | après le build | chaque cible existe dans `dist/` (message avec le numéro d'entrée) ; la cible `flux` n'est exigée que lorsque `src/pages/rss.xml.ts` existe (lot B, US-013) |
| `canonical.dist.check.ts` | après le build | une seule canonical absolue, autoréférente, sur l'origine du site (`PUBLIC_SITE_URL`, sinon le site par défaut d'`astro.config.mjs`), sur toutes les pages indexables ; une page `noindex` n'en porte aucune ; message « Canonical invalide : <URL> (attendu <origine>/…) » |
| `orphans.dist.check.ts` | après le build | toute page de `dist/` (hors 404 et `noindex`) est liée depuis une autre page : « Page orpheline : <route> » |

## Générer le fichier nginx de l'ancien site

```bash
make redirects            # écrit reports/redirects/agentic-agency.nginx.conf (ignoré par Git et Docker)
```

Le fichier contient un bloc `location = "<from>" { return 301 <origine><to>; }` par forme d'URL (avec et sans barre finale), soit 56 blocs pour les articles ; l'origine cible vient de `PUBLIC_SITE_URL` (sinon le site par défaut). Il n'est **jamais écrit sous `dist/`** (le script refuse) donc jamais déployé. Le job CI qui publie l'artefact est ajouté en phase 4 (T-900-21).

## Bascule (hors périmètre de ce sprint)

Décision du PO du 2026-10-14 : l'ancien site reste intact (protégé par authentification, 401), le doublon de contenu est sans objet et la canonical du nouveau site reste autoréférente. Le jour où `agentic-agency.fr` sera rendu public puis redirigé :

1. Vérifier que `PUBLIC_SITE_URL` du build pointe sur le domaine définitif, régénérer (`make redirects`) et relire le fichier.
2. Inclure `agentic-agency.nginx.conf` dans le serveur de l'ancien site (et y laisser le reste intact), tester quelques adresses avec `curl -I` : `301` vers la forme avec barre finale du nouveau site.
3. Supprimer ensuite la mention « Initialement publié sur Agentic Agency » (composant `OriginalNotice`, champs `originalUrl`) ou la conserver comme référence historique : décision à prendre dans la story de redirection.
4. Search Console : soumettre le sitemap du nouveau domaine ; l'outil de changement d'adresse n'est utilisable qu'une fois les redirections en place.
5. Reprendre les 6 liens des articles vers des pages non migrées (`/services/sites-ia`, `/methode`, `/boite-a-outils…`) : vers `/labo/` au sprint 4.

La mention d'origine est un texte lisible (jamais une icône seule) avec `rel="noopener noreferrer"` ; elle n'est rendue que si `originalUrl` est renseigné.
