# Sprint 3 : checklist de démarrage (Blog migré et SEO)

Stack : Astro (site statique), Docker (développement et production), Railway (hébergement), GitHub Actions (CI), Pagefind, astro-og-canvas, Umami Cloud. Date de préparation : 2026-10-14. Les constats « au 2026-10-14 » viennent de la lecture du dépôt et du disque ce jour-là ; rien n'est coché sans preuve.

## Calcul de capacité

| Élément | Valeur |
|---------|--------|
| Période | 2026-11-12 au 2026-11-25 (10 jours ouvrés) |
| Équipe | 1 contributeur (Thibaut) + orchestrateur et 2 workers agentiques au plus |
| Vélocité historique | Sprint 1 : 24 pts ; sprint 2 : 25 pts ; moyenne glissante 24,5 pts |
| Réserve | Vélocité « livrée côté équipe » : 0 point accepté par le PO à ce jour (action 6 de la rétro : la vélocité compte les US `done` après validation PO) |
| Capacité | 24,5 pts ± 20 % (19,6 à 29,4), ajustée selon le risque |
| Engagement | 25 points (8 US) : dans la plage ; risque supérieur au sprint 2 (domaine inconnu, dépendances natives, disque) compensé par 3 US « Should » écartables (US-012, US-025, US-026 = 8 pts) |
| Pilotage | Points et cycles de vérification, pas d'heures |

## 1. Sprint précédent clôturé

- [x] Sprint Review préparée (`sprint-002-preuves_profil_open_source/sprint-review.md`)
- [x] Rétrospective faite le 2026-10-14 (`sprint-retro.md`)
- [ ] PR n°2 fusionnée sur `main` en squash merge (https://github.com/thibmonier/thibaut-monier.fr/pull/2)
- [ ] Déploiement automatique depuis `main` configuré sur Railway (Wait for CI) et production mise à jour
- [ ] `make smoke` exécuté sur la production et les 7 US du sprint 2 validées par le PO (`done-pending-po` vers `done`)
- [ ] US-001 et US-029 (sprint 1) passées de `done-pending-po` à `done`
- [ ] Vélocité du sprint 2 (25 pts) et moyenne (24,5) consignées dans `.bmad/sprint-status.yaml` après acceptation PO
- [ ] Phase 4 du sprint 2 : T-900-02 à T-900-06 faites, ou reportées dans le plan du sprint 3 par décision PO (voir §3)

## 2. Actions de la rétrospective du sprint 2

Constat de départ au 2026-10-14. Chaque action a une preuve vérifiable par commande ; une case n'est cochée qu'avec cette preuve.

| # | Action | Responsable | Échéance | Statut | Preuve attendue |
|---|--------|-------------|----------|--------|-----------------|
| 1 | Contrôle `no-global-prune` (prompts, scripts, `Makefile`, workflows) + règle dans `docs/guides/qualite-ci.md` et `tasks/README.md` ; inventaire PO des 5 volumes MySQL Sylius | Orchestrateur ; PO (inventaire) | Avant `/workflow:start 3` | 🔲 (aucun `no-global-prune` dans `scripts/checks/`) | Le contrôle échoue sur un fichier contenant `docker system prune`, réussit sur le dépôt, tourne dans `make ci` ; 0 prune global dans le journal du sprint |
| 2 | Contrats d'interface entre lots publiés avant les workers ; N1 et N2 du sprint 2 résolus ou reportés par le PO | Orchestrateur | Planning, avant le premier worker | 🔲 (voir §6) | Un contrat par donnée partagée commité sur la branche du sprint ; 0 finding de type N1/N2 à la revue DoD |
| 3 | Zones append-only : un fichier par collection, `changelog.d/<lot>.md`, `mk/<lot>.mk`, task-board et navigation par l'orchestrateur seul | Orchestrateur | Jalon n°1 (2026-11-17), avant la première fusion de lot | 🔲 (`changelog.d/` et `mk/` absents) | 0 marqueur de conflit dans les fusions `merge: lot N` ; décrit dans `tasks/README.md` |
| 4 | `make preflight` : échec sous 8 Go, affiche `df` et `docker system df`, nettoyage limité au projet ; plafond de workers selon l'espace libre ; le PO libère l'espace | Orchestrateur (cible) ; PO (espace) | Avant `/workflow:start 3` | ❌ (aucune cible `preflight` dans le `Makefile` ; 6,1 Go libres, objectif 8 Go non atteint) | `make preflight` échoue sous 8 Go avec message clair et passe au-dessus ; espace relevé au démarrage noté en §4.3 ; 0 crash OrbStack ; minimum observé consigné dans le journal |
| 5 | `contenu-a-valider.md` (accroche, expériences, 20 fiches par lots de 5, career-ops, tailsfadmin, années des réalisations) ; contrôle de build « validé » | Orchestrateur (liste) ; PO (validation) | Liste : avant `/workflow:start 3` ; validation sprints 1 et 2 : 2026-11-18 | ❌ (fichier introuvable dans le dépôt) | 100 % des éléments des sprints 1 et 2 « validé » ; aucun lot de contenu du sprint 3 > 5 éléments |
| 6 | Vélocité en points ; actions du sprint 1 reportées : liste d'exceptions e2e + compte exécutés/ignorés dans la CI, `docs/guides/worktrees-agents.md`, « Pièges d'environnement » + build à blanc Railway/runner | PO (capacité) ; Orchestrateur | Capacité : planning ; reportées : jalon n°1 | 🔲 (capacité fixée ici à 25 pts ; reportées non faites) | Fichiers, tests ou commandes de preuve, ou abandon explicite par le PO |

### Actions du sprint 1 reportées (aucune sans décision)

| Origine | Action | Preuve de fermeture | Statut au 2026-10-14 |
|---------|--------|---------------------|----------------------|
| S1-1 | Liste d'exceptions e2e versionnée (raison, date), échec CI sur skip hors liste, compte exécutés/ignorés dans le résumé CI | Fichier d'exceptions + étape CI + `grep` du compte dans le résumé | ⚠️ partiel (mode strict `E2E_EXPECT_FULL_CONFIG=1` seulement) |
| S1-3 | `docs/guides/worktrees-agents.md` | `test -f docs/guides/worktrees-agents.md`, lié depuis `docs/guides/README.md` | ⚠️ partiel (procédure dans `tasks/README.md` du sprint 2) |
| S1-6 | Section « Pièges d'environnement » (aliases, `command curl`, `--mount=type=cache` sans `id`, `--no-build`) + build à blanc Railway et runner avant le premier merge | Section dans `docs/guides/qualite-ci.md` ; run de build à blanc référencé | ❌ non fait |

## 3. Réserves du PO issues de la Sprint Review 2 et actions en attente

| Statut | Réserve ou action | Référence | Bloquant pour le sprint 3 ? | Traitement |
|--------|-------------------|-----------|-----------------------------|------------|
| 🔲 | Valider les contenus : profil, 13 réalisations (années), 35 compétences, 20 fiches, career-ops, tailsfadmin, exclusion de Punchout cXML (E4), anonymisation des clients (E12) | `contenu-a-valider.md` | Non (mais DoD) | Lots de 5, au plus tard le 2026-11-18 |
| 🔲 | Fusionner la PR n°2, configurer le déploiement depuis `main` (Wait for CI), vérifier Typst et poppler sur Railway (T-900-04) | Review §6 | Oui pour une base propre | Avant le 2026-11-12 |
| 🔲 | `make smoke` en production, validation des 7 US sur le site déployé | Review §6 | Non | Fin de semaine 1 |
| 🔲 | Reprises du sprint 1 : clé Web3Forms, Calendly, e-mail de repli, secrets `RAILWAY_TOKEN` et `SMOKE_URL` | Review §6.4 | Non | Variables optionnelles avec repli |
| 🔲 | Jeton de la collecte hebdomadaire (E13) ; publication de `sylius-agentic-feeds-plugin` sur Packagist ; release v1.6.2 de tailsfadmin ou arbitrage | Review §6.5 | Non | Hors sprint 3 |
| 🔲 | Corriger les README sources des plugins (compatibilité PHP/Symfony, B3) | Review §6.6 | Non | Hors dépôt |
| 🔲 | N2 et N11 : doubles lecteurs (`getLiveStats` typé par `OssMetrics`, liste des dépôts dérivée du frontmatter) | Review §7, rétro action 2 | Non | Premier lot (contrat) |
| 🔲 | N5 (scénario « Échec de génération » du CV sans test), N6 (contrôle poids et EXIF des captures), N9 (Markdown plutôt que MDX), N10 | Review §6 et §7 | Non | À planifier ou abandonner par décision PO |
| 🔲 | T-900-02 (e2e inter-US), T-900-03 (gate sprint 002, budgets CI), T-900-05 (README, index des guides, CHANGELOG, modèle de contenu), T-900-06 (revue transverse, validation PO en production) | Review §6 | Non | Reporter ou clore avant le 2026-11-12 |
| 🔲 | Mesure et optimisation de la durée de la CI (15 min 51 s, plafond e2e 20 min) : échantillonnage Lighthouse des fiches | Review §4 et §7 | Non, mais risque croissant | Mesure à la première fusion du sprint 3 |
| 🔲 | Aligner les stories : title du catalogue (N8), chemin périmé `src/content/experiences/*.yaml` de US-007, `content-model.md` (slug, vendor) | Review §7 | Non | Affinage |
| 🔲 | Sitemap (N13, E15) et JSON-LD : repris par US-024 | Review §7 | Non | Dans le sprint |
| 🔲 | Domaine définitif, DNS, `PUBLIC_SITE_URL` | S1 | Non | Sous-domaine Railway provisoire, URL via `PUBLIC_SITE_URL` |
| 🔲 | Compte Umami Cloud, `PUBLIC_UMAMI_WEBSITE_ID` | US-026 | Non | Sans variable : aucun script |
| 🔲 | Priorités du sprint 3 (SEO, EN, sitemap) et date de mise en production : feedback à recueillir | Review §8 | Non | Planning du 2026-11-12 |

## 4. Prérequis spécifiques au sprint 3

### 4.1 Sources de contenu

| Statut | Source | Usage | Vérifié le 2026-10-14 |
|--------|--------|-------|-----------------------|
| ✅ | `/Users/tmonier/Projects/blog/src/content/blog/` | US-009 : 28 articles Markdown (frontmatter `title`, `description`, `pubDate`, `tags`, `category`, `series`, `image`, `draft`), 316 Ko | Présent, 28 fichiers |
| ✅ | `/Users/tmonier/Projects/blog/public/` (`blog/`, `images/`) | US-009 : images des articles (`image: "/blog/...webp"`), 8,8 Mo | Présent |
| 🔲 | Lecture seule respectée : copie dans le dépôt, aucune écriture dans `/Users/tmonier/Projects/blog/` | Tous | Règle des prompts de workers |
| 🔲 | Inventaire des champs : `draft`, séries, catégories, tags, liens internes, images manquantes ou lourdes | US-009, US-011 | À faire au planning |
| 🔲 | URL d'origine sur agentic-agency.fr des 28 articles (pour la table de correspondance et « Initialement publié sur ») | US-010 | À relever sans modifier l'ancien site |
| ℹ️ | `/Users/tmonier/Projects/blog/src/content/tools/` (Boîte à outils) | EPIC-004, hors périmètre | Ne pas migrer |
| 🔲 | Validation PO des articles par lots de 5 (confidentialité, ton, exactitude des affirmations) | US-009 | Avant publication de chaque lot |

### 4.2 Outillage et données

| Statut | Élément | Remarque |
|--------|---------|----------|
| 🔲 | `agentic-agency.fr` intact | Aucune requête d'écriture ; canonical autoréférent sur le nouveau domaine ; table de correspondance et fichier nginx générés en artefact, non déployés (US-010) |
| 🔲 | `PUBLIC_SITE_URL` : module unique de construction des URL absolues | Valeur provisoire = sous-domaine Railway ; test qui échoue si un domaine est en dur ; `.env.example` à jour |
| 🔲 | Pagefind épinglé (version exacte), étape post-build dans l'image Docker | US-012 ; vérifier WebAssembly et CSP (ADR-0009) ; repli sans JavaScript |
| 🔲 | `astro-og-canvas` épinglé, polices locales, dépendances natives dans l'image | US-025 ; build à blanc avant tout développement ; limite de poids par image |
| 🔲 | Umami Cloud : compte créé par le PO, `PUBLIC_UMAMI_WEBSITE_ID` en variable de build | US-026 ; absent = aucun script, aucun cookie ; événements de conversion (CV, contact, RDV) ; décision d'architecture (script tiers) écrite avant le code |
| 🔲 | JSON-LD : un seul module de construction | US-024 : `ItemList` (catalogue), `SoftwareSourceCode` (plugins), `BreadcrumbList`, `Article`, `Person` / `ProfilePage` ; reporté des sprints 1 et 2 |
| 🔲 | Sitemap, `robots.txt`, `llms.txt` | US-024 ; URL absolues via `PUBLIC_SITE_URL` |
| 🔲 | Garde-fous : CSP et ADR-0004, 0009, 0010 revus pour Umami et Pagefind | Nouvel ADR si une règle change |

### 4.3 Environnement (disque : contrainte majeure)

| Statut | Contrôle | Valeur |
|--------|----------|--------|
| ⚠️ | Espace disque libre au démarrage : **objectif 8 Go** | **6,1 Go libres** (relevé PO) ; `df` du volume de données : 6,8 Gi libres, 97 % utilisé, le 2026-10-14. Objectif de rétro non atteint : démarrage conditionné à une décision PO consignée, ou à libération d'espace (volumes OrbStack, anciennes images, **jamais** par prune global) |
| 🔲 | `make preflight` (action 4) | Cible absente au 2026-10-14 ; relever la valeur à `/workflow:start` et au début de chaque phase |
| 🔲 | **2 workers maximum** | Plafond fixé par l'espace libre mesuré ; 1 seul worker si < 3 Go libres ; arrêt de tout build si < 1,5 Go |
| 🔲 | Séquencement sous **1,5 Go** | Budget d'un worker (images, `node_modules`, Playwright, artefacts) ≤ 1,5 Go ; un seul build d'image à la fois ; `COMPOSE_PROJECT_NAME` distinct ; nettoyage limité à `docker compose -p <projet> down -v` en fin de lot |
| 🔲 | **Surveillance active** | `df -h` relevé avant et après chaque lot, minimum noté dans le journal du sprint ; alerte à l'orchestrateur sous 3 Go |
| 🔲 | **Interdiction des prune Docker globaux** | `docker system prune`, `docker volume prune`, `docker container prune`, `docker image prune -a`, `docker builder prune -a` interdits (volumes MySQL Sylius du PO perdus au sprint 1) ; seuls `docker compose -p <projet> down -v` et `docker builder prune -f` sont permis ; règle recopiée dans chaque prompt de worker |
| 🔲 | Worktrees créés par l'orchestrateur depuis la branche du sprint, pas `main` | Workers sans `git` ; `tasks/README.md` |
| 🔲 | Commandes shell sans aliases interactifs (`command ls`, `command curl`, chemins absolus, `mv -f`) | Piège constaté : `ls` est un alias |
| 🔲 | Consigne de fin de mission : un seul rapport, puis arrêt | Évite les relances en boucle |
| 🔲 | Build à blanc sur Railway et sur le runner avant le premier merge | Pas de `--mount=type=cache` sans `id`, pas de `--no-build` |

## 5. Backlog et Definition of Ready

- [x] Sprint précédent clôturé côté équipe (validation PO en attente, voir §1)
- [ ] Backlog priorisé par le PO (8 US, 25 points)
- [ ] Gate `/gate:validate-sprint 3` exécuté

| US | Description et critères Gherkin | Estimée | Dépendances | Contenu / maquettes | Bloqueur |
|----|--------------------------------|---------|-------------|---------------------|----------|
| US-009 (5) | ✅ | ✅ | US-002 (livrée) | 28 articles et images sources | Inventaire des champs, validation PO par lots |
| US-010 (2) | ✅ (lue au 2026-10-14) | ✅ | US-009 | URL d'origine à relever | Domaine provisoire |
| US-011 (3) | ✅ | ✅ | US-009 | Catégories, tags, séries | Aucun |
| US-012 (2) | ✅ | ✅ | US-009 | Pagefind | CSP / WebAssembly |
| US-013 (2) | ✅ | ✅ | US-009 | RSS | `PUBLIC_SITE_URL` |
| US-024 (5) | ✅ | ✅ | US-005, US-009, US-020 | JSON-LD (5 types), sitemap, `llms.txt` | US-009 fusionnée |
| US-025 (3) | ✅ | ✅ | US-002 (livrée) | astro-og-canvas | Dépendance native, disque |
| US-026 (3) | ✅ | ✅ | US-007, US-008 (livrées) | Umami Cloud | Compte PO, décision d'architecture |

À confirmer par lecture des fichiers de story lors du planning (statut « ✅ » = déclaré par le backlog, non revérifié ici, sauf US-010).

## 6. Contrats entre lots (action 2 de la rétro)

À commiter sur la branche du sprint **avant** la création des worktrees. Les workers importent, ne redéfinissent pas ; un seul module lecteur par donnée.

| Donnée partagée | Producteur | Consommateurs | Contrat |
|-----------------|------------|---------------|---------|
| Schéma de la collection `blog` (champs du frontmatter) | US-009 | US-010, 011, 012, 013, 024, 025 | Schéma Zod dans un fichier par collection, agrégé par un index |
| Accès aux articles (liste triée, hors `draft`) | US-009 | RSS, navigation, Pagefind, sitemap, JSON-LD, OG | Un seul module (`getPublishedPosts`) |
| URL absolue du site | Aucun (module neuf) | US-010, 013, 024, 025 | Un seul module lisant `PUBLIC_SITE_URL`, avec repli et test |
| Table de correspondance (ancienne URL vers nouvelle) | US-010 | Test de couverture, artefact nginx | Schéma Zod + exemple de données |
| Construction du JSON-LD | US-024 | Toutes les pages | Un seul module, un type par fonction |
| Configuration d'analytics | US-026 | Layout, événements de conversion | Un seul lecteur de `PUBLIC_UMAMI_WEBSITE_ID` |
| Image OG d'une page | US-025 | US-024 (`og:image`) | Fonction `getOgImageUrl(page)` |

## 7. Cérémonies (contributeur unique)

| Cérémonie | Date proposée | Durée |
|-----------|---------------|-------|
| Planning partie 1 (QUOI) | 2026-11-12 | 1 h |
| Planning partie 2 (COMMENT, `/project:decompose-tasks 003`) | 2026-11-12 | 1 h |
| Daily asynchrone (`/common:daily-standup`) | Quotidien | 5 min |
| Jalon n°1 (US-009 et US-010 déployées ensemble) | 2026-11-17 | : |
| Revue DoD indépendante à mi-sprint | 2026-11-18 | 1 h |
| Validation PO des contenus (jalon n°2) | 2026-11-18 | 1 h |
| Affinage | 2026-11-19 | 30 min |
| Sprint Review (démo en production) | 2026-11-25 | 1 h |
| Rétrospective (Starfish) | 2026-11-25 | 45 min |

## 8. Checklist finale

### Avant le Planning
- [ ] Actions 1, 4 et 5 (liste) de la rétro faites avec preuve
- [ ] PR n°2 fusionnée, production à jour, sprint 2 validé par le PO
- [ ] Espace disque relevé et noté (objectif 8 Go ; 6,1 Go = dérogation PO consignée)
- [ ] Volumes MySQL Sylius du PO inventoriés
- [ ] Sources du blog vérifiées (28 articles, images)
- [ ] Capacité validée par le PO (25 points)

### Pendant le Planning
- [ ] Sprint Goal accepté
- [ ] Scope engagé (25 points) ; US « Should » écartables identifiées
- [ ] Dépendances confirmées (`sprint-dependencies.md`)
- [ ] Contrats entre lots écrits (§6)
- [ ] Découpage en tâches sans plan d'heures détaillé ; séquencement en 2 workers

### Après le Planning
- [ ] `task-board.md` créé (mis à jour par l'orchestrateur seul)
- [ ] Daily planifié
- [ ] `contenu-a-valider.md` complété pour les articles (lots de 5)
- [ ] Variables (`PUBLIC_SITE_URL`, `PUBLIC_UMAMI_WEBSITE_ID`) documentées dans `.env.example`
- [ ] Prompts de workers : interdiction des prune globaux, lecture seule du blog source, un rapport puis arrêt

## Prochaine étape

1. Lever les points ⚠️, ❌ et 🔲 de §1 à §4
2. `/gate:validate-sprint 3`
3. `/project:decompose-tasks 003`
4. `/sprint:next-story` (US-009 en premier)
