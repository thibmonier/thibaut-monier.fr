import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { experienceSchema } from './content/schemas/experiences.ts';
import { homeSchema } from './content/schemas/home.ts';

// Point d'enregistrement unique des collections (zone append-only : un import et une clé par collection).
const home = defineCollection({ loader: file('./src/data/home.yaml'), schema: homeSchema });

// US-005
const experiences = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/data/cv/experiences' }),
  schema: experienceSchema,
});

export const collections = { home, experiences };
