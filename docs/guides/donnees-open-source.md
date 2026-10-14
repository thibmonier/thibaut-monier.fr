# Données vivantes des fiches (US-021, affichage)

Chaque fiche affiche la dernière version, la date de release, les étoiles GitHub et les téléchargements Packagist, avec la mention « Données au AAAA-MM-JJ ».

## Principe (ADR-0006)

- Le build lit uniquement `src/data/oss-metrics.json` : aucun appel réseau, aucun jeton, aucune métrique ne peut le faire échouer.
- La collecte est un script séparé (`make metrics`, workflow hebdomadaire `metrics.yml`) qui ouvre une pull request du JSON ; elle est maintenue avec la collecte (lot de collecte d’US-021).
- Le format est celui du modèle de contenu : `entries["owner/repo"]` avec `fetchedAt`, `github` (`stars`, `pushedAt`, `latestRelease`) et `packagist` (`downloadsTotal`, `downloadsMonthly`, `latestVersion`).

## Affichage

`src/lib/oss-metrics.ts` lit le JSON avec le schéma partagé de la collecte : une métrique absente est masquée seule, une entrée invalide ou sans aucune métrique supprime le bloc, la fiche s’affiche sans lui. `LiveStats.astro` rend une liste de définitions avec libellés textuels (pas de badge image) ; il est réutilisable par la page tailsfadmin. Aucune métrique n’entre dans les données structurées.

La date de release n’est affichée que si le tag de la dernière release GitHub est la version affichée ; sinon (tag sans release) elle est masquée plutôt que d’afficher la date d’une autre version.

Plugin non publié sur Packagist (Agentic Feeds) : pas de téléchargements, la version vient de la release GitHub.

## Variables

Le jeton GitHub (`GITHUB_TOKEN`) n’est lu que par la collecte, jamais par le build ni l’image Docker.
