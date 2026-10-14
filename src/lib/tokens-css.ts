import type { Tokens } from '../content/schemas/tokens.ts';

const declarations = (tokens: Tokens, theme: 'light' | 'dark', indent: string) =>
  Object.entries(tokens.color)
    .map(([name, value]) => `${indent}--c-${name}: ${value[theme]};`)
    .join('\n');

// Produit src/styles/tokens.css à partir de src/data/tokens.json (régénéré par « npm run tokens »).
export function renderTokensCss(tokens: Tokens): string {
  const theme = Object.keys(tokens.color)
    .map((name) => `  --color-${name}: var(--c-${name});`)
    .join('\n');
  const spacing = Object.entries(tokens.space)
    .map(([name, value]) => `  --spacing-${name}: ${value};`)
    .join('\n');

  return `/* Fichier généré depuis src/data/tokens.json : ne pas modifier (npm run tokens). */
:root {
  color-scheme: light;
${declarations(tokens, 'light', '  ')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: dark;
${declarations(tokens, 'dark', '    ')}
  }
}

:root[data-theme='dark'] {
  color-scheme: dark;
${declarations(tokens, 'dark', '  ')}
}

@theme inline {
${theme}
  --font-sans: ${tokens.font.sans};
  --font-mono: ${tokens.font.mono};
${spacing}
}
`;
}
