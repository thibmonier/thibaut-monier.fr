### Added

- Blog migré (US-009) : 28 articles d'Agentic Agency sous `/blog/<slug>/`, 22 images, index, composants d'article (FAQ de 3 articles, note d'auteur, temps de lecture), publication programmée, outil de migration idempotent `scripts/migrate-blog.ts`, contrôles `blog.content`, `blog-schedule.dist` et lecteur unique de la collection.
- Canonical autoréférente, mention d'origine et table de redirections (US-010) : `src/data/redirects.yaml` (95 entrées), `make redirects` (fichier nginx hors `dist/`), contrôles `canonical.dist`, `redirects.content`, `redirects.dist` et `orphans.dist`.
- Navigation du blog (US-011) : liste paginée (12 articles par page), 5 catégories, 19 tags, 6 séries avec encart « article N sur M », lien « Retour au blog » sur la 404.
- Recherche plein texte (US-012) : page `/recherche/` en `noindex`, interface maison sur l'API JavaScript de Pagefind chargée à la première interaction, contrôle `pagefind.dist` (budget de 500 Ko).

### Changed

- Navigation principale : entrées « Blog » et « Recherche ».
- Le job `external-links` vérifie aussi les liens externes des pages du blog.
