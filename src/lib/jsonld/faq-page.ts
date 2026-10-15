import type { JsonLdObject } from './types.ts';

export interface FaqItem {
  question: string;
  answer: string;
}

/** `null` sans FAQ : un `FAQPage` n'existe que si la FAQ est visible sur la page. */
export function buildFaqPage(faq: FaqItem[] | undefined): JsonLdObject | null {
  if (!faq || faq.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
