import { canonicalUrl } from './seo.ts';

// Contrat C4 : seul module qui rend un chemin absolu. L'origine vient de `site` dans astro.config.mjs
// (donc de PUBLIC_SITE_URL) ; aucun autre module ne lit la variable. Domaine provisoire (sous-domaine
// Railway) tant que le DNS n'est pas branché : tout est relatif à cette origine (écart E23).

/** Origine (schéma, hôte, port) d'une URL de site ; échoue si elle n'est pas http(s). */
export function originOf(site: string | URL): string {
  let url: URL;
  try {
    url = new URL(site);
  } catch {
    throw new Error(`Origine du site invalide : ${JSON.stringify(String(site))}`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`Origine du site invalide (http ou https attendu) : ${String(site)}`);
  }
  return url.origin;
}

const DEFAULT_SITE = 'https://thibaut-monier.fr';

/** Origine du site lue dans PUBLIC_SITE_URL (astro.config.mjs) ; repli sur le domaine cible si absente. */
export function siteFromEnv(value: string | undefined): string {
  if (value === undefined || value === '') return DEFAULT_SITE;
  try {
    return originOf(value);
  } catch {
    throw new Error(
      `PUBLIC_SITE_URL invalide : ${JSON.stringify(value)} (URL absolue attendue, par exemple ${DEFAULT_SITE})`,
    );
  }
}

/** `'/blog/x/'` devient `'https://<origine>/blog/x/'` ; la barre finale est ajoutée aux pages, jamais aux fichiers. */
export function absoluteUrl(
  path: string,
  // `import.meta.env` n'existe pas dans les scripts Node : ceux-ci passent l'origine explicitement.
  site: string | URL | undefined = import.meta.env?.SITE,
): string {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(
      `Chemin attendu (commençant par une seule barre, sans domaine) : ${JSON.stringify(path)}`,
    );
  }
  if (site === undefined || site === '')
    throw new Error("Origine du site absente (option `site` d'Astro)");
  return canonicalUrl(path, originOf(site));
}
