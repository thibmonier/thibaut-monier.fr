import { describe, expect, it } from 'vitest';
import {
  SITEMAP_EXCLUDED_PATHS,
  buildRobots,
  isExcludedFromSitemap,
  isSitemapIndexable,
  lastmodFor,
} from '../../../src/lib/sitemap.ts';

const BUILD = new Date('2026-10-15T06:00:00Z');

describe('lastmodFor', () => {
  it('prend la date du contenu quand elle existe', () => {
    const dates = { '/blog/a/': new Date('2026-09-22T00:00:00Z') };
    expect(lastmodFor('/blog/a/', { contentDates: dates, buildDate: BUILD })).toEqual(
      dates['/blog/a/'],
    );
  });

  it('retombe sur la date du build sans date de contenu', () => {
    expect(lastmodFor('/contact/', { contentDates: {}, buildDate: BUILD })).toEqual(BUILD);
  });

  it('ne renvoie jamais le futur', () => {
    const future = new Date('2027-01-01T00:00:00Z');
    expect(lastmodFor('/x/', { contentDates: { '/x/': future }, buildDate: BUILD })).toEqual(BUILD);
  });
});

describe('isSitemapIndexable', () => {
  it('exclut une page noindex et la 404', () => {
    expect(isSitemapIndexable('/a/', '<meta name="robots" content="noindex">')).toBe(false);
    expect(isSitemapIndexable('/a/', '<meta name="robots" content="index,follow">')).toBe(true);
    expect(isSitemapIndexable('/404/', '<html></html>')).toBe(false);
  });
});

describe('isExcludedFromSitemap', () => {
  it('reconnaît les URL absolues et les chemins exclus', () => {
    for (const path of SITEMAP_EXCLUDED_PATHS) {
      expect(isExcludedFromSitemap(`https://thibaut-monier.fr${path}`)).toBe(true);
      expect(isExcludedFromSitemap(path)).toBe(true);
    }
    expect(isExcludedFromSitemap('https://thibaut-monier.fr/contact/')).toBe(false);
  });
});

describe('buildRobots', () => {
  it('autorise tout et référence le sitemap', () => {
    expect(buildRobots('https://thibaut-monier.fr')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://thibaut-monier.fr/sitemap-index.xml\n',
    );
  });
});
