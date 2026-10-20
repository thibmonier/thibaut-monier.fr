---
title: "La gestion de projet IA est une discipline à part entière — et personne ne l'enseigne"
seoTitle: "Gestion de projet IA : la discipline que personne n'enseigne"
description: "Scrum et Kanban n'ont pas été pensés pour des agents qui codent en quelques heures : sprint, standup, rétro et relation client sont à repenser."
pubDate: 2026-02-27
tags: ['Gestion de projet', 'IA générative', 'Méthode']
category: 'Méthode'
series: "Transformer l'agence"
seriesOrder: 3
image: '../../../assets/blog/blog_post_8_1768850554501.webp'
imageAlt: 'Une femme présente des post-it roses, jaunes et orange collés sur un mur blanc devant une équipe attablée avec des ordinateurs portables'
draft: false
---

Scrum a été conçu pour des équipes qui écrivent du code. Kanban pour des flux de travail humains. Prince2 pour des projets à périmètre fixe. Aucun de ces frameworks n'a été pensé pour un contexte où l'agent génère en deux heures ce qu'un développeur faisait en deux semaines.

Et pourtant, ce sont ces mêmes frameworks que les équipes appliquent aujourd'hui à leurs projets vibecoding — en les adaptant à la marge, en bricolant les cérémonials, en gardant les mêmes durées de sprint pour des charges de travail qui ont changé d'un facteur cinq.

Le résultat est prévisible : des sprints sous-estimés, des rétrospectives qui tournent dans le vide, des burndowns incompréhensibles, et une pression croissante sur les chefs de projet qui pilotent un workflow nouveau avec des outils conçus pour l'ancien.

_Ce n'est pas Scrum qui est mort. C'est l'application de Scrum sans adaptation à un contexte où la vélocité technique n'est plus le facteur limitant._

## Ce qui change fondamentalement dans le rythme projet

Dans un projet classique, le sprint est calibré sur la capacité de production technique de l'équipe. Deux semaines pour implémenter N story points, selon la vélocité observée sur les sprints précédents.

Dans un projet vibecoding, la capacité de production technique n'est plus le goulot d'étranglement. Ce qui limite la cadence, c'est la qualité du cadrage en amont, la précision de la spec, et la capacité à valider rapidement ce que l'agent produit.

Concrètement : un développeur peut lancer /sprint:dev et avoir du code fonctionnel en deux heures. Mais si la spec n'est pas précise, ce code sera mal orienté. Si le Plan Mode n'est pas validé avec attention, il sera architecturalement bancal. Si la recette n'est pas faite rigoureusement, des bugs s'accumuleront silencieusement.

Le temps de sprint se redistribue : moins de temps sur la production, plus de temps sur la préparation, la validation et la qualité. Un sprint de deux semaines dans un workflow IA passe peut-être 20% du temps sur la génération, 40% sur la spec et le Plan Mode, et 40% sur la recette et les gates.

## Repenser le sprint planning

La question du sprint planning classique est : combien de story points peut-on embarquer ? Dans un workflow IA, la question devient : combien de stories peut-on spécifier suffisamment bien pour que l'agent les exécute correctement ?

Ce n'est pas la même question. La première est une question de capacité technique. La seconde est une question de maturité du besoin. Une histoire peut être techniquement simple et trop floue pour être bien spécifiée. Une autre peut être techniquement complexe mais parfaitement claire.

J'ai commencé à calibrer les sprints sur le nombre de stories qui passent le gate INVEST du premier coup — pas sur les story points. Un sprint où cinq stories sont parfaitement spécifiées et parfaitement livrées vaut mieux qu'un sprint où dix stories sont embarquées dans l'urgence et produisent du code qu'on devra retravailler.

## Le daily standup avec un agent

Le standup classique répond à trois questions : qu'est-ce que j'ai fait hier, qu'est-ce que je fais aujourd'hui, qu'est-ce qui me bloque ? Ces questions sont conçues pour la coordination humaine.

Dans un workflow IA, la question la plus importante n'est pas ce que le développeur a fait hier — c'est ce que l'agent a produit et si ce produit est aligné avec l'intention. Le standup devient moins un outil de coordination et plus un outil de supervision.

La commande /common:daily-standup génère un résumé des tâches en cours, des blocages détectés et des prochaines étapes. C'est utile. Mais ce que le standup humain doit apporter en plus, c'est la lecture de qualité : est-ce que le code produit hier ressemble à ce qu'on voulait vraiment ? Est-ce que le contexte est toujours frais et aligné ? Est-ce qu'il y a des signaux de dérive que les métriques ne montrent pas encore ?

## La rétrospective dans un workflow IA

La rétrospective classique explore ce qui a bien marché, ce qui n'a pas marché, et ce qu'on veut essayer. Dans un workflow IA, deux dimensions s'ajoutent que les équipes ignorent systématiquement.

Première dimension : la qualité du contexte. La spec était-elle assez précise pour que l'agent produise du premier coup ? Les ADR étaient-ils à jour ? Le TASKS.md était-il synchronisé avec la réalité du code en fin de sprint ? Ces questions de maintenance du contexte sont aussi importantes que les questions techniques — parce que c'est la dégradation du contexte qui est la principale cause de dérive dans les sprints suivants.

Deuxième dimension : le calibrage humain-IA. Quel était le ratio réel de validation humaine vs génération IA sur ce sprint ? Y a-t-il des moments où on a validé sans vraiment comprendre ? Y a-t-il des moments où on a trop hésité à déléguer ? Ce calibrage, examiné honnêtement à chaque rétro, est ce qui permet au workflow de progresser.

## La relation client dans le nouveau rythme

Le client d'une agence vibecoding vit une expérience radicalement différente. Les cycles de feedback raccourcissent : on lui montre des prototypes fonctionnels en jours plutôt qu'en semaines. C'est un avantage réel — et un défi de gestion de la relation.

Plus les cycles sont courts, plus le client est tenté d'ajuster le périmètre en continu. Ce qui était une demande de changement raisonnable dans un cycle de deux semaines devient, dans un cycle de deux jours, une demande quasi permanente. La dérive de périmètre s'accélère avec la vélocité.

La réponse n'est pas de ralentir les cycles. C'est de renforcer le contrat de spec. Le Spec Freeze est encore plus important dans un contexte de haute vélocité qu'il ne l'était dans un contexte classique. Et la conversation avec le client sur ce que signifie un changement de spec mid-sprint — le coût, le délai, l'impact sur les gates — doit être faite explicitement dès le début du projet.

## Ce qu'un nouveau framework de gestion de projet IA doit intégrer

Sans prétendre avoir tout résolu, voici ce que j'ai appris à intégrer systématiquement.

Un sprint IA se prépare différemment : la moitié du temps de préparation est consacrée à la qualité de la spec, pas à l'estimation des charges.

Le gate de sprint n'est pas optionnel : 100% de readiness avant tout démarrage. Un sprint mal préparé dans un workflow IA échoue plus vite et plus spectaculairement qu'un sprint mal préparé dans un workflow classique.

Le contexte se maintient activement : la spec, les ADR et le TASKS.md sont des actifs vivants. Les laisser se dégrader est le risque principal — bien avant les bugs.

La vélocité se mesure en qualité livrée, pas en code produit : stories passant le gate DoD du premier coup, taux de régression en recette, score d'alignement spec-code en fin de sprint.

_La gestion de projet IA n'est pas une version accélérée de la gestion de projet classique. C'est une discipline différente, où le facteur limitant est le jugement humain, pas la production technique._

_Prochain article : « Ce que le client doit savoir sur l'IA dans votre agence »._
