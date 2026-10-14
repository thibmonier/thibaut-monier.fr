import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import { achievementSchema, type Achievement } from '../../../src/content/schemas/achievements.ts';
import { skillSchema, type Skill } from '../../../src/content/schemas/skills.ts';
import { DOMAIN_IDS } from '../../../src/lib/filters.ts';
import { detectPii, formatPiiError } from '../../../src/lib/privacy.ts';

export const MIN_ACHIEVEMENTS = 10;
export const MAX_ACHIEVEMENTS = 15;
// Clients dont la citation est validée par le PO (T-006-01). Vide : toutes les références sont anonymisées (E12).
export const CITABLE_CLIENTS: readonly string[] = [];

const DIR = 'src/data/cv';

type Issue = { path: PropertyKey[]; message: string };
const formatIssues = (label: string, issues: Issue[]): string[] =>
  issues.map((issue) => `${label} : ${issue.path.join('.') || 'racine'} : ${issue.message}`);

async function loadList(root: string, name: string, errors: string[]): Promise<unknown[] | null> {
  const raw = await readFile(join(root, DIR, name), 'utf8');
  for (const type of detectPii(raw)) errors.push(formatPiiError(name, type));
  try {
    const data: unknown = parse(raw);
    if (Array.isArray(data)) return data;
    errors.push(`${name} : une liste est attendue`);
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    errors.push(`${name} : YAML illisible (${reason})`);
  }
  return null;
}

function parseSkills(items: unknown[], errors: string[]): Skill[] {
  const skills: Skill[] = [];
  for (const [index, item] of items.entries()) {
    const id = (item as { id?: string })?.id ?? `#${index + 1}`;
    const result = skillSchema.safeParse(item);
    if (result.success) skills.push(result.data);
    else errors.push(...formatIssues(`skills.yaml : ${id}`, result.error.issues));
  }
  const seen = new Set<string>();
  for (const skill of skills) {
    if (seen.has(skill.id)) errors.push(`skills.yaml : identifiant en double « ${skill.id} »`);
    seen.add(skill.id);
  }
  for (const domain of DOMAIN_IDS) {
    if (!skills.some((skill) => skill.domain === domain)) {
      errors.push(`skills.yaml : domaine « ${domain} » sans compétence`);
    }
  }
  return skills;
}

function checkReferences(
  item: Achievement,
  skillIds: ReadonlySet<string>,
  experienceIds: ReadonlySet<string>,
): string[] {
  const label = `achievements.yaml : ${item.id}`;
  return [
    ...item.skills
      .filter((id) => !skillIds.has(id))
      .map((id) => `${label} : skills : compétence inconnue « ${id} »`),
    ...(item.experienceId && !experienceIds.has(item.experienceId)
      ? [`${label} : experienceId : expérience inconnue « ${item.experienceId} »`]
      : []),
    ...item.clients
      .filter((client) => !CITABLE_CLIENTS.includes(client))
      .map(
        (client) => `${label} : clients : « ${client} » absent de la liste des clients citables`,
      ),
  ];
}

function parseAchievements(items: unknown[], errors: string[]): Achievement[] {
  const achievements: Achievement[] = [];
  for (const [index, item] of items.entries()) {
    const id = (item as { id?: string })?.id ?? `#${index + 1}`;
    const result = achievementSchema.safeParse(item);
    if (result.success) achievements.push(result.data);
    else errors.push(...formatIssues(`achievements.yaml : ${id}`, result.error.issues));
  }
  const seen = new Set<string>();
  for (const { id } of achievements) {
    if (seen.has(id)) errors.push(`achievements.yaml : identifiant en double « ${id} »`);
    seen.add(id);
  }
  if (items.length < MIN_ACHIEVEMENTS || items.length > MAX_ACHIEVEMENTS) {
    errors.push(
      `achievements.yaml : ${items.length} réalisation(s), ${MIN_ACHIEVEMENTS} à ${MAX_ACHIEVEMENTS} attendues`,
    );
  }
  return achievements;
}

// Contrôle de contenu des réalisations et des compétences (US-006) : schémas, références croisées (V4),
// unicité des identifiants, décompte, clients citables, liste blanche de données personnelles.
export async function checkAchievements(root: string): Promise<string[]> {
  const errors: string[] = [];
  const rawSkills = await loadList(root, 'skills.yaml', errors);
  const rawAchievements = await loadList(root, 'achievements.yaml', errors);
  const skills = rawSkills ? parseSkills(rawSkills, errors) : [];
  const achievements = rawAchievements ? parseAchievements(rawAchievements, errors) : [];

  const experienceIds = new Set(
    (await readdir(join(root, DIR, 'experiences')))
      .filter((name) => name.endsWith('.yaml'))
      .map((name) => name.replace(/\.yaml$/, '')),
  );
  const skillIds = new Set(skills.map((skill) => skill.id));
  for (const item of achievements) errors.push(...checkReferences(item, skillIds, experienceIds));
  return errors;
}
