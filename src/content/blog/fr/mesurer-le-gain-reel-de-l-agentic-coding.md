---
title: "Le gain de rentabilité agentic : comment vérifier qu'il existe vraiment"
seoTitle: "Gain de rentabilité agentic : vérifier qu'il existe"
description: "Le gain de l'agentic coding est réel à la génération, mais il se déplace vers cadrage, validation et rework. Comment le mesurer honnêtement, poste par poste."
pubDate: 2026-05-22
tags: ['ROI', 'Agentic engineering', 'Pilotage financier']
category: 'Pilotage'
series: "Les métiers à l'ère agentic"
seriesOrder: 4
image: '../../../assets/blog/blog_post_7_1768850538178.webp'
draft: false
imageAlt: "Salle de réunion lumineuse : une femme debout présente au tableau blanc à une vingtaine de collègues assis autour d'une longue table en bois"
---

Le discours sur l'agentic coding est saturé de promesses. Cinq fois plus rapide. Dix fois moins cher. Marges multipliées. Ces chiffres circulent sans être interrogés. Ils ont une qualité : ils sont vrais sur la phase de génération. Ils ont un défaut : la génération n'est qu'une partie minoritaire du coût total d'un projet.

L'agence qui mesure son gain réel découvre souvent quelque chose d'inconfortable. La marge n'a pas explosé. Elle s'est déplacée. Une partie du gain attendu a été absorbée par des coûts nouveaux que personne n'avait modélisés. Une autre partie s'est diluée dans des cycles de réécriture invisibles.

_Le gain agentic est réel — mais il n'est ni automatique, ni distribué équitablement. Le mesurer honnêtement est la première étape pour le capturer vraiment._

## Le piège du gain apparent

Le gain apparent de l'agentic coding se calcule facilement : on prend le temps qu'une story aurait pris en classique, on le compare au temps qu'elle a pris en agentic, on multiplie par le taux journalier, on annonce un ROI.

Ce calcul est trompeur pour trois raisons.

Première raison : il ignore le temps de cadrage. Une story qui se génère en deux heures a souvent nécessité dix heures de spec en amont. Ce temps de spec n'existait pas dans le modèle classique — ou existait sous une forme dégradée absorbée par les développeurs. Le compter à zéro, c'est se mentir.

Deuxième raison : il ignore le temps de validation. Le code généré doit être lu, testé, audité. Cette charge de validation est nouvelle dans son ampleur — un développeur ne validait pas son propre code avec la même rigueur. Sous-estimer ce temps, c'est gonfler artificiellement le gain.

Troisième raison : il ignore le rework caché. Une partie du code généré sera reprise dans les sprints suivants, parfois sans qu'on le décompte explicitement. Ce rework est diffus, distribué, peu visible — mais il consomme une part non négligeable du gain affiché.

## Les nouveaux postes de coût à suivre

Quatre postes de coût sont apparus avec l'agentic coding. Aucun n'existait dans la comptabilité classique d'une agence. Tous doivent être mesurés.

Le coût-token brut : ce que coûte la consommation d'API par les agents. Sur un projet typique, ce coût est faible en valeur absolue, mais variable. Une équipe qui boucle sur une story mal cadrée peut tripler sa consommation. Ce poste mérite un suivi mensuel par projet.

Le coût de cadrage amont : ce que coûte la production des artefacts de spec, ADR, user stories Gherkin, exemples canoniques. Ce coût peut représenter 30 à 50% du coût total d'un projet agentic. L'ignorer, c'est rendre les marges illisibles.

Le coût de validation continue : ce que coûtent les revues humaines, les audits de sécurité, la maintenance du contexte. Ce coût ne disparaît pas avec l'automatisation — il se déplace, et souvent il augmente parce que le rythme de génération l'exige.

Le coût de rework : ce que coûte la réécriture du code généré, qu'elle soit explicite (story rouverte) ou implicite (patch successif). Ce coût est le plus difficile à mesurer, et le plus important pour comprendre la rentabilité réelle.

## La formule de rentabilité agentic

Une formule simple permet de mesurer le gain réel par projet.

Gain net = (Coût projet classique estimé) − (Coût cadrage + Coût génération + Coût tokens + Coût validation + Coût rework)

Cette formule a deux propriétés utiles. Elle force à expliciter chaque poste — donc à le mesurer. Et elle évite l'auto-félicitation : le gain affiché est ce qui reste après tous les coûts, pas ce qui apparaît sur la première ligne du devis.

D'après les projets que j'ai pu observer en pratique sur les douze derniers mois, j'estime que le gain net se situe rarement au-delà de 30% à 60% du coût classique, avec une grande variance selon la maturité de l'équipe. C'est une estimation personnelle issue de mes projets, pas une mesure. Loin des 80% à 90% annoncés dans les pitchs, mais largement positif et durable si la méthode est saine. Chacun devra mesurer chez soi pour ne pas se baser sur des moyennes étrangères à son contexte.

## Les indicateurs financiers de pilotage

Trois indicateurs financiers méritent un suivi mensuel par projet et global agence.

La marge nette par story livrée : revenu généré par la story, divisé par le coût total réel. C'est l'indicateur de référence. Une dérive à la baisse signale soit un sous-pricing, soit un surcoût mal contrôlé.

Le ratio coût-cadrage / coût-total : sur un projet sain, ce ratio se stabilise entre 30% et 40%. En dessous, le cadrage est sous-investi et produira du rework. Au-dessus, le cadrage est sur-investi et grève la marge.

Le coût moyen par story rouverte : combien coûte en moyenne un rework. Cet indicateur seul ne dit pas tout — mais sa tendance révèle si la qualité s'améliore ou se dégrade dans le temps.

## La dette technique cachée

L'angle mort principal de la rentabilité agentic est la dette technique générée silencieusement. Le code produit rapidement sans architecture s'effondre rapidement sous son propre poids.

Cette dette ne se manifeste pas dans les indicateurs immédiats. Elle apparaît trois, six, douze mois plus tard, sous forme de bugs récurrents, de fonctionnalités impossibles à ajouter, de refactorings coûteux à entreprendre. Le gain affiché en année 1 peut être annulé par les coûts cachés en année 2.

Le seul moyen de mesurer cette dette est de la rendre visible en continu. Audits trimestriels de qualité de code, mesure de la complexité cyclomatique, suivi du taux de couverture de tests, comptage des marqueurs « à faire » et FIXME laissés dans le code généré. Ce sont des indicateurs de santé long terme — plus importants que la rentabilité court terme.

## Le ROI par phase projet

Le gain agentic n'est pas uniforme sur la durée d'un projet. Il se distribue différemment selon les phases.

En phase de cadrage initial, le gain est négatif. L'investissement amont est plus lourd qu'en classique. Une agence qui attend un gain immédiat sur cette phase est déçue — et tentée d'écourter, ce qui sera payé cher ensuite.

En phase de développement principal, le gain devient massif. C'est là que les chiffres spectaculaires se produisent. Une équipe agentic mature livre cinq à dix fois plus vite qu'une équipe classique sur cette phase.

En phase de maintenance et d'évolution, le gain redevient modéré, voire négatif si la dette technique a été accumulée. C'est ici que la méthode SDD fait la différence : une spec versionnée et maintenue permet à l'agent de reprendre proprement, là où un projet vibe coding s'enfonce dans la dette.

## Le calcul honnête à présenter en interne

Un dirigeant d'agence qui veut piloter la transition agentic doit s'imposer un calcul honnête, présenté en comité de direction tous les trimestres.

Pour chaque projet majeur livré dans le trimestre : coût estimé en classique, coût réel en agentic, gain net, principaux postes de surcoût, indicateurs de qualité de livraison. Ce reporting transparent est inconfortable la première fois — il révèle souvent que le gain réel est inférieur au gain rêvé.

Mais c'est ce reporting qui permet de progresser. Sans mesure honnête, l'agence pilote à l'aveugle et finit par découvrir trop tard que sa marge s'érode. Avec mesure honnête, elle ajuste ses prix, ses méthodes, ses investissements de formation.

_Le gain de rentabilité agentic n'est pas un acquis — c'est un objectif à conquérir et à défendre. Mesurer honnêtement, c'est s'exposer à la déception du premier trimestre. Refuser de mesurer, c'est s'exposer à la déception du premier bilan annuel. Le choix est entre une vérité tôt et un mensonge tard._

_Prochain article : « Sécurité agentic : comment rassurer un client et prouver la qualité de l'outil »._
