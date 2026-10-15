import { existsSync } from 'node:fs';
import { OGImageRoute } from 'astro-og-canvas';
import { assertOgContrast, OG_COLORS, stripUnsupported, truncateTitle } from '../../lib/og.ts';
import { loadOgPages } from '../../lib/site-pages.ts';

// Images Open Graph (US-025, ADR-0012). `OGImageRoute` ajoute lui-même l'extension `.png` à la clé : le fichier
// de route s'appelle donc `[...route].ts` (et non `[...route].png.ts`, qui donnerait `x.png.png`).
// Polices : Inter, déjà dans `cv/fonts/` (une seule copie), chemins relatifs à la racine du projet.
// Gabarit : 4 lignes de titre (90 caractères au plus) et 3 lignes de description tiennent dans 630 px.
const MAX_DESCRIPTION = 150;
const FONTS = ['./cv/fonts/Inter-Regular.ttf', './cv/fonts/Inter-Bold.ttf'];
for (const font of FONTS) {
  if (!existsSync(font)) throw new Error(`Génération Open Graph : police introuvable (${font})`);
}
assertOgContrast(OG_COLORS);

const rgb = (hex: string): [number, number, number] => {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: await loadOgPages(),
  getImageOptions: (_key, page) => ({
    title: truncateTitle(stripUnsupported(page.title)),
    description: truncateTitle(stripUnsupported(page.description), MAX_DESCRIPTION),
    bgGradient: [rgb(OG_COLORS.backgroundStart), rgb(OG_COLORS.backgroundEnd)],
    border: { color: rgb(OG_COLORS.accent), width: 24, side: 'inline-start' },
    padding: 80,
    font: {
      title: {
        color: rgb(OG_COLORS.title),
        size: 66,
        weight: 'Bold',
        lineHeight: 1.15,
        families: ['Inter'],
      },
      description: {
        color: rgb(OG_COLORS.description),
        size: 34,
        weight: 'Normal',
        lineHeight: 1.3,
        families: ['Inter'],
      },
    },
    fonts: FONTS,
    cacheDir: false,
  }),
});
