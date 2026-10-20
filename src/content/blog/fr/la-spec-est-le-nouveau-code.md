---
title: 'La spec est le nouveau code'
description: 'Un agent exécute la spec à la lettre : sa qualité détermine celle du code. Gherkin, critères mesurables, ADR et gates qualité en font un contrat exécutable.'
pubDate: 2026-03-17
tags: ['SDD', 'IA générative', 'Spécification']
category: 'Méthode'
series: "L'agence digitale augmentée"
seriesOrder: 2
image: '../../../assets/blog/blog_post_2_1768848698871.webp'
imageAlt: "Ordinateur portable posé sur une table en bois, affichant un site dont le titre dit « I design and develop experiences that make people's lives simple »"
draft: false
faq:
  - question: "Qu'est-ce qu'une spec exécutable ?"
    answer: "C'est une spec qui définit un contrat plutôt qu'une direction générale. Elle contient des user stories au format Gherkin, des critères d'acceptation mesurables, des ADR qui documentent les décisions d'architecture et les invariants métier. Par exemple, « l'utilisateur complète l'action principale en moins de 3 clics depuis la page d'accueil » plutôt que « l'interface est intuitive »."
  - question: "Quand le code généré par l'IA n'est pas bon, faut-il corriger le code ou la spec ?"
    answer: "Il faut corriger le contexte, pas le code. Patcher directement ce que l'agent a produit résout le symptôme sans traiter la cause : au prochain sprint, l'agent reproduira le même problème, car rien n'a changé dans ce qu'il lit. Affiner la spec ou le prompt règle le problème définitivement."
  - question: 'Quels gates qualité une spec doit-elle franchir avant de passer au code ?'
    answer: 'Trois gates. Le gate PRD doit atteindre 80% sur cinq dimensions, et le gate Tech Spec 90% (architecture, sécurité, stratégie de test, plan de déploiement). Le gate Backlog vérifie les six critères INVEST sur chaque user story, et une story qui échoue retourne en rédaction.'
---

Au bout de quelques semaines de vibecoding intensif, j'ai compris quelque chose d'inconfortable : la qualité de ce que l'agent produit est le miroir exact de la qualité de ce que j'ai écrit en amont.

Pas de la qualité de mes prompts. De la qualité de ma spec.

Ce n'est pas un problème technologique. C'est un problème de méthode. Et c'est le goulot d'étranglement que personne ne voit venir.

_Dans un workflow vibecoding, la spec n'est plus un document de gouvernance. C'est un programme. Mal l'écrire, c'est mal coder._

## Ce qu'était la spec avant l'IA

Dans un projet digital classique, la spécification avait une fonction essentiellement communicationnelle. Elle servait à aligner des parties prenantes. Les zones d'ambiguïté étaient comblées en cours de route — par les développeurs qui interprétaient, les réunions qui clarifiaient, les compromis tacites qui s'accumulaient.

La spec était un document rédigé pour des humains, qui lisent entre les lignes, qui posent des questions, qui s'adaptent. Cette souplesse était une fonctionnalité, pas un bug.

## Ce qu'est la spec dans un workflow IA

Dans un workflow vibecoding, la spec est injectée en début de session comme contexte d'exécution d'un agent. Cet agent lit le document et génère du code en conséquence.

Il ne lit pas entre les lignes. Il ne pose pas de questions. Il n'adapte pas à ce que vous vouliez vraiment dire. Il exécute ce qui est écrit — avec une précision et une littéralité absolues.

Une spec écrite pour des humains produit du code approximatif quand elle est donnée à un agent. Une spec écrite pour un agent est opérationnelle, précise, sans ambiguïté. Et paradoxalement, elle est aussi meilleure pour les humains — parce qu'elle force à poser les vraies questions avant de commencer.

C'est ce qu'on pourrait appeler la Documentation Driven Development : la documentation ne décrit pas ce qui a été fait, elle pilote ce qui va être fait. Elle est le signal propre que l'agent lit pour produire un résultat conforme.

## Montrer plutôt que décrire

Une leçon apprise à la pratique : les inputs visuels sont infiniment plus précis que les descriptions textuelles. Une maquette, une capture d'écran, un schéma d'architecture existant communiquent en quelques secondes ce qu'un paragraphe de spec peine à formaliser.

Ne décrivez pas le design que vous voulez : montrez-le. Ne décrivez pas le comportement attendu en prose abstraite : illustrez-le avec un scénario Gherkin concret. L'agent traduit les exemples bien mieux que les généralités.

## Qu'est-ce qu'une spec exécutable, concrètement ?

J'ai appris à distinguer deux types de specs : celles qui donnent une direction générale, et celles qui définissent un contrat.

Une spec exécutable contient des user stories au format Gherkin : 'Étant donné que l'utilisateur est connecté, quand il clique sur Exporter, alors le fichier CSV est généré avec les colonnes X, Y, Z dans cet ordre précis.' Pas 'le bouton d'export fonctionne correctement.'

Elle contient des critères d'acceptation mesurables : pas 'l'interface est intuitive', mais 'l'utilisateur complète l'action principale en moins de 3 clics depuis la page d'accueil.'

Elle documente les décisions d'architecture dans des ADR — avec le raisonnement, les alternatives considérées, les contraintes qui ont guidé le choix.

Elle définit les invariants métier : les règles qui ne doivent jamais être violées, les cas limites qui doivent être gérés.

## Corriger le contexte, pas le code

Il y a une tentation forte dans le vibecoding : quand le code généré n'est pas tout à fait juste, l'instinct est de le patcher directement. C'est une erreur.

Si vous éditez le code produit par l'agent sans corriger la spec ou le contexte qui l'a généré, vous avez résolu le symptôme sans traiter la cause. Au prochain sprint, l'agent reproduira le même problème — parce que rien n'a changé dans ce qu'il lit.

La règle : résistez à l'envie de patcher l'output. Affinez le contexte. Corrigez la spec. Précisez le prompt. Vous résolvez le problème définitivement — et vous enseignez quelque chose au système.

## Les trois gates qui garantissent qu'une spec tient la route

Dans mon workflow, une spec ne passe pas au code tant qu'elle n'a pas franchi trois gates qualité.

Le gate PRD doit atteindre 80%. Cinq dimensions : formulation du problème, identification des utilisateurs, définition des objectifs, métriques de succès, délimitation du périmètre.

Le gate Tech Spec doit atteindre 90%. Architecture, sécurité, stratégie de test, plan de déploiement. 90% parce qu'une erreur d'architecture coûte dix fois plus cher à corriger après qu'avant.

Le gate Backlog vérifie les six critères INVEST sur chaque user story. Une story qui échoue retourne en rédaction.

_Ces gates ne sont pas de la bureaucratie. Ce sont les indicateurs qui révèlent où la pensée est encore floue — et le code flou commence toujours par une pensée floue._

## Ce que la spec révèle sur l'organisation

Il y a un effet secondaire du vibecoding que personne n'anticipe : il rend les ambiguïtés organisationnelles immédiatement visibles. Dans un workflow classique, on peut vivre des mois avec un flou sur qui décide quoi. Dans un workflow IA, ce flou se retrouve dans la spec — et une spec floue produit un code flou.

Le contexte, c'est votre source de vérité. Versionnez les changements de spec et de prompts comme du code de production. Mettre à jour la spec, c'est former simultanément l'équipe et l'agent.

## Le ROI le plus rapide d'un workflow IA

Si vous commencez le vibecoding et cherchez où investir en premier : pas dans les outils. Dans la qualité de la spec.

Une heure investie à clarifier un critère d'acceptation ambigu économise une journée de génération incorrecte, suivie d'une demi-journée de débogage, suivie d'une conversation difficile avec le client.

_L'IA est aussi bonne que le contexte qu'on lui donne. Apprendre à bien écrire une spec exécutable est la compétence la plus rentable qu'une équipe puisse développer aujourd'hui._

_Prochain article : « Le junior n'est pas le problème — le workflow l'est »._
