---
title: "Sécurité agentic : comment rassurer un client et prouver la qualité de l'outil"
seoTitle: 'Sécurité agentic : rassurer le client et prouver la qualité'
description: 'Le client demande si le code généré est sécurisé : répondre par une chaîne de contrôles en cinq maillons et des preuves continues, pas des promesses.'
pubDate: 2026-05-23
tags: ['Sécurité', 'Qualité', 'Agentic engineering', 'Audit']
category: 'Pilotage'
series: "Les métiers à l'ère agentic"
seriesOrder: 5
image: '../../../assets/blog/blog_post_9_1768850568154.webp'
draft: false
originalUrl: https://agentic-agency.fr/blog/securite-agentic-rassurer-le-client-et-prouver-la-qualite
originalPublishedAt: 2026-05-23
imageAlt: "Un homme en chemise bleue sourit à une femme de dos qui tient un stylo et un bloc-notes, assis face à elle à un bureau devant un ordinateur à l'écran vert"
---

L'agentic coding a déplacé une partie significative de la production logicielle vers des agents. Cette migration arrive plus vite que la maturation des pratiques de sécurité qui devraient l'encadrer. Résultat : un fossé s'est creusé entre ce que les agences livrent et ce que les clients sont capables d'auditer.

Quand un directeur de la sécurité informatique côté client demande comment son fournisseur garantit que le code généré ne comporte pas de vulnérabilité, la réponse est souvent évasive. Quand il demande la chaîne de traçabilité d'une décision prise par un agent, la réponse est souvent inexistante. Ces silences sont commercialement coûteux et techniquement dangereux.

_La sécurité agentic ne se résume pas à scanner du code généré. Elle exige une chaîne complète : du contrôle de la spec à l'audit du runtime, en passant par la traçabilité des décisions et la maîtrise du contexte injecté._

## Les risques spécifiques au code généré par agent

Trois familles de risques sont propres aux workflows agentic. Aucune n'est gérée par les pratiques de sécurité classiques.

Le risque d'injection de contexte malveillant : un attaquant qui parvient à manipuler le contexte lu par l'agent peut faire générer du code arbitraire. Si la spec, les ADR ou les exemples sont accessibles en écriture par un acteur non maîtrisé, le pipeline devient compromis à la source. C'est une catégorie de risque qui n'existait pas avant.

Le risque de fuite par le prompt : les agents peuvent inclure dans leur sortie des fragments de leur contexte d'entrée. Si ce contexte contient des secrets, des données client ou des informations sensibles, ces éléments peuvent se retrouver dans le code généré, dans les logs, ou dans des artefacts partagés. La discipline de séparation contexte / secrets devient critique.

Le risque de vulnérabilité statistique : un agent entraîné sur du code public reproduit aussi les patterns vulnérables fréquents dans ce code. Sans contrainte explicite, il génère des SQL concaténées, des validations manquantes, des permissions trop larges — non par malveillance, mais par régression statistique vers ce qui est le plus représenté dans les données d'entraînement.

## La chaîne de sécurité agentic

Une chaîne de sécurité opérationnelle couvre cinq maillons. Chacun doit être documenté, mesurable et auditable.

Premier maillon : la sécurité du contexte. Qui peut écrire dans la spec, les ADR, les exemples ? Quelle est la chaîne de signature de ces artefacts ? Comment une modification non autorisée serait-elle détectée ? Le contexte est aujourd'hui ce que le code source était hier — il mérite la même rigueur de contrôle d'accès.

Deuxième maillon : la sécurité du prompt. Les prompts injectés aux agents doivent être versionnés, revus et testés contre les attaques d'injection. Un prompt mal conçu peut faire fuiter du contexte ou faire exécuter des instructions cachées dans les données d'entrée.

Troisième maillon : la sécurité du runtime de l'agent. Quels outils l'agent peut-il appeler ? Quels fichiers peut-il lire et écrire ? Quel accès réseau lui est accordé ? Le principe du moindre privilège s'applique aux agents au moins autant qu'aux utilisateurs humains. Un agent avec des permissions trop larges est une vulnérabilité par construction.

Quatrième maillon : la sécurité du code généré. Scan automatique des dépendances, analyse statique systématique, détection des patterns vulnérables, validation des entrées et sorties. Ces contrôles existaient avant l'agentic coding. Ils deviennent indispensables — pas optionnels.

Cinquième maillon : la traçabilité. Pour chaque artefact livré, on doit pouvoir remonter à la spec qui l'a produit, au prompt qui l'a déclenché, à la version de l'agent utilisée, aux validations qui l'ont approuvé. Cette traçabilité n'est pas un confort — c'est la condition de l'audit a posteriori.

## Les contrôles non négociables

Cinq contrôles techniques doivent être en place sur tout projet agentic mené avec un minimum de sérieux.

Le contrôle de pré-génération : avant qu'un agent ne produise du code, la spec qu'il va lire doit être validée. Pas de code généré sur un contexte non signé. Cette discipline simple élimine la moitié des risques d'injection.

Le contrôle de post-génération : tout code produit par un agent passe par un scan SAST, un audit de dépendances et une revue humaine ciblée sur les zones sensibles. Aucun commit direct par l'agent dans une branche protégée.

Le contrôle de surface d'attaque : les outils accessibles à l'agent sont listés explicitement, justifiés un par un, et révoqués dès qu'ils ne sont plus nécessaires. Pas de permission par défaut.

Le contrôle de fuite : les secrets, les données client, les contenus sensibles sont stockés hors du contexte accessible à l'agent. Toute injection accidentelle est détectée par un scan en sortie.

Le contrôle d'audit : un log immuable enregistre chaque action de l'agent — quel contexte lu, quels outils appelés, quels artefacts produits. Ce log est revu périodiquement et archivé.

## La conformité aux référentiels existants

Le client mature ne demande pas une sécurité abstraite. Il demande la conformité à des référentiels qu'il connaît. OWASP, ISO 27001, SOC 2, RGPD, NIS2. L'agentic coding ne crée pas une exception à ces référentiels — il en complique l'application.

OWASP Top 10 reste pertinent, mais les contrôles doivent intégrer les vulnérabilités générées par l'agent. Exemple concret : un agent qui produit du code d'accès base de données régressera vers la concaténation SQL si la spec ne mentionne pas explicitement les requêtes paramétrées. Le pattern de validation d'entrée doit être imposé dans le contexte, pas espéré dans le code généré.

RGPD impose la traçabilité des traitements de données personnelles. Si un agent traite ces données pour produire du code — typiquement, des exemples canoniques contenant des cas réels — la chaîne complète doit être documentée. Y compris le contexte injecté, les artefacts produits, et la durée de rétention côté fournisseur du modèle.

NIS2 et les exigences de cyber-résilience imposent des audits réguliers et une gestion documentée des incidents. Un projet agentic doit pouvoir produire ces preuves comme n'importe quel projet classique — et c'est rarement le cas par défaut.

## Le dossier de sécurité à présenter au client

Le commercial qui vend un projet agentic à un client sensible doit pouvoir présenter un dossier de sécurité structuré. Quelques éléments incontournables.

L'architecture de l'isolation : où s'exécutent les agents, à quels systèmes accèdent-ils, comment les données client sont-elles séparées d'autres clients ou d'autres projets.

La politique de prompts et de contextes : qui peut les écrire, comment ils sont signés, comment leurs modifications sont auditées.

Les contrôles de qualité du code généré : liste exhaustive des scans automatiques appliqués, fréquence des audits manuels, processus de gestion des vulnérabilités détectées.

Les engagements contractuels : SLA de correction des vulnérabilités, garanties de confidentialité du contexte, conditions de portabilité du livrable.

Un client qui reçoit ce dossier structuré bascule rapidement de la méfiance à la confiance. Un client qui ne le reçoit pas — ou reçoit des réponses évasives — soit refuse de signer, soit signe et impose des audits coûteux qui révéleront les manques en cours de projet.

## Prouver la qualité, pas la promettre

La promesse de qualité n'a plus de valeur commerciale. Tout le monde la fait, peu la tiennent. Ce qui se vend, c'est la preuve continue.

Rapports automatiques de couverture de tests publiés à chaque sprint. Tableaux de bord de vulnérabilités détectées et corrigées, accessibles au client. Audits indépendants annuels avec rapport partagé. Tests de pénétration sur les livraisons majeures.

Cette transparence inquiète au début — elle expose les imperfections. Elle rassure en réalité — parce qu'elle prouve qu'on n'a rien à cacher. Les agences qui jouent cette carte de la transparence radicale gagnent les clients les plus exigeants — qui sont aussi les plus rentables.

## L'organisation interne qui rend tout cela possible

Une fonction sécurité dédiée devient indispensable dans une agence agentic — même petite. Pas nécessairement à temps plein, mais identifiée, responsable, outillée.

Cette fonction définit la politique de contexte, audite les permissions des agents, valide les outils intégrés au pipeline, et représente l'interlocuteur unique côté client sur ces sujets. Sans cette fonction, la sécurité se dilue dans la responsabilité de tous — et finit dans la responsabilité de personne.

_La sécurité agentic n'est pas un sujet technique périphérique. C'est devenu un critère de sélection majeur côté client. Les agences qui l'intègrent dans leur méthode dès maintenant prennent une avance qui sera difficile à rattraper. Celles qui attendent le premier incident pour s'en occuper perdront la confiance qu'elles auraient pu construire en amont._

_Fin de la série « Les métiers à l'ère agentic ». Prochaine série : « Composer son pipeline agentic »._
