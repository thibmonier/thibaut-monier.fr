import { readFileSync } from 'node:fs';

// Échantillonnage des gabarits répétés (T-900-12/13, écart E21, contrat C11) : le blog ajoute environ 62 pages
// aux 30 existantes ; axe, la matrice responsive et Lighthouse n'en testent que quelques-unes par famille.
// Toutes les pages uniques restent testées. Les règles sont lues dans tests/e2e/sample-routes.json.
// Dépendance zéro (utilisé par Playwright et par lighthouse.ts) : validation écrite à la main.

export interface Family {
  /** Préfixe de route, commençant et finissant par « / » (ex. `/blog/tag/`). */
  prefix: string;
  /** Pages conservées pour cette famille ; `DEFAULT_MAX` si absent. */
  max?: number;
}

export interface SampleRules {
  families: Family[];
  /** Articles testés (`/blog/<slug>/`) ; liste vide = tous les articles. */
  articles: string[];
  /** Routes toujours conservées ; chacune doit exister dans dist/. */
  include: string[];
}

export const DEFAULT_MAX = 2;
// Segments de `/blog/<segment>/` qui ne sont pas des articles (convention C10).
export const RESERVED_BLOG_SEGMENTS = new Set(['page', 'categorie', 'tag', 'serie']);
const ARTICLE = /^\/blog\/([^/]+)\/$/u;

export function isArticleRoute(route: string): boolean {
  const segment = ARTICLE.exec(route)?.[1];
  return segment !== undefined && !RESERVED_BLOG_SEGMENTS.has(segment);
}

function assertKeys(value: Record<string, unknown>, allowed: string[], where: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`${where} : champ inconnu « ${key} »`);
  }
}

function stringList(value: unknown, field: string): string[] {
  const ok = Array.isArray(value) && value.every((v) => typeof v === 'string' && v.startsWith('/'));
  if (!ok)
    throw new Error(
      `sample-routes : « ${field} » doit être une liste de routes commençant par « / »`,
    );
  return value as string[];
}

export function parseSampleRules(input: unknown): SampleRules {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('sample-routes : objet attendu');
  }
  const raw = input as Record<string, unknown>;
  assertKeys(raw, ['families', 'articles', 'include'], 'sample-routes');
  if (!Array.isArray(raw.families))
    throw new Error('sample-routes : « families » doit être une liste');
  const families = raw.families.map((item: unknown): Family => {
    const family = (item ?? {}) as Record<string, unknown>;
    assertKeys(family, ['prefix', 'max'], 'sample-routes (famille)');
    const { prefix, max } = family;
    if (typeof prefix !== 'string' || !prefix.startsWith('/') || !prefix.endsWith('/')) {
      throw new Error(
        `sample-routes : préfixe invalide ${JSON.stringify(prefix)} (« /… / » attendu)`,
      );
    }
    if (max !== undefined && !(Number.isInteger(max) && (max as number) >= 1)) {
      throw new Error(`sample-routes : « max » doit être un entier ≥ 1 pour ${prefix}`);
    }
    return max === undefined ? { prefix } : { prefix, max: max as number };
  });
  const articles = stringList(raw.articles, 'articles');
  for (const article of articles) {
    const segment = ARTICLE.exec(article)?.[1];
    if (segment === undefined)
      throw new Error(`sample-routes : « articles » : route d'article invalide ${article}`);
    if (RESERVED_BLOG_SEGMENTS.has(segment)) {
      throw new Error(`sample-routes : « articles » : segment réservé ${article}`);
    }
  }
  return { families, articles, include: stringList(raw.include, 'include') };
}

export function loadSampleRules(file: string): SampleRules {
  return parseSampleRules(JSON.parse(readFileSync(file, 'utf8')));
}

function requireRoutes(wanted: string[], routes: Set<string>, label: string): void {
  const missing = wanted.filter((route) => !routes.has(route));
  if (missing.length > 0) {
    throw new Error(`sample-routes : ${label} absent(e)(s) de dist/ : ${missing.join(', ')}`);
  }
}

// Fonction pure : garde toutes les pages uniques, N pages au plus par famille répétée, les articles choisis
// (tous si la liste est vide) et les inclusions explicites.
export function sampleRoutes(routes: string[], rules: SampleRules): string[] {
  const available = new Set(routes);
  requireRoutes(rules.include, available, 'inclusion(s)');
  requireRoutes(rules.articles, available, 'article(s)');

  const dropped = new Set<string>();
  for (const { prefix, max = DEFAULT_MAX } of rules.families) {
    const members = [...available].filter((r) => r.startsWith(prefix) && r !== prefix).sort();
    for (const route of members.slice(max)) dropped.add(route);
  }
  if (rules.articles.length > 0) {
    const picked = new Set(rules.articles);
    for (const route of available) {
      if (isArticleRoute(route) && !picked.has(route)) dropped.add(route);
    }
  }
  for (const route of rules.include) dropped.delete(route);
  return [...available].filter((route) => !dropped.has(route)).sort();
}
