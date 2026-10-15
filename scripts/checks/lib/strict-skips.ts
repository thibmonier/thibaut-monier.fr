// Garde-fou « zéro e2e ignoré non justifié » (action S1-1, T-900-04). Logique pure : le reporter Playwright
// (tests/e2e/reporters/strict-skips.ts) la branche sur les résultats et sur tests/e2e/skip-allowlist.json.

export interface AllowlistEntry {
  /** Fichier de test, relatif à la racine du dépôt. */
  file: string;
  /** Fragment du titre complet du test (describe › test). */
  test: string;
  /** Projets Playwright concernés ; absent = tous. */
  projects?: string[];
  reason: string;
  /** Date de la décision (AAAA-MM-JJ). */
  date: string;
}

export interface SkippedTest {
  file: string;
  title: string;
  project: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const KEYS = new Set(['file', 'test', 'projects', 'reason', 'date']);

export function parseAllowlist(input: unknown): AllowlistEntry[] {
  const entries = (input as { skips?: unknown } | null)?.skips;
  if (!Array.isArray(entries)) throw new Error('skip-allowlist : tableau « skips » attendu');
  return entries.map((raw: unknown, index) => {
    const where = `skip-allowlist : entrée ${index + 1}`;
    if (typeof raw !== 'object' || raw === null) throw new Error(`${where} invalide`);
    const entry = raw as Record<string, unknown>;
    for (const key of Object.keys(entry)) {
      if (!KEYS.has(key)) throw new Error(`${where} : champ inconnu « ${key} »`);
    }
    for (const key of ['file', 'test', 'reason'] as const) {
      if (typeof entry[key] !== 'string' || entry[key].trim() === '') {
        throw new Error(`${where} : « ${key} » requis`);
      }
    }
    if (typeof entry.date !== 'string' || !ISO_DATE.test(entry.date)) {
      throw new Error(`${where} : « date » au format AAAA-MM-JJ requise`);
    }
    const projects = entry.projects;
    if (projects !== undefined && !(Array.isArray(projects) && projects.every(isNonEmptyString))) {
      throw new Error(`${where} : « projects » doit être une liste de noms`);
    }
    return entry as unknown as AllowlistEntry;
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}

export function isAllowed(skip: SkippedTest, allowlist: AllowlistEntry[]): boolean {
  return allowlist.some(
    (entry) =>
      entry.file === skip.file &&
      skip.title.includes(entry.test) &&
      (entry.projects === undefined || entry.projects.includes(skip.project)),
  );
}

export function findUnlistedSkips(
  skipped: SkippedTest[],
  allowlist: AllowlistEntry[],
): SkippedTest[] {
  return skipped.filter((skip) => !isAllowed(skip, allowlist));
}

export interface Counts {
  executed: number;
  skipped: number;
}

// Ligne de résumé « exécutés / ignorés » (sortie standard et $GITHUB_STEP_SUMMARY).
export function formatSummary(counts: Counts, unlisted: SkippedTest[]): string {
  const lines = [
    `Tests e2e : ${counts.executed} exécutés / ${counts.skipped} ignorés (${unlisted.length} hors liste d'exceptions)`,
  ];
  for (const skip of unlisted) {
    lines.push(
      `- ignoré hors liste : ${skip.file} [${skip.project}] ${skip.title} (à corriger, ou à justifier dans tests/e2e/skip-allowlist.json)`,
    );
  }
  return lines.join('\n');
}
