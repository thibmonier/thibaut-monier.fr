import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join, relative, sep } from 'node:path';

// Action 1 de la rétro du sprint 2 (E25) : des volumes d'autres projets ont déjà été perdus par un
// nettoyage Docker global. Les commandes ci-dessous sont interdites partout dans le dépôt.
// Autorisé : `docker compose -p <projet> down -v` et `docker builder prune -f`.
export const ALLOWED_CLEANUP =
  'docker compose -p <projet> down -v ou docker builder prune -f (jamais de prune global)';

// Les motifs sont assemblés à partir de fragments pour que ce fichier ne contienne jamais lui-même une commande interdite.
const D = 'docker';
const ALL_FLAG = String.raw`(?:\s+-[a-zA-Z]*a[a-zA-Z]*(?=\s|$)|\s+--all\b)`;

interface Rule {
  label: string;
  pattern: RegExp;
}

export const RULES: Rule[] = [
  { label: `${D} system prune`, pattern: new RegExp(String.raw`\b${D}\s+system\s+prune\b`) },
  { label: `${D} volume prune`, pattern: new RegExp(String.raw`\b${D}\s+volume\s+prune\b`) },
  { label: `${D} container prune`, pattern: new RegExp(String.raw`\b${D}\s+container\s+prune\b`) },
  {
    label: `${D} image prune -a`,
    pattern: new RegExp(String.raw`\b${D}\s+image\s+prune\b[^\n]*?${ALL_FLAG}`),
  },
  {
    label: `${D} builder prune -a`,
    pattern: new RegExp(String.raw`\b${D}\s+builder\s+prune\b[^\n]*?${ALL_FLAG}`),
  },
  {
    label: `${D} buildx prune -a`,
    pattern: new RegExp(String.raw`\b${D}\s+buildx\s+prune\b[^\n]*?${ALL_FLAG}`),
  },
];

// Dans la documentation, citer la commande pour l'interdire est légitime. Une mention n'est tolérée
// que si la ligne porte un terme d'interdiction ; partout ailleurs (Makefile, scripts, workflows) : aucune exception.
const PROHIBITION_CUE =
  /interdit|interdiction|jamais|ne pas|pas de|aucun|échou|never|forbidden|don't|do not|prohib/iu;
const DOC_EXTENSIONS = new Set(['.md', '.mdx', '.txt']);

const TEXT_EXTENSIONS = new Set([
  '.md',
  '.mdx',
  '.txt',
  '.ts',
  '.mjs',
  '.js',
  '.json',
  '.yml',
  '.yaml',
  '.mk',
  '.sh',
  '.astro',
  '.css',
  '.toml',
]);
const TEXT_NAMES = new Set(['Makefile', 'Dockerfile']);
const SKIPPED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.astro',
  'coverage',
  'reports',
  'test-results',
  'playwright-report',
]);
const SKIPPED_FILES = new Set(['package-lock.json']);

export interface Finding {
  line: number;
  command: string;
}

export function findForbiddenPrune(content: string, file: string): Finding[] {
  const isDoc = DOC_EXTENSIONS.has(extname(file));
  const findings: Finding[] = [];
  content.split('\n').forEach((text, index) => {
    for (const rule of RULES) {
      if (!rule.pattern.test(text)) continue;
      if (isDoc && PROHIBITION_CUE.test(text)) continue;
      findings.push({ line: index + 1, command: rule.label });
    }
  });
  return findings;
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) ? [] : listFiles(path);
      if (!entry.isFile() || SKIPPED_FILES.has(entry.name)) return [];
      const name = basename(path);
      return TEXT_NAMES.has(name) || TEXT_EXTENSIONS.has(extname(name)) ? [path] : [];
    }),
  );
  return nested.flat().sort();
}

// Parcourt tout le dépôt monté (les dossiers absents du contexte Docker, comme .github, sont simplement ignorés).
export async function checkNoGlobalPrune(root: string): Promise<string[]> {
  const errors: string[] = [];
  for (const path of await listFiles(root)) {
    const file = relative(root, path).split(sep).join('/');
    const findings = findForbiddenPrune(await readFile(path, 'utf8'), file);
    for (const { line, command } of findings) {
      errors.push(
        `${file}:${line} commande interdite « ${command} » (nettoyage autorisé : ${ALLOWED_CLEANUP})`,
      );
    }
  }
  return errors;
}
