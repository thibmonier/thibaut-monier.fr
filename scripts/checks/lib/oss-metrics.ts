import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ossMetricsSchema } from '../../../src/content/schemas/oss-metrics.ts';
import { STALE_AFTER_DAYS, isStale, isoDay } from '../../../src/lib/oss-metrics.ts';

export interface MetricsReport {
  errors: string[];
  warnings: string[];
}

/** Échec seulement si le schéma est invalide : péremption et clés manquantes sont des avertissements (V10). */
export async function checkOssMetrics(
  root: string,
  expectedKeys: readonly string[],
  now: Date = new Date(),
): Promise<MetricsReport> {
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(join(root, 'src/data/oss-metrics.json'), 'utf8'));
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return { errors: [`oss-metrics.json : JSON illisible (${reason})`], warnings: [] };
  }
  const parsed = ossMetricsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map(
        (issue) => `oss-metrics.json : ${issue.path.join('.') || 'racine'} : ${issue.message}`,
      ),
      warnings: [],
    };
  }
  const warnings: string[] = [];
  for (const [key, entry] of Object.entries(parsed.data.entries)) {
    if (isStale(entry.fetchedAt, now)) {
      warnings.push(
        `Métriques périmées pour « ${key} » : données au ${isoDay(entry.fetchedAt)} (plus de ${STALE_AFTER_DAYS} jours)`,
      );
    }
    if (!expectedKeys.includes(key)) warnings.push(`Métriques sans page associée : « ${key} »`);
  }
  for (const key of expectedKeys) {
    if (!(key in parsed.data.entries))
      warnings.push(`Métriques absentes pour « ${key} » : bloc masqué`);
  }
  return { errors: [], warnings };
}
