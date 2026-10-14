# Options techniques et recommandations

> Phase d'Analyse, 2026-10-14. Les versions ont été relevées par `npm view` et `docker manifest inspect` **dans des conteneurs** ; les offres sur les pages officielles, sauf mention contraire. Les recommandations ci-dessous deviennent des ADR en phase Conception.

## 1. Versions de référence (relevé du 2026-10-14)

| Composant | Version retenue | Note |
|-----------|-----------------|------|
| Node.js | **26.11.1** (`node:26-alpine`) | Devient LTS le 2026-10-28 ; Astro exige ≥ 22.12 ; la LTS actuelle 24.21.0 entre en maintenance le 2026-10-20 |
| npm / pnpm | npm 11.19 (12.2 disponible) · pnpm 12.11.2 | Gestionnaire à trancher en ADR (pnpm recommandé : lockfile strict, rapidité en CI) |
| Astro | **7.3.8** | Le blog est en 7.3.3 |
| @astrojs/mdx · sitemap · rss · check | 8.0.3 · 3.7.4 · 4.0.19 · 0.9.10 | |
| Tailwind CSS · @tailwindcss/vite · typography | **4.3.3** · 4.3.3 · 0.5.20 | |
| TypeScript | **6.0.3** ⚠️ | **7.0.2 est sorti aujourd'hui mais n'est pas pris en charge par `@astrojs/check`** (peer `^5 \|\| ^6`). Renovate doit bloquer le passage en 7 jusqu'à sa prise en charge |
| Pagefind · astro-pagefind | 1.5.2 · 2.0.1 | |
| astro-icon · @playform/compress | 1.2.0 · 0.2.5 | |
| Vitest | 5.0.4 | Tests unitaires de `src/lib/` |
| Playwright (@playwright/test) | 1.64.1 | Tests end-to-end (image officielle Playwright en CI) |
| @axe-core/playwright | 4.13.0 | Accessibilité en end-to-end |
| @lhci/cli | 0.15.1 ⚠️ | Dernière publication en **juin 2025** : maintenance ralentie ; alternative possible : `unlighthouse` ou Lighthouse via Playwright (à trancher en ADR) |
| ESLint · eslint-plugin-astro · typescript-eslint | 10.12.0 · 3.2.1 · 8.71.2 | eslint-plugin-astro 3.x exige ESLint ≥ 10 |
| Prettier · prettier-plugin-astro | 3.9.10 · 1.1.1 | |
| satori · astro-og-canvas | 0.56.1 · 0.13.2 | Images Open Graph (US-025) |
| wrangler | 4.151.0 | Si l'option Cloudflare est retenue |
| nginx (`nginxinc/nginx-unprivileged:stable-alpine`) | 1.30.5 | Si l'option Railway est retenue |
| Typst | 0.15.x | CV PDF (voir §4) |

## 2. Hébergement (CB-3 : coût minimal)

| Critère | **Cloudflare Workers Static Assets** | Railway (conteneur nginx) |
|---------|--------------------------------------|---------------------------|
| Coût | **0 €** : « Requests to static assets are free and unlimited » | Abonnement Hobby à **5 $/mois** (5 $ d'usage inclus) ; usage d'un nginx statique estimé entre 0,2 et 0,5 $/mois. **Coût marginal quasi nul si l'abonnement Hobby est déjà payé pour d'autres projets et que le crédit n'est pas épuisé** |
| En-têtes de sécurité | Fichier `_headers` (100 règles, 2 000 caractères par ligne) | `nginx.conf` |
| Redirections | Fichier `_redirects` | `nginx.conf` |
| Limites | 20 000 fichiers, 25 Mio par fichier (offre gratuite) | Aucune notable |
| Performance | CDN mondial, aucun démarrage à froid | Une seule région ; la mise en veille, si on l'active pour réduire le coût, provoque des démarrages à froid et des 502 à la première requête |
| Recommandation éditeur | « Start new projects with Workers » (Pages déconseillé pour un nouveau projet) | — |
| Dockerisation | Développement, build et déploiement (`wrangler`) dans Docker ; **la production n'est pas un conteneur** (CDN) ; `wrangler dev` dans Docker émule `_headers` et `_redirects` | Image identique du développement à la production |
| Rapport avec CT-1 | ⚠️ À valider avec le PO : « tout dockerisé » couvre le développement, la CI et le déploiement, mais pas l'exécution en production | ✅ Respect littéral |

**Recommandation : Cloudflare Workers Static Assets**, car c'est la seule option à 0 € garanti, plus performante, avec le même niveau de contrôle (en-têtes et redirections) qu'nginx. Le build et le déploiement restent dockerisés, et `wrangler dev` dans Docker donne un environnement de développement fidèle à la production. Repli : Railway si le PO considère que la production doit aussi être un conteneur, ou si son abonnement Hobby a assez de crédit libre.

## 3. Mesure d'audience (CB-4 : gratuité impérative, conversions O2 et O3)

| Critère | Cloudflare Web Analytics | **Umami Cloud Hobby** |
|---------|--------------------------|------------------------|
| Prix | Gratuit | Gratuit : 100 000 événements par mois, **1 site**, rétention de 6 mois |
| Sans cookie | Oui (aucun état côté client selon Cloudflare) | Oui, « no cookies », pas de bandeau |
| Événements personnalisés | **Non** : annoncés en 2020 comme « à venir », aucune trace de leur livraison | **Oui**, inclus |
| Hébergement des données | Cloudflare | Serveurs aux États-Unis et dans l'UE (région de l'offre gratuite non précisée) |

**Recommandation : Umami Cloud Hobby.** Il respecte le critère du PO (gratuit, sans cookie) et c'est le seul à mesurer les conversions par clic (CV, Calendly, GitHub, Packagist), indispensables aux KPI O2 et O3. Cloudflare Web Analytics ne mesurerait que des pages vues. *Le PO avait indiqué Cloudflare « a priori » : à confirmer en ADR.*

## 4. CV PDF généré au build (CT-7)

| Option | Poids et intégration Docker | Qualité typographique | Source unique |
|--------|-----------------------------|-----------------------|---------------|
| **Typst 0.15** | Binaire unique, image officielle légère (étape dédiée du build multi-étapes) | Excellente (moteur de composition natif) | ✅ Typst lit nativement YAML et JSON : il consomme les **mêmes fichiers de données** que les collections Astro |
| WeasyPrint 70 | Python avec Pango : image moyenne | Bonne (CSS paginé) | ✅ À partir du HTML généré par Astro |
| Playwright / Chromium | Image lourde (Chromium), plusieurs centaines de Mo | Bonne, mais pagination CSS limitée | ✅ À partir du HTML |
| Paged.js | JS, nécessite un navigateur (même poids que Playwright) | Bonne | ✅ |

**Recommandation : Typst.** C'est l'option la plus légère et la meilleure en typographie ; les données du parcours sont en YAML, lues à la fois par Astro et par Typst. Elle a un bonus : le gabarit Typst peut resservir pour produire des CV ciblés, par exemple avec career-ops. Coût : un gabarit Typst à maintenir à côté des pages.

## 5. Formulaire de contact (CR-1)

| Option | Gratuit | Données | Note |
|--------|---------|---------|------|
| **Web3Forms** | Oui (la page de prix n'a pas pu être lue ; 250 envois par mois selon des sources tierces) | Serveurs aux **États-Unis (US-East)** ; **aucun stockage des envois** (transfert par e-mail) ; journaux purgés tous les 2 mois ; DPA du 13/07/2026 | Déjà utilisé sur Agentic Agency |
| Formspree Free | 50 envois par mois | États-Unis | Quota faible mais suffisant pour l'objectif O2 (≥ 4 par mois) |
| Worker Cloudflare et Email Routing | À vérifier : la réception est gratuite, mais l'envoi sortant via Email Service est payant (5 $/mois) | Cloudflare | Ajoute du code serveur ; à étudier seulement si l'option Cloudflare est retenue |

**Recommandation : Web3Forms** (déjà maîtrisé, aucun stockage), avec une mention d'information RGPD sous le formulaire (transfert hors UE encadré par le DPA). Le DPA reste à relire avant la mise en production.

## 6. Autres choix (à confirmer en Conception)

| Sujet | Recommandation | Raison |
|-------|----------------|--------|
| i18n | Routage natif Astro, `prefixDefaultLocale: false` (FR à la racine, EN sous `/en/`) prévu dès US-002 | Activation en sprint 5 sans refonte |
| Collections | Content Layer (obligatoire depuis Astro 6) : `experiences`, `skills`, `blog`, `tools`, `tool-tests`, `plugins`, `projects` | Schémas Zod validés au build |
| Images Open Graph | astro-og-canvas (rendu au build, sans navigateur) | Pas de Chromium dans l'image de build |
| Données GitHub et Packagist | Récupération au build avec `GITHUB_TOKEN` (1 000 requêtes/h) et un cache JSON commité en repli | Le build n'échoue jamais pour une métrique (US-021) |
| Build planifié | Cron GitHub Actions quotidien | Publication programmée, métriques, alerte « test de plus de 6 mois » |
| Mises à jour | Renovate (regroupement, règle bloquant TypeScript 7) | CT-2, CT-3 |
| Lighthouse en CI | À trancher entre @lhci/cli (maintenance ralentie) et Lighthouse via Playwright | Pérennité de l'outillage |
