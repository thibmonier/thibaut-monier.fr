import { deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { checkOg, pngSize } from '../../../scripts/checks/lib/og.ts';
import { distWith, page } from './dist-helper.ts';

// PNG minimal : signature + IHDR (largeur, hauteur) + IDAT + IEND ; `pad` ajoute des octets pour le poids.
function png(width: number, height: number, pad = 0): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    return Buffer.concat([length, Buffer.from(type), data, Buffer.alloc(4)]);
  };
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.alloc(8 + pad))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const og = (image = 'https://x.fr/og/a.png') =>
  `<meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Titre">`;

describe('pngSize', () => {
  it('lit les dimensions dans l’en-tête IHDR', () => {
    expect(pngSize(png(1200, 630))).toEqual({ width: 1200, height: 630 });
  });
  it('refuse un fichier qui n’est pas un PNG', () => {
    expect(pngSize(Buffer.from('GIF89a'))).toBeNull();
  });
});

describe('checkOg', () => {
  it('accepte une image PNG de 1200 × 630 et de moins de 300 Ko', async () => {
    const dist = await distWith({
      'a/index.html': page({ head: og() }),
      'og/a.png': png(1200, 630),
    });
    expect(await checkOg(dist)).toEqual({
      errors: [],
      count: 1,
      totalBytes: expect.any(Number),
      heaviest: expect.any(Number),
    });
  });

  it('signale une image de 1200 × 600', async () => {
    const dist = await distWith({
      'a/index.html': page({ head: og() }),
      'og/a.png': png(1200, 600),
    });
    expect((await checkOg(dist)).errors).toEqual([
      'Image Open Graph de 1200 × 600 au lieu de 1200 × 630 : /a/',
    ]);
  });

  it('signale une image de plus de 300 Ko', async () => {
    const big = png(1200, 630, 400_000);
    // Données incompressibles : on remplit avec de l'aléatoire déterministe.
    const noisy = Buffer.concat([big.subarray(0, 33), Buffer.alloc(310_000, 7), big.subarray(33)]);
    const dist = await distWith({ 'a/index.html': page({ head: og() }), 'og/a.png': noisy });
    expect((await checkOg(dist)).errors.join()).toMatch(
      /Image Open Graph trop lourde \(\d+ Ko > 300 Ko\) : \/a\//,
    );
  });

  it('signale une balise manquante', async () => {
    const dist = await distWith({
      'a/index.html': page({ head: '<meta property="og:image" content="https://x.fr/og/a.png">' }),
      'og/a.png': png(1200, 630),
    });
    expect((await checkOg(dist)).errors).toEqual([
      'og:image:width absent : /a/',
      'og:image:height absent : /a/',
      'og:image:alt absent : /a/',
    ]);
  });

  it('signale une image absente de dist/ et une URL relative', async () => {
    const dist = await distWith({
      'a/index.html': page({ head: og('https://x.fr/og/absente.png') }),
      'b/index.html': page({ title: 'B', head: og('/og/a.png') }),
    });
    expect((await checkOg(dist)).errors).toEqual([
      'Image Open Graph introuvable dans dist/ (/og/absente.png) : /a/',
      'og:image doit être une URL absolue (/og/a.png) : /b/',
    ]);
  });

  it('ignore les pages noindex mais pas les autres', async () => {
    const dist = await distWith({ 'merci/index.html': page({ robots: 'noindex' }) });
    expect((await checkOg(dist)).errors).toEqual([]);
    const missing = await distWith({ 'a/index.html': page() });
    expect((await checkOg(missing)).errors).toContain('og:image absent : /a/');
  });

  it('refuse un lien visible vers une image Open Graph', async () => {
    const dist = await distWith({
      'a/index.html': page({ head: og(), body: '<a href="/og/a.png">image</a>' }),
      'og/a.png': png(1200, 630),
    });
    expect((await checkOg(dist)).errors).toEqual([
      'Image Open Graph liée dans le contenu visible : /a/',
    ]);
  });
});
