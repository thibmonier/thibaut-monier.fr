# Contraintes identifiées

> Phase d'Analyse (track Enterprise), 2026-10-14. Sources : décisions du PO, PRD, existant (`../blog`), vérifications techniques (`npm view` et images Docker, exécutés dans des conteneurs).

## Contraintes techniques

| # | Contrainte | Origine | Impact |
|---|-----------|---------|--------|
| CT-1 | **Tout est dockerisé, développement compris** : aucun outil sur le poste hors Docker et Docker Compose | PO | `compose.yaml` avec un service de développement (rechargement à chaud) ; CI exécutée dans les mêmes images ; aucun `npm` local, même pour les vérifications de versions |
| CT-2 | **Versions stables les plus récentes** du runtime, du framework et des dépendances, vérifiées à la source | PO | Relevé daté dans `technical-options.md` ; Renovate ou Dependabot ; versions et digests d'images fixés |
| CT-3 | Compatibilité croisée des dernières versions | Vérification | **TypeScript 7.0.2 (sorti le 2026-10-14) n'est pas pris en charge par `@astrojs/check`** (peer `^5 \|\| ^6`) → fixer **TypeScript 6.0.3**. `eslint-plugin-astro` 3.x exige ESLint ≥ 10 |
| CT-4 | Node.js : Astro exige Node ≥ 22.12. **Node 26 devient LTS le 2026-10-28** ; Node 24 entre en maintenance le 2026-10-20 | Vérification | Viser `node:26-alpine` (26.11.1) dès le démarrage effectif du sprint 1 |
| CT-5 | Site **statique**, sans base de données ni serveur applicatif | PRD | Pas de logique serveur ; formulaire et analytics via des services tiers ; données GitHub et Packagist récupérées au build |
| CT-6 | Le contenu vit dans Git (Markdown/MDX), sans CMS | PRD | Schémas de contenu typés et validés au build |
| CT-7 | Une **seule source de vérité pour le CV** (pages et PDF) | PRD | Génération du PDF au build depuis les mêmes données ; le choix de l'outil influe sur le poids de l'image de build (voir `technical-options.md`) |
| CT-8 | Quotas des API : GitHub `GITHUB_TOKEN` à 1 000 requêtes/h par dépôt en Actions, 60/h sans authentification ; Packagist avec un cache de 12 h | Doc GitHub et Packagist | Environ 45 appels par build pour 21 dépôts : largement sous le quota ; cache et repli obligatoires (US-021) |
| CT-9 | Réutilisation du socle Agentic Agency (Astro 7.3, Tailwind 4, Pagefind) | PRD | Montée de versions mineures uniquement ; on abandonne `@vercel/*` et le Dockerfile limité à la production |

## Contraintes business

| # | Contrainte | Impact |
|---|-----------|--------|
| CB-1 | **Double objectif** : poste (objectif final) et missions freelance (immédiates) | Proposition de valeur unique et deux appels à l'action ; sprint 1 orienté conversion |
| CB-2 | **Urgence** : recherche active en cours | Walking skeleton en production en 2 semaines ; profil et preuves avant le blog |
| CB-3 | **Coût d'hébergement le plus bas possible** (Railway ou Cloudflare, comptes existants) | Comparatif chiffré dans un ADR |
| CB-4 | **Services tiers gratuits** (critère impératif) | Analytics, formulaire et RDV dans les offres gratuites, avec leurs limites (Calendly : 1 type d'événement ; Web3Forms : 250 envois par mois…) |
| CB-5 | **agentic-agency.fr reste intact** | Pas de redirection 301 ; contenu dupliqué accepté ; canonical vers le nouveau domaine (US-010) |
| CB-6 | Un seul contributeur, en parallèle de missions | Vélocité de 20 à 26 points par sprint ; automatisation maximale (CI, Renovate, publication programmée) |

## Contraintes réglementaires

| # | Contrainte | Impact |
|---|-----------|--------|
| CR-1 | **RGPD** : formulaire de contact (nom, e-mail, message) | Sous-traitant à identifier (localisation des données, DPA) ; mention d'information sous le formulaire ; durée de conservation |
| CR-2 | **Directive ePrivacy** : aucun cookie non essentiel sans consentement | Analytics sans cookie (Cloudflare Web Analytics ou Umami), donc pas de bandeau ; Calendly en lien sortant (pas de cookies tiers sur le site) |
| CR-3 | **LCEN** : mentions légales obligatoires (éditeur, hébergeur) | Page « Mentions légales » à ajouter (pas d'US dédiée aujourd'hui, voir le delta du backlog) |
| CR-4 | Accessibilité : WCAG 2.2 AA, cible interne du PRD (l'obligation RGAA ne vise pas un site personnel) | DoD et CI (axe, Lighthouse) |
| CR-5 | Données personnelles du CV source (téléphone, âge, adresse) | Liste blanche des champs publiés, contrôle en CI |
| CR-6 | Licences des contenus et des images migrés (Unsplash dans le blog) | Vérifier la licence et l'attribution lors de la migration (US-009) |

## Contraintes de ressources

| # | Contrainte | Impact |
|---|-----------|--------|
| CRS-1 | Un seul développeur (agentique), pas de DevOps dédié | Infrastructure minimale et gérée ; aucun serveur à maintenir |
| CRS-2 | Production de contenu (tests d'outils, traductions) chronophage | Protocole imposé par le schéma ; 3 tests au lancement puis rythme soutenable |
| CRS-3 | Budget de fonctionnement visé à 0 € (hors domaine) | Hébergement et services gratuits ; seul coût incompressible : le nom de domaine (et Railway si cette option est retenue) |
