import { describe, expect, it } from 'vitest';
import { enabledItems, isActive } from '../../../src/lib/navigation.ts';

describe('isActive', () => {
  it("marque l'URL exacte, avec ou sans barre finale", () => {
    expect(isActive('/contact/', '/contact/')).toBe(true);
    expect(isActive('/contact', '/contact/')).toBe(true);
  });

  it('marque aussi les sous-chemins', () => {
    expect(isActive('/blog/mon-article/', '/blog/')).toBe(true);
  });

  it("n'active l'accueil que sur la racine", () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/contact/', '/')).toBe(false);
  });

  it('ne confond pas deux segments au préfixe commun', () => {
    expect(isActive('/contacts/', '/contact/')).toBe(false);
  });
});

describe('enabledItems', () => {
  it('écarte les entrées dont le drapeau enabled est faux', () => {
    const items = [
      { id: 'a', href: '/a/', label: 'A', enabled: true },
      { id: 'b', href: '/b/', label: 'B', enabled: false },
    ];
    expect(enabledItems(items).map((i) => i.id)).toEqual(['a']);
  });
});
