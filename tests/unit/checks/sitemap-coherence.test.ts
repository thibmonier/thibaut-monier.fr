import { describe, expect, it } from 'vitest';
import { checkSitemapCoherence } from '../../../scripts/checks/lib/sitemap-coherence.ts';
import { distWith, page } from './dist-helper.ts';

const urlset = (...paths: string[]) =>
  `<?xml version="1.0"?><urlset>${paths.map((p) => `<url><loc>https://x.fr${p}</loc></url>`).join('')}</urlset>`;
const index =
  '<?xml version="1.0"?><sitemapindex><sitemap><loc>https://x.fr/sitemap-0.xml</loc></sitemap></sitemapindex>';

describe('checkSitemapCoherence', () => {
  it('accepte un sitemap qui liste exactement les pages indexables', async () => {
    const dist = await distWith({
      'sitemap-index.xml': index,
      'sitemap-0.xml': urlset('/', '/contact/'),
      'index.html': page(),
      'contact/index.html': page({ title: 'Contact' }),
      'contact/merci/index.html': page({ robots: 'noindex' }),
      '404.html': page(),
    });
    expect(await checkSitemapCoherence(dist)).toEqual([]);
  });

  it('signale une page noindex présente dans le sitemap', async () => {
    const dist = await distWith({
      'sitemap-index.xml': index,
      'sitemap-0.xml': urlset('/', '/contact/merci/'),
      'index.html': page(),
      'contact/merci/index.html': page({ robots: 'noindex' }),
    });
    expect(await checkSitemapCoherence(dist)).toEqual([
      'Page noindex présente dans le sitemap : /contact/merci/',
    ]);
  });

  it('signale une page indexable absente du sitemap', async () => {
    const dist = await distWith({
      'sitemap-index.xml': index,
      'sitemap-0.xml': urlset('/'),
      'index.html': page(),
      'parcours/index.html': page(),
    });
    expect(await checkSitemapCoherence(dist)).toEqual([
      'Page indexable absente du sitemap : /parcours/',
    ]);
  });

  it('signale une entrée du sitemap sans page, et un sitemap absent', async () => {
    const dist = await distWith({
      'sitemap-index.xml': index,
      'sitemap-0.xml': urlset('/fantome/'),
      'index.html': page(),
    });
    expect(await checkSitemapCoherence(dist)).toContain('Entrée du sitemap sans page : /fantome/');
    const empty = await distWith({ 'index.html': page() });
    expect(await checkSitemapCoherence(empty)).toEqual(['sitemap-index.xml absent de dist/']);
  });
});
