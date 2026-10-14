import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import {
  checkSecurityHeaders,
  OK_PATHS,
  normalizeBaseUrl,
  runSmoke,
  type FetchLike,
} from '../../../scripts/checks/lib/smoke.ts';

const SECURE = {
  'content-security-policy': "default-src 'none'",
  'strict-transport-security': 'max-age=63072000',
  'x-content-type-options': 'nosniff',
};

// Site factice : 200 sur les pages connues, 404 ailleurs, 405 hors GET/HEAD ; options pour dégrader.
function fakeSite(options: { headers?: Record<string, string>; softNotFound?: boolean } = {}) {
  const headers = options.headers ?? SECURE;
  const known = new Set<string>(OK_PATHS);
  const fetchFn: FetchLike = async (url, init) => {
    const { pathname } = new URL(url);
    const method = init?.method ?? 'GET';
    let status = 404;
    if (method !== 'GET' && method !== 'HEAD') status = 405;
    else if (known.has(pathname) || options.softNotFound) status = 200;
    return new Response('x', { status, headers });
  };
  return fetchFn;
}

describe('normalizeBaseUrl', () => {
  it("garde l'origine seule", () => {
    expect(normalizeBaseUrl('https://exemple.fr/chemin/?q=1')).toBe('https://exemple.fr');
  });
  it('refuse un protocole non http(s)', () => {
    expect(() => normalizeBaseUrl('ftp://exemple.fr')).toThrow(/Protocole/);
  });
  it('refuse une URL invalide', () => {
    expect(() => normalizeBaseUrl('pas une url')).toThrow();
  });
});

describe('checkSecurityHeaders', () => {
  it('accepte CSP, HSTS et nosniff', () => {
    expect(checkSecurityHeaders('/', new Headers(SECURE))).toEqual([]);
  });
  it("signale chaque en-tête manquant avec le chemin et le nom de l'en-tête", () => {
    expect(checkSecurityHeaders('/', new Headers())).toEqual([
      '/ : en-tête content-security-policy absent',
      '/ : en-tête strict-transport-security absent',
      '/ : en-tête x-content-type-options: nosniff absent',
    ]);
  });
});

describe('runSmoke', () => {
  it('passe sur un site conforme', async () => {
    expect(await runSmoke('http://localhost:8080', fakeSite())).toEqual([]);
  });
  it('couvre le hub open source, les deux projets et les compétences', () => {
    expect(OK_PATHS).toEqual(
      expect.arrayContaining([
        '/competences/',
        '/open-source/',
        '/open-source/career-ops/',
        '/open-source/tailsfadmin/',
      ]),
    );
  });
  it('échoue si une page de la vitrine répond 404', async () => {
    const fetchFn: FetchLike = async (url, init) => {
      const { pathname } = new URL(url);
      const status = pathname === '/open-source/career-ops/' ? 404 : 200;
      return new Response('x', { status: init?.method === 'POST' ? 405 : status, headers: SECURE });
    };
    const errors = await runSmoke('http://localhost:8080', fetchFn);
    expect(errors).toContain('GET /open-source/career-ops/ : statut 404, attendu 200');
  });
  it('échoue si la CSP est absente', async () => {
    const { 'content-security-policy': _csp, ...sansCsp } = SECURE;
    const errors = await runSmoke('http://localhost:8080', fakeSite({ headers: sansCsp }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((e) => e.includes('content-security-policy'))).toBe(true);
  });
  it('échoue sur un faux 404 (statut 200)', async () => {
    const errors = await runSmoke('http://localhost:8080', fakeSite({ softNotFound: true }));
    expect(errors).toContain('GET /__smoke-introuvable__/ : statut 200, attendu 404');
  });
  it('échoue si le POST est accepté', async () => {
    const accepting: FetchLike = async () => new Response('x', { status: 200, headers: SECURE });
    const errors = await runSmoke('http://localhost:8080', accepting);
    expect(errors).toContain('POST / : statut 200, attendu 405');
  });
  it('signale une requête impossible sans lever', async () => {
    const down: FetchLike = async () => {
      throw new Error('ECONNREFUSED');
    };
    const errors = await runSmoke('http://localhost:1', down);
    expect(errors).toHaveLength(OK_PATHS.length + 2);
    expect(errors[0]).toContain('ECONNREFUSED');
  });
});

describe('runSmoke contre un vrai serveur HTTP', () => {
  let server: Server | undefined;
  afterEach(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('sort en erreur quand le serveur ne pose aucun en-tête de sécurité', async () => {
    server = createServer((req, res) => {
      res.statusCode =
        req.method === 'GET' ? (req.url === '/__smoke-introuvable__/' ? 404 : 200) : 405;
      res.end('x');
    });
    await new Promise<void>((ready) => server?.listen(0, '127.0.0.1', ready));
    const { port } = server.address() as AddressInfo;
    const errors = await runSmoke(`http://127.0.0.1:${port}`);
    expect(errors.some((e) => e.includes('content-security-policy'))).toBe(true);
  });
});
