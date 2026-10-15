---
title: 'Cycle en V, Agile, SDD × IA : trois façons de livrer un projet, trois rapport au temps'
seoTitle: 'Cycle en V, Agile, SDD × IA : comparaison des timelines'
description: 'Cycle en V, Agile et SDD assisté par IA comparés sur un même projet : durées, hypothèses et conditions pour que les calendriers tiennent.'
pubDate: 2026-02-09
tags: ['SDD', 'Méthode', 'IA générative', 'Agile', 'Delivery']
category: 'Méthode'
series: 'Software-Driven Development'
seriesOrder: 1
image: '../../../assets/blog/kanban-timelines-methodes.webp'
imageAlt: 'Trois papiers adhésifs « To Do », « Doing » et « Done » tenus sur un avant-bras'
draft: false
originalUrl: https://agentic-agency.fr/blog/cycle-en-v-agile-sdd-comparaison-timelines
originalPublishedAt: 2026-02-09
---

Il y a une question qu'on pose systématiquement en début de projet : _combien de temps ça va prendre ?_

La réponse honnête, c'est que ça dépend moins de la complexité du projet que de la méthode avec laquelle on le pilote. Un projet de même périmètre peut prendre 18 mois en cycle en V, 6 mois en Agile classique, et 3 semaines en SDD assisté par IA — avec le même niveau de qualité livré.

Ce n'est pas une hyperbole. C'est ce que les équipes qui ont adopté le développement IA-augmenté documentent depuis deux ans. Et c'est ce que j'observe sur mes propres projets depuis que j'utilise la méthode SDD avec Claude Code.

Voici une comparaison honnête des trois approches — pas pour vendre l'IA comme une baguette magique, mais pour comprendre _pourquoi_ les timelines diffèrent, et à quelles conditions.

---

## Le cycle en V : la précision comme promesse, la rigidité comme coût

Le cycle en V est né dans les années 1970, dans des contextes où changer d'avis coûtait cher — aérospatiale, défense, infrastructures critiques. Son principe est simple : on spécifie complètement avant de construire, et on vérifie complètement après.

### La timeline type

Sur un projet applicatif métier de périmètre moyen (disons, un portail BtoB ou une application de gestion), voici ce que donne un cycle en V classique :

| Phase                         | Durée typique        |
| ----------------------------- | -------------------- |
| Expression des besoins        | 4 à 8 semaines       |
| Spécifications fonctionnelles | 6 à 10 semaines      |
| Architecture technique        | 4 à 6 semaines       |
| Développement                 | 16 à 24 semaines     |
| Tests d'intégration           | 4 à 8 semaines       |
| Recette utilisateur           | 4 à 8 semaines       |
| Déploiement                   | 2 à 4 semaines       |
| **Total**                     | **40 à 68 semaines** |

Soit entre 10 mois et 17 mois pour un projet de complexité moyenne. Et c'est dans les cas favorables — sans dérive de périmètre, sans turnover d'équipe, sans changement de direction client en cours de route.

### Ce qui fait tenir le cycle en V

Le cycle en V a des vertus réelles. La complétude de la spécification en amont permet de détecter les incohérences fonctionnelles avant d'avoir écrit une ligne de code. La traçabilité des exigences vers les tests est un atout majeur dans les contextes réglementés. Et la séparation nette des phases réduit les risques d'interférence entre équipes.

### Ce qui le brise

Le problème n'est pas la méthode — c'est l'hypothèse sur laquelle elle repose : que les besoins sont stables entre le début et la fin du projet. Cette hypothèse est vraie pour un pont ou un satellite. Elle est rarement vraie pour une application métier dont les utilisateurs découvrent leurs besoins réels en voyant les premières maquettes.

En pratique, le cycle en V produit des projets livrés en retard, hors budget, avec une spécification devenue obsolète avant la fin du développement. Pas parce que les équipes sont incompétentes. Parce que le modèle ne prévoit pas le changement.

---

## L'Agile classique : l'itération comme réponse, le rythme comme contrainte

Scrum et l'Agile sont apparus précisément pour résoudre le problème du cycle en V : et si on livrait de la valeur toutes les deux semaines au lieu d'attendre la fin du projet ?

### La timeline type

Sur le même projet applicatif métier en Agile classique (Scrum à deux semaines) :

| Phase                                             | Durée typique        |
| ------------------------------------------------- | -------------------- |
| Sprint 0 — cadrage, architecture, backlog initial | 3 à 4 semaines       |
| Sprint 1 — initialisation de la stack technique   | 2 semaines           |
| Sprints 2 à N — développement itératif            | 16 à 24 semaines     |
| Stabilisation et recette                          | 4 à 6 semaines       |
| Déploiement                                       | 1 à 2 semaines       |
| **Total**                                         | **26 à 38 semaines** |

Soit 6 à 9 mois. C'est environ deux fois plus rapide que le cycle en V sur des périmètres comparables — avec l'avantage d'avoir des livrables testables toutes les deux semaines.

### Ce que l'Agile résout

L'Agile intègre le changement dans son fonctionnement. Une user story peut être révisée entre deux sprints. Une feature peut être déprioritée quand on découvre qu'elle n'apporte pas la valeur attendue. Le premier livrable testable arrive bien plus tôt — en fin de sprint 1 ou 2, pas en fin de projet.

C'est la promesse qui a convaincu l'industrie. Et elle est tenue — dans les équipes qui ont la discipline de la maintenir.

### Ce que l'Agile ne résout pas

Deux problèmes persistent.

Le premier est structurel : l'Agile classe accélère la livraison de valeur, mais pas nécessairement la vitesse de production. Le feedback arrive plus tôt, mais le code prend toujours autant de temps à être écrit. Une feature de deux semaines en cycle en V prend deux semaines en Agile.

Le second est organisationnel : l'Agile à grande échelle (SAFe, LeSS, multi-équipes) réintroduit une partie de la lourdeur du cycle en V sous forme de PI Planning, de ceremonies de synchronisation et de dépendances inter-équipes. La vélocité s'érode avec la taille.

L'infographie d'Octo Technology le formule très bien : en Agile classique, le premier livrable réellement testable par les utilisateurs arrive en fin de semaine 3 ou 4 au mieux. Le feedback réel — pas le feedback sur des maquettes, mais sur du code qui tourne — arrive avec deux sprints de décalage. Et le risque principal n'est pas la lenteur, c'est la rigidité qui se réinstalle subrepticement sous forme de backlog figé et de rituels devenus des fins en soi.

---

## SDD × IA : la rupture de rythme

Le Software-Driven Development n'est pas une nouvelle méthode de gestion de projet. C'est une discipline de production qui change fondamentalement la vitesse à laquelle on passe de la spec au code testé.

Le principe central : **la spec est le pivot**. Non pas un document figé livré en début de projet, mais un référentiel vivant qui gouverne chaque génération de code. L'IA — Claude Code avec des agents spécialisés — génère sous supervision humaine. Chaque sortie est validée contre la spec par des gates qualité bloquants.

### La timeline type

Sur le même projet applicatif métier :

| Phase                                     | Durée typique      |
| ----------------------------------------- | ------------------ |
| Double Diamond — découverte et définition | 1 à 2 semaines     |
| Architecture et design system             | 3 à 5 jours        |
| Développement IA-augmenté (N sprints)     | 1 à 3 semaines     |
| Gates qualité + recette                   | 2 à 4 jours        |
| Déploiement                               | 1 jour             |
| **Total**                                 | **3 à 6 semaines** |

C'est l'ordre de grandeur que l'infographie Octo documente pour le développement IA-assisté : un premier livrable testable en 2 à 3 jours (contre 3 à 4 semaines en Agile), une version candidate en fin de semaine 2.

### Le schéma ci-dessous illustre la structure d'un projet SDD type :

<div class="diagram-frame">
<svg width="100%" viewBox="0 0 680 560" xmlns="http://www.w3.org/2000/svg" role="img"><title>Timeline type — projet SDD × Double Diamond</title>
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
<text x="340" y="22" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#3d3d3a">Timeline type — projet SDD × Double Diamond</text>
<rect x="36" y="36" width="260" height="22" rx="4" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
<text x="166" y="47" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="12" fill="#185FA5">Double Diamond — amont projet</text>
<rect x="306" y="36" width="338" height="22" rx="4" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"/>
<text x="475" y="47" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="12" fill="#0F6E56">SDD — réalisation agentique · N sprints</text>
<line x1="36" y1="230" x2="636" y2="230" stroke="#888780" stroke-width="1.2" marker-end="url(#arrow)"/>
<!-- Phase bands Double Diamond -->
<rect x="36" y="70" width="130" height="155" rx="4" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5" opacity="0.6"/>
<rect x="176" y="70" width="120" height="155" rx="4" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5" opacity="0.6"/>
<!-- Phase bands SDD -->
<rect x="306" y="70" width="100" height="155" rx="4" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5" opacity="0.6"/>
<rect x="416" y="70" width="110" height="155" rx="4" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5" opacity="0.6"/>
<rect x="536" y="70" width="108" height="155" rx="4" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.5" opacity="0.6"/>
<!-- Phase labels -->
<text x="101" y="114" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#185FA5">Découverte</text>
<text x="101" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#185FA5">Interviews</text>
<text x="101" y="143" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#185FA5">Contraintes</text>
<text x="236" y="114" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#185FA5">Définition</text>
<text x="236" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#185FA5">Spec freeze</text>
<text x="236" y="143" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#185FA5">Architecture</text>
<text x="356" y="114" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#0F6E56">Sprint 1</text>
<text x="356" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#0F6E56">Génération</text>
<text x="356" y="143" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#0F6E56">Gate qualité</text>
<text x="471" y="114" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#0F6E56">Sprint N</text>
<text x="471" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#0F6E56">Intégration</text>
<text x="471" y="143" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#0F6E56">Review senior</text>
<text x="590" y="114" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#3B6D11">Livraison</text>
<text x="590" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#3B6D11">Recette</text>
<text x="590" y="143" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#3B6D11">Deploy prod</text>
<!-- Gates -->
<line x1="296" y1="190" x2="296" y2="230" stroke="#BA7517" stroke-width="1" stroke-dasharray="3 2"/>
<rect x="216" y="248" width="160" height="36" rx="4" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
<text x="296" y="263" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#633806">Spec Freeze</text>
<text x="296" y="278" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="10" fill="#854F0B">aucun code sans spec validée</text>
<line x1="406" y1="190" x2="406" y2="230" stroke="#BA7517" stroke-width="1" stroke-dasharray="3 2"/>
<rect x="316" y="302" width="180" height="36" rx="4" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
<text x="406" y="317" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#633806">Gate qualité sprint</text>
<text x="406" y="332" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="10" fill="#854F0B">sécurité · cohérence · fonctionnel</text>
<line x1="574" y1="190" x2="574" y2="230" stroke="#BA7517" stroke-width="1" stroke-dasharray="3 2"/>
<rect x="484" y="248" width="180" height="36" rx="4" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
<text x="574" y="263" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#633806">Definition of Done</text>
<text x="574" y="278" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="10" fill="#854F0B">tests · review · alignement spec</text>
<!-- Axis label -->
<text x="657" y="234" font-family="system-ui, sans-serif" font-size="11" fill="#888780">temps</text>
<!-- Legend -->
<rect x="36" y="440" width="10" height="10" rx="2" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
<text x="52" y="449" font-family="system-ui, sans-serif" font-size="11" fill="#3d3d3a">Double Diamond</text>
<rect x="170" y="440" width="10" height="10" rx="2" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"/>
<text x="186" y="449" font-family="system-ui, sans-serif" font-size="11" fill="#3d3d3a">SDD · sprints</text>
<rect x="296" y="440" width="10" height="10" rx="2" fill="#FAEEDA" stroke="#BA7517" stroke-width="0.5"/>
<text x="312" y="449" font-family="system-ui, sans-serif" font-size="11" fill="#3d3d3a">Gate qualité (bloquant)</text>
<line x1="460" y1="445" x2="494" y2="445" stroke="#BA7517" stroke-width="1.2" stroke-dasharray="4 2"/>
<text x="500" y="449" font-family="system-ui, sans-serif" font-size="11" fill="#3d3d3a">Spec Freeze</text>
<rect x="580" y="440" width="10" height="10" rx="2" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.5"/>
<text x="596" y="449" font-family="system-ui, sans-serif" font-size="11" fill="#3d3d3a">Deploy prod</text>
<!-- Notes -->
<text x="340" y="480" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#3d3d3a">Chaque gate est bloquant — aucune étape suivante sans validation humaine</text>
<text x="340" y="496" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#3d3d3a">La boucle sprint se répète jusqu'à livraison complète</text>
</svg>
</div>

### Pourquoi les timelines s'effondrent

Trois facteurs expliquent la compression radicale des délais.

**La vitesse de génération.** Claude Code avec des agents spécialisés génère en une heure ce qu'un développeur solo écrirait en une journée. Ce n'est pas une extrapolation — c'est ce que les équipes qui ont adopté le vibecoding structuré mesurent. L'infographie Octo cite un ratio de 10x sur la quantité de code produite. Le chiffre exact varie selon les contextes, mais l'ordre de grandeur est cohérent avec ce que j'observe.

**L'élimination des aller-retours spec → maquette → intégration.** En SDD, le design system est la spec. Ce qu'on dessine, on le code. Il n'y a pas de phase d'intégration où l'on découvre que la maquette Figma ne correspond pas aux contraintes techniques. Les composants sont générés directement depuis les décisions d'architecture.

**La réduction du coût du changement.** En cycle en V, changer une décision architecturale en cours de développement coûte des semaines. En SDD, la spec est vivante et les agents peuvent régénérer un module entier en quelques heures si la direction change. Le coût marginal du changement s'effondre — ce qui change fondamentalement la dynamique de gestion de projet.

---

## Comparaison synthétique

|                               | **Cycle en V**                 | **Agile classique**                     | **SDD × IA**                          |
| ----------------------------- | ------------------------------ | --------------------------------------- | ------------------------------------- |
| **Durée moyenne**             | 10 à 17 mois                   | 6 à 9 mois                              | 3 à 6 semaines                        |
| **Premier livrable testable** | Fin de projet                  | Fin de sprint 2-3                       | Jour 2-3                              |
| **Coût du changement**        | Très élevé                     | Moyen                                   | Faible                                |
| **Taille d'équipe requise**   | 6 à 10 personnes               | 5 à 7 personnes                         | 2 à 3 personnes                       |
| **Spec**                      | Figée en amont                 | Backlog évolutif                        | Pivot vivant                          |
| **Risque principal**          | Livrable obsolète              | Dérive de périmètre                     | Fausse maturité, dérive IA            |
| **Contexte optimal**          | Systèmes critiques réglementés | Produits évolutifs avec équipes stables | Sites métier, SaaS, POC, avant-ventes |

---

## Ce que ça change dans la pratique

L'accélération n'est pas magique — elle est conditionnelle. Octo Technology l'identifie bien : le SDD IA-assisté introduit ses propres pièges. La fatigue du feedback, la réactivité sans recul, la convergence floue sur la fin. Ce ne sont pas des problèmes insolubles — ce sont des problèmes qui se gèrent avec de la discipline méthodologique.

C'est précisément pourquoi la méthode SDD intègre des gates qualité bloquants. L'IA génère vite, très vite. Mais générer vite sans contrôler crée de la dette technique à une vitesse elle aussi inédite. Le rôle du senior dans un workflow SDD n'est pas de coder — c'est de définir les règles dans lesquelles l'IA opère, et de valider que ce qui est produit correspond à ce qui a été spécifié.

La citation de l'infographie Octo mérite d'être retenue : _l'IA démocratise la capacité à produire. Elle ne démocratise pas le jugement sur ce qui vaut la peine d'être produit._ C'est la phrase la plus juste sur le développement IA-assisté que j'aie lue ces derniers mois.

L'expérience senior reste le goulot d'étranglement. Pas pour produire — pour décider.

---

## La question à se poser avant de choisir

Ce n'est pas _"quelle méthode est la meilleure ?"_ C'est _"quel est le contexte de ce projet ?"_

Un système bancaire en production avec des contraintes réglementaires fortes a besoin du cycle en V ou d'une variante. Un produit SaaS avec une roadmap évolutive et une équipe stable tourne mieux en Agile. Une application métier de périmètre défini, un site métier, un POC pour une avant-vente — ce sont des contextes où le SDD × IA livre mieux, plus vite et moins cher que les alternatives.

La maturité, c'est de savoir distinguer les trois.

---

_Cet article fait partie de la série **Software-Driven Development**. Si vous êtes curieux de voir à quoi ressemble concrètement un projet livré avec cette méthode, les [réalisations sont disponibles ici](https://agentic-agency.fr/services/sites-ia) — avec les captures d'écran des applications livrées._

_La méthode SDD est documentée en détail sur la [page Méthode](https://agentic-agency.fr/methode)._
