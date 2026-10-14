import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import { experienceSchema } from '../../../src/content/schemas/experiences.ts';
import { findRecentNotFeatured, recentThreshold } from '../../../src/lib/experiences.ts';
import { detectPii, formatPiiError } from '../../../src/lib/privacy.ts';

// Décompte V8, tranché avec le PO (arbitrage A2) : 7 entrées, Smile fusionné en une entrée.
export const EXPECTED_EXPERIENCES = 7;

const FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.yaml$/;
const DIR = 'src/data/cv/experiences';

interface Loaded {
  id: string;
  start: string;
  end: string | null;
  featured: boolean;
  order?: number;
}

async function checkFile(root: string, name: string, loaded: Loaded[]): Promise<string[]> {
  const prefix = `experiences/${name}`;
  const errors: string[] = [];
  if (!FILE_NAME.test(name)) {
    errors.push(`${prefix} : nom de fichier invalide (slug en kebab-case attendu)`);
  }
  const raw = await readFile(join(root, DIR, name), 'utf8');
  for (const type of detectPii(raw)) errors.push(formatPiiError(name, type));

  let data: unknown;
  try {
    data = parse(raw);
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return [...errors, `${prefix} : YAML illisible (${reason})`];
  }
  const result = experienceSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${prefix} : ${issue.path.join('.') || 'racine'} : ${issue.message}`);
    }
    return errors;
  }
  const { start, end, featured, order } = result.data;
  loaded.push({ id: name, start, end, featured, order });
  return errors;
}

// Contrôle de contenu des expériences : données personnelles, schéma, règle des 10 ans (V7), décompte (V8).
export async function checkExperiences(
  root: string,
  now: Date = new Date(),
  expected: number = EXPECTED_EXPERIENCES,
): Promise<string[]> {
  const names = (await readdir(join(root, DIR))).filter((name) => name.endsWith('.yaml')).sort();
  const loaded: Loaded[] = [];
  const errors: string[] = [];
  for (const name of names) errors.push(...(await checkFile(root, name, loaded)));

  for (const item of findRecentNotFeatured(loaded, now)) {
    errors.push(
      `experiences/${item.id} : expérience terminée après ${recentThreshold(now)}, featured doit être true (V7)`,
    );
  }
  if (names.length !== expected) {
    errors.push(`Décompte des expériences : ${expected} attendues, ${names.length} trouvée(s)`);
  }
  return errors;
}
