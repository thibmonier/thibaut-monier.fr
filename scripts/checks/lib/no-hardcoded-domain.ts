export interface SourceFile {
  path: string;
  content: string;
}

// Le domaine du site ne s'écrit nulle part dans `src/` : l'origine vient de `site` (PUBLIC_SITE_URL, C4).
// Seuls `astro.config.mjs` (valeur de repli) et une liste blanche motivée (préfixes de chemins) le contiennent.
export function findHardcodedDomain(
  files: SourceFile[],
  domain: string,
  allowedPrefixes: string[],
): string[] {
  const escaped = domain.replace(/[.\\^$*+?()[\]{}|]/g, '\\$&');
  const pattern = new RegExp(`(?<![\\w.-])${escaped}`, 'i');
  const errors: string[] = [];
  for (const file of files) {
    if (file.path === 'astro.config.mjs' || allowedPrefixes.some((p) => file.path.startsWith(p)))
      continue;
    file.content.split('\n').forEach((line, index) => {
      if (pattern.test(line)) {
        errors.push(
          `Domaine du site en dur : ${file.path}:${index + 1} (utiliser absoluteUrl de src/lib/site-url.ts)`,
        );
      }
    });
  }
  return errors;
}
