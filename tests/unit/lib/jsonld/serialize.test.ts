import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from '../../../../src/lib/jsonld/index.ts';

describe('serializeJsonLd', () => {
  it('ajoute le contexte schema.org et produit un JSON par objet', () => {
    const [json] = serializeJsonLd([{ '@type': 'Person', name: 'T' }]);
    expect(JSON.parse(json as string)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'T',
    });
  });

  it('ne laisse jamais fermer la balise script (injection)', () => {
    const [json] = serializeJsonLd([
      { '@type': 'Thing', name: '</script><script>alert(1)</script> & <b>' },
    ]);
    expect(json).not.toContain('<');
    expect(json).not.toContain('>');
    expect(json).not.toContain('&');
    expect(JSON.parse(json as string).name).toBe('</script><script>alert(1)</script> & <b>');
  });

  it('ignore les objets nuls', () => {
    expect(serializeJsonLd([null, { '@type': 'Thing' }])).toHaveLength(1);
  });
});
