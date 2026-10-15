import { describe, expect, it } from 'vitest';
import {
  LATIN_GLYPHS,
  OG_COLORS,
  assertOgContrast,
  buildOgPages,
  getOgImageUrl,
  ogRouteKey,
  stripUnsupported,
  truncateTitle,
} from '../../../src/lib/og.ts';
import { contrastRatio } from '../../../src/lib/contrast.ts';

const SITE = 'https://thibaut-monier.fr';

describe('ogRouteKey', () => {
  it('produit une clé stable et sûre', () => {
    expect(ogRouteKey('/')).toBe('index');
    expect(ogRouteKey('/blog/la-spec-est-le-nouveau-code/')).toBe(
      'blog-la-spec-est-le-nouveau-code',
    );
    expect(ogRouteKey('/open-source/sylius/factur-x/')).toBe('open-source-sylius-factur-x');
    expect(ogRouteKey('/blog/Évasion.html/')).toBe('blog-evasion-html');
  });
});

describe('getOgImageUrl', () => {
  const keys = new Set(['blog-a', 'default']);

  it('retourne l’URL absolue de l’image de la page', () => {
    expect(getOgImageUrl('/blog/a/', keys, SITE)).toBe('https://thibaut-monier.fr/og/blog-a.png');
  });

  it('retombe sur l’image par défaut pour une page sans entrée', () => {
    expect(getOgImageUrl('/contact/', keys, SITE)).toBe('https://thibaut-monier.fr/og/default.png');
    expect(getOgImageUrl('/', keys, SITE)).toBe('https://thibaut-monier.fr/og/default.png');
  });
});

describe('truncateTitle', () => {
  it('garde un titre de 90 caractères et coupe celui de 91 avec une ellipse', () => {
    expect(truncateTitle('x'.repeat(90))).toBe('x'.repeat(90));
    const cut = truncateTitle('x'.repeat(91));
    expect(cut).toHaveLength(90);
    expect(cut.endsWith('…')).toBe(true);
  });

  it('ne laisse pas d’espace avant l’ellipse', () => {
    expect(truncateTitle(`${'mot '.repeat(30)}fin`, 9)).toBe('mot mot…');
  });
});

describe('stripUnsupported', () => {
  it('conserve les accents, « œ » et la ponctuation typographique', () => {
    expect(stripUnsupported('Œuvre : l’agence « augmentée » — é à ç', LATIN_GLYPHS)).toBe(
      'Œuvre : l’agence « augmentée » — é à ç',
    );
  });

  it('retire les émojis et les caractères hors police', () => {
    expect(stripUnsupported('IA 🚀 rapide ✓', LATIN_GLYPHS)).toBe('IA  rapide ');
  });
});

describe('buildOgPages', () => {
  const sources = {
    fallback: { title: 'Thibaut Monier', description: 'Directeur de projets IT.' },
    articles: [{ slug: 'a', title: 'Article A', description: 'Desc A' }],
    plugins: [{ slug: 'factur-x', name: 'Factur-X', tagline: 'Factures électroniques' }],
    projects: [{ slug: 'career-ops', title: 'career-ops', summary: 'Contributions' }],
  };

  it('construit le registre depuis les collections, avec l’image par défaut', () => {
    expect(buildOgPages(sources)).toEqual({
      default: {
        title: 'Thibaut Monier',
        description: 'Directeur de projets IT.',
        kind: 'default',
      },
      'blog-a': { title: 'Article A', description: 'Desc A', kind: 'article' },
      'open-source-sylius-factur-x': {
        title: 'Factur-X',
        description: 'Factures électroniques',
        kind: 'plugin',
      },
      'open-source-career-ops': {
        title: 'career-ops',
        description: 'Contributions',
        kind: 'project',
      },
    });
  });

  it('une page ajoutée à une collection reçoit son image sans toucher au registre', () => {
    const more = {
      ...sources,
      articles: [...sources.articles, { slug: 'b', title: 'B', description: 'D' }],
    };
    expect(Object.keys(buildOgPages(more))).toContain('blog-b');
  });

  it('échoue sur deux pages de même clé', () => {
    expect(() =>
      buildOgPages({
        ...sources,
        articles: [
          { slug: 'a', title: 'A', description: 'D' },
          { slug: 'a', title: 'A bis', description: 'D' },
        ],
      }),
    ).toThrow('Génération Open Graph : deux pages ont la clé « blog-a »');
  });
});

describe('contraste du gabarit', () => {
  it('le texte du gabarit dépasse 4,5:1 sur les deux extrémités du fond', () => {
    for (const background of [OG_COLORS.backgroundStart, OG_COLORS.backgroundEnd]) {
      expect(contrastRatio(OG_COLORS.title, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(OG_COLORS.description, background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(() => assertOgContrast(OG_COLORS)).not.toThrow();
  });

  it('refuse des couleurs à contraste insuffisant', () => {
    expect(() => assertOgContrast({ ...OG_COLORS, description: '#cccccc' })).toThrow(
      /Contraste insuffisant/,
    );
  });
});
