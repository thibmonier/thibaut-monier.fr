// Génère dist/thibaut-monier-cv.pdf avec Typst à partir des YAML partagés (US-007, ADR-0005).
// Ordre du build : checks:content -> astro build -> build:cv -> checks:dist. Échec franc, aucun PDF obsolète.
import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { parse } from 'yaml';
import { experienceSchema } from '../src/content/schemas/experiences.ts';
import { profileSchema } from '../src/content/schemas/profile.ts';
import { tokensSchema } from '../src/content/schemas/tokens.ts';
import { buildCvData, type CvData } from '../src/lib/cv-data.ts';

export const CV_FILE = 'thibaut-monier-cv.pdf';
const TIMEOUT_MS = 60_000;
const run = promisify(execFile);

async function readYaml(path: string): Promise<unknown> {
  return parse(await readFile(path, 'utf8'));
}

export async function loadCvData(root: string, generatedAt = new Date()): Promise<CvData> {
  const dir = join(root, 'src/data/cv/experiences');
  const names = (await readdir(dir)).filter((name) => name.endsWith('.yaml')).sort();
  const experiences = await Promise.all(
    names.map(async (name) => ({
      ...experienceSchema.parse(await readYaml(join(dir, name))),
      id: name.replace(/\.yaml$/, ''),
    })),
  );
  const profileFile = (await readYaml(join(root, 'src/data/cv/profile.yaml'))) as { fr: unknown };
  const tokens = tokensSchema.parse(
    JSON.parse(await readFile(join(root, 'src/data/tokens.json'), 'utf8')),
  );
  return buildCvData({
    profile: profileSchema.parse(profileFile.fr),
    experiences,
    tokens,
    generatedAt,
  });
}

export async function buildCv(root = process.cwd()): Promise<string> {
  const output = join(root, 'dist', CV_FILE);
  await rm(output, { force: true }); // jamais de PDF obsolète
  await mkdir(join(root, 'dist'), { recursive: true });
  const data = await loadCvData(root);
  await run(
    'typst',
    [
      'compile',
      '--root',
      root,
      '--font-path',
      join(root, 'cv/fonts'),
      '--ignore-system-fonts',
      '--pdf-standard',
      'ua-1',
      '--input',
      `data=${JSON.stringify(data)}`,
      join(root, 'cv/cv.typ'),
      output,
    ],
    { timeout: TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 },
  );
  return output;
}

if (import.meta.main) {
  try {
    console.log(`CV PDF généré : ${await buildCv()}`);
  } catch (error) {
    await rm(join(process.cwd(), 'dist', CV_FILE), { force: true });
    const cause =
      error instanceof Error
        ? ((error as { stderr?: string }).stderr?.trim() || error.message)
            .split('\n')
            .slice(0, 6)
            .join(' | ')
        : String(error);
    console.error(`Génération du CV PDF impossible : ${cause}`);
    process.exit(1);
  }
}
