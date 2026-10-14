# Rétrospective - Sprint 2 : Preuves : profil complet et open source

## Informations

| Attribut | Valeur |
|----------|--------|
| Date | 2026-10-14 |
| Format | Starfish |
| Facilitateur | Orchestrateur (agent Scrum Master) |
| Participants | PO (contributeur unique) + orchestrateur et workers agentiques (exécution orchestrée) |
| Sprint Goal | Rendre les preuves d'expertise consultables (CV PDF, compétences, 20 plugins Sylius, tailsfadmin, contributions career-ops) pour transformer une visite en prise de contact. |
| Branche | `feature/sprint-002-preuves_profil_open_source` |

## Directive Fondamentale

> « Peu importe ce que nous découvrons, nous comprenons et croyons sincèrement que tout le monde a fait le meilleur travail possible, compte tenu de ce qui était connu à ce moment-là, de ses compétences et capacités, des ressources disponibles et de la situation. »
> — Norman Kerth

Appliquée ici : la perte des volumes MySQL du PO, les conflits de fusion ou le test axe cassé sont des défauts de système (garde-fous absents, contrats non écrits, hypothèses de dimensionnement), pas des fautes de personnes ni d'agents. Le worker du sprint 1 qui a lancé un prune global l'a fait avec les consignes et les connaissances du moment : rien dans son prompt ne signalait des volumes appartenant à d'autres projets.

## Rappel du sprint

| Mesure | Valeur |
|--------|--------|
| US livrées | 7 / 7 (25 pts), toutes « Done sous réserve PO » (validation PO sur la production en attente) |
| Vélocité | 25 pts (sprint 1 : 24 pts) : référence stable, plage de planification 24 pts ± 20 % confirmée |
| Gate sprint | 100/100 après une remédiation |
| Revue DoD indépendante | Première passe 52/100 (CI rouge + 3 autres bloquants), score révisé 85/100 après correction de B1 à B4 |
| CI | Verte au run 38616206639 : e2e 427 réussis, 0 échec, 3 ignorés attendus ; Lighthouse ≥ 0,95 sur 29 pages |
| Packagist | 19 plugins publiés sur 20 vérifiés avant rédaction |
| Parallélisme | 3 workers en worktrees (lots 1, 2, 3), fusionnés par l'orchestrateur (`merge: lot N`) |
| Environnement | Disque à 2,5 Go libres au pic ; OrbStack planté deux fois ; 5 volumes MySQL des plugins Sylius du PO perdus |

## Suivi des actions de la rétro du sprint 1

Preuves relevées le 2026-10-14 dans le dépôt (état du `HEAD` `0053c07` et de l'arbre de travail).

| # | Action | Résultat | Preuve |
|---|--------|----------|--------|
| 1 | Garde-fou « zéro test e2e ignoré » | ⚠️ Partiellement fait | **Fait** : mode strict `E2E_EXPECT_FULL_CONFIG: '1'` (`.github/workflows/ci.yml:21`) ; une variable de build absente est une erreur, pas un skip (`tests/e2e/contact.spec.ts:29-31`) ; la DoD du sprint (`sprint-goal.md`) exige « 0 test e2e ignoré non justifié » ; la CI du sprint 2 a eu 3 ignorés attendus, 0 inattendu (`dod-review.md`). **Manque** : aucune liste d'exceptions versionnée (raison + date) ni échec CI automatique sur un skip hors liste, et pas de compte exécutés/ignorés dans le résumé CI (aucune occurrence dans `.github/` ni `scripts/`). Les « 3 attendus » sont vérifiés à la main. |
| 2 | `make preflight` (disque ≥ 10 Go, nettoyage Docker) | ❌ Non fait | Aucune cible `preflight` dans le `Makefile` (cibles : help, dev, preview, build, ..., ci). La checklist du sprint 2 le note « cible absente » ; le disque a démarré à 5,0 Gio (`pre-sprint-checklist.md` §4.3, `gate-report.md:36`), 2,5 Go au pic, 5,1 Gio libres aujourd'hui (`df`). Conséquence directe : crashs OrbStack. |
| 3 | `docs/guides/worktrees-agents.md` | ⚠️ Partiellement fait | **Fait en pratique** : la procédure est appliquée et décrite dans `tasks/README.md:73` (worktrees créés par l'orchestrateur, sans `git` pour les workers, `COMPOSE_PROJECT_NAME` et ports distincts) ; 3 lots créés puis fusionnés sans relance causée par une base erronée (commits `6ee2059`, `38f7199`, `8bf7d6b`). **Manque** : le guide n'existe pas (`docs/guides/` : aucun `worktrees-agents.md`). La procédure vit dans un README de sprint, pas dans la documentation durable. |
| 4 | Recalibrage de la vélocité en points | ✅ Fait | `.bmad/sprint-status.yaml` : sprint 1 `points: 24`, sprint 2 `capacity_points: 25` ; capacité justifiée dans `pre-sprint-checklist.md` (24 pts ± 20 %, engagement 25) ; pilotage en points et cycles de vérification. |
| 5 | `contenu-a-valider.md` + test anti-marqueur | ⚠️ Partiellement fait | **Fait** : contrôle bloquant des marqueurs de brouillon (`scripts/checks/placeholders.dist.check.ts`, `scripts/checks/lib/placeholders.ts`, `tests/unit/checks/placeholders.test.ts`), vert dans la CI. **Manque** : `contenu-a-valider.md` introuvable dans le dépôt (cité seulement dans les documents de sprint) ; validation PO des contenus du sprint 1 non constatée (US-001 et US-029 toujours `done-pending-po`, `pre-sprint-checklist.md` §1) ; les 7 US du sprint 2 sont « Done sous réserve PO ». |
| 6 | Pièges d'environnement (aliases, Railway, runner) | ❌ Non fait (non prouvé) | Aucune section « Pièges d'environnement » dans `docs/guides/qualite-ci.md`, `docs/adr/0003-environnements-docker.md` ni `CLAUDE.md` (recherche de `alias`, `command curl`, `--mount=type=cache`, `--no-build` : rien). Aucune trace du build à blanc Railway/runner avant le premier merge. Pas de blocage de ce type signalé pendant le sprint 2, mais l'absence de problème ne prouve pas l'action. |

**Bilan** : 1 faite, 3 partiellement faites, 2 non faites. Les deux non faites (2 et 6) sont les deux actions d'« environnement », et ce sont elles qui se retrouvent dans les problèmes du sprint 2 (disque, volumes perdus). Thème récurrent : on écrit une règle dans un document de sprint, on ne la transforme pas en contrôle exécutable.

### Tableau de suivi (format du workflow)

| Sprint | Action | Responsable | Statut |
|--------|--------|-------------|--------|
| S1 | 1. Garde-fou zéro e2e ignoré | Orchestrateur | ⚠️ Partiel (mode strict, pas de liste d'exceptions) |
| S1 | 2. `make preflight` | Orchestrateur / PO | ❌ Non fait |
| S1 | 3. Guide worktrees | Orchestrateur | ⚠️ Partiel (procédure appliquée, guide absent) |
| S1 | 4. Vélocité en points | PO / Orchestrateur | ✅ Fait |
| S1 | 5. Contenu à valider + anti-marqueur | PO / Orchestrateur | ⚠️ Partiel (test fait, liste et validation absentes) |
| S1 | 6. Pièges d'environnement | Orchestrateur | ❌ Non fait |

## Check-in

| Membre | Mood |
|--------|------|
| PO | À renseigner en séance |
| Orchestrateur | 😐 (livraison complète et propre, mais une perte de données chez le PO et un disque encore au bord) |

## Observations (Starfish)

### 🟢 Continuer
- 3 workers parallèles en worktrees créés par l'orchestrateur : la procédure du sprint 1 a supprimé le blocage git.
- Gate sprint à 100/100 après une seule remédiation.
- Vérifier les faits externes avant d'écrire : Packagist contrôlé (19 plugins sur 20 publiés) avant la rédaction des fiches.
- Mode strict de la CI (`E2E_EXPECT_FULL_CONFIG=1`) : CI verte avec 0 skip inattendu.
- Revue DoD indépendante : 4 vrais bloquants trouvés (dont des faits publiés inexacts : matrices de compatibilité de 10 fiches, date de release de tailsfadmin), corrigés avec des contrôles automatiques (`src/lib/compatibility.ts`, test de cohérence tag/date).

### 🟡 Commencer
- Un contrat d'interface écrit et publié avant le lancement des workers (format et lecteur unique du JSON de métriques, schémas partagés).
- Des fichiers d'enregistrement éclatés (un fichier par lot) ou une fusion systématique par l'orchestrateur pour les zones append-only.
- Un budget disque vérifié par un contrôle exécutable avant le sprint.
- Une validation PO du contenu par lots, au fil du sprint, pas à la fin.
- Une consigne de fin de mission pour les workers : un seul rapport, puis arrêt.

### 🔴 Arrêter
- Les `docker system prune` / `docker volume prune` globaux : ils ont probablement détruit 5 volumes MySQL des plugins Sylius du PO (origine probable : un worker du sprint 1). Interdiction ajoutée en cours de sprint, trop tard pour ces données.
- Les tests globaux à délai fixe (axe sur toutes les pages découvertes : cassé quand le site est passé de 7 à 31 pages).
- Les doubles lecteurs d'un même fichier de données (`src/lib/live-stats.ts` et `src/lib/oss-metrics.ts` pour `oss-metrics.json`, N1/N2 de la revue DoD).
- Laisser des workers relancer des rapports en boucle après livraison (arrêt manuel nécessaire).

### ⬆️ Plus de
- Contrôles automatiques à la place des règles écrites : chaque défaut trouvé en revue devient un test ou un contrôle de build.
- Revue DoD à mi-sprint : elle a repéré la CI rouge et les faits inexacts avant la clôture.
- Documentation durable des procédures (guides, pas seulement README de sprint).

### ⬇️ Moins de
- Conflits de fusion sur les zones append-only (`src/content.config.ts`, `CHANGELOG.md`, `Makefile`, navigation, `task-board.md`).
- Consommation disque en parallèle : un build d'image par worker avec `COMPOSE_PROJECT_NAME` distinct (2,5 Go libres au pic, OrbStack planté deux fois).
- Volume de contenu éditorial rédigé par agent d'un seul bloc (20 fiches) : la validation PO devient lourde.

## Thèmes identifiés et priorisation

| # | Thème | Votes |
|---|-------|-------|
| 1 | Hygiène de l'environnement Docker : prune destructeurs, disque tendu | ●●●●● |
| 2 | Coordination des workers : contrat d'interface, zones append-only, rapports en boucle | ●●●● |
| 3 | Validation PO d'un gros volume de contenu | ●●● |
| 4 | Règles écrites jamais transformées en contrôles (actions 2, 3, 5, 6 du sprint 1) | ●●● |
| 5 | Tests globaux fragiles à la croissance du site | ●● |

## Discussion

### Thème 1 : perte des volumes MySQL du PO

**Problème** : 5 volumes MySQL des plugins Sylius du PO ont disparu, probablement après un prune global lancé par un worker du sprint 1 ; découverte pendant le sprint 2.

**5 Pourquoi** :
1. Pourquoi les volumes ont-ils disparu ? → Un `docker ... prune` global les a supprimés (volumes non rattachés à un conteneur en cours).
2. Pourquoi un worker a-t-il lancé un prune global ? → Pour libérer de l'espace, disque à 291 Mo puis 5 Go libres.
3. Pourquoi ce besoin répété de libérer de l'espace ? → Le disque était sous-dimensionné pour des images Playwright, Typst et `tools` rebâties par worker.
4. Pourquoi un prune global était-il permis ? → Les prompts des workers ne l'interdisaient pas, et l'action 2 du sprint 1 proposait précisément un « nettoyage Docker (`prune`) » sans le limiter au périmètre du projet.
5. Pourquoi le risque n'a-t-il pas été vu ? → **Cause racine** : un hôte partagé entre ce projet et d'autres projets du PO, sans règle de périmètre Docker ni contrôle automatique des commandes destructrices.

**Solution** : interdiction des prune globaux dans tous les prompts (faite), contrôle automatique des prompts et scripts (action 1), nettoyage limité aux ressources du projet (`COMPOSE_PROJECT_NAME`), budget disque (action 4).

### Thème 2 : coordination des workers

**Problème** : conflits sur les zones append-only ; deux lecteurs du même JSON.

**5 Pourquoi** :
1. Pourquoi deux lecteurs ? → Le lot 2 (affichage) et le lot 3 (collecte) ont chacun défini leur lecture du JSON.
2. Pourquoi sans schéma commun ? → Le contrat n'a été figé qu'après coup, le schéma `ossMetricsSchema` existant n'était pas imposé au lot 2.
3. Pourquoi ? → `tasks/README.md` décrit l'ordre des lots et les fichiers, pas les interfaces entre lots.
4. Pourquoi les conflits sur les fichiers de configuration ? → Chaque lot ajoute sa ligne dans le même fichier ; la règle « l'orchestrateur résout » est un correctif a posteriori, pas une conception.
5. Pourquoi ? → **Cause racine** : le découpage en lots a porté sur les US, pas sur les points de contact (données partagées, fichiers d'enregistrement).

**Solution** : actions 2 et 3.

### Thème 3 : validation du contenu

**Cause racine** : 20 fiches rédigées en un bloc par un agent, validation PO prévue en fin de sprint. La liste `contenu-a-valider.md` de l'action 5 du sprint 1 n'existe pas, donc rien ne structure la relecture. Solution : action 5.

### Thème 4 : règles sans contrôle

**Cause racine** : le suivi montre 2 actions sur 6 non faites et 3 partielles ; les parties faites sont celles qui sont des contrôles exécutables (mode strict CI, test anti-marqueur, valeurs dans le YAML), les parties manquantes sont des documents et des cibles. Solution : chaque action ci-dessous a un critère vérifiable par une commande ou un test, et la revue de fin de sprint relève la preuve (pas de case cochée sans preuve).

### Thème 5 : test axe à délai fixe

**Cause racine** : le délai de 30 s ne dépendait pas du nombre de pages. Corrigé (`433c63e`, délai proportionnel au nombre de pages découvertes). Pas d'action dédiée : intégré au suivi des tests globaux dans l'action 6.

## Actions SMART (Sprint 3)

Dates : le sprint 3 démarre après la validation PO du sprint 2 ; les échéances sont des jalons de sprint ou des dates.

### Action 1 : Interdiction des prune globaux dans tous les prompts, avec contrôle

| Attribut | Valeur |
|----------|--------|
| Description | L'interdiction est inscrite dans les prompts des workers (fait en cours de sprint 2). Ajouter un contrôle : un script `scripts/checks/no-global-prune` (ou test) qui échoue si un prompt de sprint, un script du dépôt, le `Makefile` ou un workflow contient `docker system prune`, `docker volume prune`, `docker container prune`, `docker image prune -a`, `docker builder prune -a` sans filtre sur le projet. Le nettoyage autorisé est limité aux ressources du projet (`docker compose -p <projet> down -v`, `COMPOSE_PROJECT_NAME`). Consigner aussi la règle dans `docs/guides/qualite-ci.md` et dans `tasks/README.md` (gabarit de prompt worker). |
| Responsable | Orchestrateur |
| Deadline | Avant `/workflow:start 3` |
| DoD | Le contrôle échoue sur un fichier de test contenant `docker system prune` et réussit sur le dépôt ; il est exécuté en CI (`make ci`) ; le gabarit de prompt worker contient l'interdiction ; 0 commande prune globale dans le journal du sprint 3. Le PO a confirmé l'inventaire des volumes à recréer (5 bases MySQL Sylius) et leur origine (action PO). |
| Priorité | Haute |

### Action 2 : Contrat d'interface entre lots publié avant le lancement des workers

| Attribut | Valeur |
|----------|--------|
| Description | Ajouter à `/workflow:start` et au gabarit `tasks/README.md` une section « Contrats entre lots » : pour toute donnée ou API partagée entre lots (fichier JSON, schéma de collection, composant), un fichier de contrat (schéma Zod ou type partagé, exemple de données) commité sur la branche du sprint avant la création des worktrees. Les workers l'importent, ils ne le redéfinissent pas. Un seul module lecteur par fichier de données. |
| Responsable | Orchestrateur |
| Deadline | Planning du sprint 3, avant le lancement du premier worker |
| DoD | Pour chaque donnée partagée du sprint 3, un contrat existe dans le dépôt avant la première fusion de lot ; la revue DoD ne relève aucun nouveau doublon de lecteur (cible : 0 finding de type N1/N2) ; N1 et N2 du sprint 2 résolus (`getLiveStats` typé par `OssMetrics`, liste des dépôts dérivée du frontmatter) ou reportés par décision PO consignée. |
| Priorité | Haute |

### Action 3 : Réduction des conflits sur les zones append-only

| Attribut | Valeur |
|----------|--------|
| Description | Éliminer les conflits à la source : (a) `src/content.config.ts` : un fichier de déclaration par collection et un index qui les agrège (ou glob), (b) `CHANGELOG.md` : fragments par lot (`changelog.d/<lot>.md`) assemblés par l'orchestrateur à la clôture, (c) `task-board.md` et navigation : mis à jour uniquement par l'orchestrateur après fusion, jamais par un worker. Le `Makefile` : les cibles ajoutées par un lot passent par un fichier `mk/<lot>.mk` inclus. |
| Responsable | Orchestrateur |
| Deadline | Fin du premier jalon du sprint 3 (avant la fusion du premier lot) |
| DoD | Au sprint 3, 0 conflit de fusion à résoudre à la main sur ces fichiers (mesuré : aucun marqueur de conflit dans les fusions `merge: lot N`) ; documenté dans `tasks/README.md`. |
| Priorité | Moyenne |

### Action 4 : Budget disque ≥ 8 Go avant sprint, avec `make preflight`

| Attribut | Valeur |
|----------|--------|
| Description | Reprendre l'action 2 du sprint 1, jamais réalisée : cible `make preflight` (échec si espace libre < 8 Go, affiche `df` et `docker system df`, suggère uniquement un nettoyage limité au projet, jamais un prune global). Budget par worker concurrent documenté (images construites avec `COMPOSE_PROJECT_NAME` distinct) et nombre de workers parallèles plafonné par l'espace libre mesuré. Le PO libère l'espace nécessaire (volumes OrbStack, anciennes images) avant le démarrage. |
| Responsable | Orchestrateur (cible, plafond de workers) ; PO (libère l'espace) |
| Deadline | Avant `/workflow:start 3` |
| DoD | `make preflight` échoue avec un message clair sous 8 Go et passe au-dessus ; l'espace libre relevé au démarrage du sprint 3 est ≥ 8 Go et noté dans la checklist ; 0 crash OrbStack pendant le sprint 3 ; l'espace minimum observé pendant le sprint est consigné dans le journal. |
| Priorité | Haute |

### Action 5 : Validation du contenu par le PO par lots

| Attribut | Valeur |
|----------|--------|
| Description | Créer enfin `contenu-a-valider.md` (action 5 du sprint 1) : un tableau par élément rédigé par agent (accroche, expériences, 20 fiches plugins par lots de 5, étude de cas career-ops, page tailsfadmin, années des réalisations), avec statut à valider / validé / à corriger. Les lots de contenu sont livrés et relus au fil du sprint (un lot de 5 fiches par validation, pas 20 d'un coup) et le contrôle de build exige que les éléments publiés soient « validés ». |
| Responsable | Orchestrateur (liste, lots) ; PO (validation) |
| Deadline | Liste : avant `/workflow:start 3`. Validation PO des contenus des sprints 1 et 2 : à mi-sprint 3 (jalon n°2) au plus tard. |
| DoD | 100 % des éléments des sprints 1 et 2 en « validé » ; US-001, US-029 et les 7 US du sprint 2 passent de « Done sous réserve PO » à `done` ; pour le sprint 3, aucun lot de contenu supérieur à 5 éléments soumis d'un coup. |
| Priorité | Haute |

### Action 6 : Suivi de la vélocité et fermeture des actions de rétro avec preuve

| Attribut | Valeur |
|----------|--------|
| Description | (a) Consigner la vélocité du sprint 2 (25 pts, 7 US) dans `.bmad/sprint-status.yaml`, calculer la moyenne glissante (24, 25 → 24,5) et fixer la capacité du sprint 3 à 25 pts ± 20 % ajustée au risque ; la vélocité compte les US réellement `done` après validation PO, pas « sous réserve ». (b) Reporter dans le plan du sprint 3 les actions restantes du sprint 1 : liste d'exceptions e2e versionnée et compte exécutés/ignorés dans le résumé CI (action 1 S1), `docs/guides/worktrees-agents.md` (action 3 S1), section « Pièges d'environnement » et build à blanc Railway/runner (action 6 S1). Chacune a une commande de vérification dans le sprint-goal. |
| Responsable | PO (décision de capacité) ; Orchestrateur (calcul, suivi) |
| Deadline | Planning du sprint 3 (calcul et capacité) ; actions reportées : jalon n°1 du sprint 3 |
| DoD | Vélocité du sprint 2 et moyenne consignées ; capacité du sprint 3 fixée et justifiée ; les 3 actions reportées sont faites avec preuve (fichier, test ou commande) ou abandonnées par décision PO explicite ; le suivi de la rétro du sprint 3 ne contient aucune action « non faite » sans décision. |
| Priorité | Moyenne |

## Check-out

ROTI : à renseigner en séance par le PO (échelle 1 à 5). Estimation de l'orchestrateur : 4/5.

Verbatims à recueillir :
- « Ce que j'emporte de cette rétro : »

## Prochaine étape

`/workflow:start 3` une fois les actions 1, 4 et 5 (liste) faites, les volumes MySQL du PO recensés, et la validation PO du sprint 2 engagée.
