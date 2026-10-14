// Logique du contrôle de fumée post-déploiement (T-001-15). `fetch` est injectable pour les tests.
export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export const OK_PATHS = [
  '/',
  '/parcours/',
  '/contact/',
  '/mentions-legales/',
  '/competences/',
  '/open-source/',
  '/open-source/career-ops/',
  '/open-source/tailsfadmin/',
] as const;
export const UNKNOWN_PATH = '/__smoke-introuvable__/';

// En-têtes dont la simple présence est exigée (valeurs détaillées : tests e2e `headers.spec.ts`).
const REQUIRED_HEADERS = ['content-security-policy', 'strict-transport-security'] as const;

export function normalizeBaseUrl(raw: string): string {
  const url = new URL(raw);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Protocole non pris en charge : ${url.protocol}`);
  }
  return url.origin;
}

export function checkSecurityHeaders(path: string, headers: Headers): string[] {
  const errors = REQUIRED_HEADERS.filter((name) => !headers.get(name)).map(
    (name) => `${path} : en-tête ${name} absent`,
  );
  if (headers.get('x-content-type-options')?.toLowerCase() !== 'nosniff') {
    errors.push(`${path} : en-tête x-content-type-options: nosniff absent`);
  }
  return errors;
}

async function expectStatus(
  fetchFn: FetchLike,
  baseUrl: string,
  path: string,
  expected: number,
  init: RequestInit = {},
): Promise<string[]> {
  const method = init.method ?? 'GET';
  try {
    const response = await fetchFn(baseUrl + path, { redirect: 'manual', ...init });
    const errors =
      response.status === expected
        ? []
        : [`${method} ${path} : statut ${response.status}, attendu ${expected}`];
    // Les en-têtes sont contrôlés sur chaque réponse attendue (y compris le 404 et le 405).
    return [...errors, ...checkSecurityHeaders(`${method} ${path}`, response.headers)];
  } catch (error) {
    return [`${method} ${path} : requête impossible (${(error as Error).message})`];
  }
}

export async function runSmoke(rawUrl: string, fetchFn: FetchLike = fetch): Promise<string[]> {
  const baseUrl = normalizeBaseUrl(rawUrl);
  const results = await Promise.all([
    ...OK_PATHS.map((path) => expectStatus(fetchFn, baseUrl, path, 200)),
    expectStatus(fetchFn, baseUrl, UNKNOWN_PATH, 404),
    expectStatus(fetchFn, baseUrl, '/', 405, { method: 'POST', body: 'x' }),
  ]);
  return results.flat();
}
