---
title: "Shadow IT agentique : quand l'entreprise perd la trace de ses propres agents"
seoTitle: 'Shadow IT agentique : perdre la trace de ses agents'
description: "Des agents IA tournent sans être inventoriés. L'interdiction les cache davantage ; un registre simple, fondé sur les droits et la validation, fonctionne mieux."
pubDate: 2026-09-21
tags: ['Shadow IT', 'Gouvernance', 'IA générative', 'Risques', 'Conformité']
category: 'Pilotage'
image: '../../../assets/blog/shadow-it-agents.webp'
imageAlt: 'Câbles réseau bleus et gris branchés sur un Cloud Router Switch MikroTik dans une baie, éclairée de lueurs bleues et vertes'
series: 'Les nouveaux risques projet'
seriesOrder: 2
draft: false
originalUrl: https://agentic-agency.fr/blog/shadow-it-agentique-perdre-la-trace-de-ses-agents
originalPublishedAt: 2026-09-21
---

Un DSI ouvre son inventaire d'outils IA. Il y trouve ce qu'il a validé : un assistant de code sous licence entreprise, un copilote bureautique, deux POC encadrés. Puis il regarde les logs de sortie réseau, les clés API émises, les webhooks actifs. Le compte ne tombe pas juste. Il y a des agents qui tournent, qui appellent des services, qui écrivent dans des systèmes — et qui ne figurent nulle part.

Ce n'est pas une négligence. C'est la conséquence mécanique du fait qu'un agent utile se crée aujourd'hui en une après-midi, par quelqu'un dont ce n'est pas le métier, sans passer par personne. La barrière à l'entrée a disparu avant que la gouvernance n'ait eu le temps d'exister.

Le réflexe consiste à traiter le phénomène comme une pathologie : reprendre le contrôle, interdire, centraliser. C'est une lecture confortable parce qu'elle désigne un coupable et une solution. Elle a un défaut : c'est exactement le raisonnement qui a échoué sur le cloud il y a quinze ans.

_Un shadow IT massif n'est jamais un problème de discipline. C'est le symptôme d'un écart entre ce dont les équipes ont besoin et ce que l'organisation leur fournit._

## Le précédent que tout le monde a oublié

L'histoire est connue. Au début des années 2010, des équipes métier ont commencé à souscrire des SaaS avec une carte bleue, à stocker des fichiers sur des services grand public, à monter des instances cloud sans prévenir la DSI. Les directions informatiques ont d'abord interdit. Puis elles ont constaté que l'interdiction produisait surtout de la dissimulation. Puis elles ont fini par faire ce qu'elles auraient dû faire d'emblée : proposer une alternative aussi rapide que celle que les équipes s'étaient trouvée, et encadrer le reste.

Ce qui a mis fin au shadow IT cloud, ce n'est pas la répression. C'est le fait que la voie officielle soit devenue plus commode que la voie détournée.

Retenir cette leçon change la question. Elle n'est pas « comment empêcher mes équipes de créer des agents ». Elle est « pourquoi mes équipes trouvent plus rapide de créer un agent dans leur coin que de passer par nous ».

Dans la plupart des cas, la réponse est désagréable : parce que passer par la voie officielle prend six semaines, exige un comité, et se solde une fois sur deux par un refus sans alternative.

## Pourquoi l'agent n'est pas un SaaS de plus

Le parallèle avec le cloud éclaire le mécanisme, mais il ne doit pas masquer une différence qui change la nature du risque.

Un SaaS non déclaré est un endroit où des données dorment. Il expose, mais il n'agit pas. On peut le découvrir tardivement, évaluer l'exposition, migrer, fermer le compte. Le dommage est statique.

Un agent non déclaré agit. Il envoie des messages, modifie des enregistrements, déclenche des traitements, appelle d'autres services. Il le fait sans qu'un humain valide chaque opération — c'est précisément sa raison d'être. Et il le fait de manière variable : un agent ne se comporte pas de façon identique d'une exécution à l'autre, parce que son comportement dépend du contexte qu'il reçoit au moment où il s'exécute.

Cette variabilité est ce qui rend l'inventaire difficile et l'audit incomplet. Constater qu'un agent existe ne dit pas ce qu'il fera la prochaine fois. Un test qui passe aujourd'hui ne garantit pas le comportement de demain, parce que l'entrée aura changé.

On hérite donc d'un objet qui cumule les propriétés les plus inconfortables : il est facile à créer, difficile à recenser, autonome dans son action, et instable dans son comportement.

## L'angle mort : l'invisibilité décisionnelle

Le vrai problème n'est pas tant qu'on ignore combien d'agents tournent. C'est qu'on ignore pourquoi ils ont décidé ce qu'ils ont décidé.

Un système informatique classique est auditable par construction : la règle est dans le code, on peut la lire. Un agent produit une décision à partir d'un raisonnement qui n'est pas inscrit dans une ligne de code lisible. On peut journaliser l'entrée et la sortie. On peut rarement reconstituer le chemin.

Concrètement, cela veut dire qu'une organisation peut se trouver dans la situation suivante : un traitement a été appliqué à un client, personne ne conteste qu'il a eu lieu, et personne n'est capable d'expliquer sur quelle base il a été appliqué. Ce n'est pas un problème technique. C'est un problème de responsabilité.

Et il ne se pose pas seulement en cas d'incident. Il se pose dès qu'un client, un auditeur ou un régulateur demande une justification.

## Ce que le cadre réglementaire change à l'équation

Le règlement européen sur l'IA impose une logique proportionnée au risque : plus un système touche à des décisions qui affectent des personnes, plus les obligations de documentation, de traçabilité et de supervision humaine se renforcent. L'esprit du texte est simple à résumer : il faut pouvoir dire ce qu'un système fait, sur quelles données, sous quelle surveillance.

Un agent non inventorié rend cette phrase impossible à prononcer. Non parce qu'il serait nécessairement non conforme, mais parce qu'on ne peut rien démontrer d'un système dont on ignore l'existence.

C'est là que le shadow IT agentique cesse d'être un sujet d'hygiène interne pour devenir un sujet contractuel. Une agence qui livre à un client régulé — banque, assurance, santé, secteur public — devra tôt ou tard produire cette démonstration. Mieux vaut avoir construit la traçabilité avant qu'elle ne soit exigée.

## Pourquoi l'interdiction produit l'inverse de ce qu'elle vise

Supposons qu'une direction décide de bloquer la création d'agents hors circuit validé. Trois choses se produisent.

La première : les usages les plus visibles disparaissent. Les équipes cessent d'utiliser les outils bloqués sur le poste de travail.

La deuxième : les usages ne disparaissent pas, ils se déplacent. Vers des comptes personnels, des machines non gérées, des services accessibles depuis un navigateur. Ce qui était imparfaitement visible devient totalement invisible.

La troisième, la plus coûteuse : l'organisation perd le bénéfice des expérimentations. Car parmi ces agents non déclarés, il y en a qui marchent. Quelqu'un a automatisé une tâche pénible, réduit un délai de traitement, éliminé une ressaisie. Cette connaissance est en train de se créer dans l'entreprise, et l'interdiction la pousse hors du champ de vision au lieu de la capter.

On échange alors un risque mesurable contre un risque invisible, et on paie ce troc avec de l'innovation.

## Le registre plutôt que le barrage

La réponse qui fonctionne est plus modeste et plus exigeante que l'interdiction : rendre la déclaration plus facile que la dissimulation.

Cela suppose d'accepter un principe contre-intuitif : on ne demande pas d'autorisation pour créer un agent, on demande de l'inscrire. Le contrôle ne porte pas sur l'existence, il porte sur le périmètre.

Un registre utile tient en quelques champs, pas en un formulaire de trois pages. Qui est responsable de cet agent. À quels systèmes accède-t-il, en lecture ou en écriture. Quelles données traite-t-il. Quelle est la conséquence maximale d'une erreur de sa part. Est-ce qu'un humain valide avant l'action, après, ou jamais.

Ce dernier champ est le plus discriminant. Il permet de trier sans juger : un agent qui propose et attend validation ne relève pas du même régime qu'un agent qui écrit directement en production. Le premier peut vivre en autonomie quasi complète. Le second mérite une revue.

<svg viewBox="0 0 620 250" role="img" aria-labelledby="t-matrice d-matrice" class="w-full h-auto" font-family="ui-sans-serif,system-ui,sans-serif">
  <title id="t-matrice">Régime de contrôle selon les droits et la validation humaine</title>
  <desc id="d-matrice">Un agent en lecture seule dont les actions sont validées relève d'un régime d'autonomie. Un agent qui écrit en production sans validation humaine est le seul cas qui justifie une revue obligatoire.</desc>
  <rect x="350" y="30" width="240" height="85" fill="var(--color-primary)" opacity="0.1"/>
  <g fill="none" stroke="var(--color-border)" stroke-width="1.5">
    <rect x="110" y="30" width="480" height="170" rx="4"/>
    <line x1="350" y1="30" x2="350" y2="200"/>
    <line x1="110" y1="115" x2="590" y2="115"/>
  </g>
  <g text-anchor="end" font-size="11" fill="var(--color-muted-foreground)">
    <text x="102" y="20">Validation humaine</text>
    <text x="102" y="76">jamais</text>
    <text x="102" y="163">avant l'action</text>
  </g>
  <g text-anchor="middle" font-size="11" fill="var(--color-muted-foreground)">
    <text x="230" y="220">Lecture seule</text>
    <text x="470" y="220">Écriture</text>
    <text x="350" y="242">Droits accordés à l'agent</text>
  </g>
  <g text-anchor="middle" font-size="12.5" fill="var(--color-foreground)">
    <text x="230" y="78">Revue légère</text>
    <text x="230" y="165">Autonomie</text>
    <text x="470" y="165">Périmètre à borner</text>
  </g>
  <text x="470" y="78" text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--color-primary)">Revue obligatoire</text>
</svg>

Un seul quadrant sur quatre justifie une revue systématique. Les trois autres se contentent d'une inscription au registre — ce qui laisse à l'immense majorité des usages une voie officielle plus rapide que la dissimulation.

L'enjeu est de fixer la barrière au bon endroit. Trop haut, elle produit de la dissimulation. Trop bas, elle produit un registre que personne ne tient à jour.

## Trois gestes concrets pour une structure de taille moyenne

Pour une agence, une ESN ou un éditeur, la mise en œuvre ne demande pas une refonte de gouvernance.

Le premier geste est de découvrir avant d'encadrer. L'inventaire déclaratif ne trouve que ce que les gens veulent bien dire. Les clés API émises, les tokens actifs, les intégrations autorisées sur les SaaS métier et les sorties réseau donnent une image plus honnête. L'écart entre les deux images est votre vraie mesure de départ — et c'est un chiffre qu'il vaut mieux connaître soi-même avant qu'un client ne le demande.

Le deuxième geste est de séparer les droits de lecture des droits d'écriture. La très grande majorité des agents utiles n'ont besoin que de lire. Accorder l'écriture par défaut, parce que c'est plus simple à configurer, est la décision qui transforme un incident mineur en incident grave. C'est le principe du moindre privilège appliqué à un acteur non humain, et il n'y a aucune raison de l'assouplir pour lui.

Le troisième geste est de journaliser les actions, pas les prompts. Conserver les conversations pose des questions de confidentialité et produit un volume ingérable. Conserver ce que l'agent a effectivement fait — quel appel, sur quel système, avec quel résultat, à quelle heure, sous quelle identité — coûte peu et répond à l'essentiel des questions qu'on vous posera un jour.

## Le déplacement que cela impose

Encadrer des agents oblige à admettre une chose que beaucoup d'organisations n'ont pas encore formulée : elles ont désormais des acteurs non humains dans leurs systèmes, et ces acteurs doivent être gérés comme tels. Avec une identité propre, des droits explicites, un responsable nommé, une journalisation et une date de revue.

Ce n'est pas un sujet d'IA. C'est un sujet de gestion des identités et des accès, appliqué à une catégorie d'acteurs qui n'existait pas dans les modèles conçus pour des humains et des serveurs.

_Le shadow IT agentique n'est pas une crise de discipline. C'est un signal d'adoption, et il indique exactement où votre organisation est trop lente. La question n'est pas de savoir comment l'arrêter, mais ce que ces agents non déclarés vous apprennent sur ce que vos équipes n'obtiennent pas de vous._

_Prochain article : « Le coût caché de la supervision : ce que le modèle des équipes réduites ne dit pas »._
