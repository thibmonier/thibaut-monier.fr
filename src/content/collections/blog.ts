import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { createBlogSchema } from '../schemas/blog.ts';

// Contrat C2 : une déclaration par collection dans src/content/collections/<nom>.ts.
// Fichiers : src/content/blog/fr/<slug>.md, identifiant d'entrée `fr/<slug>` (seul `slugOf` de lib/blog.ts le convertit).
// Une collection vide ne fait pas échouer le build : le décompte des 28 articles est un contrôle de contenu.
export const blog = defineCollection({
  loader: glob({ pattern: 'fr/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) => createBlogSchema(image()),
});
