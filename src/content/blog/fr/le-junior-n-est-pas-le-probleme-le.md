---
title: "Le junior n'est pas le problème — le workflow l'est"
description: "Le risque de dépendance des juniors face à l'IA se traite par le workflow : gate de story, Plan Mode obligatoire, cycle TDD et checks automatiques."
pubDate: 2026-03-14
tags: ['Workflow', 'Junior', 'IA générative']
category: 'Métiers'
series: "L'agence digitale augmentée"
seriesOrder: 3
image: '../../../assets/blog/blog_post_3_1768848720552.webp'
imageAlt: 'Trois notes adhésives tenues sur un avant-bras, « To Do », « Doing » et « Done », étagées de bas en haut'
draft: false
---

Quand on parle de l'IA et des développeurs juniors, la conversation tourne toujours autour du même diagnostic : le risque de dépendance. Le junior voit du code apparaître, l'admire, le pousse, et ne construit pas les réflexes qu'il aurait construits en le produisant lui-même.

Ce diagnostic est juste. Mais la réponse habituelle — plus de pair programming, du mentorat intentionnel, des exercices ciblés — est insuffisante dans la réalité d'une agence sous pression projet.

_La vraie réponse n'est pas dans la relation interpersonnelle. Elle est dans le workflow. Un cadre structuré protège les juniors mieux que la bonne volonté._

## Le changement de posture le plus difficile

Il y a une transformation que le vibecoding impose à tous, senior comme junior : passer du 'coder' au 'reviewer' de l'output IA. Ce changement exige de lâcher le contrôle pixel-perfect en phase de conception. De valider plutôt que de produire. D'évaluer plutôt que d'écrire.

Pour un senior, cette transition est inconfortable mais accessible — il a déjà construit les réflexes qui lui permettent de juger la qualité de ce que l'agent produit. Pour un junior, c'est un piège : il se retrouve à valider ce qu'il n'est pas encore capable d'évaluer. Et personne ne lui a appris à faire autrement.

La solution n'est pas de lui interdire l'IA. C'est de concevoir un workflow qui le force, structurellement, à développer ce jugement — en le mettant en situation d'en avoir besoin.

## Le junior devient spectateur quand le workflow n'a pas de guardrails

Voici ce qui se passe sans cadre : le junior décrit une feature, le code apparaît, il le vérifie rapidement, il pousse. L'IA semble savoir ce qu'elle fait. Le code compile. Les tests basiques passent. Tout va bien — jusqu'à ce que ça n'aille plus.

Ce n'est pas la faute du junior. C'est la faute du workflow qui lui permet de faire ça. Ce phénomène n'est pas nouveau — avant l'IA, on dénonçait le syndrome Stack Overflow : reprendre une solution sans en comprendre les mécanismes. L'IA l'amplifie parce qu'elle produit des solutions plus élaborées, plus convaincantes, plus difficiles à questionner.

## Ce qui force un junior à comprendre : le gate de story

Dans un workflow structuré, une user story ne peut pas être marquée done sans passer un gate complet. Ce gate vérifie 100% des critères : tâches complètes, tests couvrant les scénarios Gherkin, critères d'acceptation satisfaits, code review approuvée.

Ce gate est exigeant au sens le meilleur du terme. Le junior ne peut pas juste 'ça marche' — il doit être capable d'expliquer pourquoi chaque critère d'acceptation est couvert. Et cette exigence vient du système, pas du senior qui surveille. Elle est systématique, impersonnelle, incontournable.

## Ce qui force un junior à penser : le Plan Mode obligatoire

Avant chaque implémentation, Claude Code entre en Plan Mode. Il propose un plan d'exécution : quelles parties du code seront modifiées, dans quel ordre, avec quelle justification architecturale. Le junior doit valider ce plan avant que le code soit généré.

Assez vite, l'inconfort de cette responsabilité pousse à mieux comprendre le plan avant de valider. Comprendre un plan bien structuré est un apprentissage architectural plus dense qu'une revue de code classique — parce que c'est fait avant que le code existe.

## Ce qui force un junior à apprendre : le cycle TDD

Le workflow sprint orchestre le développement en cycles TDD stricts : RED → GREEN → REFACTOR.

On ne peut pas 'juste copier' si on doit d'abord écrire le test qui échoue. Ce test, il faut le penser. Il faut formaliser ce qu'on attend du code avant qu'il existe. C'est un exercice de précision conceptuelle qui développe exactement le type de pensée qu'un junior doit construire.

## Ce qui protège un junior contre la dérive : les guardrails systémiques

Deux checks ne se bypassent jamais : pre-commit-check avant chaque commit, pre-merge-check avant chaque merge. Un code qui ne passe pas ces vérifications ne rentre pas dans le dépôt.

Ces guardrails ne sont pas de la surveillance. C'est de l'ingénierie logicielle appliquée au workflow. L'IA peut halluciner — et un junior sans guardrails n'a pas encore le réflexe de le détecter. La règle est du côté du système, pas de la relation interpersonnelle.

## Ce qu'on observe en pratique

Les juniors qui travaillent dans ce type de workflow posent des questions différentes. Pas 'comment je fais pour que ça marche' — mais 'pourquoi le gate dit que ce critère n'est pas couvert'. Ces questions révèlent une compréhension plus profonde, posée au bon moment — avant de pousser le code.

_Le workflow ne remplace pas le mentorat. Mais il crée les moments où le mentorat devient utile — parce que le junior a déjà tenté de comprendre avant de demander._

## Le meilleur investissement pour former les juniors

Si vos juniors deviennent spectateurs du code généré, la solution n'est pas d'embaucher plus de seniors pour les surveiller. C'est de concevoir un workflow qui les force à s'engager.

Un gate de story à 100%. Un Plan Mode obligatoire. Un cycle TDD. Des checks automatiques. Ce n'est pas de la surveillance. C'est de l'architecture de workflow.

_Prochain article : « Agence digitale : le binôme augmenté remplace-t-il l'équipe ? »_
