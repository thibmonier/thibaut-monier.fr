import { describe, expect, it } from 'vitest';
import { checkJsonLd, checkJsonLdPage } from '../../../scripts/checks/lib/jsonld.ts';
import { distWith, page } from './dist-helper.ts';

const crumbs = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ '@type': 'ListItem', position: 1, name: 'A', item: 'https://x.fr/' }],
};
const article = (extra: object = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Titre',
  datePublished: '2026-09-22T00:00:00.000Z',
  author: { '@type': 'Person', name: 'T' },
  image: 'https://x.fr/og/a.png',
  ...extra,
});
const articleHead = '<meta property="og:type" content="article">';

describe('checkJsonLdPage', () => {
  it('accepte une page de contenu avec fil d’Ariane', () => {
    expect(checkJsonLdPage('/contact/', page({ jsonLd: [crumbs] }))).toEqual([]);
  });

  it('signale un JSON invalide', () => {
    const html = '<script type="application/ld+json">{oups</script>';
    expect(checkJsonLdPage('/contact/', html)).toContain(
      'JSON-LD invalide (JSON mal formé) : /contact/',
    );
  });

  it('exige un BreadcrumbList sur une page indexable, pas sur une page noindex', () => {
    expect(checkJsonLdPage('/contact/', page())).toEqual(['BreadcrumbList absent : /contact/']);
    expect(checkJsonLdPage('/contact/merci/', page({ robots: 'noindex' }))).toEqual([]);
  });

  it('cite le slug et la propriété manquante d’un BlogPosting', () => {
    const { datePublished: _omit, ...broken } = article();
    expect(
      checkJsonLdPage('/blog/la-spec/', page({ head: articleHead, jsonLd: [crumbs, broken] })),
    ).toEqual(['JSON-LD BlogPosting invalide : datePublished requis (la-spec)']);
  });

  it('exige un BlogPosting sur un article', () => {
    expect(
      checkJsonLdPage('/blog/la-spec/', page({ head: articleHead, jsonLd: [crumbs] })),
    ).toEqual(['JSON-LD BlogPosting absent : /blog/la-spec/']);
  });

  it('refuse une propriété hors liste blanche dans Person, y compris en entité principale', () => {
    const person = { '@type': 'Person', name: 'T', telephone: '0102' };
    expect(checkJsonLdPage('/', page({ jsonLd: [crumbs, person] }))).toContain(
      "JSON-LD Person : propriété interdite 'telephone' : /",
    );
    const profile = { '@type': 'ProfilePage', mainEntity: person };
    expect(checkJsonLdPage('/parcours/', page({ jsonLd: [crumbs, profile] }))).toContain(
      "JSON-LD Person : propriété interdite 'telephone' : /parcours/",
    );
  });

  it('exige les types attendus par type de page', () => {
    expect(checkJsonLdPage('/', page({ jsonLd: [crumbs] }))).toContain('JSON-LD Person absent : /');
    expect(checkJsonLdPage('/parcours/', page({ jsonLd: [crumbs] }))).toContain(
      'JSON-LD ProfilePage absent : /parcours/',
    );
    expect(checkJsonLdPage('/open-source/', page({ jsonLd: [crumbs] }))).toContain(
      'JSON-LD ItemList absent : /open-source/',
    );
    expect(checkJsonLdPage('/open-source/sylius/x/', page({ jsonLd: [crumbs] }))).toContain(
      'JSON-LD SoftwareSourceCode absent : /open-source/sylius/x/',
    );
  });

  it('n’accepte un FAQPage que si la FAQ est visible', () => {
    const faq = {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Pourquoi ?',
          acceptedAnswer: { '@type': 'Answer', text: 'x' },
        },
      ],
    };
    const jsonLd = [crumbs, article(), faq];
    expect(checkJsonLdPage('/blog/a/', page({ head: articleHead, jsonLd }))).toEqual([
      'FAQPage sans FAQ visible : /blog/a/',
    ]);
    expect(
      checkJsonLdPage('/blog/a/', page({ head: articleHead, jsonLd, body: '<h2>Pourquoi ?</h2>' })),
    ).toEqual([]);
  });

  it('compare la FAQ sans tenir compte de l’espace insécable avant « ? » (typographie française)', () => {
    const faq = {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Pourquoi\u00a0?',
          acceptedAnswer: { '@type': 'Answer', text: 'x' },
        },
      ],
    };
    const body = '<h3>Pourquoi\u00a0?</h3>';
    expect(
      checkJsonLdPage(
        '/blog/a/',
        page({ head: articleHead, jsonLd: [crumbs, article(), faq], body }),
      ),
    ).toEqual([]);
  });

  it('refuse plus de 5 Ko de JSON-LD par page', () => {
    const big = article({ headline: 'x'.repeat(6000) });
    expect(
      checkJsonLdPage('/blog/a/', page({ head: articleHead, jsonLd: [crumbs, big] })).join(),
    ).toMatch(/JSON-LD trop lourd \(\d+ octets > 5120\) : \/blog\/a\//);
  });
});

describe('checkJsonLd', () => {
  it('parcourt toutes les pages indexables de dist/ et ignore la 404', async () => {
    const dist = await distWith({
      'contact/index.html': page({ jsonLd: [crumbs] }),
      'parcours/index.html': page({ jsonLd: [] }),
      '404.html': page(),
    });
    const errors = await checkJsonLd(dist);
    expect(errors).toContain('BreadcrumbList absent : /parcours/');
    expect(errors.join()).not.toContain('404');
    expect(errors.join()).not.toContain('/contact/');
  });
});
