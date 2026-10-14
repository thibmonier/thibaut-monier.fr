import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { experienceSchema } from './content/schemas/experiences.ts';
import { homeSchema } from './content/schemas/home.ts';
import { legalFrontmatterSchema } from './content/schemas/legal.ts';
import { createProjectSchema } from './content/schemas/projects.ts';

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

// US-023 : projets open source (étude de cas career-ops, bundle tailsfadmin). Texte courant en Markdown :
// le glob accepte aussi .mdx, que l'intégration MDX (US-019) rendra disponible sans changer ce loader.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => createProjectSchema(image()),
});

export const collections = { home, legal, experiences, projects };
