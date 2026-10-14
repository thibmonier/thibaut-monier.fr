import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { createProjectSchema } from '../../../src/content/schemas/projects.ts';
import { detectPii, formatPiiError } from '../../../src/lib/privacy.ts';
import { countVisibleWords, wordBudgetError } from '../../../src/lib/projects.ts';

export const EXPECTED_PROJECTS = 2;

const DIR = 'src/content/projects/fr';
const FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx?$/;
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const INSECURE_LINK = /\]\((http:\/\/[^)\s]+)\)|href=["'](http:\/\/[^"']+)["']/g;
const schema = createProjectSchema(z.string());

async function checkFile(root: string, name: string): Promise<string[]> {
  const prefix = `projects/${name}`;
  const errors: string[] = [];
  if (!FILE_NAME.test(name)) {
    errors.push(`${prefix} : nom de fichier invalide (slug en kebab-case attendu)`);
  }
  const raw = await readFile(join(root, DIR, name), 'utf8');
  for (const type of detectPii(raw)) errors.push(formatPiiError(name, type));

  const match = FRONT_MATTER.exec(raw);
  if (!match) return [...errors, `${prefix} : front matter YAML absent`];
  const [, header = '', body = ''] = match;

  let data: unknown;
  try {
    data = parse(header);
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return [...errors, `${prefix} : YAML illisible (${reason})`];
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${prefix} : ${issue.path.join('.') || 'racine'} : ${issue.message}`);
    }
    return errors;
  }

  for (const link of body.matchAll(INSECURE_LINK)) {
    errors.push(`${prefix} : lien non https dans le corps : ${link[1] ?? link[2]}`);
  }
  const budget = wordBudgetError(result.data.name, countVisibleWords(result.data, body));
  if (budget) errors.push(`${prefix} : ${budget}`);
  return errors;
}

export async function checkProjects(
  root: string,
  expected: number = EXPECTED_PROJECTS,
): Promise<string[]> {
  const names = (await readdir(join(root, DIR))).filter((name) => /\.mdx?$/.test(name)).sort();
  const errors: string[] = [];
  for (const name of names) errors.push(...(await checkFile(root, name)));
  if (names.length !== expected) {
    errors.push(`Décompte des projets : ${expected} attendus, ${names.length} trouvé(s)`);
  }
  return errors;
}
