import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { homeSchema } from './content/schemas/home.ts';

// Point d'enregistrement unique des collections (zone append-only : un import et une clé par collection).
const home = defineCollection({ loader: file('./src/data/home.yaml'), schema: homeSchema });

export const collections = { home };
