import { describe, expect, it } from 'vitest';
import { buildTwitterCard } from '../../../src/lib/seo.ts';

describe('buildTwitterCard', () => {
  it('produit la carte grand format avec titre, description et image', () => {
    expect(
      buildTwitterCard({ title: 'T', description: 'D', image: 'https://x.fr/og/a.png' }),
    ).toEqual([
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'T' },
      { name: 'twitter:description', content: 'D' },
      { name: 'twitter:image', content: 'https://x.fr/og/a.png' },
    ]);
  });
});
