import type { APIRequestContext } from '@playwright/test';

const HREF = /<a\b[^>]*\shref=["']([^"'#?]+)(?:[#?][^"']*)?["']/gi;

// Parcours en largeur des liens internes à partir de `/` : aucune liste de pages à maintenir.
export async function discoverRoutes(
  request: APIRequestContext,
  baseURL: string,
): Promise<string[]> {
  const origin = new URL(baseURL).origin;
  const seen = new Set<string>(['/']);
  const queue = ['/'];

  while (queue.length > 0) {
    const route = queue.shift() as string;
    const response = await request.get(route);
    if (!response.ok() || !(response.headers()['content-type'] ?? '').includes('text/html'))
      continue;
    const html = await response.text();
    for (const match of html.matchAll(HREF)) {
      const url = new URL(match[1] as string, new URL(route, origin));
      const path = url.pathname;
      if (url.origin !== origin || seen.has(path) || !path.endsWith('/')) continue;
      seen.add(path);
      queue.push(path);
    }
  }
  return [...seen].sort();
}
