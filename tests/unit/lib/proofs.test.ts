import { describe, expect, it } from 'vitest';
import {
  PROOF_COUNT,
  isWellFormedProofLink,
  validateProofs,
  type ProofRef,
} from '../../../src/lib/proofs.ts';

const routes = new Set(['/', '/parcours/', '/contact/']);

const four: ProofRef[] = [
  { id: 'plugins', link: 'https://github.com/thibmonier' },
  { id: 'career-ops', link: 'https://github.com/career-ops-hq/career-ops/pulls?q=is%3Amerged' },
  { id: 'erp', link: '/parcours/' },
  { id: 'experience', link: '/parcours/#exp' },
];

describe('isWellFormedProofLink', () => {
  it.each(['/parcours/', '/parcours/#ancre', 'https://github.com/thibmonier'])(
    'accepte %s',
    (link) => expect(isWellFormedProofLink(link)).toBe(true),
  );

  it.each(['http://example.org', 'parcours/', '', 'ftp://example.org', 'https://', '//evil.org/'])(
    'rejette « %s »',
    (link) => expect(isWellFormedProofLink(link)).toBe(false),
  );
});

describe('validateProofs', () => {
  it('exige exactement 4 preuves', () => {
    expect(PROOF_COUNT).toBe(4);
    expect(validateProofs(four.slice(0, 3), routes)).toEqual([
      'Il faut exactement 4 preuves (reçu : 3)',
    ]);
  });

  it('accepte 4 preuves aux liens valides', () => {
    expect(validateProofs(four, routes)).toEqual([]);
  });

  it('rejette un lien interne vers une route inconnue avec son identifiant', () => {
    const broken = four.map((p) => (p.id === 'erp' ? { ...p, link: '/inexistant/' } : p));
    expect(validateProofs(broken, routes)).toEqual(['Lien de preuve invalide : erp']);
  });

  it('ignore la requête et l’ancre pour retrouver la route', () => {
    const withQuery = four.map((p) =>
      p.id === 'erp' ? { ...p, link: '/contact/?motif=poste' } : p,
    );
    expect(validateProofs(withQuery, routes)).toEqual([]);
  });

  it('rejette un lien externe qui n’est pas en https', () => {
    const http = four.map((p) => (p.id === 'plugins' ? { ...p, link: 'http://github.com/x' } : p));
    expect(validateProofs(http, routes)).toEqual(['Lien de preuve invalide : plugins']);
  });

  it('signale toutes les preuves invalides', () => {
    const bad = four.map((p) => ({ ...p, link: '/nope/' }));
    expect(validateProofs(bad, routes)).toHaveLength(4);
  });
});
