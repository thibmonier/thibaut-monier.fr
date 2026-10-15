import { describe, expect, it } from 'vitest';
import { absoluteUrl, originOf } from '../../../src/lib/site-url.ts';

const SITE = 'https://thibaut-monier.fr';

describe('originOf', () => {
  it('retire chemin, requête et fragment', () => {
    expect(originOf('https://thibaut-monier.fr/blog/?a=1#b')).toBe(SITE);
    expect(originOf(new URL('https://exemple.up.railway.app/'))).toBe(
      'https://exemple.up.railway.app',
    );
  });
  it('conserve le port', () => {
    expect(originOf('http://localhost:8080/')).toBe('http://localhost:8080');
  });
  it.each(['', 'thibaut-monier.fr', 'ftp://exemple.fr', 'not an url'])(
    'refuse une origine invalide (%j)',
    (site) => {
      expect(() => originOf(site)).toThrow(/origine/i);
    },
  );
});

describe('absoluteUrl', () => {
  it('rend un chemin absolu à partir de l’origine du site', () => {
    expect(absoluteUrl('/blog/x/', SITE)).toBe(`${SITE}/blog/x/`);
    expect(absoluteUrl('/', SITE)).toBe(`${SITE}/`);
  });
  it('conserve la barre finale et l’ajoute aux pages (trailingSlash: always)', () => {
    expect(absoluteUrl('/blog/x', SITE)).toBe(`${SITE}/blog/x/`);
  });
  it('n’ajoute pas de barre finale aux fichiers', () => {
    expect(absoluteUrl('/rss.xml', SITE)).toBe(`${SITE}/rss.xml`);
    expect(absoluteUrl('/og/default.png', SITE)).toBe(`${SITE}/og/default.png`);
  });
  it('ignore le chemin de l’URL du site (seule l’origine compte)', () => {
    expect(absoluteUrl('/blog/', 'https://exemple.fr/sous/dossier/')).toBe(
      'https://exemple.fr/blog/',
    );
  });
  it('accepte une URL en second argument', () => {
    expect(absoluteUrl('/parcours/', new URL(SITE))).toBe(`${SITE}/parcours/`);
  });
  it.each([
    'https://autre.fr/x/',
    '//autre.fr/x/',
    'http://autre.fr',
    'mailto:a@b.fr',
    'blog/x/',
    '',
  ])('refuse un chemin qui contient déjà un domaine ou n’est pas un chemin (%j)', (path) => {
    expect(() => absoluteUrl(path, SITE)).toThrow(/chemin/i);
  });
  it('échoue avec une origine invalide ou absente', () => {
    expect(() => absoluteUrl('/x/', 'pas une url')).toThrow(/origine/i);
    expect(() => absoluteUrl('/x/', undefined)).toThrow(/origine/i);
  });
});
