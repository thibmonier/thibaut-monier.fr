import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { experienceSchema } from './content/schemas/experiences.ts';
import { homeSchema } from './content/schemas/home.ts';
import { legalFrontmatterSchema } from './content/schemas/legal.ts';

// Point d'enregistrement unique des collections (zone append-only : un import et une clé par collection).
const home = defineCollection({ loader: file('./src/data/home.yaml'), schema: homeSchema });

// US-029 : pages légales en Markdown (frontmatter validé, date de mise à jour obligatoire).
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: legalFrontmatterSchema,
});

// US-005
const experiences = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/data/cv/experiences' }),
  schema: experienceSchema,
});

export const collections = { home, legal, experiences };
