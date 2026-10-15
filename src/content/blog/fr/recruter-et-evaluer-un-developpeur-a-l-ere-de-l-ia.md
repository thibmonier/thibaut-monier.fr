---
title: "Recruter et évaluer un développeur à l'ère du vibecoding"
description: "Si l'IA génère l'essentiel du code, l'entretien technique doit tester la lecture critique, la formalisation du besoin et le diagnostic de dérive."
pubDate: 2026-03-02
tags: ['Recrutement', 'Vibecoding', 'IA générative']
category: 'Métiers'
series: "Transformer l'agence"
seriesOrder: 2
image: '../../../assets/blog/blog_post_7_1768850538178.webp'
imageAlt: 'Entretien de recrutement : un candidat souriant en chemise bleue fait face à une recruteuse de dos qui tient un bloc-notes et un stylo, devant un ordinateur de bureau'
draft: false
originalUrl: https://agentic-agency.fr/blog/recruter-et-evaluer-un-developpeur-a-l-ere-de-l-ia
originalPublishedAt: 2026-03-02
---

Si 70% du code d'un projet est généré par IA, que teste-t-on encore en entretien technique ?

C'est la question que j'aurais dû me poser bien avant de la rencontrer dans la réalité. Elle arrive toujours trop tard — au moment où on a déjà recruté quelqu'un sur des critères devenus partiellement obsolètes, ou refusé quelqu'un qui aurait été excellent dans le nouveau paradigme.

Le marché du recrutement tech n'a pas encore eu cette conversation sérieusement. Les grilles d'évaluation classiques testent des compétences qui s'automatisent. Et les nouvelles compétences critiques — celles qui font la différence dans un workflow IA — n'ont pas encore de tests standardisés.

_L'entretien technique classique mesure ce que l'IA fait désormais à la place du candidat. Ce qu'il faudrait mesurer, c'est ce que le candidat fait que l'IA ne peut pas faire._

## Ce qui ne sert plus à grand-chose de tester

Soyons précis — pas radical. La compréhension algorithmique fondamentale reste utile. La capacité à lire du code reste essentielle. Mais plusieurs catégories de tests classiques mesurent désormais des compétences que l'IA substitue efficacement.

Écrire du code CRUD de zéro, en conditions de temps limité, sur un problème artificiel. Ce type d'exercice teste une vélocité de frappe et une mémorisation syntaxique que l'IA rend largement redondantes dans un contexte professionnel réel. Un candidat qui génère ce code en deux minutes via Claude Code et qui peut expliquer chaque ligne produite a potentiellement plus de valeur qu'un candidat qui l'écrit en vingt minutes sans assistance.

Mémoriser des APIs, des configurations, des paramètres spécifiques à un framework. Cette compétence a toujours été plus proche de la capacité de consultation rapide que du raisonnement réel — et l'IA la rend clairement secondaire.

La vitesse de production brute. Un développeur qui genère vite mais ne sait pas valider est plus dangereux qu'un développeur plus lent qui comprend ce qu'il produit.

## Ce qui devient critique

**La compétence de lecture critique de code généré.**

Peut-il lire un plan proposé par Claude Code et identifier les décisions implicites ? Peut-il détecter quand l'agent a pris une direction architecturale qui va créer de la dette ? Peut-il expliquer pourquoi le code généré fonctionne — et pas seulement confirmer qu'il compile ?

C'est la compétence la plus discriminante dans un workflow IA. Elle est rare, même chez les profils expérimentés. Elle suppose une compréhension de l'architecture suffisamment solide pour juger des choix qu'on n'a pas faits soi-même.

**La compétence de formalisation du besoin.**

Peut-il écrire une user story en Gherkin qui passe le gate INVEST ? Peut-il formuler des critères d'acceptation mesurables plutôt que des intentions vagues ? Peut-il distinguer une règle métier d'une contrainte technique dans une spec ?

Cette compétence est au croisement du product management et du développement. Elle est précisément ce qui manque dans la formation classique des développeurs — et ce qui fait la différence entre un profil qui pilote l'IA et un profil que l'IA pilote.

**La compétence de diagnostic de dérive.**

Peut-il identifier, dans une base de code générée sur plusieurs sprints, les symptômes d'un contexte dégradé ? Peut-il lire un TASKS.md désynchronisé et comprendre ce que ça implique pour la suite ? Peut-il sentir quand la spec n'est plus alignée avec le code ?

Cette compétence de surveillance et de diagnostic est nouvelle dans son expression — mais elle repose sur des fondamentaux anciens : la compréhension des systèmes, la lecture de la dette technique, la cohérence architecturale.

**La posture face à l'incertitude.**

Que fait-il quand l'agent produit quelque chose qu'il ne comprend pas complètement ? Est-ce qu'il valide quand même parce que ça compile ? Ou est-ce qu'il creuse, questionne le plan, reformule le contexte ?

Cette question de posture est probablement la plus révélatrice. Elle distingue le candidat qui subira les workflows IA de celui qui les pilotera.

## Comment tester ces nouvelles compétences

L'entretien en deux temps que j'ai commencé à utiliser sur les recrutements récents.

Premier temps — la lecture : montrer au candidat un extrait de code généré par IA (réel, issu d'un projet récent, anonymisé). Lui demander d'identifier : ce que l'agent a bien fait, ce qui l'inquiète, les décisions implicites qu'il repère, une question qu'il poserait avant de valider ce plan. Ce test ne mesure pas la vitesse — il mesure le jugement.

Deuxième temps — la spec : lui donner un brief client vague, formulé comme un client le ferait vraiment. Lui demander d'en extraire une user story au format Gherkin avec ses critères d'acceptation. Pas de code. Pas d'architecture. Juste la capacité à transformer l'intention en contrat exécutable.

Ces deux exercices prennent une heure. Ils sont plus révélateurs qu'un kata algorithmique de trois heures.

## Le profil qui émerge

Ce que je cherche aujourd'hui dans un recrutement, c'est un développeur qui a une compréhension technique solide — pas nécessairement encyclopédique — et une capacité de jugement sur ce que l'IA produit. Un profil qui sait formuler, valider, diagnostiquer. Qui comprend pourquoi les guardrails existent et ne cherche pas à les contourner.

Ce profil n'est pas rare chez les seniors. Il est quasi inexistant chez les juniors récents — non pas par manque de talent, mais parce que la formation n'a pas encore intégré ces compétences. C'est une fenêtre de différenciation pour les équipes qui forment intentionnellement leurs juniors à piloter l'IA plutôt qu'à la subir.

_Le meilleur indicateur d'un développeur prêt pour le vibecoding n'est pas sa vitesse de coding. C'est sa capacité à expliquer le code qu'il n'a pas écrit._

## Une note sur les profils non-techniques

Une surprise de ces mois de pratique : les profils product — PO, BA, chefs de projet avec une culture fonctionnelle forte — apprennent souvent à piloter l'IA plus vite que certains profils techniques juniors. Parce que la compétence de formalisation du besoin, qu'ils ont déjà, est précisément ce qui devient central.

Ce n'est pas une menace pour les développeurs. C'est un signal : les frontières entre les rôles sont en train de se redessiner. Les équipes les plus efficaces dans un workflow IA seront celles qui auront appris à valoriser la pensée systémique et la précision du langage autant que la maîtrise syntaxique.

_Prochain article : « La gestion de projet IA est une discipline à part entière — et personne ne l'enseigne »._
