# Sprint 003 : Blog migré et SEO

## Informations

| Attribut | Valeur |
|----------|--------|
| Numéro | 3 |
| Début | 2026-11-12 |
| Fin | 2026-11-25 |
| Durée | 10 jours ouvrés |
| Capacité | 25 points (vélocité de référence : 24 pts au sprint 1, 25 pts au sprint 2, moyenne 24,5 ; plage 24,5 pts ± 20 % soit 19,6 à 29,4) |
| Branche | `feature/sprint-003-blog_migre_seo` (créée depuis `main` après fusion de la PR n°2) |
| Dépôt | https://github.com/thibmonier/thibaut-monier.fr |
| Prérequis | `pre-sprint-checklist.md` |
| Parallélisme | 2 workers au maximum (disque : 6,1 Go libres, objectif de rétro 8 Go non atteint) |

## Objectif du sprint (Sprint Goal)
> Rapatrier les articles d'Agentic Agency sur le nom propre, avec le nouveau domaine comme référence, et rendre tout le site lisible par les moteurs classiques et IA.

## Cérémonies (adaptées à un contributeur unique)
| Cérémonie | Durée |
|-----------|-------|
| Sprint Planning partie 1 (QUOI) | 1 h |
| Sprint Planning partie 2 (COMMENT : /project:decompose-tasks) | 1 h |
| Daily (point de suivi asynchrone, /common:daily-standup) | 5 min/jour |
| Affinage du backlog | 5 à 10 % du sprint |
| Sprint Review (démo en production) | 1 h |
| Rétrospective | 45 min |

### Calendrier
| Cérémonie / jalon | Date |
|-------------------|------|
| Planning parties 1 et 2 | 2026-11-12 |
| Jalon n°1 : US-009 et US-010 fusionnées et déployées ensemble ; actions reportées de la rétro faites | 2026-11-17 |
| Revue DoD indépendante à mi-sprint | 2026-11-18 |
| Jalon n°2 : validation PO des contenus des sprints 1 et 2 (action 5 de la rétro) | 2026-11-18 |
| Affinage (sprint 4) | 2026-11-19 |
| Sprint Review (démo en production) | 2026-11-25 |
| Rétrospective (Starfish) | 2026-11-25 |

## User stories sélectionnées
| ID | Titre | Points | Priorité | Dépend de | Statut |
|----|-------|--------|----------|-----------|--------|
| US-009 | Migration des 28 articles | 5 | Must | US-002 | 🔲 |
| US-010 | Canonical et table de correspondance | 2 | Must | US-009 | 🔲 |
| US-011 | Navigation blog | 3 | Should | US-009 | 🔲 |
| US-012 | Recherche plein texte | 2 | Should | US-009 | 🔲 |
| US-013 | Flux RSS | 2 | Should | US-009 | 🔲 |
| US-024 | SEO technique et JSON-LD | 5 | Must | US-005, US-009, US-020 | 🔲 |
| US-025 | Images Open Graph | 3 | Should | US-002 | 🔲 |
| US-026 | Analytics sans cookie et conversions | 3 | Should | US-007, US-008 | 🔲 |

**Total : 25 points**

## Ordre d'exécution
1. US-009 → US-010 (à déployer ensemble)
2. US-011, US-012, US-013
3. US-024, US-025, US-026

### Séquencement en 2 workers (contrainte disque)
| Phase | Worker 1 | Worker 2 |
|-------|----------|----------|
| 1 (jusqu'au jalon n°1) | US-009 → US-010 (7 pts) | US-026, puis US-025 (6 pts) : indépendants du blog |
| 2 (après fusion du lot du worker 1) | US-011, US-012, US-013 (7 pts) | US-024 (5 pts) : exige les articles migrés |

Règles : jamais plus de 2 workers ni plus d'un build d'image à la fois ; budget par worker ≤ 1,5 Go ; contrats entre lots commités avant la création des worktrees (voir `pre-sprint-checklist.md` §6) ; aucun worker n'écrit dans `task-board.md`, `CHANGELOG.md`, la navigation ou le `Makefile` (fragments, fusion par l'orchestrateur).

## Incrément livrable
Les 28 articles sont servis sur le nouveau domaine, chaque article déclare le nouveau domaine comme canonique (agentic-agency.fr reste intact), et le site expose sitemap, llms.txt et JSON-LD complet ; les conversions sont mesurées.

## Périmètre et décisions déjà prises
- **Source des articles** : `/Users/tmonier/Projects/blog/src/content/blog/` (28 fichiers Markdown, frontmatter `title`, `description`, `pubDate`, `tags`, `category`, `series`, `image`, `draft`) et images dans `/Users/tmonier/Projects/blog/public/` (`blog/`, `images/`, 8,8 Mo). **Lecture seule** : copie dans le dépôt, aucune écriture dans `/Users/tmonier/Projects/blog/`.
- **agentic-agency.fr reste intact** : canonical autoréférent sur le nouveau domaine, table de correspondance versionnée et fichier de redirections généré **sans être déployé** (US-010). agentic-agency.fr répond 401 (relevé du 2026-10-14) : il n'est pas public, donc il n'y a pas de risque de contenu dupliqué public (R-01 caduc).
- **Domaine définitif non acheté** : toutes les URL absolues (canonical, sitemap, RSS, JSON-LD, Open Graph) sont construites à partir de `PUBLIC_SITE_URL` (sous-domaine Railway provisoire d'ici là) via un module unique ; aucune URL de domaine en dur.
- **Umami Cloud** (US-026) : `PUBLIC_UMAMI_WEBSITE_ID` ; si la variable est absente, aucun script n'est injecté (repli sans mesure). Sans cookie, sans bandeau.
- **Pagefind** (US-012) : index généré au build, fonctionnement dégradé sans JavaScript.
- **astro-og-canvas** (US-025) : image Open Graph générée au build pour chaque page éligible.
- **JSON-LD** reporté des sprints 1 et 2 vers US-024 : `ItemList`, `SoftwareSourceCode`, `BreadcrumbList`, `Article`, `Person` / `ProfilePage`. Reprend aussi le sitemap (N13, E15 du sprint 2).
- **Hors périmètre** : la Boîte à outils (EPIC-004), les redirections 301 sur agentic-agency.fr, l'anglais.

## Definition of Done (rappel)
- [ ] Revue de code (auto-revue + CI verte, contributeur unique) et revue DoD indépendante à mi-sprint (2026-11-18)
- [ ] Tests passants, couverture ≥ 80 % sur le code testable
- [ ] **0 test e2e ignoré non justifié** (liste d'exceptions versionnée avec raison et date ; nombre exécuté / ignoré affiché dans la CI) : report de l'action 1 du sprint 1
- [ ] Qualité : lint, formatage, vérification de types Astro, build sans erreur
- [ ] Aucun marqueur de brouillon (« à vérifier », TODO, « lorem ») dans les pages construites
- [ ] Contenus rédigés depuis les sources validés par le PO (`contenu-a-valider.md`) ; **lots de 5 éléments au maximum** soumis à la validation
- [ ] Accessibilité et performance contrôlées (Lighthouse ≥ 95, axe sans violation) ; durée de la CI mesurée (plafond e2e de 20 min, 15 min 51 s au sprint 2) avec échantillonnage Lighthouse des pages en série
- [ ] Vérification sur l'image Docker réellement construite (variables de build `PUBLIC_*` transmises, dont `PUBLIC_SITE_URL` et `PUBLIC_UMAMI_WEBSITE_ID`)
- [ ] 28 articles : canonical autoréférent unique, sitemap exhaustif, JSON-LD valide, aucune URL de domaine en dur, aucun lien interne cassé
- [ ] Aucune commande de nettoyage Docker globale (contrôle `no-global-prune` vert) ; espace libre minimal du sprint consigné
- [ ] Documentation et ADR mis à jour (nouvel ADR pour Umami et Pagefind si la CSP ou ADR-0009 change)
- [ ] Déployable en production (conteneur Docker, Railway) ; build à blanc Railway et runner avant le premier merge

## Risques identifiés
| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Espace disque insuffisant (6,1 Go libres, 8 Go visés, 97 % utilisé) : crash OrbStack comme au sprint 2 | Élevée | Élevé | `make preflight` (échec sous 8 Go, démarrage toléré à 6,1 Go par décision PO consignée), 2 workers maximum, 1 build d'image à la fois, budget ≤ 1,5 Go par worker, 1 worker si < 3 Go libres, arrêt si < 1,5 Go, CI comme référence |
| Prune Docker global détruisant des volumes du PO (5 volumes MySQL perdus au sprint 1) | Moyenne | Élevé | Contrôle `no-global-prune` en CI, interdiction dans chaque prompt de worker, seuls `docker compose -p <projet> down -v` et `builder prune -f` autorisés |
| ~~Contenu dupliqué avec agentic-agency.fr~~ (caduc : ancien site non public, 401 relevé du 2026-10-14) | Nulle | - | Aucun risque dupliqué public ; canonical autoréférente testée ; table de correspondance prête ; Search Console sans changement d'adresse |
| Domaine définitif inconnu : URL absolues erronées dans canonical, sitemap, RSS, JSON-LD, Open Graph | Élevée | Élevé | Module unique lisant `PUBLIC_SITE_URL`, test qui échoue si un domaine est en dur, vérification sur l'image construite avec deux valeurs |
| Articles sources : frontmatter hétérogène, images lourdes (8,8 Mo), liens internes obsolètes, champ `draft` | Moyenne | Moyen | Schéma Zod de la collection, contrôle de build (28 articles, images présentes et pondérées), conversion des liens, source jamais modifiée |
| Validation PO d'un gros volume (28 articles) en fin de sprint | Moyenne | Élevé | Lots de 5 articles au plus (`contenu-a-valider.md`) livrés au fil de l'eau |
| Pagefind : WebAssembly et CSP (ADR-0009), poids de l'index, étape de build dans l'image Docker | Moyenne | Moyen | Test sur l'image construite, ADR si la CSP évolue, repli sans JavaScript |
| Umami Cloud : script tiers contraire à « aucune ressource externe au runtime » (ADR-0004, ADR-0009, ADR-0010) | Moyenne | Moyen | Décision d'architecture écrite avant l'US-026, CSP restreinte au seul domaine Umami, repli sans script si `PUBLIC_UMAMI_WEBSITE_ID` absent, compte Umami créé par le PO |
| astro-og-canvas : dépendance native (CanvasKit), polices à embarquer, temps et poids du build | Moyenne | Moyen | Build à blanc dans l'image Docker dès le premier jour du worker, polices locales, limite de poids par image |
| JSON-LD incohérent entre pages (plusieurs constructeurs) | Moyenne | Moyen | Un seul module de construction partagé par toutes les pages, validation de schéma en test, un lot unique (US-024) |
| Durée de la CI (15 min 51 s au sprint 2, plafond e2e 20 min) aggravée par 28 pages d'articles et les images OG | Élevée | Moyen | Mesure dès la première fusion, échantillonnage Lighthouse, découpage du job si > 17 min |
| Conflits de fusion sur les zones append-only | Moyenne | Faible | Action 3 de la rétro : un fichier par collection, `changelog.d/`, `mk/<lot>.mk`, task-board tenu par l'orchestrateur seul |
| Doubles lecteurs d'une même donnée (N1, N2 du sprint 2) | Moyenne | Moyen | Contrats entre lots commités avant les worktrees, un seul module lecteur par fichier |
| Validation PO du sprint 2 toujours en attente, PR n°2 non fusionnée : base du sprint instable | Moyenne | Élevé | Fusion de la PR n°2 (squash) et déploiement avant le 2026-11-12 ; sinon branche du sprint 3 créée depuis la branche du sprint 2 et décision PO consignée |
