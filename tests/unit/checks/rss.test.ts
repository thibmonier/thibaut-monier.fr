import { describe, expect, it } from 'vitest';
import { checkRss, checkRssXml } from '../../../scripts/checks/lib/rss.ts';
import { distWith, page } from './dist-helper.ts';

const channel = (items: string, head = '') =>
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Blog</title><description>Des articles</description><link>https://x.fr/</link>${head}<language>fr</language><lastBuildDate>Thu, 15 Oct 2026 06:00:00 GMT</lastBuildDate>${items}</channel></rss>`;
const item = (
  slug: string,
  over: { guid?: string | null; link?: string; pubDate?: string; description?: string } = {},
) =>
  `<item><title>T ${slug}</title><link>${over.link ?? `https://x.fr/blog/${slug}/`}</link>${
    over.guid === null
      ? ''
      : `<guid isPermaLink="true">${over.guid ?? `https://x.fr/blog/${slug}/`}</guid>`
  }<pubDate>${over.pubDate ?? 'Tue, 01 Sep 2026 00:00:00 GMT'}</pubDate><description>${over.description ?? 'Desc'}</description></item>`;
const routes = (n: number) => Array.from({ length: n }, (_, i) => `/blog/a${i}/`);
const items = (n: number) => Array.from({ length: n }, (_, i) => item(`a${i}`)).join('');

describe('checkRssXml', () => {
  it('accepte un flux valide dont le nombre d’items vaut min(20, articles publiés)', () => {
    expect(checkRssXml(channel(items(3)), routes(3))).toEqual([]);
    expect(checkRssXml(channel(items(20)), routes(30))).toEqual([]);
    expect(checkRssXml(channel(''), [])).toEqual([]);
  });

  it('signale une racine absente et un canal incomplet', () => {
    expect(checkRssXml('<feed></feed>', [])).toContain(
      'Flux RSS : racine <rss version="2.0"> absente',
    );
    const incomplete = '<rss version="2.0"><channel><title>x</title></channel></rss>';
    expect(checkRssXml(incomplete, [])).toEqual([
      'Flux RSS : <channel> sans <link>',
      'Flux RSS : <channel> sans <description>',
      'Flux RSS : <channel> sans <language>',
      'Flux RSS : <channel> sans <lastBuildDate>',
    ]);
  });

  it('signale un item sans guid', () => {
    expect(checkRssXml(channel(item('a0', { guid: null })), routes(1))).toEqual([
      'Flux RSS : item 1 sans <guid>',
    ]);
  });

  it('signale un lien relatif', () => {
    expect(checkRssXml(channel(item('a0', { link: '/blog/a0/' })), routes(1))).toContain(
      'Flux RSS : item 1 : lien absolu attendu (/blog/a0/)',
    );
  });

  it('signale une date qui n’est pas au format RFC 822 et une description vide', () => {
    const xml = channel(item('a0', { pubDate: '2026-09-01', description: '' }));
    expect(checkRssXml(xml, routes(1))).toEqual([
      'Flux RSS : item 1 : pubDate au format RFC 822 attendu (2026-09-01)',
      'Flux RSS : item 1 sans <description>',
    ]);
  });

  it('signale 21 items', () => {
    expect(checkRssXml(channel(items(21)), routes(30))).toContain(
      'Flux RSS : 21 articles (20 au plus)',
    );
  });

  it('signale un nombre d’items différent de min(20, publiés)', () => {
    expect(checkRssXml(channel(items(2)), routes(3))).toEqual([
      'Flux RSS : 2 articles au lieu de 3',
    ]);
  });

  it('signale un item qui ne correspond à aucun article publié', () => {
    expect(checkRssXml(channel(item('fantome')), ['/blog/autre/'])).toContain(
      "Flux RSS : l'entrée /blog/fantome/ ne correspond à aucun article publié",
    );
  });

  it('signale un flux de 120 Ko', () => {
    const xml = channel(item('a0', { description: 'x'.repeat(120 * 1024) }));
    expect(checkRssXml(xml, routes(1)).join()).toMatch(/Flux RSS trop lourd \(120 Ko > 100 Ko\)/);
  });
});

describe('checkRss', () => {
  const article = (slug: string) =>
    page({
      title: slug,
      description: `Description de ${slug} assez longue pour la limite`,
      head: '<meta property="og:type" content="article">',
    });

  it('lit rss.xml et déduit les articles publiés des pages de type article', async () => {
    const dist = await distWith({
      'rss.xml': channel(item('a')),
      'blog/a/index.html': article('a'),
      'blog/index.html': page(),
    });
    expect(await checkRss(dist)).toEqual([]);
  });

  it('signale un rss.xml absent', async () => {
    expect(await checkRss(await distWith({ 'index.html': page() }))).toEqual([
      'rss.xml absent de dist/',
    ]);
  });
});
