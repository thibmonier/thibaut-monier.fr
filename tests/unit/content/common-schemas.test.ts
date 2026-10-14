import { describe, expect, it } from 'vitest';
import {
  httpsUrl,
  repoRef,
  safeText,
  slug,
  yearMonth,
} from '../../../src/content/schemas/common.ts';

describe('slug', () => {
  it.each(['a', 'mon-slug', 'sylius-2'])('accepte %s', (v) => {
    expect(slug.safeParse(v).success).toBe(true);
  });
  it.each(['Mon-Slug', 'a_b', '-a', 'a-', 'é', 'a--b', ''])('rejette « %s »', (v) => {
    expect(slug.safeParse(v).success).toBe(false);
  });
});

describe('yearMonth', () => {
  it.each(['2024-01', '1999-12'])('accepte %s', (v) => {
    expect(yearMonth.safeParse(v).success).toBe(true);
  });
  it.each(['2024-13', '2024-00', '24-01', '2024-1', '2024/01'])('rejette %s', (v) => {
    expect(yearMonth.safeParse(v).success).toBe(false);
  });
});

describe('httpsUrl', () => {
  it('accepte https', () => {
    expect(httpsUrl.safeParse('https://example.com/a').success).toBe(true);
  });
  it.each(['http://example.com', 'ftp://example.com', 'example.com', 'javascript:alert(1)'])(
    'rejette %s',
    (v) => {
      expect(httpsUrl.safeParse(v).success).toBe(false);
    },
  );
});

describe('repoRef', () => {
  it('accepte owner et name', () => {
    expect(repoRef.safeParse({ owner: 'thibmonier', name: 'repo' }).success).toBe(true);
  });
  it('rejette une clé inconnue ou un champ vide', () => {
    expect(repoRef.safeParse({ owner: 'a', name: 'b', x: 1 }).success).toBe(false);
    expect(repoRef.safeParse({ owner: '', name: 'b' }).success).toBe(false);
  });
});

describe('safeText', () => {
  it('accepte un texte neutre', () => {
    expect(safeText.safeParse("25 ans d'expérience").success).toBe(true);
  });
  it('rejette une donnée personnelle', () => {
    const r = safeText.safeParse('Appelez le 06 12 34 56 78');
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toContain('telephone');
  });
});
