import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export interface ExperienceData {
  slug: string;
  company: string;
  role: string;
  start: string;
  end: string | null;
  featured: boolean;
  achievements: string[];
  summaryOnly?: string;
}

const DIR = join(process.cwd(), 'src/data/cv/experiences');

// Lit la collection : les tests ne codent aucun décompte en dur (robuste aux arbitrages de contenu).
export function loadExperiences(): ExperienceData[] {
  return readdirSync(DIR)
    .filter((name) => name.endsWith('.yaml'))
    .map((name) => {
      const data = parse(readFileSync(join(DIR, name), 'utf8')) as Omit<ExperienceData, 'slug'>;
      return { ...data, end: data.end ?? null, slug: name.replace(/\.yaml$/, '') };
    });
}

// Ordre attendu : poste en cours d'abord, puis fin décroissante, puis début décroissant.
export function byRecency(items: ExperienceData[]): ExperienceData[] {
  const key = (item: ExperienceData) => `${item.end ?? '9999-12'}|${item.start}`;
  return [...items].sort((a, b) => key(b).localeCompare(key(a)));
}
