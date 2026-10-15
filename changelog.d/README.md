# Fragments de CHANGELOG

Pour éviter les conflits sur `CHANGELOG.md`, chaque lot du sprint 3 écrit **un seul fragment** ici :

| Fichier                | Écrivain                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| `changelog.d/lot-a.md` | lot A (blog, redirections, navigation, recherche)                 |
| `changelog.d/lot-b.md` | lot B (flux, SEO technique, images de partage, mesure d'audience) |

Format d'un fragment : les catégories de [Keep a Changelog](https://keepachangelog.com/) (`### Added`, `### Changed`, `### Fixed`, `### Security`), une puce par changement notable, sans titre de version ni date.

À la phase 4 (`T-900-20`), l'orchestrateur assemble les fragments dans la zone `[Unreleased]` de `CHANGELOG.md` (ajout seul), puis supprime les fragments. Aucun worker n'écrit dans `CHANGELOG.md`.

Sprint 3 : les fragments `lot-a.md` et `lot-b.md` ont été assemblés dans `CHANGELOG.md` à l'intégration (T-900-20) puis supprimés. Ce dossier ne contient plus que ce fichier jusqu'au prochain sprint.
