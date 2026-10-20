---
title: 'La dette de contexte : le nouveau risque caché des projets IA'
seoTitle: 'La dette de contexte : le risque caché des projets IA'
description: "La dette de contexte s'accumule dans ce que l'agent lit, non dans le code : quatre mécanismes, des symptômes discrets et des pratiques pour la prévenir."
pubDate: 2026-02-18
tags: ['Dette technique', 'Contexte', 'IA générative', 'Risques']
category: 'Pilotage'
series: 'Les nouveaux risques projet'
seriesOrder: 1
image: '../../../assets/blog/blog_post_11_1768850597259.webp'
imageAlt: 'Colonnes de caractères verts lumineux qui défilent sur fond noir, façon code informatique en cascade'
draft: false
---

Dans un projet classique, la dette technique s'accumule dans le code. Elle est visible — à condition de savoir la lire. Un audit de code, une analyse statique, une revue d'architecture suffisent à la cartographier. Elle est coûteuse à rembourser, mais elle est localisée.

Dans un projet vibecoding, une nouvelle forme de dette apparaît. Elle ne s'accumule pas dans le code — elle s'accumule dans le contexte que l'agent utilise pour générer ce code. Elle est invisible dans les revues classiques. Elle progresse silencieusement. Et quand elle atteint un seuil critique, l'agent commence à produire du code confiant, fluide, syntaxiquement impeccable — et fondamentalement désaligné avec ce que le projet est réellement devenu.

J'appelle ça la dette de contexte. Je ne connais pas d'autre nom pour ce phénomène. Et je n'ai vu personne en parler sérieusement.

_La dette de contexte est le risque le plus sournois d'un projet IA : l'agent travaille parfaitement — sur la base d'une réalité qui n'existe plus._

## Qu'est-ce que le contexte d'un agent, exactement ?

Pour comprendre pourquoi cette dette est dangereuse, il faut d'abord comprendre ce sur quoi un agent IA s'appuie pour générer.

Dans un workflow SDD, ce contexte a plusieurs couches. La spec — le SPEC.md ou équivalent — décrit ce que le produit doit faire, sous forme de user stories et de critères d'acceptation. Le TASKS.md liste les tâches, leur statut, leurs dépendances. Les ADR documentent les décisions d'architecture prises, les alternatives considérées, les raisons des choix. La constitution projet fixe les conventions, les patterns acceptables, les guardrails techniques. Le code existant lui-même, lu par l'agent en début de session.

Ces couches forment ensemble ce qu'on peut appeler la source de vérité du projet. Quand elle est précise, cohérente et à jour, l'agent produit dans un espace bien délimité. Quand elle dérive — quand une couche devient obsolète, incohérente ou silencieuse sur une dimension importante — l'agent comble les lacunes par inférence. Et ses inférences ne sont pas les vôtres.

## Comment la dette de contexte s'accumule

Elle s'accumule par quatre mécanismes distincts. Chacun, pris isolément, semble anodin. Ensemble, ils créent un glissement qui peut compromettre plusieurs sprints de travail.

**Premier mécanisme : la spec qui ne suit pas.**

Un projet évolue. Des décisions sont prises en réunion client, des priorités changent, des features sont déprioritisées, d'autres s'ajoutent. Si ces évolutions ne sont pas répercutées dans le SPEC.md avant le sprint suivant, l'agent travaille sur la version d'avant. Il génère du code parfaitement aligné avec une spec qui ne décrit plus le produit actuel.

Le symptôme est subtil : le code passe les tests automatiques — qui eux aussi sont basés sur l'ancienne spec — mais diverge progressivement du produit que le client attend.

**Deuxième mécanisme : les ADR fantômes.**

Une décision d'architecture est prise en cours de projet — un changement de bibliothèque, un refactoring d'une couche métier, un nouveau pattern adopté pour résoudre un problème émergent. Elle est implémentée. Elle fonctionne. Mais elle n'est pas documentée dans les ADR.

Lors du sprint suivant, l'agent ne connaît pas cette décision. Il peut proposer un plan qui entre en contradiction avec elle — pas par erreur, mais par ignorance. Le développeur qui valide sans avoir fait le lien vient d'introduire une incohérence architecturale. Le code compile. Les tests passent. La dette est invisible.

**Troisième mécanisme : le TASKS.md désynchronisé.**

Le TASKS.md est le fil conducteur opérationnel du projet. Il liste ce qui est fait, ce qui est en cours, ce qui reste à faire. Quand il n'est pas maintenu à jour — parce qu'on était sous pression, parce qu'on a oublié de lancer /project:sync-backlog, parce que le sprint s'est terminé dans l'urgence — l'agent commence le sprint suivant avec une carte du territoire périmée.

Il peut relancer des tâches déjà faites sous une forme légèrement différente. Il peut ignorer des dépendances qui ont été résolues entre-temps. Il peut prendre des raccourcis que le contexte réel du code ne permet plus. Chaque génération ajoute une légère distorsion. Sur plusieurs sprints, ces distorsions s'accumulent.

**Quatrième mécanisme : la dérive silencieuse des conventions.**

En début de projet, les conventions sont claires et documentées. Puis vient la pression. Un sprint difficile conduit à un compromis sur un pattern. Une feature urgente utilise une librairie qui n'était pas dans la stack prévue. Un développeur junior ajoute une couche d'abstraction qui semblait utile sur le moment.

Ces micro-décisions ne sont pas consignées. Elles ne sont pas dans les ADR. La constitution projet ne reflète plus le code réel. L'agent, qui lit la constitution mais pas nécessairement tout le code produit, continue à générer selon les règles d'origine. Le décalage entre le code documenté et le code réel s'élargit en silence.

## Les symptômes de la dette de contexte

Contrairement à la dette technique classique, la dette de contexte ne produit pas de messages d'erreur. Elle se manifeste par des signaux plus subtils, que j'ai appris à reconnaître.

Le premier symptôme : l'agent propose des solutions que l'équipe a déjà explorées et rejetées. Sans mémoire de ce rejet dans son contexte, il redécouvre les mêmes chemins. Ce n'est pas un bug — c'est de l'ignorance.

Le deuxième symptôme : le Plan Mode génère des plans qui semblent cohérents mais qui touchent des zones de code que l'équipe sait fragiles. L'agent ne sait pas qu'elles sont fragiles — parce que cette fragilité n'est documentée nulle part dans son contexte.

Le troisième symptôme : la recette automatique passe, mais la démo client échoue. Le code est aligné avec les critères Gherkin — mais ces critères décrivent un comportement que le client a modifié il y a trois semaines. La spec n'a pas suivi.

Le quatrième symptôme, le plus inquiétant : l'agent commence à prendre des décisions architecturales de plus en plus autonomes, dans des zones où le contexte est lacunaire. Ces décisions ne sont pas mauvaises en elles-mêmes — mais elles ne sont pas les vôtres. Et personne n'a validé qu'elles s'intègrent dans la vision d'ensemble.

_Quand l'agent comble les lacunes du contexte par inférence, c'est qu'on a cessé de piloter et qu'on se laisse porter._

## La dette de contexte est exponentielle

La particularité dangereuse de la dette de contexte, c'est sa progression non-linéaire. Pendant les premiers sprints, elle reste gérable — les décalages sont mineurs, les inférences de l'agent restent proches de l'intention réelle.

Mais chaque sprint mal documenté génère plus de lacunes que le précédent, parce que le code produit dans ces lacunes crée à son tour des références que les ADR ne capturent pas. La base de code devient progressivement un actif réel qui diverge de la base documentaire — et l'agent, qui tente de réconcilier les deux, commence à produire des solutions de compromis non intentionnelles.

Il y a un point de bascule, difficile à identifier précisément, après lequel le coût de remboursement de la dette de contexte dépasse le coût de repartir d'une spec propre. J'ai vu des projets atteindre ce point au cinquième ou sixième sprint — sans que l'équipe comprenne pourquoi la vélocité s'effondrait alors que les outils n'avaient pas changé.

## Comment mesurer et surveiller la dette de contexte

Le premier instrument de mesure est le gate /gate:validate-alignment, disponible dans claude-craft. Il évalue l'alignement entre la spec documentée et le code réel, et alerte quand le score passe sous 85%. C'est un signal d'alarme, pas une mesure continue.

La commande /project:trace génère une matrice de traçabilité bidirectionnelle — de chaque user story vers le code qui l'implémente, et du code vers la spec qui le justifie. Toute zone de code non tracée est une zone de dette de contexte potentielle.

Au-delà des outils, j'ai développé un rituel en fin de sprint : avant la rétrospective, je passe quinze minutes à comparer l'état du TASKS.md, des ADR et de la spec avec ce que le code fait réellement. Ce n'est pas une vérification exhaustive — c'est un sondage. Je cherche les zones où la réalité et la documentation ont commencé à diverger.

Les questions que je me pose : quelle décision a été prise ce sprint sans être documentée ? Quelle évolution de périmètre n'a pas été répercutée dans la spec ? Quelle convention a été contournée pour des raisons de délai ?

## Les pratiques qui préviennent la dette de contexte

La prévention est moins coûteuse que le remboursement — de loin. Voici les pratiques qui ont le plus d'impact.

Mettre à jour le contexte avant de fermer le sprint, jamais après. La dette de contexte se crée dans l'intervalle entre la fin d'un sprint et le début du suivant. Si le TASKS.md, les ADR et la spec ne sont pas synchronisés avant que l'agent commence le sprint suivant, le glissement est déjà en cours.

Traiter la documentation comme du code de production. Versionner les changements de spec et d'ADR dans Git, avec des messages de commit explicites. Un changement de spec non versionné est une décision prise sans traçabilité — exactement le type de décision qui crée de la dette de contexte.

Ne jamais valider un plan qui touche une zone non documentée sans documenter d'abord. Si l'agent propose de modifier une partie du code que les ADR ne couvrent pas, la bonne réaction n'est pas de valider quand même — c'est de documenter d'abord la décision d'architecture qui encadre cette zone, puis de valider.

Faire de la dette de contexte un item explicite de la rétrospective. Pas sous ce nom nécessairement — mais sous la forme de la question : est-ce que notre contexte reflète encore fidèlement notre projet ? Cette question, posée à chaque rétro, force une mise à jour régulière.

## La dette de contexte comme révélateur organisationnel

Il y a une dimension plus profonde dans ce phénomène. La dette de contexte ne surgit pas par hasard — elle surgit là où la communication a été insuffisante, là où les décisions ont été prises sans être formalisées, là où la pression a conduit à des raccourcis.

En ce sens, elle révèle les mêmes problèmes organisationnels que la dette technique classique — mais elle les révèle plus vite et plus brutalement. Dans un projet classique, une mauvaise communication entre PO et développeurs produit des fonctionnalités mal ciblées après plusieurs semaines. Dans un projet vibecoding, elle produit une spec désalignée que l'agent amplifie dès le sprint suivant.

La dette de contexte est, à sa façon, un instrument de diagnostic organisationnel. Les équipes qui la gèrent bien sont celles qui ont des conversations claires, des décisions tracées, des changements de cap formalisés. Les équipes qui la subissent sont celles qui décident vite et documentent tard — ou jamais.

_La dette de contexte ne ment pas. Elle révèle exactement où l'organisation a pris des raccourcis sur la clarté et la formalisation de ses décisions._

## Vers une discipline de maintenance du contexte

Ce que j'ai décrit ici est un risque nouveau, propre aux projets vibecoding, qui n'a pas encore de nom établi dans la communauté. Je suis convaincu qu'il en aura un — parce que les équipes qui commencent à travailler avec des agents IA sur des projets longs vont toutes le rencontrer.

La réponse n'est pas de ralentir le vibecoding, ni de revenir à des workflows plus lents. Elle est de construire une discipline de maintenance du contexte aussi rigoureuse que la discipline de maintenance du code. Ces deux actifs ont la même importance dans un projet IA. L'un sans l'autre, c'est un moteur sans gouvernail.

Les équipes qui comprendront ça en premier prendront une longueur d'avance qui ne se comblera pas facilement. Parce que la dette de contexte, une fois accumulée, est aussi coûteuse à rembourser que la dette technique — et beaucoup plus difficile à voir.

_Dans un projet vibecoding, la spec est un actif de production au même titre que le code. La laisser se dégrader, c'est laisser se dégrader le projet lui-même — en silence, et avec un décalage._

_Cet article ouvre la série « Les nouveaux risques projet »._
