---
title: 'Sortir du rendu générique : Hallmark, DESIGN.md et Modern Web Guidance'
seoTitle: 'Rendu générique : Hallmark, DESIGN.md, Modern Web Guidance'
description: 'Trois outils contre la signature visuelle et technique du code généré : Hallmark, DESIGN.md et Modern Web Guidance, avec une réserve sur le registre public.'
pubDate: 2026-09-22
tags: ['Outils', 'Design', 'Front-end', 'Agence digitale', 'Qualité']
category: 'Outils'
image: '../../../assets/blog/design-nuancier.webp'
imageAlt: 'Nuancier Pantone déployé en éventail, dégradé de jaunes, verts, bleus, violets et rouges, vu de près avec les références imprimées'
series: 'La boîte à outils agentic'
seriesOrder: 4
draft: false
---

Il y a un commentaire que les agences entendent de plus en plus souvent en présentation client, et il est difficile à contester : « ça fait IA ».

Le client ne saurait pas dire pourquoi. Il constate. Le dégradé en arrière-plan, les cartes aux coins également arrondis, l'espacement régulier, la même police sans empattement, les mêmes icônes, la même section de témoignages à trois colonnes. Rien n'est laid. Tout est compétent. Et tout ressemble à ce qu'il a vu ailleurs la semaine dernière.

Pour une agence, ce n'est pas un problème esthétique. C'est un problème de valeur : si le rendu est indiscernable de ce qu'un client obtient seul en une soirée, la prestation devient difficile à défendre.

_Un agent produit la moyenne de ce qu'il a vu. C'est précisément la définition de ce qu'une agence est payée pour ne pas livrer._

## Pourquoi tout se ressemble

Le mécanisme n'a rien de mystérieux. Un modèle sollicité sans contrainte produit la solution la plus probable. En design, la solution la plus probable est la convention dominante du moment.

Deux conséquences en découlent, et la seconde est la plus coûteuse.

La première est l'uniformité visuelle : tout converge vers le même point.

La seconde est le décalage technique. Ce que le modèle considère comme probable reflète la masse de code qu'il a vue, et cette masse est ancienne. Il produit donc volontiers des solutions qui étaient les bonnes il y a cinq ans, alors que le navigateur propose aujourd'hui une réponse native, plus courte et plus robuste. On hérite d'un code qui fonctionne, qui est plus verbeux que nécessaire, et qui porte une dette dès sa première ligne.

Trois outils traitent ces deux problèmes par des angles différents, et ils n'interviennent pas au même moment.

<svg viewBox="0 0 620 175" role="img" aria-labelledby="t-design d-design" class="w-full h-auto" font-family="ui-sans-serif,system-ui,sans-serif">
  <title id="t-design">Où intervient chacun des trois outils</title>
  <desc id="d-design">DESIGN.md fixe l'identité en amont et persiste entre les projets. Hallmark agit au moment de la génération et de l'audit. Modern Web Guidance corrige la justesse technique du code produit.</desc>
  <defs>
    <marker id="ad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--color-muted-foreground)"/>
    </marker>
  </defs>
  <rect x="8" y="46" width="132" height="58" rx="7" fill="none" stroke="var(--color-primary)" stroke-width="1.5"/>
  <rect x="196" y="46" width="132" height="58" rx="7" fill="none" stroke="var(--color-primary)" stroke-width="1.5"/>
  <rect x="384" y="46" width="132" height="58" rx="7" fill="none" stroke="var(--color-primary)" stroke-width="1.5"/>
  <rect x="546" y="46" width="66" height="58" rx="7" fill="none" stroke="var(--color-border)" stroke-width="1.5"/>
  <g stroke="var(--color-muted-foreground)" stroke-width="1.5" marker-end="url(#ad)">
    <line x1="144" y1="75" x2="190" y2="75"/>
    <line x1="332" y1="75" x2="378" y2="75"/>
    <line x1="520" y1="75" x2="540" y2="75"/>
  </g>
  <g text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--color-primary)">
    <text x="74" y="72">DESIGN.md</text>
    <text x="262" y="72">Hallmark</text>
    <text x="450" y="72">Modern Web</text>
    <text x="450" y="88">Guidance</text>
  </g>
  <text x="579" y="80" text-anchor="middle" font-size="12.5" fill="var(--color-foreground)">UI</text>
  <g text-anchor="middle" font-size="10.5" fill="var(--color-muted-foreground)">
    <text x="74" y="32">identité</text>
    <text x="262" y="32">génération</text>
    <text x="450" y="32">justesse technique</text>
    <text x="74" y="92">ce qui persiste</text>
    <text x="262" y="92">ce qui distingue</text>
    <text x="168" y="142">audit en retour</text>
  </g>
  <path d="M262 108 L262 124 L74 124 L74 108" fill="none" stroke="var(--color-muted-foreground)" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#ad)"/>
</svg>

Le sens de lecture compte : l'identité se décide avant, la génération s'appuie dessus, et la vérification technique intervient sur ce qui a été produit.

## Hallmark : contraindre le geste de design

[Hallmark](https://github.com/Nutlope/hallmark) est une compétence de design destinée aux agents de code, conçue explicitement contre le rendu générique — son auteur la présente d'ailleurs comme une compétence « anti-slop ».

Le projet réunit environ 30 000 étoiles (relevé du 15 octobre 2026) et est publié sous licence MIT. Il embarque vingt-et-un thèmes distincts et cinquante-sept contrôles de qualité appliqués avant le rendu.

```bash
npx skills add nutlope/hallmark
```

Il s'utilise ensuite selon quatre verbes, qu'on adresse à l'agent :

```
hallmark                      # construire une interface neuve
hallmark audit <cible>        # noter l'existant, sans rien modifier
hallmark redesign <cible>     # reconstruire en gardant contenu et marque
hallmark study <URL | capture> # extraire l'ADN visuel d'une référence
```

L'idée est intéressante parce qu'elle s'attaque à la cause plutôt qu'au symptôme. Plutôt que de corriger après coup un rendu fade, elle force une divergence en amont : deux briefs différents ne doivent pas aboutir à la même structure visuelle.

Le mode audit est probablement le plus immédiatement utile, et le moins engageant : il s'applique à une interface existante, rend une liste de points à corriger et ne modifie rien. On peut l'essayer sur un projet livré sans rien changer à sa chaîne de production.

Le mode `study` mérite une mention à part, parce qu'il fait le lien avec la section suivante : il extrait d'une référence visuelle sa structure, ses associations typographiques et son ancrage chromatique, et peut en produire un fichier `design.md` réutilisable.

Une réserve de mesure : le rythme de publication du projet est moins soutenu que celui des autres outils de cette série. Sur un domaine où les conventions bougent vite, c'est un paramètre à surveiller — pas un obstacle à l'essai.

## Modern Web Guidance : empêcher le code obsolète

Publié sous l'organisation GoogleChrome, [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) traite le second problème : l'ancienneté des solutions produites.

L'outil injecte dans le contexte de l'agent l'état actuel des capacités du web — plus d'une centaine de fonctionnalités et près de cent quarante cas d'usage documentés — pour l'orienter vers la solution native quand elle existe. Le projet réunit environ 2 500 étoiles (relevé du 15 octobre 2026) et est publié sous licence Apache 2.0.

```bash
npx modern-web-guidance@latest install

# on peut aussi l'essayer sans rien installer
npx modern-web-guidance@latest search "animate a dialog modal backdrop"
npx modern-web-guidance@latest retrieve "animate-to-from-top-layer"
```

Ces deux dernières commandes sont exactement ce que fait l'agent : il cherche, puis il récupère la fiche correspondante et l'injecte dans son contexte. La recherche tourne en local, sans appel réseau.

Le projet publie ses propres mesures. Sur un jeu de 132 tâches et plus de mille assertions, il relève un passage de 54 % à 87 % de solutions modernes retenues avec un agent, et de 59 % à 81 % avec un autre. Il faut lire ces chiffres pour ce qu'ils sont : une évaluation conduite par l'équipe du projet, sur son propre jeu de tests, et non un audit indépendant. C'est une indication sérieuse, pas une preuve.

Un point à connaître avant un déploiement chez un client : l'outil collecte des données d'usage anonymes — nombre d'installations et requêtes de recherche, pas les prompts. La collecte se désactive par variable d'environnement.

```bash
export DISABLE_TELEMETRY=1
```

Ce n'est pas un problème en soi, mais c'est le genre de détail qu'il vaut mieux découvrir soi-même que se faire signaler par le RSSI du client.

## DESIGN.md : la mémoire de design partagée — et la question du registre

Il faut distinguer ici deux choses que l'on confond facilement, et la distinction commande la décision.

Il y a d'abord un **format**. [DESIGN.md](https://github.com/google-labs-code/design.md) est une spécification publiée par Google Labs, décrite par ses auteurs comme un format destiné à donner aux agents de code une compréhension persistante et structurée d'un système de design. Le dépôt de la spécification réunit environ 28 000 étoiles et est publié sous licence Apache 2.0. C'est un fichier que l'on écrit dans son propre dépôt, à côté du code, et que l'agent lit.

Sa structure combine un en-tête de jetons exploitables par la machine et une prose qui explique les intentions — c'est cette seconde moitié qui fait la différence avec un simple fichier de variables.

<!-- prettier-ignore -->
```md
---
name: Heritage
colors:
  primary: "#1A1C1E"
  tertiary: "#B8422E"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
rounded: { sm: 4px, md: 8px }
---

## Overview

Architectural Minimalism meets Journalistic Gravitas. The UI evokes a
premium matte finish — a high-end broadsheet or contemporary gallery.

## Colors

- **Primary (#1A1C1E):** Deep ink for headlines and core text.
- **Tertiary (#B8422E):** "Boston Clay" — the sole driver for interaction.
```

Le fichier se vérifie, se compare d'une version à l'autre et s'exporte vers les formats de votre chaîne front.

```bash
npx @google/design.md lint DESIGN.md
npx @google/design.md diff DESIGN.md DESIGN-v2.md
npx @google/design.md export --format json-tailwind DESIGN.md
```

La commande `diff` est celle qui intéresse une agence : elle transforme « la charte a changé » en une liste précise de ce qui a bougé.

Il y a ensuite un **registre**. designmd.sh, maintenu par l'équipe VoltAgent, référence publiquement ces fichiers pour que les principaux agents et générateurs d'interface du marché puissent les consulter. On y inscrit un dépôt d'une commande, et le service ne fait état d'aucune tarification.

```bash
npx designmd.sh add <owner/repo>
```

Cette distinction est la plus utile de tout cet article, parce qu'elle sépare un engagement durable d'un pari. Adopter le format ne dépend de personne : c'est un fichier Markdown dans votre dépôt, il fonctionne même si le registre disparaît demain. S'inscrire au registre est un choix distinct, qui ajoute la découvrabilité inter-outils et ses propres conséquences.

L'idée commune aux deux répond à un vrai besoin : tenir une cohérence visuelle entre plusieurs projets et plusieurs outils, sans redécrire les mêmes règles à chaque fois.

Mais il y a une contrepartie qu'il faut énoncer clairement, parce qu'elle est structurante pour une agence : **c'est un registre public**. Y publier le système de design d'un client revient à rendre publiques ses règles de marque — couleurs, typographies, principes d'espacement, composants. Pour un projet interne ou open source, c'est sans conséquence. Pour un client qui paie une identité, c'est une décision contractuelle, pas une décision technique, et elle ne se prend pas par commodité un vendredi après-midi.

Ajoutons que le registre est jeune et que sa documentation reste sommaire. La conclusion pratique est donc asymétrique : écrivez le `DESIGN.md`, il ne coûte rien et ne vous engage envers personne. Inscrivez-le au registre uniquement pour ce que vous acceptez de rendre public.

## Ce que ces trois outils ne font pas

Aucun ne produit une direction artistique. Ils empêchent le pire, ils ne créent pas le meilleur.

Un thème bien choisi et des contrôles de qualité évitent le rendu générique. Ils ne produisent pas une identité qui dit quelque chose de la marque du client, ne résolvent pas la hiérarchie de l'information, et ne remplacent pas la décision de ce qui doit être mis en avant. Ces questions restent entièrement humaines.

C'est plutôt une bonne nouvelle pour une agence : cela situe exactement où se trouve la valeur qu'elle vend encore. Ce qui est automatisable, c'est l'exécution propre. Ce qui ne l'est pas, c'est le parti pris.

## Le montage qui fonctionne

Pour une agence qui veut adopter ces outils sans risque, l'ordre a son importance.

Commencer par Modern Web Guidance. C'est l'outil le moins engageant : il n'a aucun effet visible sur le rendu, il améliore la qualité technique du code produit, et il s'installe en une commande. Rien à arbitrer avec le client.

Ajouter ensuite Hallmark, d'abord en mode audit sur une interface existante. On mesure l'écart entre ce qu'on livre aujourd'hui et ce que l'outil considère comme générique. Cette mesure est instructive indépendamment de la décision d'adopter.

Garder designmd.sh pour les projets internes tant que la question de la publicité du registre n'a pas été tranchée avec le client — et en faire un point explicite du contrat le jour où elle se pose.

_La production générée n'a pas de mauvais goût. Elle n'a pas de goût du tout, ce qui est un problème différent et plus difficile à corriger. Ces outils suppriment la banalité ; le parti pris reste le travail de quelqu'un._
