# Guide du flux RSS

Flux unique `/rss.xml` (US-013).

## Décisions du 2026-10-15 (T-013-01)

Statut : proposées par le lot B, **à valider par le PO**.

| Sujet | Décision |
|-------|----------|
| Périmètre | Un seul flux (YAGNI : pas de flux par catégorie) |
| Contenu | Les 20 articles publiés les plus récents ; `description` = `excerpt ?? description` (extrait, pas l'article complet, pour conserver la visite du site) ; la catégorie en `<category>` |
| Canal | `<language>fr</language>`, auteur Thibaut Monier, `lastBuildDate` à la date du build |
| Adresse | `/rss.xml`, la même que l'ancien site (entrée de type `flux` de la table de redirections, lot A) |
| Filtre | Le même `isPublished` que la liste du blog (`src/lib/blog.ts`) : ni brouillon, ni article daté du futur |
| Erreur | Si `excerpt` et `description` manquent : « Flux RSS : description manquante pour <slug> » |

## Fonctionnement

- `src/lib/rss.ts` : `buildRssItems` (tri par date décroissante, limite à 20, filtre `isPublished` de `src/lib/blog.ts`, liens par `absoluteUrl`) et `buildRssXml` (`getRssString` de `@astrojs/rss`, qui échappe `&`, `<` et `>`).
- `src/pages/rss.xml.ts` : fichier statique `dist/rss.xml`, sans barre finale. `getPublishedPosts()` est la seule source.
- Découverte automatique : `<link rel="alternate" type="application/rss+xml">` dans `BaseLayout.astro` ; lien visible « S'abonner (RSS) » dans le pied de page (clé `footer.rss`).
- `nginx.conf` : `location = /rss.xml` avec `application/rss+xml; charset=utf-8`, `Cache-Control: no-cache` et le snippet de sécurité. L'extension `xml` est servie en `text/xml` par défaut : le bloc `types` de la `location` la redéfinit.

## Contrôle de build

`rss.dist.check.ts` : racine `<rss version="2.0">`, canal complet (`title`, `link`, `description`, `language`, `lastBuildDate`), `item` avec `title`, lien absolu, `guid`, `pubDate` au format RFC 822 et `description`, 20 items au plus, nombre égal à `min(20, articles publiés)`, aucune entrée qui ne soit un article de `dist/`, moins de 100 Ko. Les articles publiés sont les pages `dist/` dont `og:type` vaut `article`.

## Ajouter un champ

Étendre `buildRssItems` (champ de `RSSFeedItem`), mettre à jour `tests/unit/lib/rss.test.ts` puis le contrôle si le champ devient obligatoire. Le document est validé de forme par le navigateur (`DOMParser`) dans `tests/e2e/rss.spec.ts`.

## Validation

Le flux vide (aucun article publié) est valide : il sort un canal sans `item`. Une validation externe (validateur W3C) se fait en production avec le PO.
