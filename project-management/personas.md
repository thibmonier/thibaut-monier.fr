# Personas

> Personas construits à partir des objectifs du PRD, du CV et de la cible d'Agentic Agency (CUSTOMER.md). Ils restent des hypothèses à confronter aux premiers contacts réels.

---

## P-001 : Claire Morel — DG d'une scale-up qui recrute (primaire)

| Identité | |
|---|---|
| Âge | 44 ans |
| Poste | Directrice générale d'une scale-up SaaS B2B (120 personnes), ou DRH d'une ESN |
| Localisation | Nantes / Paris, ouverte au télétravail partiel |
| Niveau technique | Moyen : elle comprend les enjeux mais ne lit pas de code |

> « Je ne cherche pas le meilleur développeur, je cherche quelqu'un qui fera livrer mes équipes, à l'heure, sans casse, et qui sait ce que l'IA change vraiment. »

**Contexte.** Sa scale-up a doublé ses effectifs tech en deux ans, et le delivery dérape : les estimations ne tiennent plus et la dette s'accumule. Elle recrute un CTO, COO ou Delivery Manager. Elle reçoit des dizaines de profils via un cabinet et LinkedIn, et passe moins de deux minutes sur chacun en première lecture.

Elle se méfie des profils « IA » opportunistes et des seniors restés figés sur des pratiques datées. Ce qu'elle veut voir : un parcours de direction cohérent, des résultats chiffrés, et la preuve d'une pratique actuelle.

**Objectifs**
1. Juger en moins de 2 minutes si le profil mérite un entretien.
2. Vérifier l'expérience de management et de pilotage (taille des équipes, périmètres, résultats).
3. Repérer des signaux concrets d'actualité technique, notamment l'IA appliquée au delivery.

**Frustrations**
- Des CV PDF génériques, sans preuve vérifiable.
- Des portfolios de développeurs illisibles pour une non-technicienne.
- Ne pas savoir si la personne est disponible ni pour quel type de poste.

**Motivations** : réduire le risque d'erreur de recrutement et trouver un profil hybride, à la fois technique, management et stratégie.

**Comportements** : laptop au bureau, mobile entre deux réunions. Arrive par un lien LinkedIn ou un e-mail de cabinet. Télécharge le CV pour le transmettre au comité.

**Scénario** : *Contexte* : un cabinet lui transmet le profil. *Besoin* : décider vite. *Action* : elle ouvre le site, lit l'accroche, survole le parcours, voit « 20 plugins open source » et « ERP de 12 modules livré en agentique », puis télécharge le CV. *Résultat* : elle demande un entretien depuis le formulaire, motif « poste ».

**Critères de décision**
- Adoption : clarté du positionnement visible sans défilement.
- Recommandation : un CV PDF propre, transmissible tel quel.
- Abandon : un jargon trop technique en page d'accueil ; une disponibilité ambiguë.

---

## P-002 : Marc Delaunay — dirigeant e-commerce B2B qui cherche un expert en mission (primaire)

| Identité | |
|---|---|
| Âge | 52 ans |
| Poste | Dirigeant d'un distributeur B2B (matériel professionnel, 15 M€ de CA), ou dirigeant d'une agence digitale de 30 personnes |
| Localisation | Grand Ouest |
| Niveau technique | Faible à moyen |

> « J'ai besoin de quelqu'un qui connaît Sylius de l'intérieur et qui peut cadrer, chiffrer et livrer, sans me revendre une équipe de dix personnes. »

**Contexte.** Il migre son e-commerce, ou doit livrer un projet Sylius B2B : devis, comptes entreprise, conditions de paiement, facture électronique obligatoire. Son prestataire habituel manque de compétences Sylius 2 ou de capacité. Il cherche un expert au forfait, capable de reprendre un applicatif existant rapidement.

**Objectifs**
1. Trouver un expert Sylius/Symfony crédible sur le B2B et la conformité UE (Factur-X, GPSR, rétractation).
2. Évaluer la capacité à cadrer et livrer au forfait.
3. Prendre contact rapidement pour qualifier le besoin.

**Frustrations**
- Les freelances « full-stack » sans expérience e-commerce de volume.
- Les agences trop chères pour un périmètre ciblé.
- Ne pas savoir si le freelance peut démarrer bientôt.

**Motivations** : un interlocuteur unique, senior, qui a déjà résolu son problème (le plugin existe peut-être déjà).

**Comportements** : arrive par Google (« plugin Sylius devis B2B », « Factur-X Sylius »), par la marketplace Sylius ou par recommandation. Lit les fiches plugins et les références clients.

**Scénario** : *Contexte* : obligation de facturation électronique à venir. *Besoin* : générer des factures Factur-X depuis Sylius. *Action* : il trouve la fiche du plugin Factur-X, lit la compatibilité, voit les références e-commerce (Lescuyer, Gémo…), puis clique sur « Me confier une mission ». *Résultat* : RDV de qualification pris.

**Critères de décision**
- Adoption : un plugin ou une référence qui correspond à son besoin.
- Recommandation : un premier échange de qualité.
- Abandon : pas de moyen de contact rapide ; un profil perçu comme uniquement en recherche de CDI.

---

## P-003 : Julien Ferreira — lead dev et intégrateur Sylius/Symfony (secondaire)

| Identité | |
|---|---|
| Âge | 34 ans |
| Poste | Lead développeur dans une agence partenaire Sylius |
| Localisation | Lyon, ou à l'international (anglophone) |
| Niveau technique | Expert |

> « Avant d'installer un plugin en production, je veux savoir s'il est maintenu, testé, compatible avec ma version, et s'il touche aux entités du core. »

**Contexte.** Il intègre des boutiques Sylius 2 pour des clients B2B. Il cherche des plugins fiables plutôt que de tout redévelopper. Il lit les README, regarde la CI, les versions supportées et les dépendances.

**Objectifs**
1. Trouver rapidement le plugin qui couvre un besoin B2B ou réglementaire.
2. Vérifier la compatibilité (PHP, Sylius, Symfony, base de données) et la qualité (tests, PHPStan, CI).
3. Comprendre les dépendances entre plugins (order-hold, company-accounts…).

**Frustrations**
- Des plugins abandonnés, sans version compatible Sylius 2.
- De la documentation éparpillée entre README et issues.
- Des plugins qui surchargent les entités du core.

**Motivations** : gagner des jours de développement ; contribuer s'il trouve un bon projet.

**Comportements** : desktop, GitHub ouvert en parallèle, recherche en anglais. Partage des liens sur Slack.

**Scénario** : *Contexte* : son client veut des tarifs dégressifs par groupe de clients. *Besoin* : un plugin compatible Sylius 2.3. *Action* : il filtre le catalogue sur « B2B », ouvre la fiche Tier Pricing, vérifie la matrice de compatibilité et la dernière release, puis clique vers Packagist. *Résultat* : il l'installe et met une étoile au dépôt.

**Critères de décision**
- Adoption : une matrice de compatibilité claire et une release récente.
- Recommandation : une documentation d'installation qui fonctionne du premier coup.
- Abandon : pas de version anglaise ; des informations de version périmées.

---

## P-004 : Sophie Lambert — tech lead qui pratique l'agentic engineering (secondaire)

| Identité | |
|---|---|
| Âge | 38 ans |
| Poste | Tech lead dans une ESN, ou développeuse senior freelance |
| Localisation | Remote, France |
| Niveau technique | Expert |

> « Des listes de “10 outils IA indispensables”, j'en lis tous les jours. Ce qui m'intéresse, c'est quelqu'un qui a vraiment testé, avec quelle version, sur quel cas, et ce qui n'a pas marché. »

**Contexte.** Elle outille son équipe en agents de code (Claude Code, Codex…) et cherche des retours d'expérience concrets : gestion du contexte, coût en tokens, outils CLI, méthodes de spec-driven development. Elle lit le blog et partage les articles pertinents.

**Objectifs**
1. Trouver des tests d'outils reproductibles, avec protocole, versions et limites.
2. Comparer les outils d'une même catégorie selon des critères communs.
3. Suivre les nouveaux articles sans effort (RSS).

**Frustrations**
- Des avis sans date ni version, vite obsolètes.
- Du contenu sponsorisé déguisé.
- L'absence de limites et d'échecs dans les retours d'expérience.

**Motivations** : gagner du temps d'évaluation et apprendre des pratiques éprouvées.

**Comportements** : desktop, lecteur RSS, recherche interne au site. Arrive via LinkedIn, Hacker News ou un moteur IA.

**Scénario** : *Contexte* : elle hésite entre deux outils pour réduire la facture de tokens. *Besoin* : un retour mesuré. *Action* : elle cherche « tokens » sur le site, ouvre le test complet, lit le protocole et les mesures, consulte le comparatif. *Résultat* : elle adopte l'outil et s'abonne au flux RSS.

**Critères de décision**
- Adoption : un protocole et une date de test visibles.
- Recommandation : des mesures chiffrées et des limites honnêtes.
- Abandon : un test qui se résume à un lien vers l'outil.

---

## Matrice personas / fonctionnalités

| Fonctionnalité | P-001 Claire | P-002 Marc | P-003 Julien | P-004 Sophie |
|---|---|---|---|---|
| Accueil avec double parcours | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐ |
| Parcours professionnel | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐ |
| Compétences et références | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐ |
| CV PDF | ⭐⭐⭐ | ⭐ | — | — |
| Contact et RDV | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐ |
| Blog migré | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Labo d'outils | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| Catalogue des plugins Sylius | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Fiche plugin détaillée | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| tailsfadmin et career-ops | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ |
| SEO et données structurées | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Version anglaise | ⭐ | ⭐ | ⭐⭐⭐ | ⭐ |

⭐⭐⭐ Critique | ⭐⭐ Important | ⭐ Utile

## Anti-personas

- **Le débutant qui cherche des tutoriels pas à pas** : le site montre une expertise, ce n'est pas un cours.
- **L'acheteur low cost** qui cherche un développeur en régie au TJM le plus bas : ce n'est pas le positionnement.
- **L'agence qui veut de la marque blanche** sur les plugins sans contact ni contribution : les plugins sont libres, mais le site n'est pas un support commercial pour eux.
- **Les robots de collecte de données personnelles** : aucune coordonnée directe (téléphone, adresse) n'est publiée.
