import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import type { FullResult, Reporter, TestCase } from '@playwright/test/reporter';
import {
  findUnlistedSkips,
  formatSummary,
  parseAllowlist,
  type SkippedTest,
} from '../../../scripts/checks/lib/strict-skips.ts';

// E2E stricts (C11) : un test ignoré hors de tests/e2e/skip-allowlist.json fait échouer l'exécution.
// Le compte « exécutés / ignorés » va sur la sortie standard, dans reports/e2e-summary.md et, en CI,
// dans $GITHUB_STEP_SUMMARY.
const ALLOWLIST = resolve('tests/e2e/skip-allowlist.json');
const SUMMARY_FILE = resolve('reports/e2e-summary.md');

export default class StrictSkipsReporter implements Reporter {
  private readonly tests = new Map<string, TestCase>();

  printsToStdio(): boolean {
    return false;
  }

  onTestEnd(test: TestCase): void {
    this.tests.set(test.id, test);
  }

  async onEnd(): Promise<{ status: FullResult['status'] } | undefined> {
    const skipped: SkippedTest[] = [];
    let executed = 0;
    for (const test of this.tests.values()) {
      const outcome = test.outcome();
      if (outcome === 'skipped') {
        skipped.push({
          file: relative(process.cwd(), test.location.file).split(sep).join('/'),
          title: test.titlePath().slice(3).join(' › '),
          project: test.parent.project()?.name ?? '',
        });
      } else {
        executed += 1;
      }
    }
    const allowlist = parseAllowlist(JSON.parse(readFileSync(ALLOWLIST, 'utf8')));
    const unlisted = findUnlistedSkips(skipped, allowlist);
    const summary = formatSummary({ executed, skipped: skipped.length }, unlisted);

    console.log(`\n${summary}`);
    mkdirSync(dirname(SUMMARY_FILE), { recursive: true });
    writeFileSync(SUMMARY_FILE, `${summary}\n`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### e2e\n\n${summary}\n`);
    }
    return unlisted.length > 0 ? { status: 'failed' } : undefined;
  }
}
