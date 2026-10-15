import { readFile } from 'node:fs/promises';
import { dirname, relative, sep } from 'node:path';
import { originOf } from '../../../src/lib/site-url.ts';
import { walk } from './fs.ts';

// Contrôle de la balise canonical (US-010) : une seule, absolue, autoréférente, sur l'origine du site.
// Les pages noindex n'en portent aucune (comportement de `Seo.astro`).

const attribute = (tag: string, name: string): string | undefined =>
  new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i')
    .exec(tag)
    ?.slice(1)
    .find((v) => v !== undefined);

export function extractCanonicals(html: string): string[] {
  return [...html.matchAll(/<link\b[^>]*>/gi)].flatMap(([tag]) =>
    attribute(tag, 'rel')?.toLowerCase() === 'canonical' ? [attribute(tag, 'href') ?? ''] : [],
  );
}

export function isNoindex(html: string): boolean {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some(
    ([tag]) =>
      attribute(tag, 'name')?.toLowerCase() === 'robots' &&
      /noindex/i.test(attribute(tag, 'content') ?? ''),
  );
}

/** Site par défaut déclaré dans `astro.config.mjs` (`process.env.PUBLIC_SITE_URL || '<site>'`). */
export function defaultSite(configText: string): string {
  const site = /process\.env\.PUBLIC_SITE_URL\s*\|\|\s*['"]([^'"]+)['"]/.exec(configText)?.[1];
  if (site === undefined) throw new Error('Site par défaut introuvable dans astro.config.mjs');
  return site;
}

/** Même règle que la configuration d'Astro : `PUBLIC_SITE_URL` vide ou absente = site par défaut. */
export function expectedOrigin(env: { PUBLIC_SITE_URL?: string }, fallback: string): string {
  return originOf(env.PUBLIC_SITE_URL || fallback);
}

export async function pageRoutes(distDir: string): Promise<{ route: string; file: string }[]> {
  return (await walk(distDir))
    .filter((file) => file.endsWith(`${sep}index.html`))
    .map((file) => {
      const folder = relative(distDir, dirname(file)).split(sep).join('/');
      return { route: folder === '' ? '/' : `/${folder}/`, file };
    });
}

export async function checkCanonicals(distDir: string, origin: string): Promise<string[]> {
  const errors: string[] = [];
  for (const { route, file } of await pageRoutes(distDir)) {
    const html = await readFile(file, 'utf8');
    const found = extractCanonicals(html);
    if (isNoindex(html)) {
      if (found.length > 0) errors.push(`${route} : page noindex avec une balise canonical`);
      continue;
    }
    const expected = `(attendu ${origin}/…)`;
    if (found.length === 0) {
      errors.push(`${route} : Canonical invalide : aucune balise ${expected}`);
    } else if (found.length > 1) {
      errors.push(
        `${route} : Canonical invalide : ${found.length} balises (${found.join(', ')}) ${expected}`,
      );
    } else if (found[0] !== `${origin}${route}`) {
      errors.push(`${route} : Canonical invalide : ${found[0]} ${expected}`);
    }
  }
  return errors;
}
