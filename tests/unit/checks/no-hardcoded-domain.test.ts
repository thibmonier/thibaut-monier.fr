import { describe, expect, it } from 'vitest';
import { findHardcodedDomain } from '../../../scripts/checks/lib/no-hardcoded-domain.ts';

const DOMAIN = 'thibaut-monier.fr';

describe('findHardcodedDomain', () => {
  it('signale le domaine du site écrit en dur, avec fichier et ligne', () => {
    const files = [
      { path: 'src/lib/x.ts', content: "a\nconst u = 'https://thibaut-monier.fr/x';\n" },
    ];
    expect(findHardcodedDomain(files, DOMAIN, [])).toEqual([
      'Domaine du site en dur : src/lib/x.ts:2 (utiliser absoluteUrl de src/lib/site-url.ts)',
    ]);
  });

  it('tolère astro.config.mjs et la liste blanche motivée', () => {
    const files = [
      { path: 'astro.config.mjs', content: "'https://thibaut-monier.fr'" },
      { path: 'src/content/legal/mentions-legales.md', content: 'du site thibaut-monier.fr.' },
    ];
    expect(findHardcodedDomain(files, DOMAIN, ['src/content/legal/'])).toEqual([]);
  });

  it('ne confond pas un autre domaine', () => {
    expect(
      findHardcodedDomain(
        [{ path: 'src/a.ts', content: 'exemple-thibaut-monier.fr.test' }],
        DOMAIN,
        [],
      ),
    ).toEqual([]);
    expect(
      findHardcodedDomain([{ path: 'src/a.ts', content: 'https://exemple.fr' }], DOMAIN, []),
    ).toEqual([]);
  });
});
