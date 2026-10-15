---
title: 'Donner à lire à un agent : MarkItDown et mq'
description: 'MarkItDown convertit les documents du client en Markdown versionné, mq en extrait la section utile : une chaîne reproductible pour alimenter un agent.'
pubDate: 2026-09-22
tags: ['Outils', 'Cadrage', 'AMOA', 'Markdown', 'Agentic engineering']
category: 'Outils'
image: '../../../assets/blog/documents-ingestion.webp'
imageAlt: 'Piles de dossiers et de documents papier annotés de marque-pages jaunes, empilées dans un bureau'
series: 'La boîte à outils agentic'
seriesOrder: 3
draft: false
originalUrl: https://agentic-agency.fr/blog/donner-a-lire-a-un-agent-markitdown-et-mq
originalPublishedAt: 2026-09-22
---

Un cadrage commence rarement par une page blanche. Il commence par une pièce jointe : un cahier des charges en PDF de cent vingt pages, un tableur de règles de gestion, un jeu de présentations qui contient les seules maquettes existantes, et un export de tickets.

Entre ces fichiers et un contexte qu'un agent peut réellement exploiter, il y a un travail de transformation. Dans la plupart des équipes, ce travail se fait à la main : on ouvre, on sélectionne, on colle, on constate que la mise en forme a explosé, on recommence. C'est long, c'est ingrat, et surtout c'est irreproductible — refaire la même chose le mois suivant, quand le client envoie la version 2 du document, coûte exactement le même temps.

Deux outils traitent ce maillon. Ils sont peu spectaculaires et probablement les plus immédiatement rentables de la catégorie.

_La qualité de ce qu'un agent produit est plafonnée par la qualité de ce qu'il a pu lire. Le maillon d'ingestion est celui qu'on optimise en dernier, alors qu'il détermine tout le reste._

## La chaîne, vue d'ensemble

<svg viewBox="0 0 620 140" role="img" aria-labelledby="t-pipeline d-pipeline" class="w-full h-auto" font-family="ui-sans-serif,system-ui,sans-serif">
  <title id="t-pipeline">Chaîne d'ingestion documentaire</title>
  <desc id="d-pipeline">Les documents du client sont convertis en Markdown par MarkItDown, versionnés dans le dépôt, puis découpés par mq pour ne transmettre à l'agent que la section utile.</desc>
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--color-muted-foreground)"/>
    </marker>
  </defs>
  <g fill="none" stroke="var(--color-border)" stroke-width="1.5">
    <rect x="8" y="34" width="112" height="60" rx="7"/>
    <rect x="276" y="34" width="124" height="60" rx="7"/>
    <rect x="516" y="34" width="84" height="60" rx="7"/>
  </g>
  <g fill="none" stroke="var(--color-primary)" stroke-width="1.5">
    <rect x="146" y="34" width="104" height="60" rx="7"/>
    <rect x="426" y="34" width="64" height="60" rx="7"/>
  </g>
  <g stroke="var(--color-muted-foreground)" stroke-width="1.5" marker-end="url(#ar)">
    <line x1="122" y1="64" x2="142" y2="64"/>
    <line x1="252" y1="64" x2="272" y2="64"/>
    <line x1="402" y1="64" x2="422" y2="64"/>
    <line x1="492" y1="64" x2="512" y2="64"/>
  </g>
  <g text-anchor="middle" font-size="12.5" fill="var(--color-foreground)">
    <text x="64" y="61">Documents client</text>
    <text x="338" y="61">Markdown versionné</text>
    <text x="558" y="69">Agent</text>
  </g>
  <g text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--color-primary)">
    <text x="198" y="69">MarkItDown</text>
    <text x="458" y="69">mq</text>
  </g>
  <g text-anchor="middle" font-size="10" fill="var(--color-muted-foreground)">
    <text x="64" y="79">PDF · DOCX · XLSX</text>
    <text x="338" y="79">suivi par Git, diffable</text>
    <text x="198" y="114">conversion</text>
    <text x="458" y="114">découpe ciblée</text>
  </g>
</svg>

Deux outils, deux fonctions distinctes : l'un normalise tout ce qui entre, l'autre découpe ce qui en sort. C'est l'enchaînement des deux qui produit le bénéfice, pas chacun pris isolément.

## MarkItDown : normaliser l'entrée

[MarkItDown](https://github.com/microsoft/markitdown) est un utilitaire publié par Microsoft qui convertit en Markdown la plupart des formats qu'un client est susceptible de vous envoyer : documents bureautiques, tableurs, présentations, PDF, pages web, archives.

Le projet dépasse 190 000 étoiles (relevé du 15 octobre 2026), ce qui en fait l'un des dépôts les plus suivis de l'écosystème. Il est publié sous licence MIT, écrit en Python, et supporte les versions 3.10 à 3.14.

```bash
# installation complète, ou ciblée sur les seuls convertisseurs utiles
pip install 'markitdown[all]'
pip install 'markitdown[pdf, docx, pptx]'

# conversion d'un document
markitdown cahier-des-charges.pdf -o docs/cahier-des-charges.md
```

Installer l'ensemble des convertisseurs tire des dépendances lourdes. Sur un poste de travail c'est indifférent ; dans une image Docker de CI, l'installation ciblée fait une vraie différence.

L'intérêt n'est pas la conversion en soi — beaucoup d'outils convertissent. C'est que la sortie est pensée pour être lue par un modèle : la structure logique du document, ses titres et sa hiérarchie, est préservée, tandis que l'habillage visuel disparaît.

## Ce que la conversion perd, et pourquoi c'est voulu

Il faut comprendre ce choix, sinon on prend une caractéristique pour un défaut.

Une conversion vers Markdown élimine la mise en forme : polices, couleurs, positionnement, sauts de page. C'est délibéré. Ce qui compte pour un agent, c'est de savoir que ce paragraphe dépend de cette section, pas qu'il était en gras et en bleu.

Il y a toutefois une limite réelle qu'il faut éprouver sur vos propres documents avant de bâtir un processus dessus : lorsqu'un document porte du sens dans sa mise en page, ce sens s'évapore. Un tableau complexe avec des cellules fusionnées, un schéma dont la disposition exprime une hiérarchie, un formulaire dont l'ordre visuel encode un parcours — tout cela ressort dégradé. Testez d'abord sur le type de document que vos clients vous envoient réellement, pas sur un exemple simple.

Deux points de vigilance complètent le tableau. Les documents les plus difficiles — PDF scannés, images contenant du texte — nécessitent des composants additionnels, et certains d'entre eux impliquent un appel à un service externe : sur un cahier des charges confidentiel, c'est une décision à prendre consciemment, pas un paramètre par défaut. Et le nombre important de tickets ouverts sur le projet reflète moins une fragilité qu'une réalité du domaine : la variété des fichiers produits par le monde réel est sans fond.

## mq : découper ce qui est devenu trop gros

Une fois la conversion faite, on se retrouve avec un autre problème : un fichier Markdown de plusieurs centaines de milliers de caractères. Le donner entièrement à un agent coûte cher et noie l'information utile.

C'est là qu'intervient [mq](https://github.com/harehare/mq), qui fait pour le Markdown ce que jq fait pour le JSON : un langage de requête en ligne de commande pour interroger, filtrer et transformer des documents structurés.

Le projet est écrit en Rust, publié sous licence MIT, et réunit un peu plus de 1 000 étoiles (relevé du 15 octobre 2026) — de loin le plus confidentiel des outils de cette série.

```bash
brew install mq          # ou : cargo install mq-run
```

L'usage typique consiste à extraire d'un gros document la section pertinente pour la tâche du moment. Au lieu de donner cent pages à l'agent, on lui donne les quatre qui concernent son travail.

```bash
# la table des matières réelle du document, pour savoir ce qu'il contient
mq '.h(1, 2)' docs/cahier-des-charges.md

# une seule section, par son titre
mq -A 'section::section("Facturation")' docs/cahier-des-charges.md

# tous les blocs de code d'un langage donné
mq '.code("sql")' docs/cahier-des-charges.md
```

La première commande est celle qu'on lance en premier sur un document inconnu : elle donne en une seconde la structure réelle du cahier des charges, ce qui est souvent plus instructif que son sommaire annoncé.

Ce que mq apporte par rapport à un script maison, c'est la compréhension de la structure du document. Un script qui découpe au regex casse dès qu'un titre change de niveau ou qu'un bloc de code contient un caractère qui ressemble à un séparateur. Une requête qui raisonne sur les titres et les sections continue de fonctionner.

Le prix à payer est une syntaxe à apprendre. Comptez une demi-journée pour être autonome — c'est le principal frein à son adoption, et c'est ce qui explique sa discrétion malgré son utilité.

## La chaîne complète, sur un cas réel

Le bénéfice apparaît quand on enchaîne les deux.

Le client envoie sa documentation. On convertit l'ensemble en Markdown dans un répertoire versionné, on en extrait ce dont le sprint a besoin.

```bash
# tout ce que le client a envoyé, converti d'un coup
for f in entrants/*; do
  markitdown "$f" -o "docs/$(basename "${f%.*}").md"
done

# le périmètre du sprint en cours, isolé pour l'agent
mq -A 'section::section("Facturation")' docs/cahier-des-charges.md \
  > contexte/sprint-04-facturation.md

git add docs contexte && git commit -m "docs: cahier des charges client v1"
```

Le mois suivant, le client envoie la version 2. On rejoue exactement les mêmes commandes, et on demande à Git ce qui a bougé.

```bash
git diff --stat HEAD~1 -- docs/
git diff HEAD~1 -- docs/cahier-des-charges.md
```

En quelques secondes, on sait ce qui a changé dans ses exigences — information qui, obtenue à la main, aurait demandé une relecture complète et aurait probablement été partielle.

C'est ce dernier point qui justifie l'investissement. La conversion ponctuelle fait gagner une heure. La chaîne reproductible transforme une relecture fastidieuse en comparaison automatique, et elle la rend fiable.

## Ce que ça change pour une AMOA

L'effet le plus intéressant n'est pas le gain de temps. C'est que la documentation client entre dans le même régime que le code.

Elle est versionnée, donc on sait quand elle a changé. Elle est diffable, donc on sait ce qui a changé. Elle est requêtable, donc on peut vérifier une affirmation sans rouvrir le PDF. Et elle devient, de fait, une source de contexte utilisable directement par les agents plutôt qu'une pile de pièces jointes dans une boîte mail.

Pour une AMOA, c'est un changement de nature. Le cahier des charges cesse d'être un document qu'on lit une fois et qu'on résume, pour devenir une base interrogeable tout au long du projet — celle qui permet de répondre, trois mois plus tard, à la question « est-ce que c'était dans le périmètre » sans dépendre de la mémoire de quelqu'un.

_Ces deux outils ne produisent rien. Ils préparent ce que d'autres vont lire. C'est exactement pour cette raison qu'on les installe en dernier, et qu'on aurait intérêt à les installer en premier._

_Prochain article : « Sortir du rendu générique : Hallmark, DESIGN.md et Modern Web Guidance »._
