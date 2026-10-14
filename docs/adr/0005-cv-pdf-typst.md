# ADR-0005 : CV PDF généré au build avec Typst

## Statut
Accepté (2026-10-14, validé par le PO)

## Contexte
Le CV PDF doit venir de **la même source** que la page « Parcours » (CT-7, US-007), sans double saisie. Il doit être transmissible tel quel (P-001), faire moins de 500 Ko, ne contenir ni téléphone ni âge (CR-5), et sa génération doit tenir dans un build Docker léger.

## Décision
**Typst 0.15.1**, utilisé comme binaire dans une étape dédiée du Dockerfile, à partir de l'image `ghcr.io/typst/typst:0.15.1`.

- **Source unique** : les données du CV vivent en **YAML** dans `src/data/cv/` :
  - `profile.yaml` : titre et accroche ;
  - `experiences/*.yaml` ;
  - `skills.yaml` ;
  - `achievements.yaml`.
- Elles sont lues :
  - par **Astro**, via une collection `experiences` (loader `file()`/`glob()`) et un schéma Zod ;
  - par **Typst**, via la fonction native `yaml()`.
- **Gabarit** : `cv/cv.typ`, en A4, sur 2 pages au maximum, avec la typographie de la charte du site.
- **Liste blanche** : le schéma Zod n'expose **aucun** champ téléphone, adresse, âge ou date de naissance. Un contrôle post-build (`pdftotext` puis expressions régulières des motifs interdits) fait échouer le build si l'un d'eux apparaît (scénario d'erreur d'US-007).
- **Sortie** : `dist/thibaut-monier-cv.pdf`, avec les métadonnées titre, auteur et langue `fr`, puis `en` en sprint 5 (seconde compilation avec `--input lang=en`).
- **Règle de la frise** (D-6) : le CV détaille les 10 dernières années et résume l'antériorité, avec le même champ `featured` dans le YAML.

## Alternatives considérées
| Option | Rejet |
|--------|-------|
| Playwright / Chromium headless (impression de la page HTML) | Image de build de plusieurs centaines de Mo ; pagination CSS limitée |
| WeasyPrint | Image Python avec Pango plus lourde ; pagination CSS correcte mais moins de contrôle typographique |
| Paged.js | Nécessite un navigateur, avec le même poids que Playwright |
| PDF maintenu à la main | Contraire à la source unique |

## Conséquences
- ✅ Image de build légère (un binaire) ; compilation en moins d'une seconde.
- ✅ Typographie de qualité professionnelle (césure, crénage, mise en page fine).
- ✅ Gabarit réutilisable pour des CV ciblés (opportunité O-04, career-ops).
- ⚠️ Deux rendus du même contenu (HTML et Typst) à garder visuellement cohérents : la charte (couleurs, fontes) est partagée via un fichier de tokens exporté en JSON et lu par Typst.
- ⚠️ Accessibilité du PDF (balisage) limitée par les capacités de Typst 0.15 : à vérifier (PDF/UA), avec en repli un lien vers la page HTML accessible.
