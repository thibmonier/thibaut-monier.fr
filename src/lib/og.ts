import tokens from '../data/tokens.json' with { type: 'json' };
import { postPath } from './blog.ts';
import { contrastRatio } from './contrast.ts';
import { absoluteUrl } from './site-url.ts';

// Contrat C9 : seul module qui sait où est l'image Open Graph d'une page. `Seo.astro` appelle `getOgImageUrl` ;
// aucune page n'écrit `/og/` elle-même. Le registre vient des mêmes sources que le sitemap et llms.txt
// (src/lib/site-pages.ts) : une page ajoutée à une collection reçoit son image sans éditer ce fichier.

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const DEFAULT_KEY = 'default';
const MAX_TITLE = 90;

/** Chemin -> clé de l'image : `/` donne `index`, `/blog/a/` donne `blog-a` (sans accent ni point). */
export function ogRouteKey(path: string): string {
  const key = path
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return key === '' ? 'index' : key;
}

/**
 * URL absolue de l'image d'une page. Sans `keys` (registre inconnu), toute page est supposée avoir son image ;
 * avec le registre, une page sans entrée reçoit l'image `default`. L'accueil n'a pas d'entrée : il utilise `default`.
 */
export function getOgImageUrl(
  path: string,
  keys?: ReadonlySet<string>,
  site?: string | URL,
): string {
  const key = ogRouteKey(path);
  const known = path !== '/' && (keys === undefined || keys.has(key));
  return absoluteUrl(`/og/${known ? key : DEFAULT_KEY}.png`, site);
}

export function truncateTitle(title: string, max = MAX_TITLE): string {
  if (title.length <= max) return title;
  return `${title.slice(0, max - 1).trimEnd()}…`;
}

/** Glyphes d'Inter utiles ici : alphabet latin (accents, « œ »), chiffres, ponctuation, espaces, symboles courants. */
export const LATIN_GLYPHS = /[\p{Script=Latin}\p{M}\p{N}\p{P}\p{Z}€©®™+=<>~^$%&§°]/u;

/** Retire les caractères que la police ne dessine pas (émojis...) : ils s'afficheraient en carré. */
export function stripUnsupported(text: string, glyphs: RegExp = LATIN_GLYPHS): string {
  return [...text].filter((char) => glyphs.test(char)).join('');
}

export interface OgSources {
  fallback: { title: string; description: string };
  articles: { slug: string; title: string; description: string }[];
  plugins: { slug: string; name: string; tagline: string }[];
  projects: { slug: string; title: string; summary: string }[];
}

export interface OgPage {
  title: string;
  description: string;
  kind: 'default' | 'article' | 'plugin' | 'project';
}

/** Registre `clé -> page`. Deux pages de même clé font échouer le build. */
export function buildOgPages(sources: OgSources): Record<string, OgPage> {
  const pages: Record<string, OgPage> = {};
  const add = (key: string, page: OgPage) => {
    if (key in pages) throw new Error(`Génération Open Graph : deux pages ont la clé « ${key} »`);
    pages[key] = page;
  };
  add(DEFAULT_KEY, { ...sources.fallback, kind: 'default' });
  for (const a of sources.articles)
    add(ogRouteKey(postPath(a.slug)), {
      title: a.title,
      description: a.description,
      kind: 'article',
    });
  for (const p of sources.plugins)
    add(ogRouteKey(`/open-source/sylius/${p.slug}/`), {
      title: p.name,
      description: p.tagline,
      kind: 'plugin',
    });
  for (const p of sources.projects)
    add(ogRouteKey(`/open-source/${p.slug}/`), {
      title: p.title,
      description: p.summary,
      kind: 'project',
    });
  return pages;
}

// Couleurs du gabarit : thème clair des tokens (une seule source de couleurs).
export const OG_COLORS = {
  backgroundStart: tokens.color.bg.light,
  backgroundEnd: tokens.color.surface.light,
  title: tokens.color.fg.light,
  description: tokens.color.muted.light,
  accent: tokens.color.accent.light,
};

const MIN_CONTRAST = 4.5;

export function assertOgContrast(colors: typeof OG_COLORS): void {
  for (const background of [colors.backgroundStart, colors.backgroundEnd]) {
    for (const [role, text] of [
      ['titre', colors.title],
      ['description', colors.description],
    ] as const) {
      const ratio = contrastRatio(text, background);
      if (ratio < MIN_CONTRAST) {
        throw new Error(
          `Contraste insuffisant (${ratio.toFixed(2)}:1 < ${MIN_CONTRAST}:1) : ${role} ${text} sur ${background}`,
        );
      }
    }
  }
}
