# ADR-0001 : Stack technique et politique de versions

## Statut
Accepté (2026-10-14, validé par le PO)

## Contexte
Le site est statique : profil, blog, labo d'outils et vitrine open source (PRD 1.1). Le PO impose les versions stables les plus récentes de toutes les dépendances (CT-2). Le socle d'Agentic Agency (`../blog`) tourne déjà en Astro 7.3, Tailwind 4 et Pagefind. Il y a un seul contributeur, et le contenu est en Markdown/MDX dans Git.

## Décision
Générateur de site statique **Astro**, sortie `static`, sans adaptateur. Versions relevées le 2026-10-14 avec `npm view`, exécuté dans un conteneur :

| Composant | Version | Remarque |
|-----------|---------|----------|
| Node.js | 26.11.1 (`node:26-alpine`) | Devient LTS le 2026-10-28 |
| npm | 11.19 (fourni avec l'image) | Pas de pnpm : un outil de moins (KISS), lockfile `package-lock.json` comme dans le blog |
| astro | 7.3.8 | |
| @astrojs/mdx · sitemap · rss · check | 8.0.3 · 3.7.4 · 4.0.19 · 0.9.10 | |
| tailwindcss · @tailwindcss/vite · @tailwindcss/typography | 4.3.3 · 4.3.3 · 0.5.20 | |
| typescript | **6.0.3** | La 7.0.2 (sortie le 2026-10-14) n'est pas prise en charge par `@astrojs/check` (peer `^5 \|\| ^6`) |
| zod | 4.6.7 (via `astro/zod`) | Schémas des collections |
| pagefind · astro-pagefind | 1.5.2 · 2.0.1 | |
| astro-icon · @playform/compress | 1.2.0 · 0.2.5 | |
| astro-og-canvas | 0.13.2 | Images OG au build, sans navigateur |
| yaml | 2.9.1 | Lecture des données partagées avec Typst |
| eslint · eslint-plugin-astro · typescript-eslint | 10.12.0 · 3.2.1 · 8.71.2 | |
| prettier · prettier-plugin-astro | 3.9.10 · 1.1.1 | |
| vitest · @playwright/test · @axe-core/playwright | 5.0.4 · 1.64.1 · 4.13.0 | |
| lighthouse | 13.5.0 | Voir ADR-0008 |

**Politique de versions**
1. Toutes les versions sont fixées exactement dans `package.json` (pas de `^`), le lockfile est commité, et les images Docker sont fixées par tag et par digest.
2. **Renovate** propose les mises à jour chaque semaine (regroupées par écosystème) et les fusionne automatiquement si la CI est verte pour les versions patch et mineures. Les versions majeures passent en revue manuelle.
3. **Règle de compatibilité** : on ne monte pas une majeure tant qu'une dépendance directe ne la prend pas en charge (cas actuel : `typescript < 7` bloqué tant que `@astrojs/check` n'accepte pas la 7).

**Abandonné par rapport au blog** : `@vercel/analytics` et `@vercel/speed-insights` (hébergeur différent), `husky` et `lint-staged` (les hooks git supposent un Node local, contraire à CT-1 ; les contrôles se font dans Docker et en CI).

## Alternatives considérées
- **Symfony + Twig** (stack habituelle du PO) : rejeté pour ce site, qui n'a pas besoin de serveur applicatif ; l'hébergement et la maintenance seraient plus coûteux (YAGNI). La vitrine Symfony est portée par tailsfadmin et les plugins.
- **Next.js / Hugo** : rejetés, car il n'y a aucun gain par rapport au socle Astro déjà maîtrisé.
- **pnpm 12** : rejeté. Il serait plus rapide, mais il faut l'installer dans l'image (corepack n'est plus fourni avec Node ≥ 25) et les informations sur la v12 sont contradictoires.

## Conséquences
- ✅ Réutilisation du socle et des composants d'Agentic Agency (vélocité, opportunité O-06).
- ✅ Site 100 % statique : surface d'attaque minimale, performance maximale.
- ⚠️ « Dernières versions » ne signifie pas « dernière majeure à tout prix » : les exceptions sont tracées dans cet ADR.
- ⚠️ Revue manuelle des PR Renovate majeures (environ 1 par mois).
