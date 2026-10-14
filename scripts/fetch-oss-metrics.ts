import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ossMetricsSchema, type OssMetrics } from '../src/content/schemas/oss-metrics.ts';
import { collectMetrics } from './lib/fetch-metrics.ts';
import { OSS_TARGETS } from './lib/oss-targets.ts';

// Collecte des métriques (ADR-0006) : `make metrics` ou workflow hebdomadaire. Le build, lui, ne lit
// que le JSON commité. Code de sortie 0 même en cas de panne réseau : le JSON précédent sert de cache.
const FILE = resolve(process.cwd(), 'src/data/oss-metrics.json');

async function readPrevious(): Promise<OssMetrics | undefined> {
  try {
    return ossMetricsSchema.parse(JSON.parse(await readFile(FILE, 'utf8')));
  } catch {
    console.warn('AVERTISSEMENT cache précédent illisible : collecte sans valeurs de repli');
    return undefined;
  }
}

const token = process.env.GITHUB_TOKEN || undefined;
console.log(
  `Jeton GitHub : ${token ? 'fourni (jamais journalisé)' : 'absent (60 requêtes par heure)'}`,
);

const started = Date.now();
const data = await collectMetrics(OSS_TARGETS, await readPrevious(), {
  fetch: (url, init) => fetch(url, init),
  now: () => new Date(),
  sleep: (ms) => new Promise((done) => setTimeout(done, ms)),
  log: {
    info: (message) => console.log(message),
    warn: (message) => console.warn(`AVERTISSEMENT ${message}`),
  },
  ...(token ? { token } : {}),
});

await writeFile(FILE, `${JSON.stringify(data, null, 2)}\n`);
const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(
  `${Object.keys(data.entries).length}/${OSS_TARGETS.length} entrées écrites dans src/data/oss-metrics.json en ${seconds} s`,
);
