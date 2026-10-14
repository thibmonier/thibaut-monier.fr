# Rétrospective - Sprint 1 : Walking skeleton

## Informations

| Attribut | Valeur |
|----------|--------|
| Date | 2026-10-14 |
| Format | Starfish |
| Facilitateur | Orchestrateur (agent Scrum Master) |
| Participants | PO (contributeur unique) + orchestrateur et workers agentiques (exécution orchestrée) |
| Sprint Goal | Mettre en production un site minimal mais complet où un recruteur ou un client comprend le positionnement, parcourt le parcours professionnel et peut prendre contact. |
| Branche | `feature/sprint-001-walking_skeleton` (18 commits depuis `main`) |

## Directive Fondamentale

> « Peu importe ce que nous découvrons, nous comprenons et croyons sincèrement que tout le monde a fait le meilleur travail possible, compte tenu de ce qui était connu à ce moment-là, de ses compétences et capacités, des ressources disponibles et de la situation. »
> — Norman Kerth

Appliquée ici : les défauts relevés ci-dessous sont des défauts de système (outillage, garde-fous, hypothèses d'estimation), pas des fautes de personnes ni d'agents.

## Rappel du sprint

| Mesure | Valeur |
|--------|--------|
| US livrées | 7 / 7 (24 pts) ; US-001 en `done-pending-po` (actions PO externes : domaine, clés) |
| Gate sprint | 100/100 après 1 correction de métadonnées (bloc `metadata` manquant dans `.bmad/sprint-status.yaml`) |
| CI | Verte, Docker partout (lint, types, tests, build, e2e, Trivy, SBOM) |
| Lighthouse | 100 |
| Revue DoD indépendante | `dod-review.md` : défauts réels détectés (voir ci-dessous) |
| Estimation initiale | 90 tâches, 236,5 h pour 24 pts (non pertinent en exécution agentique) |
| Vélocité | 24 pts livrés = première mesure de référence (à recalibrer, action 4) |

## Check-in

| Membre | Mood |
|--------|------|
| PO | À renseigner en séance |
| Orchestrateur | 😐 (livraison complète, mais un faux vert CI évité de justesse) |

## Observations (Starfish)

### 🟢 Continuer
- Gate sprint à 100/100 : le gabarit a bien servi, la seule correction a porté sur des métadonnées.
- CI verte avec Docker partout : même environnement en local, en CI et en production.
- TDD : tâches `[TEST]` RED avant implémentation dans chaque US.
- Workers parallèles en worktrees pour US-004, US-005, US-008, US-029.
- Lighthouse 100.
- Revue DoD **indépendante** (contexte frais, pas de biais d'auteur) : elle a trouvé ce que la CI ne voyait pas.

### 🟡 Commencer
- Un contrôle d'espace disque avant le sprint (le disque Mac à 291 Mo libres a bloqué l'image Playwright).
- Une procédure écrite de création de worktree pour sous-agents (base, branche, garde-fou git).
- Un garde-fou CI qui échoue si des tests e2e sont ignorés sans autorisation explicite.
- Une validation PO systématique du contenu rédigé depuis le CV, avant publication.
- Un test de non-régression sur les marqueurs de brouillon (« à vérifier », TODO) dans les pages publiées.
- Estimer en points et mesurer la vélocité, pas en heures.

### 🔴 Arrêter
- Faire confiance à « CI verte » comme preuve de livraison : 47 tests e2e ignorés, variables `PUBLIC_*` absentes du build Docker, détecté seulement par la revue DoD.
- Publier des contenus provisoires dans les pages publiques (marqueur « à vérifier » dans les mentions légales).
- Estimer en heures humaines (236,5 h pour 24 pts) en exécution agentique.
- Lancer des commandes shell avec les aliases interactifs de l'utilisateur (`curl`→curlie, `cat`, `mv -i`).

### ⬆️ Plus de
- Revues indépendantes, plus tôt (à mi-sprint, pas seulement en fin).
- Vérifications de bout en bout contre l'image réellement construite (pas seulement les tests unitaires).
- Documentation des particularités de la plateforme (Railway, runner CI) dans les guides et ADR.

### ⬇️ Moins de
- Corrections de compatibilité découvertes tard : `--mount=type=cache` sans `id` refusé par Railway ; `docker compose run --no-build` absent sur le runner (commits `8e8d5b9`, `df211d9`). Les valider sur la cible dès le premier jour.
- Relances manuelles de sous-agents (worktrees créés depuis `main`, garde-fou refusant git).
- Détail de planification à granularité d'heures (90 tâches).

## Thèmes identifiés et priorisation

| # | Thème | Votes |
|---|-------|-------|
| 1 | Faux vert CI (tests ignorés, variables de build) | ●●●●● |
| 2 | Environnement d'exécution fragile (disque, worktrees, aliases, compat Railway/runner) | ●●●● |
| 3 | Contenu publié non validé (marqueur, texte tiré du CV) | ●●● |
| 4 | Estimation inadaptée (heures vs points) | ●●● |

## Discussion

### Thème 1 : faux vert CI

**Problème** : la CI était verte alors que 47 tests e2e étaient ignorés.

**5 Pourquoi** :
1. Pourquoi 47 tests ignorés ? → Les tests e2e se sautent quand la configuration manque.
2. Pourquoi la configuration manquait-elle ? → Les variables `PUBLIC_*` n'atteignaient pas le build Docker (pas de `build-args` / `ARG`).
3. Pourquoi cela n'a-t-il pas échoué ? → « Ignoré » n'est pas « en échec » pour le runner.
4. Pourquoi personne ne l'a vu ? → Le rapport CI ne présente que vert/rouge, sans compte de tests ignorés.
5. Pourquoi ? → **Cause racine** : aucun critère explicite « 0 test ignoré non autorisé » dans la DoD ni dans la CI.

**Solution** : `af34b69` transmet les variables de build et refuse les tests ignorés (en partie fait) ; à compléter par un test de garde permanent (action 1).

### Thème 2 : environnement d'exécution

**Cause racine** : les conditions de la machine hôte (disque, aliases) et les règles des sous-agents (worktrees, garde-fous) n'étaient ni vérifiées ni documentées avant le sprint. Solutions : actions 2, 3, 6.

### Thème 3 : contenu non validé

**Cause racine** : le contenu a été rédigé à partir du CV sans étape de validation PO ; `5aeff95` a retiré le marqueur provisoire. Solution : action 5.

### Thème 4 : estimation

**Cause racine** : le gabarit de décomposition impose des heures humaines ; en exécution agentique, la durée dépend des cycles de vérification, pas du volume de saisie. Solution : action 4.

## Actions SMART (Sprint 2)

Sprint 2 démarre après le 2026-10-28 ; les échéances sont exprimées en date ou en jalon de sprint.

### Action 1 : Garde-fou « zéro test e2e ignoré »

| Attribut | Valeur |
|----------|--------|
| Description | Compléter `af34b69` : un test/étape CI qui échoue si un test e2e est ignoré (skipped) hors liste autorisée explicite (fichier versionné avec raison et date), et qui affiche le nombre de tests exécutés / ignorés dans le résumé de la CI. Ajouter à la DoD « 0 test ignoré non justifié ». |
| Responsable | Orchestrateur |
| Deadline | 2026-10-21 (avant la fin du sprint 1 si possible, sinon jalon n°1 du sprint 2) |
| DoD | Une PR de test qui ignore volontairement un e2e fait passer la CI au rouge ; la CI de `main` exécute 100 % des tests e2e attendus (nombre vérifié, 0 ignoré hors liste) ; la DoD mise à jour. |
| Priorité | Haute |
| Statut | 🔄 En partie fait (`af34b69`) |

### Action 2 : Contrôle d'espace disque avant sprint

| Attribut | Valeur |
|----------|--------|
| Description | Ajouter à `pre-sprint-checklist.md` et à un script `make preflight` : espace libre ≥ 10 Go, nettoyage Docker (`docker system df`, `prune`) proposé si en dessous, avant tout build d'image (Playwright). |
| Responsable | Orchestrateur (exécution) ; PO (libère de l'espace si le contrôle échoue) |
| Deadline | Avant le démarrage du sprint 2 (`/workflow:start 2`) |
| DoD | `make preflight` échoue avec un message clair quand l'espace libre est < 10 Go ; il est coché dans la checklist ; l'espace libre mesuré et noté au démarrage du sprint 2. |
| Priorité | Haute |

### Action 3 : Procédure worktree documentée pour sous-agents

| Attribut | Valeur |
|----------|--------|
| Description | Rédiger `docs/guides/worktrees-agents.md` : créer le worktree depuis la branche du sprint (pas `main`) avant de lancer le worker, branche dédiée par worker, ce que le garde-fou git autorise, procédure de relance manuelle et de fusion (`merge: lot ...`), nettoyage. |
| Responsable | Orchestrateur |
| Deadline | 2026-10-24 |
| DoD | Le guide existe et est lié depuis `tasks/README.md` ; au sprint 2, 0 relance manuelle de worker causée par une base de worktree erronée (mesuré dans le journal du sprint). |
| Priorité | Moyenne |

### Action 4 : Recalibrage de la vélocité en points

| Attribut | Valeur |
|----------|--------|
| Description | Abandonner l'estimation en heures humaines pour le pilotage ; piloter en points + nombre de cycles de vérification. Enregistrer la référence du sprint 1 (24 pts) dans `.bmad/sprint-status.yaml` et fixer la capacité du sprint 2 par rapport à elle (24 pts ± 20 %, ajustée selon le risque), sans plan d'heures détaillé. |
| Responsable | PO (décision de capacité) ; Orchestrateur (calcul) |
| Deadline | Planning du sprint 2 (avant 2026-10-28) |
| DoD | Vélocité du sprint 1 (24 pts livrés / 7 US) consignée ; capacité du sprint 2 fixée en points avec justification ; le gate sprint ne signale plus d'avertissement « heures ». |
| Priorité | Moyenne |

### Action 5 : Liste de validation du contenu par le PO

| Attribut | Valeur |
|----------|--------|
| Description | Produire `contenu-a-valider.md` : tout contenu rédigé depuis le CV (accroche, 7 expériences de la frise, chiffres, mentions légales, politique de vie privée), avec statut (à valider / validé / à corriger). Ajouter un test automatisé qui échoue sur « à vérifier », TODO, « lorem » dans les pages construites. |
| Responsable | PO (validation) ; Orchestrateur (liste et test) |
| Deadline | Liste : 2026-10-17. Validation PO complète : 2026-10-28 (fin du sprint 1, avant la bascule en production). |
| DoD | 100 % des éléments en « validé » par le PO ; le test anti-marqueur est vert en CI et échoue sur un marqueur injecté ; US-001 passe de `done-pending-po` à `done`. |
| Priorité | Haute |

### Action 6 : Exécution shell fiable (aliases et compatibilité cible)

| Attribut | Valeur |
|----------|--------|
| Description | Imposer `command curl` / chemins absolus et `-f` pour `mv`/`cp` dans les scripts et prompts des agents ; valider sur Railway et sur le runner CI dès le premier jour (build Docker sans `--mount=type=cache` sans `id`, pas de `--no-build`). Consigner dans le guide qualité et CI. |
| Responsable | Orchestrateur |
| Deadline | 2026-10-24 |
| DoD | Section « Pièges d'environnement » ajoutée au guide ; scripts du dépôt sans appel nu à `curl`/`cat`/`mv` ; un build à blanc sur Railway et sur le runner réalisé avant le premier merge du sprint 2. |
| Priorité | Moyenne |

## Suivi actions précédentes

Aucune : premier sprint.

## Check-out

ROTI : à renseigner en séance par le PO (échelle 1 à 5). Estimation de l'orchestrateur : 4/5.

Verbatims à recueillir :
- « Ce que j'emporte de cette rétro : »

## Prochaine étape

`/workflow:start 2` une fois les actions 2 et 4 faites et la validation PO (action 5) engagée.
