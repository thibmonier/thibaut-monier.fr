import { describe, expect, it } from 'vitest';
import { checkMeta } from '../../../scripts/checks/lib/meta.ts';
import { extractJsonLd, extractMeta } from '../../../scripts/checks/lib/html-meta.ts';
import { distWith, page } from './dist-helper.ts';

describe('extractMeta', () => {
  it('lit titre, description et robots en décodant les entités', () => {
    const meta = extractMeta(
      page({
        title: 'L&#39;agence &amp; moi',
        description: 'Une &quot;citation&quot; assez longue pour la description',
        robots: 'noindex',
      }),
    );
    expect(meta.title).toBe("L'agence & moi");
    expect(meta.description).toBe('Une "citation" assez longue pour la description');
    expect(meta.noindex).toBe(true);
  });

  it('renvoie les blocs JSON-LD bruts', () => {
    expect(extractJsonLd(page({ jsonLd: [{ a: 1 }, { b: 2 }] }))).toEqual(['{"a":1}', '{"b":2}']);
  });
});

describe('checkMeta', () => {
  const long = 'x'.repeat(61);

  it('accepte des métadonnées dans les limites', async () => {
    const dist = await distWith({
      'a/index.html': page(),
      'b/index.html': page({
        title: 'Autre titre',
        description: 'Une autre description de page, assez longue pour la limite basse.',
      }),
    });
    expect(await checkMeta(dist)).toEqual([]);
  });

  it('signale un titre de 61 caractères avec la page et la valeur', async () => {
    const dist = await distWith({ 'blog/x/index.html': page({ title: long }) });
    expect(await checkMeta(dist)).toEqual(['Titre trop long (61 > 60) : /blog/x/']);
  });

  it('borne la description entre 50 et 160 caractères', async () => {
    const dist = await distWith({
      'a/index.html': page({ description: 'x'.repeat(49) }),
      'b/index.html': page({ title: 'B', description: 'y'.repeat(161) }),
    });
    expect(await checkMeta(dist)).toEqual([
      'Description trop courte (49 < 50) : /a/',
      'Description trop longue (161 > 160) : /b/',
    ]);
  });

  it('signale les doublons de titre et de description', async () => {
    const dist = await distWith({ 'a/index.html': page(), 'b/index.html': page() });
    expect(await checkMeta(dist)).toEqual([
      'Titre en double : /b/ (déjà utilisé par /a/)',
      'Description en double : /b/ (déjà utilisée par /a/)',
    ]);
  });

  it('exclut les pages noindex de l’unicité et signale une description absente', async () => {
    const dist = await distWith({
      'a/index.html': page(),
      'merci/index.html': page({ robots: 'noindex' }),
      'c/index.html': '<html><head><title>C</title></head></html>',
    });
    expect(await checkMeta(dist)).toEqual(['Description absente : /c/']);
  });

  it('peut exclure le blog tant que ses articles ne sont pas relus', async () => {
    const dist = await distWith({ 'blog/x/index.html': page({ title: long }) });
    expect(await checkMeta(dist, { excludeBlog: true })).toEqual([]);
  });
});
