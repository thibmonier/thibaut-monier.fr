# Rétrospective - Sprint 3 : Blog migré et SEO

## Informations

| Attribut | Valeur |
|----------|--------|
| Date | 2026-10-15 |
| Format | Starfish |
| Facilitateur | Orchestrateur (agent Scrum Master) |
| Participants | PO (contributeur unique) + orchestrateur et workers agentiques (exécution orchestrée) |
| Sprint Goal | Rapatrier les articles d'Agentic Agency sur le nom propre, avec le nouveau domaine comme référence, et rendre tout le site lisible par les moteurs classiques et IA. |
| Branche | `feature/sprint-003-blog_migre_seo` (PR n°3, brouillon) |

## Directive Fondamentale

> « Peu importe ce que nous découvrons, nous comprenons et croyons sincèrement que tout le monde a fait le meilleur travail possible, compte tenu de ce qui était connu à ce moment-là, de ses compétences et capacités, des ressources disponibles et de la situation. »
> — Norman Kerth

Appliquée ici : la série de CI rouges, le build non relancé avant un push, le worker bloqué 45 minutes ou le `PUBLIC_SITE_URL` sans schéma sont des défauts de système (contrôles manquants, contrats non écrits, disque contraint), pas des fautes de personnes ni d'agents. L'orchestrateur qui a poussé sans relancer le build complet l'a fait avec un disque à 1,2 Go, une décision PO de laisser la CI faire foi, et aucun contrôle qui l'obligeait à relancer ce build.

## Rappel du sprint

| Mesure | Valeur |
|--------|--------|
| US livrées | 8 / 8 (25 pts), toutes « Done sous réserve PO » |
| Vélocité | 25 pts (sprints 1 et 2 : 24 et 25) ; moyenne 24,7 ; points acceptés par le PO : 0 à ce jour |
| Revue DoD indépendante | 88/100 (première passe, 0 bloquant, 4 majeurs), 95/100 en seconde passe |
| CI | Verte sur `095eb39` : 615 e2e exécutés / 3 ignorés autorisés, Lighthouse ≥ 0,95 sur 26 pages, artefact `redirections-nginx` |
| Runs CI de la branche | 8 : 2 annulés, 4 échecs, 2 succès (+ 1 en cours sur `79cbae1`) |
| Parallélisme | 2 workers séquencés (disque), pas de 3e worker |
| Environnement | Disque à 1,2 Go libres au pic ; 0 perte de volume Docker |

## Suivi des actions de la rétro du sprint 2

Preuves relevées le 2026-10-15 dans le dépôt.

| # | Action | Résultat | Preuve |
|---|--------|----------|--------|
| 1 | Contrôle `no-global-prune` | ✅ Fait | `scripts/checks/no-global-prune.content.check.ts` ; commit `69089a4` ; agents et commandes nettoyés (`960ff62`) ; contrôle vert en CI ; 0 perte de volume au sprint 3 |
| 2 | Contrat d'interface entre lots | ✅ Fait | Contrats C1 à C6 commités en phase 0 (`47390fa`, `52fece2`) avant les worktrees ; un seul lecteur de la collection (`lib/blog.ts`) ; la revue DoD ne relève aucun doublon de lecteur |
| 3 | Zones append-only | ✅ Fait | `mk/lot-a.mk`, `mk/preflight.mk`, `changelog.d/`, board tenu par l'orchestrateur seul ; aucun conflit manuel signalé dans la revue DoD |
| 4 | `make preflight`, budget disque ≥ 8 Go | ⚠️ Partiellement fait | **Fait** : cible `preflight` (`mk/preflight.mk:7`), 2 workers, 1 build à la fois. **Manque** : le seuil de la cible est de 5 Go, pas de 8 Go ; démarrage à 6,1 Go ; pic à 1,2 Go ; e2e local abandonné (décision PO) |
| 5 | `contenu-a-valider.md` par lots de 5 | ⚠️ Partiellement fait | **Fait** : fichier créé, 6 lots de 5 au plus. **Manque** : 0/28 articles validés, validation des sprints 1 et 2 non constatée, 24 des 25 points toujours « sous réserve » |
| 6 | Vélocité et actions reportées du sprint 1 | ✅ Fait | Liste d'exceptions e2e et décompte exécutés/ignorés (`b470591`), `docs/guides/worktrees-agents.md`, section « Pièges d'environnement » dans `docs/guides/qualite-ci.md` ; capacité 25 pts |

**Bilan** : 4 faites, 2 partielles, 0 non faite (contre 1 / 3 / 2 au sprint 2). Progrès net : les actions transformées en contrôles exécutables (1, 2, 3, 6) sont tenues. Les deux partielles dépendent du PO ou d'un seuil laissé plus bas que la cible.

| Sprint | Action | Responsable | Statut |
|--------|--------|-------------|--------|
| S2 | 1. no-global-prune | Orchestrateur | ✅ Fait |
| S2 | 2. Contrat entre lots | Orchestrateur | ✅ Fait |
| S2 | 3. Zones append-only | Orchestrateur | ✅ Fait |
| S2 | 4. preflight 8 Go | Orchestrateur / PO | ⚠️ Partiel (seuil 5 Go) |
| S2 | 5. Validation PO par lots | Orchestrateur / PO | ⚠️ Partiel (0/28) |
| S2 | 6. Actions reportées S1 | PO / Orchestrateur | ✅ Fait |

## Check-in

| Membre | Mood |
|--------|------|
| PO | À renseigner en séance |
| Orchestrateur | 😐 (livraison complète et revue à 95, mais cinq CI rouges évitables et une validation de contenu toujours à zéro) |

## Observations (Starfish)

### 🟢 Continuer
- Contrats entre lots avant les worktrees : aucun doublon de lecteur, fusions sans conflit manuel.
- Zéro perte de volume Docker grâce au contrôle `no-global-prune`.
- Revue DoD indépendante à mi-sprint (puis seconde passe) : 4 écarts majeurs trouvés, dont un artefact de redirections absent de la CI et un `wasm-unsafe-eval` servi sur toutes les pages.
- Contrôles de build qui échouent franchement (domaine en dur, `PUBLIC_SITE_URL`, JSON-LD, titres, redirections).
- Liste d'exceptions e2e versionnée : « 3 ignorés » n'est plus une vérification à la main.

### 🟡 Commencer
- Un build complet local ou dans Docker avant chaque push de l'orchestrateur, ou une porte automatique équivalente.
- Un test d'intégration du contexte Docker : tout test qui lit un fichier du dépôt vérifie qu'il existe dans le contexte.
- Une estimation de durée de CI par page avant d'ajouter un contrôle qui parcourt toutes les pages.
- Une consigne de routage des rapports de sous-agents de workers vers l'orchestrateur, dans le gabarit de prompt.
- Un budget de relance pour un worker bloqué : relance ou arrêt après 15 minutes sans sortie.
- Une validation PO des articles dès le premier lot livré, pas en fin de sprint.

### 🔴 Arrêter
- Pousser sans relancer le build complet (contrôle `no-hardcoded-domain` cassé, découvert en CI).
- Laisser des tests dépendre de fichiers hors du contexte Docker (test lisant `ci.yml`).
- Changer le rendu d'un contenu (typographie) sans rechercher les tests qui en dépendent (test e2e des titres de série).
- Cache GHA figé : un export de cache non invalidé a masqué un changement.
- Laisser un hook bloquer la lecture de `.env.example` sans contournement documenté.

### ⬆️ Plus de
- Contrôles automatiques à la place des règles écrites (4 actions sur 6 du sprint 2 sont tenues pour cette raison).
- Mesure avant optimisation (Lighthouse : 46 pages × 3 trop long, échantillonnage à 26 pages et délai de 30 min).
- Messages d'erreur explicites : `PUBLIC_SITE_URL` sans schéma dit maintenant ce qu'il faut corriger.

### ⬇️ Moins de
- CI rouge en série : cinq causes distinctes sur 8 runs.
- Dépendance du PO pour les validations de contenu en fin de sprint (24 points sur 25 sous réserve).
- Statuts de tâches périmés (board contradictoire à la première passe, 16 tâches hétérogènes à la seconde, m9).

## Thèmes identifiés et priorisation

| # | Thème | Votes |
|---|-------|-------|
| 1 | Qualité avant push : CI rouge en série | ●●●●● |
| 2 | Validation PO d'un volume de contenu (28 articles, 22 images, 3 FAQ) | ●●●● |
| 3 | Disque contraint et e2e local abandonné | ●●●● |
| 4 | Coordination agentique : rapports routés, worker bloqué 45 minutes | ●●● |
| 5 | Déploiement : configuration d'environnement, hook, cache | ●● |

## Discussion

### Thème 1 : CI rouge en série

**Problème** : 8 runs, 4 échecs et 2 annulations. Causes : (a) Lighthouse en timeout (46 pages × 3 sur un délai trop court, corrigé par échantillonnage à 26 pages et délai de 30 min, `e579165`) ; (b) contrôle `no-hardcoded-domain` cassé par une correction de l'orchestrateur (`c964f3b`) ; (c) test lisant `ci.yml` absent du contexte Docker (`d15df9c`) ; (d) test e2e non mis à jour après la typographie des titres (`095eb39`) ; (e) export du cache GHA figé.

**5 Pourquoi** :
1. Pourquoi cinq échecs ? → Chaque correction a été vérifiée par la CI, pas en local.
2. Pourquoi pas en local ? → Disque à 1,2 Go au pic, e2e local abandonné par décision PO.
3. Pourquoi ce choix n'a-t-il pas été compensé ? → La CI dure environ 15 minutes et aucun contrôle intermédiaire (build complet, tests unitaires) n'était obligatoire avant un push.
4. Pourquoi les tests ne détectent-ils pas l'écart avec le contexte Docker ? → Les tests unitaires tournent hors de l'image ; la liste des fichiers du contexte n'est pas vérifiée.
5. **Cause racine** : la décision « la CI fait foi » a été prise sans définir la porte minimale locale qui la précède, et aucun sprint-goal ne fixe un plafond de runs rouges.

**Solution** : actions 1 et 2.

### Thème 2 : validation des contenus

**Problème** : 0/28 articles validés, 3 FAQ, 22 licences d'images, anomalies d'origine (pieds « Prochain article » vers des contenus inexistants, numéros de série périmés, licence de Caveman), environ 420 lignes de typographie.

**5 Pourquoi** :
1. Pourquoi 0 validé ? → Le PO n'a pas relu les lots pendant le sprint.
2. Pourquoi ? → Les lots n'ont été livrés au PO qu'au moment de la revue, le jalon n°2 est au 2026-11-18, après la fin du développement.
3. Pourquoi ? → Le flux produit le contenu en une migration d'ensemble (28 articles), puis soumet des lots.
4. Pourquoi ? → Un article migré n'est visible dans la file du PO que via un fichier Markdown de suivi, sans signal.
5. **Cause racine** : la validation n'a pas de rythme ni de limite de travail en cours ; elle dépend d'une disponibilité hors sprint.

**Solution** : action 3.

### Thème 3 : disque et e2e local

**Problème** : 1,2 Go libres au pic, 2 workers séquencés, aucun e2e local. `make preflight` vérifie 5 Go au lieu de 8.

**Cause racine** : l'espace dépend du Mac du PO partagé avec d'autres projets (images Playwright, Typst, outils, volumes OrbStack) ; la cible a été abaissée plutôt que l'espace libéré. **Solution** : action 4.

### Thème 4 : coordination agentique

**Problème** : des rapports de sous-agents de workers sont arrivés à l'orchestrateur sans passer par leur worker ; le worker de phase 0 est resté bloqué 45 minutes avant reprise.

**Cause racine** : le gabarit de prompt ne dit ni où router un rapport de sous-agent, ni quand arrêter un worker silencieux. **Solution** : action 5.

### Thème 5 : déploiement

**Problème** : le déploiement Railway a échoué car `PUBLIC_SITE_URL` n'avait pas de schéma (corrigé par le PO ; message explicite ajouté dans `1ded799`) ; un hook a bloqué la lecture de `.env.example`.

**Cause racine** : les variables de production n'ont pas de contrôle de format avant le déploiement ; le périmètre du hook n'est pas documenté. Le message explicite traite déjà la première cause ; pas d'action dédiée au-delà de l'action 5 (documentation des pièges d'environnement).

## Actions SMART (Sprint 4)

### Action 1 : Porte locale avant push

| Attribut | Valeur |
|----------|--------|
| Description | Ajouter une cible `make prepush` qui exécute dans Docker le lint, `astro check`, les tests unitaires et le build complet avec les contrôles de contenu et de dist, sans e2e. Elle est inscrite dans le gabarit de prompt de l'orchestrateur et des workers (« aucun push sans `make prepush` vert »). Elle inclut un contrôle qui échoue si un test ou un script lit un fichier absent du contexte Docker (liste d'inclusion de `.dockerignore`). |
| Responsable | Orchestrateur |
| Deadline | Avant `/workflow:start 4` |
| DoD | `make prepush` échoue sur un fichier de test lisant `.github/workflows/ci.yml` et passe sur le dépôt ; sa durée est inférieure à 8 min ; au sprint 4, le nombre de runs CI en échec dû à une erreur détectable par `prepush` est de 0 (relevé par `gh run list` à la revue). |
| Priorité | Haute |

### Action 2 : Plafond de runs rouges et budget de durée de CI

| Attribut | Valeur |
|----------|--------|
| Description | Mesurer la durée de chaque job de la CI (T-900-25 reporté) et la publier dans le résumé du run ; séparer Lighthouse du job `e2e` (T-900-21 reporté) ; fixer deux plafonds dans le sprint-goal du sprint 4 : durée totale de CI ≤ 20 min, et au plus 2 runs rouges évitables par sprint. Tout nouveau contrôle qui parcourt toutes les pages déclare son coût par page. |
| Responsable | Orchestrateur |
| Deadline | Jalon n°1 du sprint 4 |
| DoD | Résumé du run avec la durée par job ; Lighthouse dans un job dédié ; sprint-goal du sprint 4 contenant les deux plafonds ; revue du sprint 4 qui relève les valeurs mesurées. |
| Priorité | Haute |

### Action 3 : Validation PO par lots au fil de l'eau

| Attribut | Valeur |
|----------|--------|
| Description | Le PO valide les 6 lots d'articles de `contenu-a-valider.md`, les 3 FAQ, les licences des 22 images (CR-6) et arbitre les anomalies de contenu (pieds « Prochain article », numéros de série, licence de Caveman) ; il décide de m4 (lien d'origine) et de la typographie des corps (420 lignes) ; les ADR-0011 et ADR-0012 passent à « Accepté ». Pour le sprint 4, un lot de 5 éléments au plus est soumis par jour de développement, et l'orchestrateur ne démarre pas un nouveau lot de contenu tant que 2 lots restent « à valider ». |
| Responsable | PO (validation et décisions) ; Orchestrateur (rythme des lots) |
| Deadline | Validation des 28 articles avant la fusion de la PR n°3, au plus tard le 2026-11-18 (jalon n°2) ; règle du lot par jour : dès le sprint 4 |
| DoD | `contenu-a-valider.md` : 28/28 articles `validé`, 3 FAQ validées, 22 licences déclarées ; US-009 à US-013, US-024 à US-026 et les US des sprints 1 et 2 passées de `done-pending-po` à `done` dans `.bmad/sprint-status.yaml` ; aucun lot supérieur à 5 éléments au sprint 4. |
| Priorité | Haute |

### Action 4 : Budget disque tenu par le contrôle

| Attribut | Valeur |
|----------|--------|
| Description | Remonter le seuil de `make preflight` à 8 Go (`mk/preflight.mk:7`), et faire afficher le plafond de workers qui en découle (1 worker sous 3 Go, arrêt sous 1,5 Go). Le PO libère l'espace (volumes OrbStack inutiles, anciennes images) avant le démarrage du sprint 4, sans prune global. Consigner l'espace minimal observé dans le journal du sprint. |
| Responsable | Orchestrateur (cible) ; PO (libère l'espace) |
| Deadline | Avant `/workflow:start 4` |
| DoD | `make preflight` échoue sous 8 Go et passe au-dessus ; l'espace libre au démarrage du sprint 4 est ≥ 8 Go et noté dans la checklist ; espace minimum du sprint 4 ≥ 3 Go ; 0 crash OrbStack ; contrôle `no-global-prune` toujours vert. |
| Priorité | Moyenne |

### Action 5 : Gabarit de prompt agentique : routage, relance et pièges d'environnement

| Attribut | Valeur |
|----------|--------|
| Description | Compléter le gabarit de prompt worker (`tasks/README.md`) et `docs/guides/worktrees-agents.md` : (a) les rapports de sous-agents sont adressés à l'orchestrateur par un seul message de fin de mission, jamais en boucle ; (b) un worker sans sortie pendant 15 minutes est relancé une fois puis arrêté, la décision est consignée au journal ; (c) section « Pièges d'environnement » complétée : `PUBLIC_SITE_URL` avec schéma, périmètre du hook sur `.env.example`, invalidation du cache GHA. |
| Responsable | Orchestrateur |
| Deadline | Avant la création des worktrees du sprint 4 |
| DoD | Gabarit et guide contenant (a), (b), (c) (vérifiable par `grep`) ; au sprint 4, 0 worker bloqué plus de 15 minutes sans relance consignée et 0 rapport de sous-agent routé hors de l'orchestrateur. |
| Priorité | Moyenne |

## Check-out

ROTI : à renseigner en séance par le PO (échelle 1 à 5). Estimation de l'orchestrateur : 3/5 (livraison complète et revue à 95/100, mais cinq CI rouges évitables et 0 point accepté).

Verbatims à recueillir :
- « Ce que j'emporte de cette rétro : »

## Prochaine étape

Validation PO des contenus (action 3), puis marquer la PR n°3 prête, squash merge, déploiement et fumée réelle (T-900-26 et T-900-28). Ensuite `/workflow:start 4` une fois les actions 1, 2 et 4 faites.
