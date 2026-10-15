import { describe, expect, it } from 'vitest';
import { deriveBreadcrumb, toBreadcrumbItems } from '../../../src/lib/breadcrumb.ts';

describe('deriveBreadcrumb', () => {
  it('l’accueil n’a qu’un maillon', () => {
    expect(deriveBreadcrumb('/', 'Accueil')).toEqual([{ label: 'Accueil' }]);
  });

  it('une page de premier niveau : accueil puis titre', () => {
    expect(deriveBreadcrumb('/contact/', 'Contact')).toEqual([
      { label: 'Accueil', href: '/' },
      { label: 'Contact' },
    ]);
  });

  it('conserve les segments connus et ignore ceux sans page', () => {
    expect(deriveBreadcrumb('/open-source/sylius/factur-x/', 'Factur-X')).toEqual([
      { label: 'Accueil', href: '/' },
      { label: 'Open source', href: '/open-source/' },
      { label: 'Factur-X' },
    ]);
    expect(deriveBreadcrumb('/blog/categorie/methode/', 'Méthode')).toEqual([
      { label: 'Accueil', href: '/' },
      { label: 'Blog', href: '/blog/' },
      { label: 'Méthode' },
    ]);
  });
});

describe('toBreadcrumbItems', () => {
  it('le dernier maillon pointe vers la page courante', () => {
    expect(
      toBreadcrumbItems([{ label: 'Accueil', href: '/' }, { label: 'Contact' }], '/contact/'),
    ).toEqual([
      { name: 'Accueil', path: '/' },
      { name: 'Contact', path: '/contact/' },
    ]);
  });

  it('retire un maillon intermédiaire sans lien', () => {
    expect(
      toBreadcrumbItems(
        [{ label: 'Accueil', href: '/' }, { label: 'Open source' }, { label: 'X' }],
        '/open-source/x/',
      ),
    ).toEqual([
      { name: 'Accueil', path: '/' },
      { name: 'X', path: '/open-source/x/' },
    ]);
  });
});
