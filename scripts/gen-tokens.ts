import { readFileSync, writeFileSync } from 'node:fs';
import { tokensSchema } from '../src/content/schemas/tokens.ts';
import { renderTokensCss } from '../src/lib/tokens-css.ts';

const tokens = tokensSchema.parse(JSON.parse(readFileSync('src/data/tokens.json', 'utf8')));
writeFileSync('src/styles/tokens.css', renderTokensCss(tokens));
console.log('src/styles/tokens.css régénéré depuis src/data/tokens.json');
