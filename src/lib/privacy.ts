// Liste blanche de données publiables (security.md §7, arbitrage A1) : détecte téléphone, âge,
// naissance et adresse postale. « 25 ans d'expérience » reste autorisé : seul l'âge est visé.

export type PiiType = 'telephone' | 'age' | 'naissance' | 'adresse';

const RULES: ReadonlyArray<readonly [PiiType, RegExp]> = [
  [
    'telephone',
    /(?:\+33[\s.]?[1-9]|(?<![\d])0[1-9])(?:[\s.]?\d{2}){4}(?!\d)|(?<!\w)\+\d{1,3}(?:[\s.]?\d{1,4}){3,5}(?!\d)/u,
  ],
  [
    'age',
    /(?<!\d)\d{2}\s?ans(?!\s+d['’]\s?(?:expérience|experience|ancienneté|anciennete))\b|(?<![\p{L}])âgée?s?(?![\p{L}])/iu,
  ],
  ['naissance', /(?<![\p{L}])née?\s+le(?![\p{L}])|date\s+de\s+naissance/iu],
  [
    'adresse',
    /(?<!\d)\d{1,3}\s?(?:bis|ter)?\s+(?:rue|avenue|av\.|boulevard|bd|chemin|impasse|allée|place|quai|route|cours)(?![\p{L}])/iu,
  ],
];

export function detectPii(text: string): PiiType[] {
  return RULES.filter(([, pattern]) => pattern.test(text)).map(([type]) => type);
}

export function formatPiiError(file: string, type: PiiType): string {
  return `Donnée personnelle interdite détectée dans ${file} : ${type}`;
}
