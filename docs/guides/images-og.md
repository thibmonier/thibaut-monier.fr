# Guide des images Open Graph

Images de partage générées au build (US-025).

## Décisions du 2026-10-15 (T-025-01)

Statut : proposées par le lot B, **à valider par le PO**.

| Sujet | Décision |
|-------|----------|
| Bibliothèque | `astro-og-canvas` 0.13.2 (déjà installée ; `canvaskit-wasm`, sans binaire natif). Alternative Satori + resvg écartée : voir ADR-0012 |
| Police | Inter, déjà dans `cv/fonts/` (licence OFL, intégration libre) : aucune police dupliquée |
| Format | PNG de 1200 × 630, moins de 300 Ko |
| Couverture | Une image par article, par fiche de plugin et par projet ; image de repli `default` pour l'accueil et toutes les autres pages |
| Couleurs | Celles de `src/data/tokens.json` (thème clair), contraste du texte d'au moins 4,5:1 |
| URL | `getOgImageUrl(path)` de `src/lib/og.ts` (contrat C9) : seul module qui écrit `/og/` |
| Budget | Génération en moins de 3 minutes sur le site complet |

## Fonctionnement

- `src/lib/og.ts` (contrat C9) : `getOgImageUrl(path, keys)` est le seul module qui connaît `/og/` ; `ogRouteKey` (`/blog/a/` donne `blog-a`), `buildOgPages` (registre), `truncateTitle`, `stripUnsupported`, couleurs du gabarit et `assertOgContrast`.
- `src/lib/site-pages.ts` : chargeur commun à `llms.txt` et au registre (articles par `getPublishedPosts`, plugins, projets). Une page ajoutée à une collection reçoit son image sans toucher au registre.
- `src/pages/og/[...route].ts` : `OGImageRoute` d'`astro-og-canvas`. Le fichier ne s'appelle pas `[...route].png.ts` : la bibliothèque ajoute elle-même `.png` à la clé, ce nom donnerait `x.png.png`.
- `Seo.astro` écrit `og:image`, ses dimensions (1200 × 630), `og:image:alt` (titre de la page) et les cartes `twitter:*` (`summary_large_image`). Les pages `noindex` gardent leurs balises de partage. L'accueil et toute page sans entrée utilisent `/og/default.png`.
- `nginx.conf` : `location ^~ /og/` avec `Cache-Control: public, max-age=86400` (noms non hachés) et le snippet de sécurité.

## Gabarit

Fond en dégradé du thème clair (`bg` vers `surface` de `src/data/tokens.json`), filet d'accent à gauche, titre Inter Bold 66 px (90 caractères au plus, ellipse au-delà), description Inter Regular 34 px (150 caractères au plus), marge de 80 px. Les caractères que la police ne dessine pas (émojis) sont retirés. Le contraste du titre et de la description sur les deux extrémités du fond dépasse 4,5:1 (vérifié au build : `assertOgContrast`). Une police absente fait échouer le build : « Génération Open Graph : police introuvable (<chemin>) ».

## Contrôle de build

`og.dist.check.ts` : `og:image` absolue et joignable dans `dist/`, PNG de 1200 × 630 (en-tête IHDR) de moins de 300 Ko, dimensions et texte alternatif déclarés, aucun lien visible vers une image de partage. Il affiche le nombre d'images, le poids total et la plus lourde.

## Mesures (2026-10-15, build local sous Docker)

| Mesure | Valeur |
|--------|--------|
| Images générées | 23 (20 plugins, 2 projets, image par défaut) ; les articles du blog s'y ajouteront |
| Poids total de `dist/og/` | 1,2 Mo ; la plus lourde : 65 Ko (`open-source-tailsfadmin.png`) |
| Durée du build Astro complet | 5 s (images comprises) ; le budget de 3 minutes n'est pas menacé |
| Cache | désactivé (`cacheDir: false`) : aucun cache fragile dans une image reconstruite à chaque fois |

À relever de nouveau avec les 28 articles (T-025-11).

## Revue visuelle (T-025-09)

Examinées à l'œil, en ouvrant les PNG de `dist/og/` : image par défaut, fiche plugin (`company-accounts`) et un essai au pire cas (titre de 90 caractères avec accents et « œ », description tronquée à 150 caractères). Le titre sur quatre lignes et la description sur trois lignes tiennent dans le cadre ; accents et « œ » sont dessinés ; le contraste est net. Ajustement consigné : première version (titre 76 px, description 38 px) trop haute, la description touchait le bord du bas, d'où 66 px et 34 px. Reste à examiner avec les articles réels : article au titre le plus long, article avec « œ », page de liste.

## Ajouter un type de page

Ajouter sa source à `OgSources` et à `buildOgPages` (`src/lib/og.ts`), la lire dans `loadOgPages` (`src/lib/site-pages.ts`), puis un cas dans `tests/unit/lib/og.test.ts`. Le chemin de la page doit correspondre à `ogRouteKey` de sa clé.

## Dépannage

| Symptôme | Cause probable |
|----------|----------------|
| « deux pages ont la clé » | deux sources donnent le même chemin ; renommer le slug |
| `og:image` vers `/og/default.png` pour une page qui devrait avoir la sienne | clé absente du registre : vérifier `buildOgPages` |
| Carré à la place d'un caractère | glyphe absent d'Inter : étendre `LATIN_GLYPHS` ou retirer le caractère |
