---
title: 'Réduire la facture token : ce que Caveman et CodeGraph font vraiment'
seoTitle: 'Réduire la facture token : Caveman et CodeGraph'
description: 'Deux outils réduisent le coût des agents par des chemins opposés ; la recherche citée par l’un d’eux contredit en partie son argumentaire.'
pubDate: 2026-09-22
tags: ['Outils', 'Coût token', 'Agentic engineering', 'Performance']
category: 'Outils'
image: '../../../assets/blog/cout-token-reseau.webp'
imageAlt: 'Visualisation abstraite de fils lumineux violets reliant des points sur fond noir'
series: 'La boîte à outils agentic'
seriesOrder: 2
faq:
  - question: 'Faut-il comprimer l’entrée ou la sortie d’un agent pour réduire sa facture ?'
    answer: 'Selon l’étude citée par l’article, comprimer la sortie confirme l’intérêt de l’approche, avec une économie de l’ordre de 1,4 à 2,4 selon les modèles accessibles par API. Comprimer l’entrée augmente au contraire le coût net, d’environ 1,15 fois en moyenne et jusqu’à 1,8 fois sur le pire jeu de données, parce que le modèle compense une entrée dégradée par des réponses plus longues. La règle d’adoption tient en une phrase : prenez la compétence, instruisez le relais.'
  - question: 'Où part réellement l’argent quand un agent de code travaille sur un projet ?'
    answer: 'Le gros de la consommation vient de l’exploration, pas du code généré. Pour modifier une fonction, l’agent lit le fichier qui la contient, puis ceux qui l’appellent, les types qu’elle manipule et les tests qui la couvrent ; chaque lecture ramène du texte dont l’essentiel ne servira pas. C’est ce gisement que visent CodeGraph, par un graphe pré-indexé, et Caveman, par la compression.'
  - question: 'Comment mesurer chez soi l’effet d’un outil de réduction de tokens ?'
    answer: 'Il faut choisir cinq tâches représentatives de son travail réel, avec un critère de réussite objectif, les exécuter sans outil en relevant le coût total et la réussite, puis installer un seul des deux outils et réexécuter les mêmes tâches. La comparaison se fait sur le coût total par tâche réussie, jamais sur le volume de tokens. Un outil qui divise par deux les tokens envoyés mais fait échouer une tâche sur cinq coûte plus cher que pas d’outil du tout.'
draft: false
originalUrl: https://agentic-agency.fr/blog/reduire-la-facture-token-caveman-codegraph
originalPublishedAt: 2026-09-22
---

Sur un projet agentic, la facture de consommation arrive à la fin du mois et elle ne ressemble à rien de ce qu'on connaissait. Elle n'est pas proportionnelle au nombre de développeurs, ni aux heures passées, ni même vraiment au code produit. Elle est proportionnelle à une chose difficile à se représenter : le volume de texte qui a transité, dans les deux sens, entre l'équipe et les modèles.

Deux outils très visibles s'attaquent à ce poste. Ils partent du même constat et prennent des chemins opposés. L'un supprime du texte inutile en amont. L'autre comprime le texte échangé. Les deux annoncent des gains importants.

L'un des deux renvoie, dans sa propre documentation, à un travail de recherche indépendant. Ce travail confirme une moitié de son argumentaire et contredit l'autre. C'est ce genre de détail qui sépare une recommandation utile d'un relais d'argumentaire commercial.

_Réduire le nombre de tokens envoyés et réduire la facture ne sont pas la même chose. Un modèle à qui l'on parle moins clairement peut répondre plus longuement — et coûter davantage._

## Le vrai gisement : l'exploration

Avant de parler des outils, il faut situer où part l'argent. L'intuition dit que c'est le code généré. C'est faux dans la plupart des cas.

Le gros de la consommation vient de l'exploration. Pour modifier une fonction, un agent lit le fichier qui la contient, puis ceux qui l'appellent, puis les types qu'elle manipule, puis les tests qui la couvrent. Chaque lecture est un appel, chaque appel ramène du texte, et l'essentiel de ce texte ne servira pas. L'agent tâtonne dans une base de code de la même manière qu'un développeur qui découvre un projet — sauf qu'il le refait à chaque session.

C'est ce gisement que visent les deux outils, par deux angles différents.

<svg viewBox="0 0 620 215" role="img" aria-labelledby="t-graph d-graph" class="w-full h-auto" font-family="ui-sans-serif,system-ui,sans-serif">
  <title id="t-graph">Exploration fichier par fichier contre graphe pré-indexé</title>
  <desc id="d-graph">Sans index, l'agent fait de nombreux allers-retours de lecture dans la base de code. Avec un graphe construit à l'avance, il pose une requête et obtient directement le contexte utile.</desc>
  <defs>
    <marker id="ag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--color-muted-foreground)"/>
    </marker>
  </defs>
  <g font-size="11" fill="var(--color-muted-foreground)">
    <text x="8" y="14">Sans index — l'agent tâtonne</text>
    <text x="8" y="130">Avec un graphe pré-indexé</text>
  </g>
  <g fill="none" stroke="var(--color-border)" stroke-width="1.5">
    <rect x="8" y="26" width="86" height="52" rx="7"/>
    <rect x="430" y="26" width="182" height="52" rx="7"/>
    <rect x="8" y="140" width="86" height="52" rx="7"/>
  </g>
  <rect x="200" y="140" width="140" height="52" rx="7" fill="none" stroke="var(--color-primary)" stroke-width="1.5"/>
  <g stroke="var(--color-muted-foreground)" stroke-width="1" marker-end="url(#ag)" opacity="0.75">
    <line x1="100" y1="34" x2="424" y2="34"/>
    <line x1="100" y1="42" x2="424" y2="42"/>
    <line x1="100" y1="50" x2="424" y2="50"/>
    <line x1="100" y1="58" x2="424" y2="58"/>
    <line x1="100" y1="66" x2="424" y2="66"/>
    <line x1="100" y1="74" x2="424" y2="74"/>
  </g>
  <line x1="100" y1="166" x2="194" y2="166" stroke="var(--color-muted-foreground)" stroke-width="1.5" marker-end="url(#ag)"/>
  <line x1="500" y1="82" x2="348" y2="140" stroke="var(--color-muted-foreground)" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#ag)"/>
  <g text-anchor="middle" font-size="12.5" fill="var(--color-foreground)">
    <text x="51" y="57">Agent</text>
    <text x="521" y="57">Base de code</text>
    <text x="51" y="171">Agent</text>
  </g>
  <text x="270" y="171" text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--color-primary)">Graphe local</text>
  <g font-size="10.5" fill="var(--color-muted-foreground)">
    <text x="262" y="98" text-anchor="middle">28 appels d'outils</text>
    <text x="270" y="209" text-anchor="middle">2 appels d'outils</text>
    <text x="470" y="128">indexation initiale</text>
  </g>
</svg>

Les deux chiffres portés sur ce schéma sont ceux que l'éditeur de CodeGraph relève sur un dépôt précis ; nous revenons plus bas sur ce qu'ils valent.

## CodeGraph : supprimer le tâtonnement

[CodeGraph](https://github.com/colbymchenry/codegraph) pré-indexe la base de code dans un graphe stocké localement : les symboles, leurs dépendances, les chemins d'appel. L'agent interroge alors ce graphe et obtient directement la portion pertinente, au lieu de naviguer de fichier en fichier.

Le projet réunit plus de 74 000 étoiles (relevé du 15 octobre 2026), est publié sous licence MIT, et fonctionne intégralement en local — point important pour une prestation où le code client ne doit pas sortir.

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
# ou, si Node est déjà là : npm i -g @colbymchenry/codegraph

codegraph install          # déclare l'outil auprès de l'agent
cd mon-projet && codegraph init   # construit l'index du dépôt
```

Une fois l'index construit, l'agent — et vous — interrogez le graphe plutôt que le système de fichiers.

```bash
codegraph query "facturation"        # retrouver un symbole
codegraph explore "cycle de commande" # suivre un flux à travers le code
codegraph callers processPayment      # qui appelle cette fonction
```

Sur les mesures : l'éditeur annonce 88 % d'appels d'outils en moins, 62 % de tokens en moins, 53 % de gain de temps et 44 % de coût en moins. La méthodologie est publiée — sept dépôts de langages différents, un agent exécuté sans interface avec une configuration MCP stricte, quatre exécutions par condition et médiane retenue — et un cas est détaillé : sur le dépôt de VS Code, environ onze mille fichiers TypeScript, deux appels d'outils au lieu de vingt-huit.

C'est plus rigoureux que la moyenne des annonces du secteur, et cela reste **une mesure conduite par l'éditeur sur son propre outil**. La nuance compte. Cela dit, c'est le type d'annonce le moins risqué à croire, pour une raison mécanique : l'effet est directement observable. Si un agent obtient le bon contexte en une requête au lieu de douze lectures de fichiers, la différence apparaît dans le décompte d'appels d'une seule session. On n'a pas besoin de faire confiance, on regarde.

Le coût réel de l'outil est ailleurs : l'indexation initiale, et la fraîcheur de l'index. Un graphe désynchronisé du code renvoie du contexte faux, ce qui est pire qu'un contexte absent. La synchronisation automatique est donc la fonctionnalité à éprouver en priorité, pas les chiffres de performance.

## Caveman : comprimer la langue

[Caveman](https://github.com/JuliusBrussee/caveman) part d'une autre idée, résumée par son propre auteur avec humour : pourquoi utiliser beaucoup de mots quand peu de mots suffisent. L'outil s'installe à deux endroits distincts — une compétence qui pousse l'agent à répondre de façon plus dense, et un relais local qui comprime ce que l'agent lit.

Le projet dépasse 111 000 étoiles (relevé du 15 octobre 2026), ce qui en fait l'un des plus populaires de l'écosystème. Il est écrit en Go.

```bash
# la compétence : agit sur la SORTIE, ce que l'agent vous répond
npx skills add JuliusBrussee/caveman -g

# le relais : agit sur l'ENTRÉE, ce que l'agent lit
npm install -g @caveman-ai/cli && caveman setup --install
```

Cette séparation n'est pas un détail d'installation. Elle recoupe exactement les deux résultats de l'étude dont nous parlons plus bas, et elle recoupe aussi la licence.

**Le projet est sous licence double**, et c'est un point sérieux pour une structure qui facture. La compétence, les SDK et la ligne de commande sont sous MIT. En revanche le moteur, le relais et le cache sont sous BSL 1.1 : une licence _source-available_, explicitement non open source au sens de l'OSI, chaque version basculant en Apache 2.0 à la plus proche de deux échéances — le 21 juin 2030, ou quatre ans après sa publication.

Autrement dit : la couche que vous pouvez adopter sans arrière-pensée contractuelle est précisément la couche MIT. Celle qui demande une lecture juridique est le relais. Retenez cette correspondance, elle va se répéter.

## Ce que dit la recherche, et que l'argumentaire ne dit pas

La documentation du projet renvoie à un article scientifique déposé sur arXiv en juin 2026, [CAVEWOMAN: How Large Language Models Behave Under Linguistic Input and Output Compression](https://arxiv.org/abs/2606.24083), signé par Morayo Danielle Adeyemi, Ryan A. Rossi et Franck Dernoncourt. L'étude évalue huit modèles sur cinq jeux de données, en mesurant à la fois l'exactitude des réponses et la dépense réellement engagée.

Son résultat se lit en deux temps, et les deux temps n'ont pas la même couleur.

Sur la compression de la **sortie** — demander au modèle de répondre de façon plus dense — le résultat confirme l'intérêt de l'approche. Les auteurs relèvent un facteur d'économie de l'ordre de 1,4 à 2,4 selon les modèles sur les modèles accessibles par API, avec un bénéfice constaté sur l'ensemble des modèles à poids ouverts testés.

Sur la compression de l'**entrée** — comprimer ce qu'on envoie au modèle — le résultat s'inverse. L'étude conclut que cette compression **augmente le coût net** plutôt qu'elle ne le réduit : de l'ordre de 1,15 fois en moyenne sur les cinq jeux de données, et jusqu'à 1,8 fois sur le pire d'entre eux. Le mécanisme est contre-intuitif et parfaitement logique une fois énoncé : face à une entrée dégradée, le modèle compense en produisant des réponses plus longues. On économise sur ce qu'on envoie et on repaie davantage sur ce qui revient — avec, en prime, une exactitude en baisse.

## La conséquence pratique

Cette distinction n'est pas un détail académique. Elle change ce qu'il faut installer — et c'est ici que la correspondance annoncée plus haut se referme.

| Couche     | Ce qu'elle comprime | Ce qu'en dit l'étude   | Licence |
| ---------- | ------------------- | ---------------------- | ------- |
| Compétence | la sortie           | économie de 1,4 à 2,4× | MIT     |
| Relais     | l'entrée            | coût net en hausse     | BSL 1.1 |

Les deux lignes ne se ressemblent pas. La couche dont le bénéfice est établi par une publication indépendante est aussi celle dont la licence ne pose aucune question : on peut l'adopter et passer à autre chose.

La couche qui comprime l'entrée cumule au contraire les deux réserves — celle de l'étude que le projet cite lui-même, et celle d'une licence non open source à lire avant tout usage en prestation. Cela ne veut pas dire qu'elle ne marche jamais : cela veut dire qu'elle doit être mesurée sur vos propres tâches, en coût total et non en tokens envoyés, avant d'être généralisée.

Que la frontière technique, la frontière des preuves et la frontière juridique tombent exactement au même endroit est une coïncidence commode. Elle donne une règle d'adoption qui tient en une phrase : prenez la compétence, instruisez le relais.

Il y a une leçon plus large là-dedans, qui vaut au-delà de cet outil. Le nombre de tokens envoyés est un indicateur commode parce qu'il est facile à compter. Le coût total d'une tâche accomplie correctement est le seul indicateur qui compte. Optimiser le premier en croyant optimiser le second est une erreur classique, et elle est ici documentée.

## L'angle mort commun aux deux outils

Les deux approches partagent un risque qu'aucun benchmark ne capture : la compression peut masquer l'information qui aurait permis de détecter une erreur.

Un journal d'exécution tronqué, un message d'erreur résumé, un extrait de code coupé au mauvais endroit : dans chacun de ces cas, l'agent travaille sur une version appauvrie de la réalité et produit une réponse confiante et fausse. Le gain de tokens est bien réel, il est simplement payé ailleurs — en temps de débogage.

La règle de prudence est donc de ne pas comprimer les canaux de diagnostic. Ce qui sert à produire peut être compressé. Ce qui sert à comprendre pourquoi ça ne marche pas doit rester intact.

## Mesurer chez soi, en une semaine

Le protocole est simple et il vaut mieux que n'importe quel chiffre annoncé.

Choisir cinq tâches représentatives de votre travail réel, avec un critère de réussite objectif. Les exécuter sans outil, en relevant pour chacune le coût total et le fait qu'elle ait abouti ou non. Installer un seul des deux outils. Réexécuter les mêmes cinq tâches. Comparer sur le coût total par tâche réussie, jamais sur le volume de tokens.

Ce dernier point est tout l'enjeu. Un outil qui divise par deux les tokens envoyés et fait échouer une tâche sur cinq vous coûte plus cher que pas d'outil du tout, parce que la reprise d'une tâche échouée consomme bien davantage que ce qui a été économisé.

_La bonne question n'est pas « combien de tokens ai-je économisés » mais « combien m'a coûté ce résultat ». Les deux réponses divergent plus souvent qu'on ne le croit, et c'est précisément ce que montre l'étude que l'outil le plus populaire du domaine cite lui-même._

_Prochain article : « Donner à lire à un agent : MarkItDown et mq »._
