---
title: "Amorcer un projet agentic coding : le rôle nouveau de l'AMOA"
description: "Avec un agent, le cadrage de l'AMOA devient le programme exécuté : elle n'amorce plus le projet, elle écrit la première version du logiciel."
pubDate: 2026-05-19
tags: ['AMOA', 'SDD', 'Agentic engineering', 'Cadrage']
category: 'Méthode'
series: "Les métiers à l'ère agentic"
seriesOrder: 1
image: '../../../assets/blog/blog_post_4_1768848735398.webp'
draft: false
originalUrl: https://agentic-agency.fr/blog/amorcer-un-projet-agentic-coding-le-role-amoa
originalPublishedAt: 2026-05-19
imageAlt: "Deux femmes de dos devant un ordinateur portable affichant du code sur fond sombre, l'une pointant une ligne de l'écran du doigt"
---

L'AMOA a toujours eu un rôle de traducteur : transformer un besoin métier flou en un cahier des charges exploitable par une équipe technique. Dans un projet classique, ce travail s'arrêtait à la frontière du développement. Les développeurs prenaient le relais, interprétaient, complétaient les zones grises avec leur jugement.

Dans un projet agentic coding, cette frontière disparaît. L'agent ne complète pas les zones grises — il les traite comme du vide. Ce que l'AMOA produit devient directement le contexte d'exécution. Le cahier des charges n'est plus un document de référence, c'est un programme.

_L'AMOA ne prépare plus le projet pour les développeurs. Elle écrit, sans le savoir, la première version du logiciel._

## Ce qui change dans la mission de cadrage

Dans un projet classique, un cadrage à 70% de précision était suffisant. Les développeurs absorbaient les 30% restants par des questions, des compromis, des arbitrages en cours de route. Le coût de cette absorption était invisible, dilué dans le temps de développement.

Dans un projet agentic, ce qui n'est pas spécifié n'existe pas. L'agent produira quelque chose de plausible à la place — souvent une généralisation statistique sans rapport avec le besoin réel. C'est précisément ce que le SDD vient corriger : en imposant un cadrage exécutable, on prive l'agent de la latitude qui produit du code plausible mais faux. Le coût des 30% manquants devient visible immédiatement, sous forme de code à jeter ou à reprendre.

La conséquence pratique : le cadrage doit atteindre 90% avant la première ligne de code. Ce n'est pas une exigence bureaucratique, c'est une condition d'exécution.

## Les nouveaux artefacts de l'AMOA agentic

Un cahier des charges traditionnel n'est plus suffisant. Trois artefacts deviennent indispensables.

Le PRD opérationnel formalise le problème, les utilisateurs cibles, les objectifs mesurables, les indicateurs de succès et les limites de périmètre. Pas un document de vente — un document d'exécution. Chaque ambiguïté restante devient une décision déléguée à l'agent, donc une décision non contrôlée.

Les user stories au format Gherkin remplacent les expressions de besoin en prose. « Étant donné / Quand / Alors » n'est pas une coquetterie méthodologique. C'est un contrat exécutable que l'agent peut transformer directement en tests d'acceptation.

Les exemples canoniques accompagnent chaque story. Une maquette, un échantillon de données, un parcours type capturé en captures d'écran. L'agent généralise à partir d'exemples concrets infiniment mieux qu'à partir de descriptions abstraites.

## Le piège de la sur-spécification

Cadrer plus n'est pas cadrer tout. L'AMOA agentic doit résister à deux dérives symétriques.

La première : spécifier les choix d'implémentation. Décider à la place de l'architecte quel pattern utiliser, quelle bibliothèque choisir, comment structurer le code. Ce n'est pas le rôle de l'AMOA, et ces décisions coûtent cher quand elles sont prises sans la compétence technique appropriée.

La seconde : spécifier au cas où. Ajouter des règles métier pour des scénarios qui n'existeront jamais, anticiper des évolutions hypothétiques, gonfler le périmètre par prudence. Chaque ligne de spec ajoutée est une ligne de code à générer, à tester, à maintenir.

Le bon cadrage est celui qui couvre 100% du périmètre demandé, à 90% de précision, sans déborder.

## Le rituel d'amorçage : avant le sprint 0

Un projet agentic mature ne démarre pas par un sprint 0 technique. Il démarre par un rituel d'amorçage piloté par l'AMOA.

Première séance : formalisation du problème. Avant toute discussion de solution, on écrit en une page ce que le projet doit résoudre, pour qui, et comment on saura qu'on a réussi. Cette page est revue avec le client jusqu'à validation explicite.

Deuxième séance : cartographie des invariants métier. On documente les règles qui ne doivent jamais être violées. Pas les fonctionnalités — les contraintes. Ce sont elles qui éviteront que l'agent produise du code plausible mais métier-faux.

Troisième séance : production du premier backlog INVEST. Stories indépendantes, négociables, valuables, estimables, small, testables. Chaque story qui échoue au test INVEST retourne en rédaction avant le démarrage.

## Le nouveau livrable de l'AMOA : le contexte exécutable

L'AMOA ne livre plus un cahier des charges. Elle livre un contexte exécutable.

Ce contexte comprend : un PRD à 80% minimum, une cartographie des bounded contexts métier, un backlog INVEST validé, un glossaire des termes métier exploitable par l'agent, et un ensemble d'exemples canoniques par fonctionnalité.

Ce livrable est versionné dans git, revu en pull request, signé par le client. Il devient un actif vivant du projet, mis à jour à chaque évolution du besoin. Une modification de spec en cours de sprint suit le même process qu'un correctif de code.

## La nouvelle compétence-clé : penser comme un agent

L'AMOA agentic doit développer une compétence nouvelle : anticiper comment l'agent va lire ce qu'elle écrit. C'est un travail de mise en scène du contexte.

Concrètement : éviter les phrases à double sens, expliciter les hypothèses tacites, donner des exemples plutôt que des définitions, structurer l'information par bounded context plutôt que par chronologie d'écriture. Ce sont des réflexes qui s'acquièrent en pratique, pas en formation théorique.

L'AMOA qui maîtrise cette compétence devient un multiplicateur de productivité pour toute l'équipe. Une mauvaise spec coûte une semaine de génération à jeter. Une bonne spec économise cette semaine — et libère le développeur senior pour les vrais arbitrages d'architecture.

## Le repositionnement de la fonction AMOA

Loin d'être menacée par l'agentic coding, la fonction AMOA en sort renforcée. Mais elle change de nature.

L'AMOA classique était un intermédiaire entre le métier et la technique. Son rôle pouvait sembler optionnel quand les développeurs maîtrisaient le domaine. L'AMOA agentic est le rédacteur du programme. Sans elle, l'agent produit du code mais pas le bon code.

_Les agences qui investiront dans la montée en compétence de leurs AMOA sur les pratiques SDD prendront une avance structurelle. Celles qui considéreront le cadrage comme une étape secondaire continueront à débugger en production ce qu'elles auraient dû clarifier en amont._

_Prochain article : « Chiffrer et rassurer : la nouvelle posture commerciale face à l'agentic coding »._
