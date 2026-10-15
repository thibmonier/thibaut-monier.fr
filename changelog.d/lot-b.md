### Added

- Données structurées JSON-LD (`Person`, `ProfilePage`, `SoftwareSourceCode`, `ItemList`, `BlogPosting`, `FAQPage`, `BreadcrumbList`) produites par un module unique, avec contrôle de build (liste blanche de `Person`, poids, types attendus).
- Sitemap (`/sitemap-index.xml`), `robots.txt` et `llms.txt` générés au build ; contrôles de cohérence du sitemap, de longueur et d'unicité des titres et descriptions, et d'absence de domaine en dur.
- Flux RSS `/rss.xml` (20 articles les plus récents), lien de découverte et lien « S'abonner (RSS) » dans le pied de page, contrôle de build.
- Images Open Graph (1200 × 630) générées au build par `astro-og-canvas`, balises `og:image` et `twitter:*`, contrôle de build.
- Mesure d'audience Umami sans cookie : chargeur différé, contrat fermé des événements (ADR-0011), contrôle de build, respect de Do Not Track et de Global Privacy Control.

### Changed

- `buildTitle` n'ajoute le suffixe « — Thibaut Monier » que s'il tient dans 60 caractères.
- CSP : `connect-src` autorise `https://gateway.umami.is` (hôte réel de collecte relevé le 2026-10-15) au lieu de `cloud.umami.is` et `api-gateway.umami.dev`.
- nginx : `location` dédiées pour `/rss.xml`, les sitemaps, `robots.txt`, `llms.txt` (type et charset) et `/og/` (cache d'un jour).
- `/vie-privee/` : section « Mesure d'audience » complétée (événements, base légale, hébergement, conservation, refus).

### Security

- Le script d'audience n'est chargé ni avec Do Not Track, ni avec Global Privacy Control, ni par un navigateur automatisé ; aucune donnée saisie n'entre dans un événement.
