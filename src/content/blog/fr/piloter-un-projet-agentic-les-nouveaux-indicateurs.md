---
title: 'Piloter un projet agentic : ce que les indicateurs classiques ne mesurent plus'
seoTitle: 'Piloter un projet agentic : les nouveaux indicateurs'
description: "Vélocité et burndown mesurent l'effort humain. Sur un projet agentic, mieux vaut suivre la qualité du contexte, du flux et du risque avec cinq indicateurs clés."
pubDate: 2026-05-21
tags: ['Pilotage', 'Gestion de projet', 'Agentic engineering', 'KPI']
category: 'Pilotage'
series: "Les métiers à l'ère agentic"
seriesOrder: 3
image: '../../../assets/blog/blog_post_6_1768848765056.webp'
draft: false
originalUrl: https://agentic-agency.fr/blog/piloter-un-projet-agentic-les-nouveaux-indicateurs
originalPublishedAt: 2026-05-21
imageAlt: "Écran d'ordinateur sombre affichant un tableau de bord d'analyse web, avec histogrammes bleus, courbes roses de taux de rebond et indicateurs chiffrés en bas"
---

Un chef de projet d'agence pilote depuis dix ans avec les mêmes instruments : vélocité, burndown, capacité, story points, taux de complétion. Ces indicateurs ont fait leurs preuves sur des équipes humaines avec une vélocité technique stable. Ils ont une qualité essentielle : ils sont prévisibles parce que l'effort humain l'est.

L'agent, lui, n'est pas prévisible de la même manière. Il peut générer en deux heures un module qui prendrait deux semaines à un humain. Il peut aussi passer trois jours à itérer sur une story mal cadrée, en consommant des tokens sans produire de valeur. Mesurer cette équipe hybride avec les anciens instruments revient à mesurer un avion avec un compteur kilométrique de voiture.

_Le pilotage agentic n'a pas besoin d'instruments plus précis. Il a besoin d'instruments différents._

## Pourquoi la vélocité classique devient trompeuse

La vélocité mesurait la capacité de production technique. Dans un workflow classique, c'était le bon proxy : ce qu'une équipe pouvait livrer dépendait essentiellement de ce qu'elle pouvait coder.

Dans un workflow agentic, la production technique n'est plus le goulot d'étranglement. Une équipe peut livrer cinq fois plus de code que le sprint précédent — et avoir détruit autant de valeur. Le code généré sur une spec floue est du code à jeter. Le code généré sur un contexte dégradé crée de la dette qui se paiera trois sprints plus tard.

La vélocité brute, mesurée en story points complétés, devient un indicateur dangereux. Elle pousse à fermer des stories vite, à empiler la production, à minimiser la friction de validation. Tout l'inverse de ce qui rend un projet agentic sain.

## Les indicateurs de qualité du contexte

Le premier nouveau tableau de bord concerne la qualité du contexte. Ce que l'agent lit détermine ce qu'il produit. Mesurer le contexte, c'est mesurer la cause — pas le symptôme.

Le score de readiness des stories : pourcentage de stories du backlog qui passent les critères INVEST avant le sprint. En dessous de 80%, le sprint démarre dans le brouillard. Cet indicateur prédit la qualité du sprint mieux que n'importe quelle estimation.

L'âge moyen de la spec : depuis combien de temps les artefacts de contexte (PRD, ADR, glossaire) n'ont-ils pas été revus ? Au-delà de quatre sprints sans relecture, le contexte est probablement désynchronisé du code. Cet écart silencieux est la cause principale des régressions inexpliquées.

Le taux de dérive contextuelle : pourcentage de stories où le code généré diffère significativement de l'intention initiale. Calculable par revue humaine échantillonnée. Au-delà de 15%, le contexte fuit — il faut auditer avant de continuer à produire.

## Les indicateurs de qualité du flux

Le deuxième tableau de bord concerne le flux de production. Pas la vitesse — la qualité du flux.

Le taux de stories passant les gates au premier coup : combien de stories validées sans aller-retour ? C'est l'indicateur synthétique de la maturité du workflow. Une équipe agentic mature dépasse 70%. En dessous de 50%, le pipeline est cassé quelque part.

Le ratio génération-validation : sur le temps total d'un sprint, quel pourcentage est consacré à la génération de code, quel pourcentage à la validation humaine ? Un ratio sain tourne autour de 25%-50%, le reste étant le cadrage et la maintenance. Un ratio génération > 50% est suspect — l'équipe pousse plus qu'elle ne valide.

Le taux de rework : pourcentage de stories rouvertes après livraison. C'est le signal de la dette de qualité qui se constitue. Au-delà de 10%, la vélocité affichée est largement fictive.

## Les indicateurs de risque agentic

Le troisième tableau de bord est spécifique au risque agentic — un type de risque que les projets classiques ne connaissaient pas.

Le coût-token par story : combien de tokens consommés pour produire une story validée ? C'est un indicateur direct de l'efficacité du cadrage. Une story qui consomme dix fois la médiane signale soit une complexité réelle, soit un cadrage défaillant. Les deux méritent investigation.

La densité de validation humaine : combien de points de validation explicite dans le pipeline ? Un projet où l'humain ne valide que le résultat final est un projet qui découvre les problèmes trop tard. Une validation par étape, par contre, ralentit en apparence et fiabilise en réalité.

Le taux de patch hors-spec : pourcentage de corrections appliquées directement au code sans mise à jour du contexte. C'est le marqueur de la dette de contexte qui se forme. Chaque patch hors-spec est un futur bug — parce que le prochain sprint régénérera le code à partir de la spec inchangée.

## Le tableau de bord de pilotage agentic

Synthèse pratique : un chef de projet agentic surveille en continu cinq indicateurs.

Readiness backlog : objectif 80% minimum, lu en début de chaque sprint.

Taux de passage gates au premier coup : objectif 70% minimum, lu en fin de chaque sprint.

Taux de rework post-livraison : objectif inférieur à 10%, lu sur les quatre derniers sprints glissants.

Âge moyen des artefacts de spec : objectif inférieur à quatre sprints, lu mensuellement.

Coût-token par story validée : objectif stable ou décroissant, lu en tendance.

Ces cinq indicateurs ne remplacent pas tous les indicateurs classiques — mais ils sont les seuls qui mesurent vraiment ce qui rend un projet agentic sain.

## Le standup pilotage : ce qu'on regarde vraiment

Dans le standup classique, on regardait l'avancement des tâches. Dans le standup agentic, on regarde l'état du système.

Quelle est la qualité du contexte aujourd'hui ? Y a-t-il des stories en cours sur des specs dégradées ? Quels patchs hors-spec ont été appliqués hier ? L'agent a-t-il dérivé sur une story ou est-il aligné avec l'intention ? Y a-t-il des signaux de bruit dans le code généré qui méritent une investigation avant accumulation ?

Ces questions ne se posaient pas avant. Elles sont aujourd'hui plus importantes que « qu'est-ce que tu as fait hier ».

## Le pilotage prédictif vs réactif

Le pilotage classique était essentiellement réactif : on mesurait ce qui s'était passé, on ajustait après coup. Cela fonctionnait parce que la production humaine est continue et lente.

La production agentique est discontinue et rapide. Un problème détecté en fin de sprint a déjà produit deux semaines de code potentiellement compromis. Le pilotage doit devenir prédictif : on mesure les conditions amont (qualité du contexte, readiness, densité de validation) plutôt que les conséquences aval (bugs, rework, régressions).

Un projet agentic bien piloté est un projet où la moitié des problèmes sont détectés avant qu'ils produisent du code. C'est un changement de culture autant que d'outillage.

## Le rôle qui se transforme

Le chef de projet agentic n'est plus un coordinateur de tâches. C'est un superviseur de système. Il observe le contexte, surveille les gates, anticipe les dérives, ajuste les rituels.

Son temps se redistribue : moins de suivi d'avancement, plus de vérification de qualité amont. Moins de coordination de personnes, plus d'audit de pipelines. Moins de reporting au passé, plus d'alerte sur les signaux faibles.

_Piloter en agentic, c'est cesser de regarder la vélocité comme un thermomètre. Le vrai thermomètre, c'est la santé du contexte amont — un signal silencieux que les outils classiques ne captent pas. Apprendre à le lire est l'investissement le plus rentable d'un chef de projet aujourd'hui._

_Prochain article : « Le gain de rentabilité agentic : comment vérifier qu'il existe vraiment »._
