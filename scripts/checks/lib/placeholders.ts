import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { walk } from './fs.ts';

// Marqueurs de contenu provisoire qui ne doivent jamais atteindre la production (revue DoD, B2).
// Frontières de mots explicites : « todo » ne doit pas matcher à l'intérieur d'un autre mot.
const MARKERS: ReadonlyArray<[label: string, pattern: RegExp]> = [
  ['à vérifier', /(^|[^\p{L}])à vérifier([^\p{L}]|$)/u],
  ['todo', /(^|[^\p{L}])todo([^\p{L}]|$)/u],
  ['lorem ipsum', /lorem ipsum/u],
];

// Le texte visible seulement : les commentaires HTML et les scripts ne sont pas publiés comme contenu.
function visibleText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .toLowerCase();
}

export function findPlaceholders(html: string): string[] {
  const text = visibleText(html);
  return MARKERS.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

export async function checkPlaceholders(distDir: string): Promise<string[]> {
  const pages = (await walk(distDir)).filter((file) => file.endsWith('.html'));
  const errors: string[] = [];
  for (const page of pages) {
    for (const marker of findPlaceholders(await readFile(page, 'utf8'))) {
      errors.push(`Contenu provisoire publié dans ${relative(distDir, page)} : « ${marker} »`);
    }
  }
  return errors;
}
