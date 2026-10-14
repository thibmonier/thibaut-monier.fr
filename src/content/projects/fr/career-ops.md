---
name: career-ops
kind: contribution
title: 'Contributions à career-ops'
description: 'Trois correctifs acceptés dans career-ops, projet open source très suivi : des défauts silencieux, corrigés avec un test écrit d’abord.'
summary: 'career-ops, outil open source de recherche d’emploi assistée par IA, suivi par plus de 74 000 étoiles sur GitHub (relevé du 14 octobre 2026).'
role: 'Contributeur, membre de l’équipe Contributors du projet.'
result: 'Trois défauts qui ne se voyaient pas corrigés en une semaine, chacun accepté par l’équipe du projet avec son test de non-régression.'
repo:
  owner: career-ops-hq
  name: career-ops
verifiedAt: 2026-10-14
contributions:
  - number: 3496
    type: pr
    title: 'Lire les colonnes du suivi de candidatures depuis la liste des lignes'
    mergedAt: 2026-09-02
    status: merged
    url: https://github.com/career-ops-hq/career-ops/pull/3496
    problem: 'Le module de calibrage lisait le tableau de suivi avec le mauvais plan de colonnes. Dès qu’une colonne optionnelle était présente, chaque valeur était lue une colonne trop à gauche et les lignes étaient écartées sans le moindre message. L’outil annonçait qu’il manquait d’historique alors qu’il n’avait rien lu, et se terminait en succès.'
    fix: 'Une seule ligne. Le calcul des colonnes reçoit désormais la liste des lignes du fichier, comme le font les 25 autres appels du projet, au lieu de la seule ligne d’en-tête.'
    tests: 'Un test de non-régression lit un tableau avec la colonne optionnelle, puis un tableau à l’ancien format, et vérifie que chaque champ est lu dans sa propre colonne. Il échoue avant le correctif et passe après.'
    technical: '`loadTrackerRows()` (dans `calibrate.mjs`) passait une chaîne à `resolveColumns()`, qui attend le tableau de lignes. La fonction parcourait la chaîne caractère par caractère, ne trouvait aucun en-tête et retombait sur `LEGACY_COLMAP`, l’ordre à 9 colonnes sans la colonne `Via`. La suite complète est passée de 7288 à 7297 tests en mode rapide, sans échec.'
  - number: 3808
    type: pr
    title: 'Reconnaître les en-têtes de rapport écrits en français'
    mergedAt: 2026-09-05
    status: merged
    url: https://github.com/career-ops-hq/career-ops/pull/3808
    problem: 'La typographie française place une espace avant les deux-points et les modèles de rapport écrivent « Archétype » avec un accent. L’outil ne reconnaissait ni l’un ni l’autre et lisait ces champs comme absents, sans aucune alerte. Résultat mesuré sur un corpus français : 128 URL et 61 archétypes perdus sur 224 rapports. La répartition par fournisseur ne portait plus que sur 1 candidature sur 22, sans que rien ne la distingue d’un manque réel de données.'
    fix: 'Les deux motifs de lecture acceptent une espace avant les deux-points, y compris l’espace insécable que les éditeurs français insèrent automatiquement, ainsi que la graphie accentuée. Les anciens rapports restent lisibles.'
    tests: 'Des tests couvrent chaque champ en anglais, en français et en espagnol, y compris l’espace insécable. Un cas négatif vérifie qu’une ligne sans URL reste absente au lieu de produire un faux positif. Les cas français échouent avec les anciens motifs.'
    technical: 'Les motifs deviennent `REPORT_URL_RE` et `REPORT_ARCHETYPE_RE`, au niveau du module, donc testables directement. La relecture a demandé de remplacer `\s` par une classe horizontale seule : `\s` franchit les retours à la ligne et un champ vide pouvait capturer la ligne suivante. Une alerte automatique de sécurité, un faux positif, a été levée en appelant le motif plutôt que la chaîne dans le test.'
  - number: 3866
    type: pr
    title: 'Lire l’archétype dans chacune des langues du projet'
    mergedAt: 2026-09-05
    status: merged
    url: https://github.com/career-ops-hq/career-ops/pull/3866
    problem: 'Le champ « archétype » n’était lu que pour 5 des 12 langues du projet. Les rapports des autres langues, dont l’allemand, l’italien, le polonais, le portugais, le turc, l’indonésien, le danois, le russe et l’ukrainien, étaient classés « inconnu », et cette valeur alimentait la recommandation finale, calculée sur une population vide.'
    fix: 'Toutes les graphies sont réunies dans une liste unique, chacune extraite du modèle de rapport qui l’écrit réellement plutôt que traduite, pour ne jamais ajouter un libellé qu’aucun rapport ne porte. Une garde évite de capturer par erreur une ligne du tableau de notation.'
    tests: 'Un test par langue, de sorte qu’un modèle qui renomme son en-tête fasse échouer une assertion nommée au lieu de vider silencieusement la répartition. Les sept nouvelles graphies échouent avec l’ancien motif. Sur le même corpus de 224 rapports, le nombre d’archétypes reconnus reste à 177 (aucune perte de précision).'
    technical: 'Les libellés sont rangés du plus long au plus court dans `ARCHETYPE_LABELS` pour qu’une forme courte n’en masque pas une plus longue (`Arketip` et `Arketipe`). Le bloc A du rapport est volontairement laissé de côté : le motif de cellule élargi aurait capturé la ligne de notation `Archétype / séniorité | 25 %` comme archétype. Un cas négatif verrouille cette garde. La suite complète affiche 8289 tests passés, 0 échec.'
---

## Pourquoi ces trois correctifs comptent

Dans les trois cas, l’outil ne plantait pas. Il répondait, avec un code de sortie annonçant le succès, à partir d’une fraction des données, voire d’aucune. Une erreur franche se corrige en une heure. Une réponse plausible mais fausse peut orienter des décisions pendant des mois. C’est le même risque qu’en livraison logicielle : le problème qu’on ne voit pas n’apparaît dans aucun rapport d’avancement.

## La méthode que je demande à mes équipes

Chaque correctif suit la même séquence : reproduire le défaut sur des données réelles, écrire d’abord le test qui échoue, corriger au plus juste, puis mesurer l’effet. La relecture des mainteneurs a durci le deuxième correctif, et le troisième conserve une garde contre une erreur voisine. Je traite ces retours comme une partie du travail, pas comme une critique.
