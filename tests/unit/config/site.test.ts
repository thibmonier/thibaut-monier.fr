import { describe, expect, it } from 'vitest';
import { navSchema, parseNav } from '../../../src/config/nav.ts';
import { site } from '../../../src/config/site.ts';

describe('configuration du site', () => {
  it('fournit le nom, la langue et les réseaux obligatoires', () => {
    expect(site.name).toBe('Thibaut Monier');
    expect(site.lang).toBe('fr');
    expect(site.social.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\//);
    expect(site.social.github).toMatch(/^https:\/\/github\.com\//);
  });

  it('active Accueil et Contact et ne publie ni Blog ni Labo (arbitrage A4)', () => {
    const enabled = site.nav.main.filter((item) => item.enabled).map((item) => item.id);
    expect(enabled).toContain('accueil');
    expect(enabled).toContain('contact');
    expect(site.nav.main.map((item) => item.id)).not.toContain('blog');
    expect(site.nav.main.map((item) => item.id)).not.toContain('labo');
  });

  it('prévoit les liens légaux du pied de page', () => {
    const ids = site.nav.footer.map((item) => item.id);
    expect(ids).toEqual(expect.arrayContaining(['mentions-legales', 'vie-privee']));
  });

  it('chaque lien interne se termine par une barre oblique', () => {
    for (const item of [...site.nav.main, ...site.nav.footer]) {
      expect(item.href).toMatch(/^\/.*\/$|^\/$/);
    }
  });
});

describe('parseNav', () => {
  const valid = {
    main: [
      { id: 'accueil', href: '/', label: 'Accueil', enabled: true },
      { id: 'contact', href: '/contact/', label: 'Contact', enabled: true },
    ],
    footer: [
      {
        id: 'mentions-legales',
        href: '/mentions-legales/',
        label: 'Mentions légales',
        enabled: false,
      },
      { id: 'vie-privee', href: '/vie-privee/', label: 'Vie privée', enabled: false },
    ],
  };

  it('accepte une navigation complète', () => {
    expect(() => parseNav(valid)).not.toThrow();
  });

  it('échoue avec un message clair quand un lien obligatoire est retiré', () => {
    const broken = { ...valid, main: valid.main.slice(0, 1) };
    expect(() => parseNav(broken)).toThrow(/contact/);
  });

  it('échoue quand un lien obligatoire est désactivé', () => {
    const broken = {
      ...valid,
      main: [valid.main[0], { ...valid.main[1], enabled: false }],
    };
    expect(() => parseNav(broken)).toThrow(/contact/);
  });

  it('refuse un lien sans barre finale', () => {
    expect(() =>
      navSchema.parse({ ...valid, main: [{ id: 'a', href: '/a', label: 'A', enabled: true }] }),
    ).toThrow();
  });
});
