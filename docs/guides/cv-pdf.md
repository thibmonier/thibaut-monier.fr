# Guide : CV PDF (US-007)

Le CV `dist/thibaut-monier-cv.pdf` est généré au build par Typst à partir des mêmes YAML que la page `/parcours/` : aucune double saisie. Décision d'architecture : [ADR-0005](../adr/0005-cv-pdf-typst.md).

## Décisions (T-007-01)

| Sujet | Décision |
|-------|----------|
| Titre et accroche | `src/data/cv/profile.yaml` (clé `fr`), distinct de l'accroche web `home.yaml` (E21) |
| E-mail public | Aucun dans le PDF (le champ `email` du schéma reste optionnel et **n'est jamais repris**) : le contact passe par le formulaire |
| Liens | LinkedIn, GitHub, Packagist (`profile.yaml`) |
| `X-Robots-Tag` | `noindex` : la page Parcours reste la version indexée |
| Cache | `no-cache` (revalidation par ETag), à la place des 30 jours des autres `.pdf` (`nginx.conf`) |
| Polices | Inter statique TTF (Regular, Medium, SemiBold, Bold) dans `cv/fonts/` (1,6 Mo, licence OFL dans `OFL.txt`) : Typst 0.15 ne lit pas le WOFF2 du site |
| Extraction de texte | `pdftotext` (poppler-utils 25.12.0-r1 épinglé), installé dans l'étape `deps` du `Dockerfile` ; absent de l'image `runtime` |
| Libellé du lien | Statique : « Télécharger mon CV (PDF, 2 pages) » ; le nombre de pages et le poids sont vérifiés au build, jamais affichés |

## Modifier le CV

1. Modifier la **source** : `src/data/cv/profile.yaml` (titre, accroche, résumé, liens) ou une expérience dans `src/data/cv/experiences/*.yaml` (voir [parcours-experiences.md](parcours-experiences.md)). Les jetons de couleur viennent de `src/data/tokens.json`.
2. `make cv` génère `dist/thibaut-monier-cv.pdf` (le dossier `dist/` existe après `make build`). `make build` enchaîne `checks:content`, `astro build`, `build:cv` puis `checks:dist`.
3. Mise en page : `cv/cv.typ` (aucune donnée en dur, tout vient du JSON assemblé par `src/lib/cv-data.ts` et passé par `--input data=...`). Gabarit réutilisable pour des variantes ciblées (opportunité O-04).

En développement (`make dev`), le lien du CV mène à un 404 tant que `make cv` n'a pas été lancé.

## Contrôles

- `scripts/build-cv.ts` : échec « Génération du CV PDF impossible : <cause> » (Typst absent, erreur de gabarit, délai de 60 s) et suppression de tout PDF obsolète.
- `scripts/checks/cv-pdf.dist.check.ts` (phase `dist`, avec `lib/pdf-privacy.ts`) : texte extrait sans téléphone, âge ni adresse (message « CV public : donnée personnelle interdite (téléphone, âge ou adresse) », « 25 ans d'expérience » autorisé), moins de 500 Ko, au plus 2 pages et égal au nombre annoncé par le lien, toutes les entreprises et toutes les réalisations de la source présentes, titre et langue `fr` dans les métadonnées.
- PDF/UA : compilé avec `--pdf-standard ua-1` (Typst 0.15.1 balise le document : `pdfinfo` affiche `Tagged: yes`).

## Contrôle manuel (avant une release)

`pdfinfo dist/thibaut-monier-cv.pdf` (2 pages, Tagged oui), copier-coller du texte, ordre de lecture, comparaison avec `/parcours/`.

## Poids ajouté au dépôt

`cv/fonts/` : 1,6 Mo (< 2 Mo).
