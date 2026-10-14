import { readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export type Phase = 'content' | 'dist';

export interface CheckContext {
  root: string;
  distDir: string;
}

export type Check = (context: CheckContext) => string[] | Promise<string[]>;

// Convention : <nom>.content.check.ts (avant le build, sur les sources) et <nom>.dist.check.ts (sur dist/).
export async function discoverChecks(dir: string, phase: Phase): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(`.${phase}.check.ts`))
    .map((entry) => join(dir, entry.name))
    .sort();
}

export async function runChecks(
  dir: string,
  phase: Phase,
  context: CheckContext = { root: process.cwd(), distDir: join(process.cwd(), 'dist') },
): Promise<{ exitCode: number; errors: string[] }> {
  const errors: string[] = [];
  for (const file of await discoverChecks(dir, phase)) {
    const name = basename(file);
    try {
      const module = (await import(pathToFileURL(file).href)) as { default: Check };
      errors.push(...(await module.default(context)).map((message) => `${name} : ${message}`));
    } catch (error) {
      errors.push(`${name} : ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { exitCode: errors.length > 0 ? 1 : 0, errors };
}
