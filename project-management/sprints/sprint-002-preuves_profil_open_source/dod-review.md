# Revue indépendante de la Definition of Done : Sprint 002

> Revue du 2026-10-14, branche `feature/sprint-002-preuves_profil_open_source`, PR #2, HEAD `8bf7d6b`. Référentiel : `project-management/definition-of-done.md`, stories US-006, US-007, US-019 à US-023, résolutions E1 à E22 et « Arbitrages de l'orchestrateur » de `tasks/README.md` (ils font foi). Niveau d'exigence aligné sur la revue du sprint 1. Aucun code modifié.
>
> Remarque : l'arbre était propre au début de la revue (builds Docker lancés sur HEAD). Pendant la revue, `tests/e2e/a11y.spec.ts` a été modifié localement sans commit (correctif probable du délai d'axe, voir B1). Ce correctif n'est ni commité ni vérifié en CI : il n'est pas pris en compte ici.

## Verdict révisé (seconde passe, HEAD `0053c07`)

Les quatre bloquants B1 à B4 sont corrigés et vérifiés : voir « Seconde passe » en fin de document. Aucune régression constatée. La CI du run 38616206639 est verte : e2e **427 passed, 0 failed, 3 skipped** (les skips attendus), aucun test flaky, Lighthouse ≥ 0,95 sur les 4 axes pour 29 pages.

| US | Verdict | Réserves |
|----|---------|----------|
| US-007 | **Done sous réserve PO** | T-007-01 et T-007-16 (validation PO) ; scénario « Échec de génération » sans test (N5) |
| US-006 | **Done sous réserve PO** | T-006-01, années des réalisations à valider (`src/data/cv/achievements.yaml:2`) |
| US-019 | **Done sous réserve PO** | Title du catalogue différent de la story (N8) |
| US-020 | **Done sous réserve PO** | Pas de contrôle de build du poids et des EXIF des captures (N6) |
| US-021 | **Done sous réserve PO** | Liste des dépôts dupliquée (N2) |
| US-022 | **Done sous réserve PO** | Le scénario « Métriques disponibles » n'affiche plus la date de release de tailsfadmin (le tag v1.6.2 n'a pas de release GitHub) : c'est exact, mais incomplet par rapport au Gherkin. Arbitrage PO, ou publication d'une release GitHub v1.6.2 |
| US-023 | **Done sous réserve PO** | Aucune |

**Score révisé : 85/100.** Les 7 stories sont « Done sous réserve PO ». Les réserves communes à toutes restent ouvertes : phase 4 en cours (T-900-01 partiel, T-900-02 à T-900-06), déploiement, contrôle de fumée et validation PO sur la production (DoD §10), squash merge (DoD §1).

## Verdict initial (première passe, HEAD `8bf7d6b`)

| US | Titre | Verdict | Motif principal | Après correctifs bloquants |
|----|-------|---------|-----------------|----------------------------|
| US-007 | CV PDF généré au build | **Non done** | CI rouge (B1) | Done sous réserve PO (T-007-01, T-007-16) |
| US-006 | Compétences filtrables | **Non done** | CI rouge (B1) | Done sous réserve PO (T-006-01, années à valider) |
| US-019 | Catalogue des 20 plugins | **Non done** | CI rouge (B1) ; preuve de l'accueil non re-pointée (B4, T-019-14) | Done sous réserve PO |
| US-020 | Fiche détaillée d'un plugin | **Non done** | CI rouge (B1) ; matrices de compatibilité inexactes sur 10 fiches (B3) | Done sous réserve PO |
| US-021 | Données vivantes | **Non done** | CI rouge (B1) ; version et date de release incohérentes (B2) | Done sous réserve PO |
| US-022 | Page tailsfadmin | **Non done** | CI rouge (B1) ; fait inexact publié (B2) ; page orpheline (B4) | Done sous réserve PO |
| US-023 | Étude de cas career-ops | **Non done** | CI rouge (B1) ; page orpheline, scénario « Accès depuis la page profil » impossible (B4) | Done sous réserve PO |

**Score : 52/100.** Le travail est de bonne qualité : 499 tests unitaires verts, couverture élevée, scénarios Gherkin presque tous automatisés, faits career-ops exacts, aucune donnée personnelle. Mais la CI de HEAD est rouge, et cela suffit à rendre les 7 stories « Non done ». Il y a 4 correctifs bloquants (B1 à B4). B1 et B2 sont de petits correctifs. B4 correspond aux tâches de phase 4, déjà planifiées mais pas réalisées.

La validation PO sur la production (DoD §10) est en attente pour toutes les stories : rien du sprint 2 n'est déployé et la phase 4 (T-900-01 à T-900-06) n'a pas commencé. Ce point n'est pas répété dans le détail.

## Preuves exécutées

| Vérification | Résultat |
|--------------|----------|
| `docker build --no-cache-filter build,test --target test .` (HEAD) | `EXIT=0`. `Contrôles content : OK`, 31 pages, `CV PDF généré`, `Contrôles dist : OK` (avertissements non bloquants : CNIL 503, LinkedIn 999). ESLint, Prettier, `astro check` : 0 erreur, 0 avertissement |
| Vitest | 50 fichiers, **499 tests** verts. Couverture : lignes 96,69 %, branches 89,73 %, instructions 96,27 %, fonctions 95,98 % |
| `pdfinfo` / `pdftotext` sur `dist/thibaut-monier-cv.pdf` | 2 pages A4, 65 473 octets, `Tagged: yes`, titre « Thibaut Monier – CV », Typst 0.15.1. Les 7 expériences sont présentes (5 détaillées et 2 dans « Avant 2016 »). Ni téléphone, ni âge, ni adresse : localisation « Nantes (France) », « Plus de 25 ans d'expérience » autorisé par A1. Clients anonymisés |
| CI GitHub, run 38610656862 (HEAD `8bf7d6b`) | **failure**. `quality`, `dockerfile`, `supply-chain` et `external-links` OK. `e2e` : **419 passed, 2 failed, 3 skipped**. Lighthouse non exécuté |
| Tests ignorés en CI | **3, conformes à l'attendu** : `contact.spec.ts:295` [sans-clé] sur desktop et mobile, `parcours.spec.ts:132` (impression PDF) sur mobile. Aucun écart |
| `dist/` : bloc `LiveStats` des 21 pages | Les 20 fiches et tailsfadmin affichent toutes les métriques présentes dans le JSON (version, release, étoiles, téléchargements du mois et totaux) et « Données au 2026-10-14 ». Agentic Feeds n'a pas de téléchargements, comme prévu par E20. **Aucune métrique n'est perdue en silence** |
| `dist/` : marqueurs provisoires et données personnelles | Aucun marqueur (`TODO`, « à vérifier », « provisoire », lorem…), aucun téléphone, aucun âge, aucune adresse dans les 31 pages. Aucun nom de client (Gémo, Brittany Ferries, Lescuyer, Pileje, Dior, Manitou…) |
| `dist/` : liens entrants | **Aucune page ne pointe vers `/open-source/career-ops/` ni vers `/open-source/tailsfadmin/`** (B4) |
| Captures (`src/assets/plugins`, 22 WebP) | 20 à 70 Ko, aucun bloc EXIF ni XMP. Revue visuelle de 4 captures (membres d'une société, commande en attente, relevé de crédit, consentement MCP) : données de démonstration uniquement (« Acme Industries », « Fashion Web Store », 127.0.0.1) |
| Faits career-ops (`gh pr view -R career-ops-hq/career-ops`) | #3496 fusionnée le 2026-09-02, #3808 et #3866 le 2026-09-05, auteur `thibmonier`. 74 531 étoiles. Chiffres 7288 → 7297, 8289, 128/61/224, 1 sur 22, 177, 5 langues sur 12 et « 25 autres appels » : tous conformes aux corps et aux diffs des PR |
| Faits des plugins (`sylius_plugins/<repo>/composer.json`, 20 dépôts) | Paquets `tmonier/*`, licence MIT, `requires`, `complements` et `externalRequires` conformes à `require` et `suggest` (seule exception : audit-log → timeline, voir N10). Compatibilité : 10 fiches inexactes (B3) |
| Faits tailsfadmin (`/Users/tmonier/Projects/tailsfadmin`) | MIT, 7 ADR, PHPStan `level: max`, PHP CS Fixer : conformes. Version v1.6.2 : conforme. **Date de release : inexacte** (B2) |

Limite de la revue : Playwright n'a pas été exécuté en local (pas d'image Playwright). Le résultat d'axe sur l'ensemble des pages découvertes n'est connu nulle part, puisque le test échoue par délai dépassé avant de conclure.

## Correctifs bloquants

**B1. La CI de HEAD est rouge.** Concerne toutes les stories (DoD §3 « CI verte », §4 « audit axe », §5 « Lighthouse »). Dans le run 38610656862, `tests/e2e/a11y.spec.ts:8` dépasse le délai de 30 s sur desktop et sur mobile, retry compris. Le site passe de 7 à 31 pages, et la boucle de `:16-27` analyse chaque page découverte en thème clair puis sombre sans adapter le délai. Lighthouse n'est jamais lancé : le score de 95 n'est vérifié sur aucune des 24 nouvelles pages. Conséquence : axe n'est vérifié que sur les pages qui ont leur propre spec (compétences, catalogue, 2 fiches sur 20, career-ops, tailsfadmin, zone du lien CV). Les 18 autres fiches ne sont pas auditées. Correctif attendu : commiter un délai proportionnel au nombre de routes (la modification locale non commitée va dans ce sens), relancer la CI et obtenir `e2e` vert avec 3 tests ignorés au plus, puis un Lighthouse ≥ 95 sur les nouvelles pages.

**B2. Fait inexact publié sur `/open-source/tailsfadmin/` (US-021, US-022).** Le bloc affiche « Dernière version v1.6.2 » à côté de « Date de release 13 septembre 2026 ». Or le 13 septembre est la date de la release GitHub **v1.6.1** (`src/data/oss-metrics.json`, entrée `thibmonier/tailsfadmin` : `latestRelease.tag = v1.6.1`). Le tag v1.6.2 date du 2026-09-14 et n'a pas de release GitHub. Cause : `src/lib/live-stats.ts:33-34` prend la version sur Packagist et la date sur la dernière release GitHub, sans vérifier qu'il s'agit de la même version. Aujourd'hui, les 20 plugins ne sont pas touchés (version Packagist = tag de release). Correctif : n'afficher la date que si le tag de la release correspond à la version affichée (sinon masquer la date, ou afficher le tag GitHub avec sa date), et ajouter un test unitaire pour ce cas.

**B3. Matrices de compatibilité inexactes sur 10 fiches (US-020).** Les fiches `admin-order-creation`, `audit-log`, `bulk-actions`, `command-palette`, `facturx`, `gpsr`, `timeline`, `webhook-outbox`, `withdrawal` (ligne « Sylius 2.2 et 2.3 ») et `quote-request` (ligne « 2.2.9+ et 2.3 ») déclarent `php: '>=8.2'` et Symfony « 6.4, 7.4, 8.0 » sur une seule ligne. Un lecteur en déduit deux combinaisons impossibles :
- Sylius 2.3 sur PHP 8.2 : Sylius v2.3.0 exige `"php": "^8.3"` (`sylius_plugins/sylius-quote-request-plugin/vendor/sylius/sylius/composer.json:23`) ;
- Sylius 2.2 avec Symfony 8.0 : seul Sylius 2.3 le permet (`sylius-company-accounts-plugin/README.md:51`).

Les 9 autres fiches (par exemple `purchase-approval.mdx:19-31`) séparent correctement les deux lignes, comme le demande l'exemple de la story US-020. Correctif : scinder la ligne en « 2.2 → PHP ≥ 8.2, Symfony 6.4/7.4 » et « 2.3 → PHP ≥ 8.3, Symfony 6.4/7.4/8.0 (PHP 8.4) ». Les README sources de ces plugins ont la même imprécision et sont à corriger aussi, hors de ce dépôt.

**B4. Intégration de phase 4 absente : pages orphelines et scénario impossible (US-019, US-022, US-023).** T-019-14, T-023-14, T-023-15, T-022-11 et T-900-01 à 06 sont encore « À faire ». Aucune page de `dist/` ne pointe vers `/open-source/career-ops/` ni vers `/open-source/tailsfadmin/`. Conséquences :
- un visiteur ne peut pas atteindre ces deux pages ;
- le scénario US-023 « Accès depuis la page profil » ne peut pas se produire : la mention « Contributeur career-ops » n'existe pas sur `/parcours/`, et `tests/e2e/career-ops.spec.ts:149` ne vérifie que le lien « Retour au profil » ;
- les critères « lien depuis la page d'ensemble de la vitrine » (US-022) et « lien depuis la page profil et la vitrine » (US-023) ne sont pas remplis ;
- les deux pages échappent au parcours de `tests/e2e/helpers/routes.ts`, donc à `a11y.spec.ts` et à `pages-matrix.spec.ts` (règle de `tasks/README.md:77`) ;
- les preuves de l'accueil pointent encore vers GitHub (`src/data/home.yaml:18` vers `github.com/thibmonier` et `:23` vers la recherche de PR) au lieu de `/open-source/` et de l'étude de cas.

Correctif : réaliser la phase 4 avant la fusion, ou retirer US-022 et US-023 du périmètre « Done » du sprint.

## Détail par story

### US-007 : Non done (B1), puis Done sous réserve PO

| Scénario | Couverture |
|----------|-----------|
| Nominal : clic, fichier `thibaut-monier-cv.pdf` < 500 Ko, 7 expériences et résumé, 2 pages, texte sélectionnable, `noindex` et `no-cache` | `tests/e2e/cv-pdf.spec.ts:60-67` (téléchargement), `:69-77` (taille, `%PDF-`), `:79-85` (en-têtes), `:87-95` (en-têtes de sécurité conservés). Contenu : `scripts/checks/cv-pdf.dist.check.ts:40-47` (entreprises, résumé, réalisations, pages), `tests/unit/checks/cv-pdf.test.ts:110-148`, `tests/unit/lib/cv-data.test.ts:168`. Constaté sur le PDF construit |
| Source unique | `tests/unit/checks/cv-pdf.test.ts:144` ; le contrôle de build compare le texte du PDF aux YAML lus par `/parcours/` |
| Lecture accessible (balisé, titre, langue « fr ») | Titre et langue : `tests/unit/checks/cv-pdf.test.ts:150`. **Balisage non contrôlé** : `tagged` est lu (`scripts/checks/lib/pdf-privacy.ts:42`) mais jamais vérifié dans `evaluateCvPdf` (`:62-91`), voir N4. `Tagged: yes` constaté à la main. Ordre de lecture non vérifié avec un lecteur d'écran |
| Donnée personnelle dans le PDF | `tests/unit/checks/cv-pdf.test.ts:95-102` (message exact de la story) |
| Échec de génération, aucun PDF obsolète | **Non couvert** : `scripts/build-cv.ts:68-82` n'a aucun test et la PR ne contient aucune preuve manuelle (N5) |

Sections DoD : §1 à §3 conformes, sauf la CI (B1). §6 : nginx réinclut le snippet d'en-têtes (`nginx.conf:79-83`). §8 : guide `docs/guides/cv-pdf.md`, amendement d'ADR-0005 et CHANGELOG présents. §9 : poppler et Typst sont épinglés dans `deps`, absents de `runtime` (`Dockerfile:19-24`, `:68-72`). Réserve PO : T-007-01 et T-007-16 en revue.

### US-006 : Non done (B1), puis Done sous réserve PO

| Scénario | Couverture |
|----------|-----------|
| Filtre « E-commerce », compteur exact, « Référence confidentielle » | `tests/e2e/competences.spec.ts:101-116`, `:37-52` |
| Réinitialisation | `:138-147` |
| Filtre partagé `?domaine=ia-appliquee` | `:151-157` |
| Domaine inconnu, message annoncé | `:161-168` (région `aria-live`, `:54-59`) |
| Filtre sans résultat, lien « Voir toutes les réalisations » | `:172-196` (HTML réécrit à la volée) |

Les critères techniques sont couverts : sans JavaScript (`:199-215`), script < 3 Ko (`:218-233`), 360 px (`:235-245`), cibles ≥ 44 px (`:247-256`), axe clair et sombre (`:266-277`). Aucun nom de client publié (vérifié sur `dist/`). Réserve PO : `src/data/cv/achievements.yaml:2` indique que les années sont « à valider par le PO » ; T-006-01 et T-006-13 en revue.

### US-019 : Non done (B1, B4), puis Done sous réserve PO

| Scénario | Couverture |
|----------|-----------|
| Catalogue puis « B2B » : 9 cartes, « 9 plugins », `?theme=b2b`, partage | `tests/e2e/open-source.spec.ts:12-60` ; décompte de 20 et répartition `scripts/checks/lib/plugins.ts:11-17`, `tests/unit/checks/plugins.test.ts:62-75` |
| Recherche « facture » : Factur-X en premier | `tests/e2e/open-source.spec.ts:69-89` |
| Sans JavaScript : 20 plugins groupés, ancres | `:110-125` |
| Aucun résultat « blockchain » | `:90-99`, `tests/unit/lib/plugins.test.ts:102` |
| Thème inconnu : échec du build avec le message | `tests/unit/content/plugins.test.ts:39`, `tests/unit/checks/plugins.test.ts:79` |

Écarts : T-019-14 non fait (B4). Le title livré, « Plugins Sylius 2 open source : B2B, UE, IA » (`src/pages/open-source/index.astro:39`), diffère de celui de la story (N8).

### US-020 : Non done (B1, B3), puis Done sous réserve PO

| Scénario | Couverture |
|----------|-----------|
| Purchase Approval à 1440 × 900 : matrice sans défilement, « Nécessite », liens `noopener`, copie | `tests/e2e/plugin-detail.spec.ts:12-77` |
| Sans dépendance (Tier Pricing) | `:79-88` |
| Non publié sur Packagist (Agentic Feeds), mention « Paquet bientôt publié sur Packagist » | `:90-107`, `tests/e2e/oss-metrics.spec.ts:49-57` |
| Fiches liées : « Utilisé par » | `:109-123` ; dépendance externe B2B MCP `:125` |
| Dépendance inexistante | `tests/unit/lib/plugin-deps.test.ts:51`, `tests/unit/checks/plugins.test.ts:83` |
| `compatibilité.php` manquant | `tests/unit/content/plugins.test.ts:47`, `tests/unit/lib/plugins.test.ts:115` |

Écarts : B3 (matrices inexactes). T-020-05 et T-020-06 (contrôle de build du poids et des EXIF des captures, `optimize-captures.ts`) ne sont pas faits malgré la résolution E17 (N6). La contrainte est respectée aujourd'hui (22 WebP de 70 Ko au plus, sans métadonnées), mais rien ne la garantit pour la suite. Axe ne porte que sur 2 fiches sur 20 tant que B1 n'est pas corrigé.

### US-021 : Non done (B1, B2), puis Done sous réserve PO

| Scénario | Couverture |
|----------|-----------|
| Nominal : JSON complet, ≤ 60 s, « Données au … » | `tests/unit/oss-metrics/fetch.test.ts:88-135`, `tests/e2e/oss-metrics.spec.ts:14-36`. La durée de 60 s n'est pas testée : les horodatages du JSON montrent environ 15 s pour 21 dépôts |
| API indisponible avec cache | `fetch.test.ts:138-156`, `:211` (jamais rajeuni) |
| Limite de débit GitHub, arrêt après le premier 403 | `:157-175` |
| Pas de cache, pas d'API : métrique absente et message | `:189-205`, `:206` (code de sortie 0) ; masquage `tests/unit/lib/live-stats.test.ts:49-52` |
| Réponse malformée | `:176-188` |

**Format du JSON lu par `LiveStats`.** Le format est compatible. Les clés `fetchedAt`, `github.{stars, latestRelease.tag, latestRelease.publishedAt}` et `packagist.{latestVersion, downloadsMonthly, downloadsTotal}` de `src/data/oss-metrics.json` (lot 3) sont celles que lit `src/lib/live-stats.ts:29-37` (lot 2). Le rendu des 21 pages est complet. Ce couplage repose toutefois sur une duplication (N1).

Sécurité : `metrics.yml` démarre avec `permissions: {}` au niveau du workflow, puis donne au job les droits minimaux. Le jeton est passé par variable d'environnement, `persist-credentials: false`, et la CI est déclenchée par `workflow_dispatch` (E13). Le jeton est absent des journaux et des données (`fetch.test.ts:246-266`). Conforme.

### US-022 : Non done (B1, B2, B4), puis Done sous réserve PO

| Scénario | Couverture |
|----------|-----------|
| Nom, v1.6.2, licence sans défilement ; copie ; liens GitHub, Packagist et README | `tests/e2e/tailsfadmin.spec.ts:14-71` |
| Métriques disponibles | `:89-108`. **La date affichée est fausse** (B2) |
| Visiteur non technique : « En bref » de 2 phrases | `:111-123` |
| Métriques indisponibles | `tests/unit/lib/live-stats.test.ts:49-52` (`null`) et `src/components/oss/LiveStats.astro:12` (bloc absent) ; pas de test e2e de ce cas |
| Lien sortant cassé | `tests/unit/checks/external-links.test.ts:74-93` (générique sur `/open-source/**`, testé avec l'URL career-ops) |

Écarts : page orpheline (B4). Le critère « Contenu en MDX » ne correspond pas à `src/content/projects/fr/tailsfadmin.md` (N9). La page est publiée sans capture, ce qui est conforme à E18.

### US-023 : Non done (B1, B4), puis Done sous réserve PO

| Scénario | Couverture |
|----------|-----------|
| Résumé de 3 lignes, 4 blocs par PR, chiffre 128/61/224, ≤ 900 mots | `tests/e2e/career-ops.spec.ts:14-66` ; budget de mots `tests/unit/checks/projects.test.ts:69-82` |
| Lecture non technique, dépliage au clavier | `:109-146` |
| Accès depuis la page profil | **Non couvert et impossible aujourd'hui** (B4). Seul « Retour au profil » est vérifié (`:149-165`) |
| Lien de PR cassé | `tests/unit/checks/external-links.test.ts:74-80` (message exact) ; job CI `external-links` vert sur HEAD |
| PR sans tests décrits | `tests/unit/content/projects.test.ts:51`, `tests/unit/checks/projects.test.ts:62-67` |

Les faits publiés sont exacts (voir « Preuves exécutées »). Les tests des PR #3808 et #3866 sont des auto-tests intégrés à `analyze-patterns.mjs`, et non des fichiers séparés : le texte « Des tests couvrent… » reste exact.

## Correctifs non bloquants

- **N1. DRY, deux lecteurs du JSON de métriques.** `src/lib/live-stats.ts:14-60` réimplémente à la main le contrat déjà défini par `ossMetricsSchema` et `OssMetric` (`src/content/schemas/oss-metrics.ts:7-27`). L'entrée est typée `unknown`, puis passe par les gardes `isRecord`, `count` et `text`. Si un champ est renommé dans le schéma (et donc par la collecte), aucune erreur de type n'apparaît et la métrique disparaît de la page en silence. Seule la fiche company-accounts est gardée par un test e2e (`tests/e2e/oss-metrics.spec.ts:11`). De plus, `src/lib/oss-metrics.ts` (péremption) et `live-stats.ts` (affichage) sont deux bibliothèques pour un même fichier. Recommandation : typer `getLiveStats` avec `OssMetrics`, ou valider chaque entrée avec `safeParse` sur le schéma partagé.
- **N2. DRY, liste des dépôts.** `scripts/lib/oss-targets.ts:26-52` duplique `repo` et `packagist` déjà portés par le frontmatter des 20 fiches, y compris le statut « non publié » d'Agentic Feeds. Un écart entre les deux ne produit qu'un avertissement (`scripts/checks/lib/oss-metrics.ts`).
- **N3.** Version au format incohérent : « v1.0.0 » quand elle vient de Packagist, « 1.0.0 » quand elle vient d'un tag GitHub, dont le préfixe est retiré (`src/lib/live-stats.ts:33`).
- **N4.** `PdfInfo.tagged` est lu mais jamais vérifié (`scripts/checks/lib/pdf-privacy.ts:15`, `:42`, `:62-91`). C'est un champ mort, et le scénario « Lecture accessible » n'a aucune garde contre une régression.
- **N5.** Le scénario US-007 « Échec de génération » n'a ni test ni preuve manuelle.
- **N6.** T-020-05 et T-020-06 ne sont pas faits (contrôle de build des captures, E17). Le tableau dit qu'ils « restent au lot 3 », or le lot 3 est clos sans eux.
- **N7. Tableau des tâches incohérent** (`task-board.md`) : le résumé annonce 79 tâches « À faire » et 28 « Done », alors que les lots 2 et 3 sont listés comme faits plus bas. Les tâches du lot 2 figurent aussi dans « À faire », et il existe deux sections « ✅ Done ». T-022-05 est « Done » alors qu'aucune capture n'a été produite (E18 l'autorise, mais il faut l'écrire). Cela nuit à la transparence.
- **N8.** Le title du catalogue diffère de celui de la story US-019 (raccourci, sans doute pour tenir en 60 caractères) : mettre la story à jour.
- **N9.** Les projets sont en `.md`, alors que US-022 (« Contenu en MDX ») et le commentaire de `astro.config.mjs:12` annoncent du MDX : incohérence entre la documentation et le code.
- **N10.** `audit-log` déclare `complements: [timeline]` alors que son `composer.json` n'a pas de `suggest` (règle E6). Le lien est justifié par le README (« sibling plugin ») : à documenter ou à aligner.
- **N11.** L'analyse du frontmatter est dupliquée entre `scripts/checks/lib/plugins.ts:21-35` et `scripts/checks/lib/projects.ts:13-35`.
- **N12.** Les commits `merge: lot N` n'utilisent pas un type Conventional Commits. Le squash merge prévu par la DoD §1 règle ce point.
- **N13.** Le sitemap est toujours absent (DoD §5, constat du sprint 1). Les nouvelles pages publiques n'y figurent pas.

## Suite donnée

Remédiation du 2026-10-14 (worker DoD). Rien n'est commité par le worker.

| Point | Suite |
|-------|-------|
| B1 | Déjà corrigé (`tests/e2e/a11y.spec.ts`, délai proportionnel) : non touché. |
| B2 | Corrigé à la lecture : `getLiveStats` (`src/lib/oss-metrics.ts`) n'affiche la date de release que si le tag de la release GitHub est la version affichée. tailsfadmin affiche « v1.6.2 » sans date (le tag v1.6.2 n'a pas de release GitHub). Tests unitaires (`tests/unit/lib/oss-metrics.test.ts`) et e2e (`tests/e2e/tailsfadmin.spec.ts`). |
| B3 | Les 10 fiches sont scindées en « 2.2 → PHP ≥ 8.2, Symfony 6.4/7.4 » et « 2.3 → PHP ≥ 8.3, Symfony 6.4/7.4/8.0 (PHP 8.4 requis) ». Règle vérifiée dans `sylius/sylius` v2.3.0 (`php ^8.3`, `symfony/* ^6.4 \|\| ^7.4 \|\| ^8.0`) et dans les `composer.json` des 20 plugins (`php ^8.2`, contraintes `symfony/*`). Nouveau contrôle `src/lib/compatibility.ts`, branché sur le contrôle de contenu `plugins` et testé (`tests/unit/lib/compatibility.test.ts`, y compris sur les 20 fiches). Limite : Sylius 2.2 n'est pas installé localement, sa règle (PHP ≥ 8.2, Symfony 6.4/7.4) repose sur les `composer.json` des plugins et le README company-accounts. README des plugins sources non touchés (hors dépôt). |
| B4 | T-022-11 : section « Autres projets » (`ProjectCard`) sur `/open-source/`, catalogue toujours à 20. T-023-14 : mention « Contributeur career-ops » sur `/parcours/` (masquée à l'impression). T-019-14 et T-023-15 : preuves de l'accueil re-pointées vers `/open-source/` et `/open-source/career-ops/`. T-900-01 (partiel) : `OK_PATHS` étendu à `/competences/`, `/open-source/` et aux deux projets ; le contrôle du type `application/pdf` reste à faire. Scénarios e2e ajoutés (parcours vers career-ops, hub vers les deux projets). Le crawl découvre désormais les deux pages. |
| N1 | `LiveStats` lu via `src/lib/oss-metrics.ts` et le schéma partagé `ossMetricSchema` ; `src/lib/live-stats.ts` supprimé, tests migrés. |
| N3 | Version toujours affichée avec le préfixe « v ». |
| N4 | `evaluateCvPdf` refuse un PDF non balisé (test ajouté). |
| N8 | Non traité (title du catalogue : à aligner par le PO dans la story). |
| N9 | Commentaire de `astro.config.mjs` et critère d'US-022 alignés sur le Markdown (`.md`). |
| N2, N5, N6, N7, N10, N11, N12, N13 | Laissés : refactorings ou décisions hors périmètre « rapide et sûr » (N2, N11), tests de build absents (N5, N6), tableau des tâches (N7), décision PO (N10, N8), process Git (N12), sitemap (N13). |

Reste de la phase 4 : T-900-02 à T-900-06 (scénarios inter-US dédiés, porte du sprint, déploiement, README et CHANGELOG, validation PO).

## Seconde passe : vérification de la remédiation (HEAD `0053c07`)

Constats d'origine rejoués sur HEAD. Le tableau « Suite donnée » ci-dessus est la déclaration du worker ; ce qui suit est vérifié indépendamment.

| Point | Vérification | Statut |
|-------|--------------|--------|
| B1 | `tests/e2e/a11y.spec.ts:16` : délai de `30 s + routes × 2 × 5 s` ; les violations de toutes les pages sont agrégées (`:18-34`), aucune n'est masquée. CI 38616206639 : `a11y.spec.ts:8` vert sur desktop (47,9 s) et sur mobile (44,2 s) ; e2e à 427 passed, 0 failed, 3 skipped (`contact.spec.ts:295` × 2, `parcours.spec.ts:132` mobile), sans retry ; Lighthouse : 29 pages ≥ 0,95 sur les 4 axes | **Levé** |
| B2 | `src/lib/oss-metrics.ts:28-41` : la date n'est affichée que si `bare(release.tag) === bare(version)`. Dans `dist/` reconstruit, tailsfadmin affiche « v1.6.2 » sans date ; les 20 fiches affichent une date égale au `publishedAt` du JSON pour le même tag (vérifié). Tests : `tests/unit/lib/oss-metrics.test.ts:79-100`, `tests/e2e/tailsfadmin.spec.ts` (scénario « version et date de release cohérentes ») | **Levé** (réserve US-022 ci-dessus) |
| B3 | Comparaison des 20 frontmatters avec les `composer.json` des dépôts : plus aucune ligne mêlant 2.2 et 2.3. Chaque fiche porte « 2.2 (ou 2.2.9+) → PHP ≥ 8.2, Symfony 6.4/7.4 » (7.4 seul pour ai-catalog-copilot et b2b-mcp, conforme à leurs contraintes `^7.4`) et « 2.3 → PHP ≥ 8.3, Symfony …/8.x (PHP 8.4 requis) ». Garde de build : `src/lib/compatibility.ts`, branchée dans `scripts/checks/lib/plugins.ts:66-67`, avec un test sur les 20 fiches (`tests/unit/lib/compatibility.test.ts:58`). Limite déjà signalée par le worker : la règle Sylius 2.2 repose sur les README et les `composer.json` des plugins (pas de Sylius 2.2 installé) | **Levé** |
| B4 | `dist/` : `/open-source/career-ops/` est lié depuis `/`, `/open-source/` et `/parcours/` ; `/open-source/tailsfadmin/` est lié depuis `/open-source/`. « Contributeur career-ops » est présent sur `/parcours/`. Preuves de l'accueil : `src/data/home.yaml:19` et `:24`. Tests : `tests/e2e/career-ops.spec.ts` (parcours vers l'étude de cas), `tests/e2e/open-source.spec.ts` (« Autres projets », catalogue toujours à 20) | **Levé** |
| N1 | `src/lib/live-stats.ts` est supprimé ; un seul lecteur valide chaque entrée avec le schéma partagé `ossMetricSchema` (`src/lib/oss-metrics.ts:55-61`). Les 21 blocs `LiveStats` de `dist/` sont complets (agentic-feeds sans téléchargements, tailsfadmin sans date, comme attendu) | **Levé** |
| N3, N4, N9 | Version préfixée « v » partout (`oss-metrics.ts:32`) ; PDF non balisé refusé (`pdf-privacy.ts:90`) ; `astro.config.mjs:12` et US-022 alignés sur `.md` | **Levés** |
| Non-régression | `docker build --target test` sur HEAD : `EXIT=0`, contrôles `content` et `dist` OK, 31 pages, CV PDF généré, ESLint, Prettier et `astro check` à 0, **512 tests** verts, couverture : lignes 96,62 %, branches 88,77 % | OK |

### Points non bloquants restants

| # | Point | Classement |
|---|-------|------------|
| N2 | `scripts/lib/oss-targets.ts` duplique `repo` et `packagist` du frontmatter (DRY) | Dette technique, sprint suivant |
| N5 | « Échec de génération » du CV sans test ni preuve manuelle | Réserve US-007 : ajouter un test ou une preuve dans la PR |
| N6 | T-020-05 et T-020-06 : pas de contrôle de build du poids et des EXIF des captures (aujourd'hui conforme) | Réserve US-020 : à planifier |
| N7 | `task-board.md` : le résumé affiche toujours 79 tâches « À faire » et 28 « Done », incohérent avec les tâches | Transparence : à corriger avant la Sprint Review |
| N8 | Title du catalogue différent de la story US-019 | Décision PO (mettre la story à jour) |
| N10 | audit-log → timeline en `complements` sans `suggest` Composer | Décision PO |
| N11 | Analyse du frontmatter dupliquée entre les contrôles `plugins` et `projects` | Dette technique mineure |
| N12 | Commits `merge: lot N` | Réglé par le squash merge |
| N13 | Sitemap absent | Hors sprint (US-024) |
| Nouveau | La date de release de tailsfadmin n'est plus affichée (conséquence exacte de B2) | Réserve US-022, décision PO |
