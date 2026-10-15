import { describe, expect, it } from 'vitest';
import { buildFaqPage } from '../../../../src/lib/jsonld/faq-page.ts';

describe('buildFaqPage', () => {
  it('ne produit rien sans FAQ', () => {
    expect(buildFaqPage(undefined)).toBeNull();
    expect(buildFaqPage([])).toBeNull();
  });

  it('décrit chaque question et sa réponse', () => {
    const faq = buildFaqPage([{ question: 'Pourquoi ?', answer: 'Parce que.' }]);
    expect(faq).toEqual({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Pourquoi ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Parce que.' },
        },
      ],
    });
  });
});
