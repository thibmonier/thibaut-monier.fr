// Logique pure du catalogue des plugins Sylius (US-019) : regroupement, filtre par thème, recherche.
export const THEMES = ['b2b', 'conformite-ue', 'back-office', 'ia-integrations'] as const;
export type PluginTheme = (typeof THEMES)[number];

export const THEME_LABELS: Record<PluginTheme, string> = {
  b2b: 'B2B',
  'conformite-ue': 'Conformité UE',
  'back-office': 'Back-office',
  'ia-integrations': 'IA et intégrations',
};

export interface PluginLike {
  slug: string;
  name: string;
  tagline: string;
  theme: PluginTheme;
}

export interface ThemeGroup<T extends PluginLike> {
  theme: PluginTheme;
  label: string;
  plugins: T[];
}

export function groupByTheme<T extends PluginLike>(plugins: readonly T[]): ThemeGroup<T>[] {
  return THEMES.map((theme) => ({
    theme,
    label: THEME_LABELS[theme],
    plugins: plugins
      .filter((p) => p.theme === theme)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  }));
}

export function themeCounts(plugins: readonly PluginLike[]): Record<PluginTheme, number> {
  const counts = Object.fromEntries(THEMES.map((theme) => [theme, 0])) as Record<
    PluginTheme,
    number
  >;
  for (const plugin of plugins) counts[plugin.theme] += 1;
  return counts;
}

export function parseThemeParam(search: string): PluginTheme | null {
  const value = new URLSearchParams(search).get('theme');
  return THEMES.find((theme) => theme === value) ?? null;
}

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export interface SearchEntry {
  id: string;
  name: string;
  tagline: string;
  extra: string;
}

export function buildSearchEntry(input: {
  id: string;
  name: string;
  tagline: string;
  keywords: readonly string[];
}): SearchEntry {
  return {
    id: input.id,
    name: normalize(input.name),
    tagline: normalize(input.tagline),
    extra: normalize(input.keywords.join(' ')),
  };
}

const NAME_WEIGHT = 100;
const TAGLINE_WEIGHT = 40;
const EXTRA_WEIGHT = 10;

function scoreToken(entry: SearchEntry, token: string): number {
  if (entry.name.includes(token)) return NAME_WEIGHT;
  if (entry.tagline.includes(token)) return TAGLINE_WEIGHT;
  return entry.extra.includes(token) ? EXTRA_WEIGHT : 0;
}

// Identifiants classés par pertinence ; tous les mots doivent correspondre ; requête vide = tout.
export function searchPlugins(entries: readonly SearchEntry[], query: string): string[] {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return entries.map((e) => e.id);
  return entries
    .map((entry, index) => {
      const scores = tokens.map((token) => scoreToken(entry, token));
      return {
        id: entry.id,
        index,
        score: scores.includes(0) ? 0 : scores.reduce((a, b) => a + b),
      };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((hit) => hit.id);
}

export const countLabel = (count: number): string => `${count} plugin${count > 1 ? 's' : ''}`;

export const noResultMessage = (query: string): string =>
  `Aucun plugin ne correspond à « ${query.trim()} ». Essayez un autre mot-clé ou parcourez les ${THEMES.length} thèmes.`;

export function syliusVersions<T extends { sylius: string }>(matrix: readonly T[]): string[] {
  return [...new Set(matrix.map((row) => row.sylius))];
}

const FIELD_LABELS: Record<string, string> = {
  name: 'nom',
  tagline: 'accroche',
  theme: 'thème',
  repo: 'dépôt',
  packagist: 'paquet',
  features: 'fonctionnalités',
  compatibility: 'compatibilité',
  screenshots: 'captures',
  installSteps: 'installation',
  status: 'statut',
  inDemo: 'démo',
  configExcerpt: 'extrait de configuration',
};

// « Plugin « slug » invalide : compatibilité.php est requis »
export function formatPluginIssue(
  slug: string,
  issue: { path: readonly PropertyKey[]; message: string },
): string {
  const segments = issue.path.filter((s) => typeof s === 'string' && s !== 'matrix').map(String);
  const [first = '', ...rest] = segments;
  const field = [FIELD_LABELS[first] ?? first, ...rest].join('.');
  return `Plugin « ${slug} » invalide : ${field ? `${field} ` : ''}${issue.message}`;
}

// Découpe un texte en segments « code » (entre accents graves) et texte ordinaire.
export function splitInlineCode(text: string): { code: boolean; text: string }[] {
  return text
    .split('`')
    .map((part, index) => ({ code: index % 2 === 1, text: part }))
    .filter((segment) => segment.text !== '');
}
