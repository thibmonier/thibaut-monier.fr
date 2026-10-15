import { describe, expect, it } from 'vitest';
import { buildLlmsTxt, type LlmsEntry } from '../../../src/lib/llms.ts';

const header = {
  name: 'Thibaut Monier',
  summary: 'Directeur de projets IT et architecte e-commerce.',
};
const entries = (n: number): LlmsEntry[] =>
  Array.from({ length: n }, (_, i) => ({
    section: i < 2 ? 'Profil' : 'Plugins Sylius',
    title: `Page ${i}`,
    path: `/p${i}/`,
    description: `Description ${i}`,
  }));

describe('buildLlmsTxt', () => {
  const text = buildLlmsTxt(entries(12), 'https://thibaut-monier.fr', header);

  it('suit le format llmstxt.org : H1, citation, sections de liens', () => {
    const lines = text.split('\n');
    expect(lines[0]).toBe('# Thibaut Monier');
    expect(lines[2]).toBe('> Directeur de projets IT et architecte e-commerce.');
    expect(text).toContain('\n## Profil\n');
    expect(text).toContain('\n## Plugins Sylius\n');
  });

  it('écrit chaque lien en URL absolue avec sa description', () => {
    expect(text).toContain('- [Page 0](https://thibaut-monier.fr/p0/): Description 0');
    expect(text.match(/^- \[/gm)).toHaveLength(12);
  });

  it('refuse moins de 10 liens', () => {
    expect(() => buildLlmsTxt(entries(9), 'https://thibaut-monier.fr', header)).toThrow(
      'llms.txt : au moins 10 liens attendus (9 fournis)',
    );
  });

  it('garde l’ordre des sections tel que fourni', () => {
    expect(text.indexOf('## Profil')).toBeLessThan(text.indexOf('## Plugins Sylius'));
  });
});
