# ADR-0012 : Images Open Graph générées par astro-og-canvas

## Statut
Proposé (2026-10-15, lot B du sprint 3) : à valider par le PO.

## Contexte
Le partage d'une page (LinkedIn, messageries) affiche une image et un titre. L'US-025 demande une image de 1200 × 630, de moins de 300 Ko, par page de contenu, générée au build. La tech-spec et la checklist de démarrage citent `astro-og-canvas` ; les notes de l'US citent Satori et resvg (écart E17 du sprint 3).

Relevés du 2026-10-14 et 2026-10-15 :
- `astro-og-canvas` 0.13.2 : `canvaskit-wasm`, aucun binaire natif, pair `astro ^5 || ^6 || ^7`, déjà installé ;
- `OGImageRoute` génère `getStaticPaths` et `GET` à partir d'un objet `pages` ; l'extension `.png` est ajoutée à la clé ;
- police : Inter (OFL) est déjà dans `cv/fonts/`.

## Décision
1. **`astro-og-canvas`** génère les images au build, dans `src/pages/og/[...route].ts` (le nom `[...route].png.ts` donnerait `x.png.png`).
2. **Inter** (`cv/fonts/`), sans copie : une seule police pour le CV et les images. Une police absente fait échouer le build.
3. **Registre unique** (`src/lib/og.ts`, `getOgImageUrl`, contrat C9) : une image par article, fiche plugin et projet, plus une image `default` pour l'accueil et les autres pages. `Seo.astro` seul écrit `/og/`.
4. **Couleurs** du thème clair des tokens ; contraste du texte d'au moins 4,5:1, vérifié au build.
5. **Contrôle de build** : URL absolue, PNG de 1200 × 630, moins de 300 Ko, dimensions et texte alternatif déclarés.
6. **Pas de cache de génération** (`cacheDir: false`) : l'image Docker est reconstruite à chaque fois.

## Alternatives considérées
| Alternative | Rejet |
|-------------|-------|
| Satori + resvg | Deux dépendances de plus, `resvg` avec binaire natif (à vérifier sur Alpine), gabarit en JSX à écrire ; aucun gain pour un gabarit titre et description |
| Images dessinées à la main | Non reproductibles, à refaire pour chaque article |
| Service tiers de génération | Dépendance externe et cookies ou requêtes tierces, contraire à ADR-0004 |

## Conséquences
- ✅ Aucune dépendance ajoutée ; 23 images pour 1,2 Mo ; génération en quelques secondes (mesure du 2026-10-15, avant les articles).
- ✅ Un article ajouté reçoit son image sans éditer de liste.
- ⚠️ `canvaskit-wasm` ne dessine pas les émojis : ils sont retirés des titres (`stripUnsupported`).
- ⚠️ Images non hachées : durée de cache d'un jour (`nginx.conf`).
