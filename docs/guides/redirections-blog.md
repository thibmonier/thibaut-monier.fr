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
