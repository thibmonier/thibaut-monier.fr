import { countWords } from './text.ts';

export const MAX_VISIBLE_WORDS = 900;

interface CountedContribution {
  problem: string;
  fix: string;
  tests: string;
}

interface CountedProject {
  summary: string;
  role: string;
  result?: string | undefined;
  contributions: CountedContribution[];
}

const DETAILS_BLOCK = /<details[\s\S]*?<\/details>/gi;

/** Mots lus sans rien déplier : les encadrés techniques (`technical`, `<details>`) sont exclus. */
export function countVisibleWords(project: CountedProject, body: string): number {
  const parts = [
    project.summary,
    project.role,
    project.result ?? '',
    ...project.contributions.flatMap((item) => [item.problem, item.fix, item.tests]),
    body.replace(DETAILS_BLOCK, ' '),
  ];
  return parts.reduce((total, part) => total + countWords(part), 0);
}

export function wordBudgetError(name: string, words: number): string | null {
  return words > MAX_VISIBLE_WORDS
    ? `Étude de cas « ${name} » : ${words} mots visibles, ${MAX_VISIBLE_WORDS} au plus (hors encadrés techniques)`
    : null;
}

export function contributionLabel(item: { type: 'pr' | 'issue'; number: number }): string {
  return `${item.type === 'pr' ? 'PR' : 'Issue'} #${item.number}`;
}

export interface Crumb {
  label: string;
  href?: string;
}

/** La vitrine n'est un lien que si sa page existe (lien de navigation actif) : jamais de lien mort. */
export function breadcrumbTrail(projectName: string, hubAvailable: boolean): Crumb[] {
  return [
    { label: 'Accueil', href: '/' },
    hubAvailable ? { label: 'Open source', href: '/open-source/' } : { label: 'Open source' },
    { label: projectName },
  ];
}

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatLongDate = (date: Date): string => DATE_FORMAT.format(date);

export const PROFILE_PATH = '/parcours/';

/** Identifiant d'une entrée de la collection `projects` (le glob part de `src/content/projects`). */
export const projectEntryId = (slug: string, lang = 'fr'): string => `${lang}/${slug}`;

export const repoUrl = (repo: { owner: string; name: string }): string =>
  `https://github.com/${repo.owner}/${repo.name}`;

export const packagistUrl = (name: string): string => `https://packagist.org/packages/${name}`;

export const STATUS_LABELS = { merged: 'Mergée', open: 'Ouverte', closed: 'Fermée' } as const;

export interface TextPart {
  text: string;
  code: boolean;
}

/** Découpe un texte en segments courants et segments `code` (délimités par des accents graves). */
export function splitInlineCode(text: string): TextPart[] {
  return text
    .split('`')
    .map((part, index) => ({ text: part, code: index % 2 === 1 }))
    .filter((part) => part.text !== '');
}

/** Nombre de phrases : terminaisons `.`, `!` ou `?` suivies d'une espace ou de la fin ; « 1.6.2 » n'en compte pas. */
export function sentenceCount(text: string): number {
  return (text.match(/[.!?…]+(?=\s|$)/gu) ?? []).length;
}
