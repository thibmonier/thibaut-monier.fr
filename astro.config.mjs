import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// URL publique provisoire tant que le domaine n'est pas branché (PUBLIC_SITE_URL, voir .env.example).
const site = process.env.PUBLIC_SITE_URL || 'https://thibaut-monier.fr';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
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
