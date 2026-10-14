import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import {
  checkExternalLinks,
  extractLinks,
  findBrokenInternalLinks,
} from '../../../scripts/checks/lib/links.ts';

const fixtures = resolve(import.meta.dirname, '../../fixtures');

describe('extractLinks', () => {
  it('extrait href et ids', () => {
    const { hrefs, ids } = extractLinks('<h1 id="a"><a href="/x/">x</a><a href=\'/y/\'>y</a>');
    expect(hrefs).toEqual(['/x/', '/y/']);
    expect(ids).toEqual(['a']);
  });
});

describe('findBrokenInternalLinks', () => {
  it('ne signale rien sur un dist valide (mailto, externe et assets ignorés)', async () => {
    expect(await findBrokenInternalLinks(resolve(fixtures, 'dist-ok'))).toEqual([]);
  });

  it('détecte un lien interne cassé et une ancre manquante', async () => {
    const broken = await findBrokenInternalLinks(resolve(fixtures, 'dist-broken'));
    const messages = broken.map((b) => b.message);
    expect(messages).toContain('/index.html : lien interne cassé « /absente/ »');
    expect(messages).toContain('/index.html : ancre manquante « /#manquante »');
  });
});

describe('checkExternalLinks', () => {
  it('produit un avertissement (jamais une erreur) sur 503', async () => {
    const fetcher = async () => ({ status: 503 });
    const warnings = await checkExternalLinks(['https://example.com/a'], fetcher);
    expect(warnings).toEqual(['Lien externe indisponible (503) : https://example.com/a']);
  });

  it('produit un avertissement sur erreur réseau', async () => {
    const fetcher = async () => {
      throw new Error('timeout');
    };
    const warnings = await checkExternalLinks(['https://example.com/a'], fetcher);
    expect(warnings).toEqual(['Lien externe injoignable (timeout) : https://example.com/a']);
  });

  it('ne dit rien si le lien répond 200', async () => {
    expect(
      await checkExternalLinks(['https://example.com'], async () => ({ status: 200 })),
    ).toEqual([]);
  });
});
