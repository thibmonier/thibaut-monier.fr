import { describe, expect, it } from 'vitest';
import {
  DEBOUNCE_MS,
  UNAVAILABLE_MESSAGE,
  cleanExcerpt,
  countMessage,
  createDebouncer,
  emptyMessage,
  isRelevant,
  moveSelection,
  searchReducer,
  toResult,
  type SearchState,
} from '../../../src/lib/search.ts';

describe('cleanExcerpt', () => {
  it('conserve uniquement les balises mark', () => {
    expect(cleanExcerpt('Les <mark>tokens</mark> coûtent cher')).toBe(
      'Les <mark>tokens</mark> coûtent cher',
    );
  });

  it('échappe tout le reste, extrait hostile compris', () => {
    const hostile =
      '<mark onmouseover="alert(1)">a</mark><img src=x onerror=alert(1)><script>alert(2)</script> & "fin"';
    const out = cleanExcerpt(hostile);
    expect(out).not.toContain('<img');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('onmouseover="');
    expect(out).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(out).toContain('&amp; &quot;fin&quot;');
  });

  it('ne double-échappe pas un extrait déjà encodé', () => {
    expect(cleanExcerpt('R&amp;D et &lt;b&gt; <mark>x</mark>')).toBe(
      'R&amp;D et &lt;b&gt; <mark>x</mark>',
    );
  });
});

describe('cleanExcerpt : entités de Pagefind', () => {
  it("décode l'apostrophe numérique (&#x27; et &#39;) et l'espace insécable (&nbsp;)", () => {
    expect(cleanExcerpt('l&#x27;<mark>agent</mark> d&#39;IA&nbsp;: oui')).toBe(
      "l'<mark>agent</mark> d'IA : oui",
    );
  });

  it('un caractère dangereux encodé en numérique reste échappé', () => {
    expect(cleanExcerpt('&#x3C;img src=x&#62;')).toBe('&lt;img src=x&gt;');
  });

  it('laisse (échappée) une entité numérique hors plage', () => {
    expect(cleanExcerpt('a&#x110000;b')).toBe('a&amp;#x110000;b');
  });
});

describe('toResult', () => {
  it('convertit un résultat Pagefind en url, titre, extrait nettoyé et catégorie', () => {
    expect(
      toResult({
        url: '/blog/la-spec/',
        excerpt: 'Un <mark>mot</mark>',
        meta: { title: 'La spec', category: 'Méthode' },
      }),
    ).toEqual({
      url: '/blog/la-spec/',
      title: 'La spec',
      excerptHtml: 'Un <mark>mot</mark>',
      category: 'Méthode',
    });
  });

  it('retombe sur l’adresse sans titre et sur une catégorie vide', () => {
    expect(toResult({ url: '/blog/x/', excerpt: '', meta: {} })).toMatchObject({
      title: '/blog/x/',
      category: '',
    });
  });

  it('refuse une adresse qui n’est pas un chemin du site', () => {
    expect(() => toResult({ url: 'https://exemple.test/', excerpt: '', meta: {} })).toThrow(
      'Adresse de résultat invalide',
    );
    expect(() => toResult({ url: '//exemple.test/', excerpt: '', meta: {} })).toThrow();
  });
});

describe('createDebouncer', () => {
  function fakeClock() {
    let now = 0;
    let next = 1;
    const timers = new Map<number, { at: number; run: () => void }>();
    return {
      setTimeout: (run: () => void, delay: number) => {
        timers.set(next, { at: now + delay, run });
        return next++;
      },
      clearTimeout: (id: number) => void timers.delete(id),
      advance(ms: number) {
        now += ms;
        for (const [id, timer] of [...timers]) {
          if (timer.at <= now) {
            timers.delete(id);
            timer.run();
          }
        }
      },
    };
  }

  it('attend 150 ms après la dernière frappe (critère : moins de 300 ms)', () => {
    expect(DEBOUNCE_MS).toBe(150);
    const clock = fakeClock();
    const calls: string[] = [];
    const schedule = createDebouncer((value: string) => calls.push(value), DEBOUNCE_MS, clock);
    schedule('t');
    clock.advance(100);
    schedule('to');
    clock.advance(100);
    expect(calls).toEqual([]);
    clock.advance(50);
    expect(calls).toEqual(['to']);
  });

  it('ne déclenche rien après une annulation', () => {
    const clock = fakeClock();
    const calls: string[] = [];
    const schedule = createDebouncer((value: string) => calls.push(value), DEBOUNCE_MS, clock);
    schedule('a');
    schedule.cancel();
    clock.advance(1000);
    expect(calls).toEqual([]);
  });
});

describe('searchReducer', () => {
  const idle: SearchState = { kind: 'idle' };

  it('une saisie non vide passe de idle à loading, une saisie vide revient à idle', () => {
    expect(searchReducer(idle, { type: 'input', query: 'tokens' })).toEqual({
      kind: 'loading',
      query: 'tokens',
    });
    expect(searchReducer({ kind: 'loading', query: 'a' }, { type: 'input', query: '  ' })).toEqual(
      idle,
    );
  });

  it('les résultats mènent à results, une liste vide à empty avec la requête', () => {
    const loading: SearchState = { kind: 'loading', query: 'zzzzqq' };
    expect(searchReducer(loading, { type: 'results', results: [] })).toEqual({
      kind: 'empty',
      query: 'zzzzqq',
    });
    const result = { url: '/blog/x/', title: 'X', excerptHtml: '', category: '' };
    expect(searchReducer(loading, { type: 'results', results: [result] })).toEqual({
      kind: 'results',
      query: 'zzzzqq',
      results: [result],
    });
  });

  it('un échec de chargement mène à unavailable, et une nouvelle saisie ne le masque pas', () => {
    const failed = searchReducer({ kind: 'loading', query: 'a' }, { type: 'failure' });
    expect(failed).toEqual({ kind: 'unavailable' });
    expect(searchReducer(failed, { type: 'input', query: 'b' })).toEqual({ kind: 'unavailable' });
  });

  it('ignore des résultats tardifs hors d’une recherche en cours', () => {
    expect(searchReducer(idle, { type: 'results', results: [] })).toEqual(idle);
  });
});

describe('messages', () => {
  it('message exact quand il n’y a aucun résultat', () => {
    expect(emptyMessage('zzzzqq')).toBe(
      'Aucun résultat pour « zzzzqq ». Essayez un autre mot ou parcourez les catégories.',
    );
  });

  it('message exact quand la recherche est indisponible', () => {
    expect(UNAVAILABLE_MESSAGE).toBe('La recherche est momentanément indisponible.');
  });

  it('annonce le nombre de résultats au singulier et au pluriel', () => {
    expect(countMessage(1)).toBe('1 résultat');
    expect(countMessage(12)).toBe('12 résultats');
  });
});

describe('moveSelection', () => {
  it('descend depuis le champ, puis reste sur le dernier résultat', () => {
    expect(moveSelection(-1, 'ArrowDown', 3)).toBe(0);
    expect(moveSelection(1, 'ArrowDown', 3)).toBe(2);
    expect(moveSelection(2, 'ArrowDown', 3)).toBe(2);
  });

  it('remonte, puis revient au champ depuis le premier résultat', () => {
    expect(moveSelection(2, 'ArrowUp', 3)).toBe(1);
    expect(moveSelection(0, 'ArrowUp', 3)).toBe(-1);
    expect(moveSelection(-1, 'ArrowUp', 3)).toBe(-1);
  });

  it('ne bouge pas sans résultat', () => {
    expect(moveSelection(-1, 'ArrowDown', 0)).toBe(-1);
  });
});

describe('isRelevant', () => {
  // Pagefind tolère les approximations : « zzzzqq » ramène une page dont l'extrait surligne seulement « Z ».
  it('refuse un résultat dont le mot surligné ne ressemble pas à la requête', () => {
    expect(isRelevant('colonnes X, Y, <mark>Z</mark> dans cet ordre', 'zzzzqq')).toBe(false);
    expect(isRelevant('un extrait sans surlignage', 'tokens')).toBe(false);
  });

  it('accepte un mot surligné qui partage le début de la requête, accents et casse ignorés', () => {
    expect(isRelevant('Le <mark>token</mark> coûte', 'tokens')).toBe(true);
    expect(isRelevant('La <mark>Méthode</mark> SDD', 'methode')).toBe(true);
    expect(isRelevant('Des <mark>méthodes</mark> agiles', 'METHODE')).toBe(true);
  });

  it('accepte une requête courte qui correspond à un mot court', () => {
    expect(isRelevant('de <mark>IA</mark> générative', 'ia')).toBe(true);
    expect(isRelevant('colonnes <mark>Z</mark>', 'z')).toBe(true);
  });

  it('une requête de plusieurs mots est pertinente si l’un des mots l’est', () => {
    expect(isRelevant('<mark>coût</mark> des agents', 'cout token')).toBe(true);
  });
});
