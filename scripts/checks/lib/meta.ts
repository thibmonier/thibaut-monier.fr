import { extractMeta, readPages } from './html-meta.ts';

export const MAX_TITLE = 60;
export const MIN_DESCRIPTION = 50;
export const MAX_DESCRIPTION = 160;

export interface MetaOptions {
  /** Tant que les articles du blog ne sont pas relus (`seoTitle`), contrôler seulement les autres pages. */
  excludeBlog?: boolean;
}

// `<title>` ≤ 60 caractères, description de 50 à 160, titres et descriptions uniques sur le site.
// Les pages `noindex` sont ignorées (la page de confirmation n'a pas à être unique).
export async function checkMeta(distDir: string, options: MetaOptions = {}): Promise<string[]> {
  const errors: string[] = [];
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  for (const { route, html } of await readPages(distDir)) {
    if (options.excludeBlog && route.startsWith('/blog/')) continue;
    const meta = extractMeta(html);
    if (meta.noindex) continue;

    if (!meta.title) errors.push(`Titre absent : ${route}`);
    else {
      if (meta.title.length > MAX_TITLE)
        errors.push(`Titre trop long (${meta.title.length} > ${MAX_TITLE}) : ${route}`);
      const first = titles.get(meta.title);
      if (first) errors.push(`Titre en double : ${route} (déjà utilisé par ${first})`);
      else titles.set(meta.title, route);
    }

    const description = meta.description;
    if (!description) errors.push(`Description absente : ${route}`);
    else {
      if (description.length < MIN_DESCRIPTION)
        errors.push(
          `Description trop courte (${description.length} < ${MIN_DESCRIPTION}) : ${route}`,
        );
      if (description.length > MAX_DESCRIPTION)
        errors.push(
          `Description trop longue (${description.length} > ${MAX_DESCRIPTION}) : ${route}`,
        );
      const first = descriptions.get(description);
      if (first) errors.push(`Description en double : ${route} (déjà utilisée par ${first})`);
      else descriptions.set(description, route);
    }
  }
  return errors;
}
