---
title: 'Cycle en V, Agile, SDD × IA : de quelles équipes humaines a-t-on vraiment besoin ?'
seoTitle: 'Cycle en V, Agile, SDD × IA : quelles équipes humaines ?'
description: 'Comparaison phase par phase des équipes nécessaires en cycle en V, en Agile et en SDD × IA : effectifs, profils mobilisés et rôles qui se redistribuent.'
pubDate: 2026-02-08
tags: ['SDD', 'Méthode', 'IA générative', 'Agile', 'Delivery', 'Organisation']
category: 'Métiers'
series: 'Software-Driven Development'
seriesOrder: 2
image: '../../../assets/blog/team-equipes-humaines.webp'
imageAlt: "Quatre collègues souriants, assis et debout autour d'un ordinateur portable ouvert sur une table en verre, dans un bureau clair avec étagères de plantes"
draft: false
originalUrl: https://agentic-agency.fr/blog/projet-classique-vs-sdd-ia-quelles-equipes-humaines
originalPublishedAt: 2026-02-08
---

Dans l'article précédent, j'ai comparé les [timelines de trois méthodes projet](/blog/cycle-en-v-agile-sdd-comparaison-timelines/) — cycle en V, Agile et SDD × IA. Les durées s'effondrent. Mais une question reste ouverte : _qu'est-ce que ça change pour les équipes humaines ?_

Parce que la vraie différence entre ces trois approches n'est pas seulement le temps. C'est le nombre de personnes, les profils mobilisés, et surtout le moment où chaque compétence intervient.

Voici une comparaison phase par phase — pas pour dire que l'IA remplace les gens, mais pour montrer que les rôles se redistribuent.

---

## Phase amont : cadrage, découverte, spécification

C'est la phase où l'on comprend le besoin, où l'on définit le périmètre, où l'on pose les fondations du projet. C'est aussi la phase qui détermine tout ce qui suit.

### En cycle en V

Le cadrage mobilise beaucoup de monde, longtemps. Les rôles sont très segmentés.

| Rôle                      | Responsabilité                         |
| ------------------------- | -------------------------------------- |
| Chef de projet            | Coordination, planning, budget         |
| Business analyst          | Recueil des besoins, rédaction des SFD |
| Architecte technique      | Choix d'architecture, DAT              |
| UX designer               | Maquettes, parcours utilisateur        |
| Responsable qualité       | Plan de test, stratégie de recette     |
| Représentant métier (MOA) | Validation fonctionnelle               |

**Effectif type : 4 à 6 personnes pendant 2 à 4 mois.**

Le cycle en V sépare strictement les rôles. Chacun produit un livrable — cahier des charges, SFD, DAT, plan de test — qui est validé avant de passer à la phase suivante. La qualité du cadrage est réelle. Le coût aussi.

### En Agile

L'Agile compresse le cadrage dans un Sprint 0, mais les rôles restent nombreux.

| Rôle             | Responsabilité                          |
| ---------------- | --------------------------------------- |
| Product Owner    | Vision produit, priorisation du backlog |
| Scrum Master     | Facilitation, élimination des blocages  |
| UX/UI designer   | Prototypage, design system              |
| Tech Lead        | Architecture, choix techniques          |
| 2-3 développeurs | Estimation, POC technique               |

**Effectif type : 5 à 7 personnes pendant 3 à 4 semaines.**

Le cadrage est plus rapide, mais il mobilise déjà l'équipe de développement. C'est un investissement — les devs ne codent pas pendant le Sprint 0, ils estiment et prototypent.

### En SDD × IA

Le cadrage en SDD s'appuie sur le Double Diamond : découverte, puis définition. Mais l'équipe est radicalement plus réduite.

| Rôle                       | Responsabilité                                |
| -------------------------- | --------------------------------------------- |
| Lead SDD (CTO / senior)    | Interviews, spec, architecture, design system |
| Client / porteur du besoin | Expression du besoin, validation              |

**Effectif type : 1 à 2 personnes pendant 1 à 2 semaines.**

Le lead SDD cumule les fonctions de business analyst, architecte et designer. Ce n'est pas un raccourci — c'est possible parce que l'IA accélère la formalisation. La spec est rédigée avec l'assistance de l'IA, les composants du design system sont prototypés en temps réel, l'architecture est validée contre des contraintes documentées dans le CLAUDE.md du projet.

La condition : que le lead ait l'expérience métier et technique pour porter ces décisions seul. C'est un profil senior, pas un profil interchangeable.

---

## Phase de réalisation : développement et intégration

C'est la phase qui concentre le plus de travail humain dans les méthodes classiques — et c'est celle où le SDD × IA change le plus la donne.

### En cycle en V

Le développement est la phase la plus longue et la plus gourmande en effectif.

| Rôle                 | Responsabilité                          |
| -------------------- | --------------------------------------- |
| Chef de projet       | Suivi d'avancement, gestion des risques |
| 3 à 5 développeurs   | Développement des modules               |
| Intégrateur frontend | Intégration des maquettes               |
| DBA                  | Modélisation et optimisation BDD        |
| Testeur QA           | Rédaction et exécution des tests        |
| Ops / admin sys      | Préparation des environnements          |

**Effectif type : 6 à 10 personnes pendant 4 à 6 mois.**

Le travail est distribué par spécialité. Chaque changement de périmètre nécessite une chaîne de validation qui traverse plusieurs rôles. Le coût de coordination est significatif — réunions de suivi, rapports d'avancement, gestion des dépendances inter-modules.

### En Agile

L'Agile réduit la spécialisation au profit d'équipes cross-fonctionnelles.

| Rôle                          | Responsabilité                                 |
| ----------------------------- | ---------------------------------------------- |
| Product Owner                 | Priorisation continue, acceptation des stories |
| Scrum Master                  | Rituels, vélocité, amélioration continue       |
| 3 à 5 développeurs full-stack | Développement, tests, code review              |
| UX/UI designer                | Support design en continu                      |
| QA engineer                   | Tests automatisés, non-régression              |

**Effectif type : 5 à 7 personnes pendant 4 à 6 mois.**

L'équipe est stable sur la durée. La vélocité s'installe au bout de 2-3 sprints. Le coût humain est comparable au cycle en V sur la durée totale, mais le feedback arrive plus tôt et les corrections de trajectoire sont moins chères.

### En SDD × IA

C'est ici que la rupture est la plus visible. L'IA prend en charge la production de code sous supervision humaine.

| Rôle                           | Responsabilité                                        |
| ------------------------------ | ----------------------------------------------------- |
| Lead SDD                       | Pilotage des agents IA, review de code, gates qualité |
| Développeur senior (optionnel) | Modules complexes, intégrations tierces               |

**Effectif type : 1 à 2 personnes pendant 1 à 3 semaines.**

Le lead SDD ne code pas ligne par ligne. Il rédige les specs de sprint, configure les agents (CLAUDE.md, rules, skills), lance les générations, et valide chaque sortie contre les gates qualité. Le ratio est documenté : ce qu'une équipe de 5 devs produit en un sprint de deux semaines, un binôme humain-IA le produit en 2 à 3 jours.

Le développeur senior intervient quand le projet touche à des systèmes complexes — authentification, paiement, intégrations API tierces avec des edge cases non documentés. Ce n'est pas systématique.

---

## Phase de validation : tests, recette, qualité

La phase qui détermine si ce qui a été construit correspond à ce qui a été demandé — et si c'est suffisamment solide pour aller en production.

### En cycle en V

La recette est une phase à part entière, avec ses propres équipes.

| Rôle                 | Responsabilité               |
| -------------------- | ---------------------------- |
| Responsable recette  | Pilotage de la phase de test |
| 2 à 3 testeurs       | Exécution des cas de test    |
| Représentants métier | Validation fonctionnelle     |
| Développeurs         | Correction des anomalies     |

**Effectif type : 4 à 6 personnes pendant 2 à 4 mois.**

Les tests sont exécutés tardivement. Les anomalies découvertes à ce stade sont coûteuses à corriger — le code est stabilisé, les développeurs sont parfois déjà sur un autre projet. Le cycle correction → re-test → validation peut durer des semaines.

### En Agile

Les tests sont intégrés dans chaque sprint, mais une phase de stabilisation reste nécessaire.

| Rôle          | Responsabilité                         |
| ------------- | -------------------------------------- |
| QA engineer   | Tests automatisés, exploratory testing |
| Product Owner | Acceptation des stories                |
| Développeurs  | Correction en cours de sprint          |

**Effectif type : l'équipe sprint + 1 à 2 semaines de stabilisation.**

La qualité est meilleure en sortie de sprint qu'en cycle en V, parce que les tests arrivent plus tôt. Mais la phase de stabilisation finale — pour les tests de charge, les edge cases, la non-régression globale — mobilise encore du temps humain.

### En SDD × IA

Les tests sont générés avec le code. Les gates qualité sont bloquants à chaque sprint.

| Rôle     | Responsabilité                              |
| -------- | ------------------------------------------- |
| Lead SDD | Validation des gates, recette fonctionnelle |
| Client   | Test utilisateur, feedback                  |

**Effectif type : 1 à 2 personnes pendant 2 à 4 jours.**

L'IA génère les tests unitaires et d'intégration en même temps que le code. Le lead SDD exécute la recette assistée (QA Recette avec Claude in Chrome sur les parcours critiques). Le client teste sur un environnement de preview.

La condition : que la spec soit suffisamment précise pour que les tests générés couvrent les cas métier réels. C'est le retour au point de départ — la qualité de la spec détermine la qualité des tests.

---

## Phase de déploiement et mise en production

### En cycle en V

| Rôle           | Responsabilité                |
| -------------- | ----------------------------- |
| Ops / SRE      | Déploiement, monitoring       |
| Chef de projet | Coordination du go-live       |
| Support N1/N2  | Accompagnement post-lancement |

**Effectif type : 3 à 4 personnes pendant 2 à 4 semaines.**

### En Agile

| Rôle         | Responsabilité             |
| ------------ | -------------------------- |
| DevOps / SRE | CI/CD, déploiement continu |
| Scrum Master | Coordination               |

**Effectif type : 1 à 2 personnes, déploiement continu.**

### En SDD × IA

| Rôle     | Responsabilité             |
| -------- | -------------------------- |
| Lead SDD | Push to deploy, monitoring |

**Effectif type : 1 personne, 1 jour.**

Le CI/CD est configuré dès le Sprint 0. Le déploiement est un `git push`. Le monitoring est en place avant le premier déploiement. Il n'y a pas de "phase de déploiement" au sens classique — c'est un événement, pas un projet.

---

## Vue synthétique : les équipes comparées

| Phase            | **Cycle en V**              | **Agile**                | **SDD × IA**             |
| ---------------- | --------------------------- | ------------------------ | ------------------------ |
| **Cadrage**      | 4-6 pers. · 2-4 mois        | 5-7 pers. · 3-4 sem.     | 1-2 pers. · 1-2 sem.     |
| **Réalisation**  | 6-10 pers. · 4-6 mois       | 5-7 pers. · 4-6 mois     | 1-2 pers. · 1-3 sem.     |
| **Validation**   | 4-6 pers. · 2-4 mois        | 3-5 pers. · 1-2 sem.     | 1-2 pers. · 2-4 jours    |
| **Déploiement**  | 3-4 pers. · 2-4 sem.        | 1-2 pers. · continu      | 1 pers. · 1 jour         |
| **Total projet** | **8-12 pers. · 10-17 mois** | **5-7 pers. · 6-9 mois** | **1-3 pers. · 3-6 sem.** |

---

## Ce que ça implique vraiment

### Les rôles qui disparaissent

Pas les personnes — les rôles. En SDD × IA, il n'y a plus de chef de projet dédié, plus de business analyst séparé du tech lead, plus de testeur QA qui n'est pas aussi développeur. Ces fonctions existent toujours. Elles sont absorbées par le lead SDD et par l'IA.

### Les rôles qui deviennent critiques

Le **senior technique polyvalent** devient la ressource la plus précieuse. Celui qui comprend le métier, qui sait architecturer, qui peut rédiger une spec que l'IA exécutera correctement, et qui a le jugement pour valider ce qui sort. Ce profil existait avant — il était tech lead ou CTO. En SDD, il est le projet.

Le **client impliqué** devient indispensable. En cycle en V, le client pouvait déléguer à une MOA et revenir en recette. En SDD, le feedback client arrive en jour 2 ou 3. S'il n'est pas disponible, le projet ralentit — pas parce que l'IA est lente, mais parce que les décisions humaines sont le chemin critique.

### Ce que ça ne change pas

La compétence humaine reste le facteur limitant. L'IA accélère la production, pas la réflexion. Un projet mal cadré avec l'IA sera livré plus vite — mais il sera mal cadré plus vite. Les erreurs de conception se propagent à la vitesse de la génération de code.

C'est pour cette raison que le SDD ne remplace pas l'expérience par l'outillage. Il remplace les effectifs par la séniorité.

---

_Cet article fait partie de la série **Software-Driven Development** et complète la [comparaison des timelines projet](/blog/cycle-en-v-agile-sdd-comparaison-timelines/). La méthode SDD est documentée en détail sur la [page Méthode](https://agentic-agency.fr/methode)._
