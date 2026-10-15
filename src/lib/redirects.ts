import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { postPath } from './blog.ts';
import { originOf } from './site-url.ts';

// Contrat C6 : table de correspondance ancien site -> nouveau site (src/data/redirects.yaml).
// Fonctions pures, sans `astro:content`. `loadRedirects` est le SEUL lecteur de redirects.yaml.
// La table ne contient que des chemins : l'origine du nouveau site vient de site-url.ts (E23) et celle de
// l'ancien site n'est pas stockée. Forme de `from` : sans barre finale (E15, relevé du 2026-10-14).

export const REDIRECT_KINDS = ['article', 'index', 'categorie', 'tag', 'page', 'flux'] as const;
export const REDIRECTS_FILE = 'src/data/redirects.yaml';

const hasControl = (value: string): boolean =>
  [...value].some((char) => char.charCodeAt(0) < 0x20 || char.charCodeAt(0) === 0x7f);
const FROM_FORBIDDEN = /["'\u005c;{}$]/u;
const TO_FORBIDDEN = /["'\u005c;{}$\s]/u;

const isFile = (path: string): boolean => (path.split('/').pop() ?? '').includes('.');
const hasDomain = (path: string): boolean => !path.startsWith('/') || path.startsWith('//');

/** Décode le pourcentage (accents UTF-8) ; une séquence invalide est un problème, pas une exception. */
function decode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/** Problèmes d'un `from`, évalués sur la forme décodée (c'est celle que nginx compare). */
export function fromProblems(raw: string): string[] {
  const value = decode(raw);
  if (value === null) return ['encodage en pourcentage invalide'];
  const problems: string[] = [];
  if (hasDomain(value))
    problems.push('chemin attendu, commençant par une seule barre et sans domaine');
  if (hasControl(value)) problems.push('caractère de contrôle interdit');
  if (value.includes('?')) problems.push('requête interdite');
  if (value.includes('#')) problems.push('fragment interdit');
  if (FROM_FORBIDDEN.test(value)) problems.push('caractère interdit parmi " \' \\ ; { } $');
  if (value.length > 1 && value.endsWith('/'))
    problems.push('barre finale interdite (forme de l’ancien site, E15)');
  return problems;
}

export function toProblems(value: string): string[] {
  const problems: string[] = [];
  if (hasDomain(value))
    problems.push('chemin attendu, commençant par une seule barre et sans domaine');
  if (hasControl(value)) problems.push('caractère de contrôle interdit');
  if (TO_FORBIDDEN.test(value) || value.includes('?') || value.includes('#')) {
    problems.push('caractère interdit (espace, " \' \\ ; { } $ ? #)');
  }
  if (!value.endsWith('/') && !isFile(value)) problems.push('barre finale requise (sauf fichier)');
  return problems;
}

const key = (from: string): string => {
  const decoded = decode(from) ?? from;
  return decoded.length > 1 ? decoded.replace(/\/$/u, '') : decoded;
};

const entrySchema = z.strictObject({
  from: z.string().min(1),
  to: z.string().min(1),
  kind: z.enum(REDIRECT_KINDS),
});

export const redirectsSchema = z.array(entrySchema).superRefine((table, ctx) => {
  const seen = new Set<string>();
  table.forEach((entry, index) => {
    const issue = (field: 'from' | 'to', message: string) =>
      ctx.addIssue({
        code: 'custom',
        path: [index, field],
        message: `${field} « ${entry[field]} » : ${message}`,
      });
    for (const problem of fromProblems(entry.from)) issue('from', problem);
    for (const problem of toProblems(entry.to)) issue('to', problem);
    const id = key(entry.from);
    if (seen.has(id)) issue('from', 'Doublon de from');
    seen.add(id);
  });
});

export type Redirect = z.infer<typeof entrySchema>;
export type RedirectKind = Redirect['kind'];

export function parseRedirects(yamlText: string): Redirect[] {
  const data: unknown = parse(yamlText) ?? [];
  const result = redirectsSchema.safeParse(data);
  if (result.success) return result.data;
  const details = result.error.issues
    .map((issue) =>
      typeof issue.path[0] === 'number'
        ? `entrée ${issue.path[0] + 1} : ${issue.message}`
        : issue.message,
    )
    .join(' ; ');
  throw new Error(`redirects.yaml : ${details}`);
}

export async function loadRedirects(root: string): Promise<Redirect[]> {
  return parseRedirects(await readFile(join(root, REDIRECTS_FILE), 'utf8'));
}

export interface Coverage {
  covered: number;
  total: number;
  errors: string[];
}

/** Chaque slug d'article publié doit avoir une entrée `article` vers `/blog/<slug>/`. */
export function coverage(slugs: string[], table: Redirect[]): Coverage {
  const targets = new Set(
    table.filter((entry) => entry.kind === 'article').map((entry) => entry.to),
  );
  const missing = slugs.filter((slug) => !targets.has(postPath(slug)));
  const covered = slugs.length - missing.length;
  return {
    covered,
    total: slugs.length,
    errors: missing.map(
      (slug) => `Correspondance manquante : ${slug} (couverture ${covered}/${slugs.length})`,
    ),
  };
}

function locations(entry: Redirect): string[] {
  const from = decode(entry.from) ?? entry.from;
  const problems = fromProblems(entry.from);
  if (problems.length > 0)
    throw new Error(`redirects : from « ${entry.from} » : ${problems.join(', ')}`);
  const withSlash = from === '/' || isFile(from) ? [] : [`${from}/`];
  return [from, ...withSlash];
}

/** Un bloc `location = "<from>" { return 301 <origine><to>; }` par forme d'URL (avec et sans barre finale). */
export function toNginx(table: Redirect[], origin: string): string {
  const base = originOf(origin);
  const lines: string[] = [];
  for (const entry of table) {
    const problems = toProblems(entry.to);
    if (problems.length > 0)
      throw new Error(`redirects : to « ${entry.to} » : ${problems.join(', ')}`);
    for (const from of locations(entry)) {
      lines.push(`location = "${from}" { return 301 ${base}${entry.to}; }`);
    }
  }
  return lines.length > 0 ? `${lines.join('\n')}\n` : '';
}
