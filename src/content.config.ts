import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { homeSchema } from './content/schemas/home.ts';
import { legalFrontmatterSchema } from './content/schemas/legal.ts';

// Point d'enregistrement unique des collections (zone append-only : un import et une clé par collection).
const home = defineCollection({ loader: file('./src/data/home.yaml'), schema: homeSchema });

// US-029 : pages légales en Markdown (frontmatter validé, date de mise à jour obligatoire).
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: legalFrontmatterSchema,
});

export const collections = { home, legal };
