import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';
import { rehypeArticleBlocks } from './src/lib/rehype-article-blocks.ts';

// URL publique provisoire tant que le domaine n'est pas branché (PUBLIC_SITE_URL, voir .env.example).
const site = process.env.PUBLIC_SITE_URL || 'https://thibaut-monier.fr';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  // US-019 : collection `plugins` en MDX (ADR-0001) ; les projets (`projects`) sont en Markdown simple, sans composant.
  integrations: [mdx()],
  // Locales fr/en, le français sans préfixe (ADR-0008). Les pages en anglais arrivent au sprint 5.
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  build: {
    // CSP stricte sans 'unsafe-inline' : aucun style ni script inline (ADR-0009).
    inlineStylesheets: 'never',
  },
  // Bloc `markdown` (phase 0, T-009-07). Astro 7 rend le Markdown avec Sätteri : `markdown.rehypePlugins` exigerait
  // `@astrojs/markdown-remark`, donc le plugin des blocs défilants est un plugin HAST de `satteri()`.
  // Pas de coloration syntaxique : Shiki produit des attributs `style` en ligne, que la CSP `style-src 'self'`
  // bloque (écart E9) ; les blocs de code restent lisibles en monospace défilant.
  markdown: {
    syntaxHighlight: false,
    processor: satteri({ hastPlugins: [rehypeArticleBlocks] }),
  },
  server: { host: true, port: 4321 },
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: 0 },
    // Rechargement à chaud avec des fichiers montés (macOS) : polling activable par variable.
    server: {
      watch: process.env.CHOKIDAR_USEPOLLING ? { usePolling: true, interval: 300 } : undefined,
    },
  },
});
