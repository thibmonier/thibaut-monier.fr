---
title: "Du vibe coding à l'agentic engineering : l'industrialisation passe par le SDD"
seoTitle: "Du vibe coding à l'agentic engineering : le rôle du SDD"
description: "Le vibe coding ne passe pas à l'échelle. L'agentic engineering, fondé sur la spécification (SDD), permet d'industrialiser la génération de code par agents."
pubDate: 2026-05-18
tags: ['SDD', 'IA générative', 'Agentic engineering', 'Industrialisation']
category: 'Méthode'
series: 'Software-Driven Development'
seriesOrder: 3
image: '../../../assets/blog/blog_post_3_1768848720552.webp'
imageAlt: 'Trois post-it colorés « To Do », « Doing » et « Done » collés en escalier sur un avant-bras tendu, devant un canapé rouge'
draft: false
originalUrl: https://agentic-agency.fr/blog/du-vibe-coding-a-l-agentic-engineering
originalPublishedAt: 2026-05-18
---

Le vibe coding a été un choc culturel. En quelques mois, des équipes entières ont découvert qu'on pouvait livrer en un week-end ce qui prenait un trimestre. Le ratio effort-résultat a basculé, les démos se sont multipliées, et l'idée qu'un agent puisse écrire la majorité du code est devenue une évidence opérationnelle, pas une promesse marketing.

Sauf qu'au moment de transformer ces démos en produits, quelque chose se grippe. Le code généré au feeling tient deux semaines, puis se fissure. Les régressions s'accumulent sans qu'on sache pourquoi. Le contexte dérive d'un sprint à l'autre. Et la même équipe qui livrait à toute vitesse se retrouve à colmater plus qu'à construire.

_Ce n'est pas un problème d'agent. C'est un problème d'approche. Le vibe coding n'a jamais été conçu pour passer à l'échelle — c'était un mode d'exploration, pas un mode de production._

## Pourquoi le vibe coding ne passe pas à l'échelle

L'agent qui exécute un prompt vague produit un résultat plausible. Plausible n'est pas correct. Et plausible accumulé sur cinquante itérations devient incohérent.

Trois mécanismes techniques expliquent cette dégradation. Le premier est l'auto-régression : chaque token généré conditionne le suivant, donc une erreur précoce se propage et s'amplifie. Le deuxième est le « lost in the middle » : sur un contexte long, les informations centrales perdent en poids, et l'agent oublie ce qu'il a lu il y a quinze minutes. Le troisième est le biais de régression vers la moyenne statistique : sans contrainte forte, l'agent produit la solution la plus banale plutôt que la plus juste.

À ces problèmes techniques s'ajoute un problème méthodologique. Le vibe coding ne laisse aucune trace exploitable. Pas de spec à versionner, pas de décision à auditer, pas de critère d'acceptation à rejouer. Tout est dans la conversation — et la conversation s'efface ou se compacte.

## Ce que change l'agentic engineering

L'agentic engineering n'est pas une version plus sérieuse du vibe coding. C'est un changement de posture. On ne demande plus à un agent de produire du code à partir d'une intuition. On lui demande d'exécuter une spécification, avec un plan, des gates, et des points de vérification.

Concrètement, cela veut dire qu'on arrête de prompter en flux tendu pour construire en amont les artefacts qui pilotent la génération : PRD, ADR, user stories au format Gherkin, contrats d'interface, plans d'exécution. L'agent ne devine plus — il lit, planifie, exécute, vérifie.

C'est la différence entre un développeur junior qu'on lance sur une tâche sans contexte, et un développeur senior à qui on donne une spec complète. Le second produit dix fois mieux pour le même effort. L'agent fonctionne exactement de la même manière.

## Le SDD comme socle d'industrialisation

Le Specification-Driven Development est le cadre qui rend cette industrialisation possible. Il pose un principe simple : la spécification est la source de vérité, le code en est une expression dérivée.

Trois conséquences pratiques découlent de ce principe.

La spec devient un artefact versionné, revu, signé. Elle est traitée comme du code de production : pull requests, revues croisées, historique git. Une modification de spec en cours de sprint suit le même process qu'un hotfix.

Les agents deviennent spécialisés. On ne lance plus un agent généraliste sur un problème flou. On orchestre des agents avec des personas définis : un agent qui rédige la spec, un autre qui planifie, un autre qui implémente, un autre qui vérifie. Chacun a son périmètre, son contexte limité, sa boucle de validation.

Le workflow devient observable. À chaque étape, on peut répondre à trois questions : quelle spec a été lue, quel plan a été produit, quel artefact a été généré. Quand un bug apparaît trois sprints plus tard, on remonte la chaîne — au lieu de redécouvrir le problème à l'aveugle.

## Les patterns qui marchent en pratique

Plusieurs techniques se sont imposées comme les briques de base d'un workflow agentic mature.

Le plan-and-solve prompting : on demande à l'agent de produire un plan détaillé avant toute génération de code. Le plan est validé, corrigé, puis exécuté. Cette séparation explicite entre planification et exécution est ce qui empêche les dérives en cascade.

Le few-shot avec exemples canoniques : plutôt que de décrire le comportement attendu en prose, on fournit deux ou trois exemples concrets. L'agent généralise à partir des exemples bien mieux qu'à partir des descriptions abstraites.

Le feedback exécution-basé : à chaque génération, on lance les tests, on capture les erreurs, on réinjecte. La boucle se referme sur un signal objectif, pas sur une appréciation subjective. C'est ce qui transforme un agent qui produit du code « qui semble correct » en un agent qui produit du code « qui passe les tests ».

La gestion active du contexte : on découpe les tâches en sessions courtes, on nettoie entre deux features, on délègue les investigations à des sous-agents pour ne pas polluer le contexte principal. La discipline de contexte est devenue aussi importante que la discipline de code.

## L'intégration avec les pratiques existantes

L'agentic engineering ne remplace pas le BDD, le DDD ou les principes SOLID. Il les rend plus indispensables qu'avant.

Le BDD fournit le format naturel des user stories que l'agent sait exécuter sans ambiguïté. Étant donné / Quand / Alors n'est pas qu'une convention de rédaction — c'est un contrat exécutable que l'agent peut transformer en tests automatisés.

Le DDD donne le vocabulaire métier précis qui empêche l'agent de générer du code génériquement « plausible » mais déconnecté du domaine. Quand les bounded contexts sont clairs, l'agent reste dans son périmètre. Quand ils ne le sont pas, il invente.

Les principes SOLID restent les garde-fous qui permettent au code généré d'être maintenable. Un agent qui produit une classe de 800 lignes au mépris du SRP livre du code que personne ne pourra reprendre — humain ou autre agent.

_Ce qui était une bonne pratique devient une condition de survie. Le code généré à grande vitesse sans architecture s'effondre à grande vitesse._

## Ce qui se joue au niveau organisationnel

Le passage du vibe coding à l'agentic engineering n'est pas une migration d'outillage. C'est une transformation des rôles.

Le rôle qui prend le plus de valeur est celui qui sait rédiger une spec exécutable. Ce n'est plus le développeur le plus rapide qui fait la différence — c'est celui qui sait poser les bonnes questions en amont, structurer le contexte, et orchestrer les agents.

Le rôle de chef de projet évolue vers une fonction de superviseur de workflow. La question n'est plus combien d'heures pour livrer, mais combien de stories ont passé les gates qualité, et quel est le coût de réparation d'un sprint mal cadré.

Le rôle du senior technique se déplace vers l'architecture des prompts, la définition des personas d'agents, et la conception des boucles de vérification. C'est un travail méta — concevoir le système qui produit le code, pas produire le code.

## La feuille de route concrète pour industrialiser

Pour une équipe qui veut sortir du vibe coding sans tomber dans la sur-ingénierie, trois étapes structurent la transition.

Première étape : versionner la spec. Avant de toucher au reste, on traite la spec comme du code. Un dépôt dédié, des revues, un historique. Cette seule discipline élimine la moitié des dérives.

Deuxième étape : introduire les gates. Un PRD à 80%, une tech spec à 90%, un backlog INVEST avant tout démarrage. Ces gates ne sont pas négociables — ils sont l'équivalent des tests unitaires pour la phase de cadrage.

Troisième étape : orchestrer plutôt que prompter. On structure le workflow en étapes claires avec des agents spécialisés, des artefacts intermédiaires, et des points de validation explicites. On passe d'une conversation libre à un pipeline auditable.

## L'industrialisation comme avantage compétitif

Le vibe coding restera utile pour le prototypage, l'exploration, les démos. C'est un outil puissant à condition de le cantonner à son périmètre. Le confondre avec une méthode d'ingénierie, c'est garantir l'échec au passage à l'échelle.

L'agentic engineering, structuré par le SDD, est ce qui permet aux équipes de transformer la vitesse en valeur durable. Pas en générant plus de code — en générant du code qui ne se déchire pas au premier sprint suivant.

_Les équipes qui auront industrialisé leur workflow agentic dans les douze prochains mois auront un avantage structurel difficilement rattrapable. Celles qui resteront en vibe coding livreront de plus en plus vite des produits de moins en moins maintenables — jusqu'au mur._

_Prochain article : « Les agents spécialisés : comment composer un pipeline qui ne dérive pas »._
