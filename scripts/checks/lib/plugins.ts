import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { createPluginSchema } from '../../../src/content/schemas/plugins.ts';
import { findCompatibilityErrors } from '../../../src/lib/compatibility.ts';
import { findDependencyErrors } from '../../../src/lib/plugin-deps.ts';
import { THEMES, formatPluginIssue, type PluginTheme } from '../../../src/lib/plugins.ts';
import { detectPii, formatPiiError } from '../../../src/lib/privacy.ts';

export const EXPECTED_PLUGINS = 24;
export const EXPECTED_THEME_COUNTS: Record<PluginTheme, number> = {
  b2b: 13,
  'conformite-ue': 3,
  'back-office': 5,
  'ia-integrations': 3,
};

const DIR = 'src/content/plugins/fr';
const FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const schema = createPluginSchema(() => z.string());

export function parseFrontmatter(raw: string): { data?: unknown; body: string; error?: string } {
  const match = FRONTMATTER.exec(raw);
  if (!match) return { body: raw, error: 'frontmatter absent' };
  const body = raw.slice(match[0].length);
  try {
    return { data: parse(match[1] ?? ''), body };
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return { body, error: `frontmatter illisible (${reason})` };
  }
}

interface Loaded {
  slug: string;
  theme: PluginTheme;
  requires: string[];
  complements: string[];
  externalRequires: string[];
}

async function checkFile(root: string, name: string, loaded: Loaded[]): Promise<string[]> {
  const prefix = `plugins/fr/${name}`;
  const slug = name.replace(/\.mdx$/, '');
  const errors: string[] = [];
  if (!FILE_NAME.test(name))
    errors.push(`${prefix} : nom de fichier invalide (slug en kebab-case attendu)`);

  const raw = await readFile(join(root, DIR, name), 'utf8');
  for (const type of detectPii(raw)) errors.push(formatPiiError(name, type));

  const { data, error } = parseFrontmatter(raw);
  if (error) return [...errors, `${prefix} : ${error}`];
  const result = schema.safeParse(data);
  if (!result.success) {
    return [
      ...errors,
      ...result.error.issues.map((i) => `${prefix} : ${formatPluginIssue(slug, i)}`),
    ];
  }
  const plugin = result.data;
  for (const message of findCompatibilityErrors(plugin.compatibility?.matrix ?? []))
    errors.push(`${prefix} : compatibilité : ${message}`);
  for (const shot of plugin.screenshots) {
    if (!existsSync(resolve(root, DIR, dirname(shot.src), shot.src.split('/').pop() ?? ''))) {
      errors.push(`${prefix} : capture introuvable « ${shot.src} »`);
    }
  }
  if (!plugin.draft) {
    loaded.push({
      slug,
      theme: plugin.theme,
      requires: plugin.requires,
      complements: plugin.complements,
      externalRequires: plugin.externalRequires,
    });
  }
  return errors;
}

export async function checkPlugins(
  root: string,
  options: { expected?: number; themeCounts?: Record<PluginTheme, number> } = {},
): Promise<string[]> {
  const expected = options.expected ?? EXPECTED_PLUGINS;
  const themeCounts = options.themeCounts ?? EXPECTED_THEME_COUNTS;
  const names = (await readdir(join(root, DIR))).filter((n) => n.endsWith('.mdx')).sort();
  const loaded: Loaded[] = [];
  const errors: string[] = [];
  for (const name of names) errors.push(...(await checkFile(root, name, loaded)));

  errors.push(...findDependencyErrors(loaded));
  if (loaded.length !== expected) {
    errors.push(`Décompte des plugins : ${expected} attendus, ${loaded.length} trouvé(s)`);
  }
  for (const theme of THEMES) {
    const actual = loaded.filter((p) => p.theme === theme).length;
    if (actual !== themeCounts[theme]) {
      errors.push(`Thème « ${theme} » : ${themeCounts[theme]} attendus, ${actual} trouvé(s)`);
    }
  }
  return errors;
}
