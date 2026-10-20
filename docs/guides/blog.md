# Guide du blog

Reprise des 28 articles d'un ancien blog (US-009). Ce guide est créé en phase 0 du sprint 3 (T-009-01) : inventaire de la source, décisions de migration et contrats publiés. Le lot A le complète (composants, migration, relecture, T-009-27). Décisions structurantes : ADR-0008 (URL, collections, i18n), ADR-0009 (CSP).

## Inventaire du 2026-10-14

Source en lecture seule : un dépôt local de l'ancien blog (aucune écriture dans ce dépôt). Les commandes se lancent depuis ce dossier (depuis le dossier des articles de la source, avec `command grep` et `command ls` sur le poste de l'orchestrateur).

| Fait | Valeur relevée | Commande |
|------|----------------|----------|
| Fichiers | 28, tous `.md` (aucun MDX) | `command ls \| wc -l` ; `command ls \| sed 's/.*\\.//' \| sort \| uniq -c` |
| Volume | 40 399 mots fichiers entiers (933 à 2 496 par fichier) ; 36 553 mots de corps selon `countWords` (829 à 2 190, soit 4 à 10 min de lecture à 230 mots/min) | `command cat *.md \| wc -w` ; corps : `countWords` de `src/lib/text.ts` |
| Brouillons | 0 | `command grep -l '^draft: true' *.md \| wc -l` |
| Dates | dernier `pubDate` : 2026-09-22 ; aucune date future | `command grep -h '^pubDate:' *.md \| sort \| tail -1` |
| `faq`, `excerpt`, `updatedDate`, `toolsMentioned` | 0 article | `command grep -l '^faq:' *.md \| wc -l` |
| Catégories | 5 : Business 4, Méthode 5, Métiers 7, Outils 5, Pilotage 7 | `command grep -h '^category:' *.md \| sort \| uniq -c` |
| Tags | 56, dont 37 portés par un seul article et 19 par deux ou plus | `command grep -h '^tags:' *.md \| command grep -o '"[^"]*"' \| sort \| uniq -c \| wc -l` |
| Séries | 6 pour 26 articles : « L'agence digitale augmentée » 5, « Les métiers à l'ère agentic » 5, « Transformer l'agence » 5, « La boîte à outils agentic » 4, « Les nouveaux risques projet » 4, « Software-Driven Development » 3 | `command grep -h '^series:' *.md \| sort \| uniq -c` |
| Images | 22 distinctes pour 28 articles, 6 partagées par deux articles ; `public/blog/` contient 25 fichiers (2,0 Mo), dont 3 inutilisés (`blog_post_12_1768850610966.webp`, `markdown.webp`, `welcome.webp`) | `command grep -h '^image:' *.md \| sort -u \| wc -l` |
| Textes alternatifs | 19 articles sur 28 sans `imageAlt` | `command grep -L '^imageAlt:' *.md \| wc -l` |
| Descriptions | 26 de plus de 160 caractères (de 64 à 252 au total) | `command grep -h '^description:' *.md \| awk '{ l=length($0)-length("description: \"\""); if (l>160) n++ } END {print n}'` |
| Titres | 18 de plus de 60 caractères (14 sur une ligne + 4 sur deux lignes), maximum 86 ; 26 de plus de 43 | `command grep -h '^title:' *.md \| awk '{ l=length($0)-length("title: \"\""); if (l>60) n++ } END {print n}'` |
| Frontmatter sur deux lignes | 10 fichiers (titre ou description coupé sans indentation) | lignes du frontmatter qui ne commencent pas par `clé :` |
| SVG intégrés | 9 articles, dont 8 avec attribut `style` | `command grep -l '<svg' *.md \| wc -l` |
| Tableaux, blocs de code | 4 articles avec tableau, 5 avec bloc de code | `command grep -l '^```' *.md \| wc -l` |
| « Operations Director » | 4 occurrences dans 3 articles | `command grep -o 'Operations Director' *.md \| wc -l` |
| Liens | 9 liens internes dans la source (7 vers des pages non reprises, 2 vers un article sans barre finale ; les liens vers des pages non reprises ont été retirés le 2026-10-20) ; 8 URL externes distinctes (7 dépôts GitHub, 1 article arXiv) | `command grep -ho '](\\(https\\?://[^)]*\\|/[^)]*\\))' *.md \| sort \| uniq -c` |

Écarts avec la décomposition du sprint : le décompte « environ 38 000 mots (871 à 2 424) » correspond à une autre méthode de comptage ; les autres chiffres sont confirmés.

## Décisions de migration (E1 à E12, arbitrées le 2026-10-14)

Appliquées sans attendre le PO (sections « Arbitrages de l'orchestrateur et du PO » de `tasks/README.md`) ; les contenus restent à valider par lots (`contenu-a-valider.md`).

| # | Décision |
|---|----------|
| E1 | Description de 50 à 160 caractères, réécrite à la main par lots de 5, sans troncature |
| E2 | `seoTitle` (20 à 60 caractères) obligatoire quand `title` dépasse 60 ; `title` (h1) inchangé |
| E3 | `imageAlt` rédigé en regardant chaque image ; contrôle bloquant |
| E4 | Copier seulement les 22 images utilisées ; le PO déclare l'origine et le droit d'usage ; `aspect-ratio` CSS pour les 2 formats atypiques |
| E5 | **Décision du PO** : l'agent rédige 3 FAQ de 3 questions pour 3 articles qu'il choisit, à partir du contenu de l'article seul, marquées à valider |
| E6 | **Décision du PO** : ordre des séries déduit des pieds d'article (« prochain article : … »), à valider ; `seriesOrder` obligatoire avec `series` |
| E7 | Pages de tags seulement pour les tags portés par 2 articles ou plus (`tagsWithPages`) ; les autres restent du texte non lié ; normalisation des synonymes |
| E8 | Les URL d'index changent (`/blog/category/` devient `/blog/categorie/`, `/blog/tags/` devient `/blog/tag/`, `/blog/<n>/` devient `/blog/page/<n>/`) |
| E9 | CSP sans style en ligne : SVG convertis en classes et attributs, contrôle bloquant « aucun `style` en ligne », `markdown.syntaxHighlight: false` |
| E10 | Liens vers les pages non reprises : **retirés le 2026-10-20** (décision du PO), le texte est conservé ; la boîte à outils sera recréée plus tard sous `/labo/` ; autres liens réécrits au format cible |
| E11 | **Décision du PO** : note d'auteur sobre alignée sur le profil du site (COO/CTO, Delivery Manager, architecte e-commerce, IA appliquée au delivery) vers `/parcours/` ; les 3 pieds biographiques sont retirés, la phrase narrative adaptée ; aucune mention d'« Operations Director » |
| E12 | Non migrés : table des matières, bloc auteur et CTA de marque, boutons de partage, plugin de temps de lecture (remplacé par `readingMinutes`) |
| E13 | Titres et descriptions normalisés en une ligne ; on garde `.md` |

## Contrats publiés en phase 0

| Contrat | Module | Rôle |
|---------|--------|------|
| C1 schéma | `src/content/schemas/blog.ts` (`createBlogSchema(image)`, `BlogData`) | frontmatter : `strictObject`, `validated` à `false` par défaut, `seoTitle` obligatoire au-delà de 60 caractères, `image` avec `imageAlt`, `series` avec `seriesOrder` |
| C2 collection | `src/content/collections/blog.ts` | `glob('fr/*.{md,mdx}')` sous `src/content/blog` ; identifiant d'entrée `fr/<slug>` ; une collection vide ne fait pas échouer le build (un avertissement du chargeur) |
| C3 accès | `src/lib/blog.ts` (fonctions pures) et `src/lib/blog-source.ts` (`getPublishedPosts`, seul appel de `getCollection('blog')`) | publication (`isPublished`), tri, chemins, pagination, séries, tags |
| Blocs défilants | `src/lib/rehype-article-blocks.ts` | `pre` focalisable, tableau enveloppé dans `div.table-scroll` (`tabindex="0"`, `role="region"`, `aria-label`) |

Précisions de contrat :

- `slugOf('fr/la-spec')` renvoie `la-spec` (seul convertisseur d'identifiant).
- `tagsWithPages(entries, min = 2)` renvoie les **libellés** de tags (triés par slug) ; le chemin d'une page de tag est `tagPath(slugify(libellé))`. Deux libellés qui donnent le même slug font échouer avec les deux libellés cités.
- `seriesNeighbors(...).index` commence à 0.
- `paginate(items, page, size = 12)` renvoie `null` hors bornes ; une liste vide reste une page 1 vide. `pagePath(1)` vaut `/blog/` (la page 1 n'a pas d'URL `/blog/page/1/`).
- `isPublished` compare `pubDate` à l'instant du build : un `pubDate` sans heure vaut minuit UTC, donc publié au redéploiement de 06:00 UTC du jour même.
- **Astro 7 et Markdown** : le rendu par défaut est Sätteri. `markdown.rehypePlugins` exige `@astrojs/markdown-remark` (non installé) : le plugin des blocs défilants est donc un plugin HAST de `satteri({ hastPlugins })`, déclaré dans `astro.config.mjs` avec `syntaxHighlight: false`. Les plugins `unified` (remark/rehype) ne sont pas utilisables sans cette dépendance.

## Navigation (décisions T-011-01, 2026-10-15)

Décidées par l'agent selon les arbitrages du 2026-10-14 (aucune attente du PO) ; la table de séries et les tags normalisés sont inscrits dans `contenu-a-valider.md` pour validation (à la charge de l'orchestrateur).

| Sujet | Décision |
|-------|----------|
| Taille de page | 12 articles par page : 28 articles = 3 pages (`/blog/`, `/blog/page/2/`, `/blog/page/3/`). `/blog/page/1/` n'existe pas. |
| Catégories | 5 pages, une par catégorie du schéma ayant au moins un article publié : Business (4), Méthode (5), Métiers (7), Outils (5), Pilotage (7). Slugs sans accent (`methode`, `metiers`…). |
| Tags | Pages seulement pour les tags portés par 2 articles ou plus (`tagPages`) : 19 pages. Les autres tags (34 après normalisation) sont affichés en texte non lié : aucune page mince, aucun `noindex` à gérer (E7). |
| Normalisation des tags avant migration | « Méthodologie » devient « Méthode », « Management de projet » devient « Gestion de projet », « Rentabilité » devient « ROI » (doublons supprimés dans un même article) : 56 tags d'origine, 53 après normalisation. « Outils », « Méthode » et « Pilotage » restent des tags malgré leur homonymie avec des catégories. Les tags sont ceux du frontmatter des articles. |
| Taille maximale d'une taxonomie | Une page de catégorie, de tag ou de série n'est pas paginée : elle liste tous ses articles. Au-delà de `MAX_TAXONOMY_ARTICLES` (24, soit deux pages de liste), le build échoue (« pagination de taxonomie non prévue ») plutôt que de tronquer. Le tag « IA générative » compte 17 articles : la limite de 12 supposée par la décomposition (qui ne comptait que les catégories, 7 au plus) aurait fait échouer le build. |
| Catégories : libellé et description | Le libellé est la valeur de l'énumération du schéma ; titre de page « <nom> (N articles) » ; description « Les N articles de la catégorie <nom> du blog de Thibaut Monier, du plus récent au plus ancien. » |

### Ordre de lecture des séries (`seriesOrder`, E6)

Déduit des pieds d'article (« Prochain article : … », « Dernier article de la série… »), à valider par le PO. Les `pubDate` ne donnent pas l'ordre (dates identiques ou inversées). La source de vérité du contenu est le champ `seriesOrder` de chaque article ; le contrôle de contenu vérifie que les ordres sont uniques dans chaque série.

| Série | Ordre |
|-------|-------|
| L'agence digitale augmentée (5) | 1 `le-vrai-developpeur-augmente-c-est-le-chef`, 2 `la-spec-est-le-nouveau-code`, 3 `le-junior-n-est-pas-le-probleme-le`, 4 `agence-digitale-le-binome-augmente-remplace-t-il`, 5 `ce-que-l-ia-ne-fera-jamais-a-votre-place` |
| Les métiers à l'ère agentic (5) | 1 `amorcer-un-projet-agentic-coding-le-role-amoa`, 2 `chiffrer-et-rassurer-autour-de-l-agentic-coding`, 3 `piloter-un-projet-agentic-les-nouveaux-indicateurs`, 4 `mesurer-le-gain-reel-de-l-agentic-coding`, 5 `securite-agentic-rassurer-le-client-et-prouver-la-qualite` |
| Transformer l'agence (5) | 1 `comment-mesurer-le-roi-reel-d-un-workflow`, 2 `recruter-et-evaluer-un-developpeur-a-l-ere-de-l-ia`, 3 `la-gestion-de-projet-ia-est-une-discipline`, 4 `ce-que-le-client-doit-savoir-sur-l`, 5 `esn-agence-freelance-augmente-qui-survit-a-l-ia` |
| La boîte à outils agentic (4) | 1 `outils-agentic-engineering-qui-meritent-un-essai`, 2 `reduire-la-facture-token-caveman-codegraph`, 3 `donner-a-lire-a-un-agent-markitdown-et-mq`, 4 `sortir-du-rendu-generique-hallmark-designmd-modern-web-guidance` |
| Les nouveaux risques projet (4) | 1 `la-dette-de-contexte-le-nouveau-risque-cache`, 2 `shadow-it-agentique-perdre-la-trace-de-ses-agents`, 3 `le-cout-cache-de-la-supervision-agentique`, 4 `l-ia-vous-accelere-t-elle-ou-vous-precipite-t-elle` |
| Software-Driven Development (3) | 1 `cycle-en-v-agile-sdd-comparaison-timelines`, 2 `projet-classique-vs-sdd-ia-quelles-equipes-humaines`, 3 `du-vibe-coding-a-l-agentic-engineering` |

Hors série : `certifications-ia-signal-ou-bruit-au-recrutement` et `la-boite-a-outils-du-poweruser`. Les pieds « Prochain article » restants pointent tous vers un article existant ; ceux qui annonçaient un contenu inexistant ont été supprimés le 2026-10-20, et les numéros de série périmés (« série 2 », « série 3 ») ont été retirés ou remplacés par le nom de la série.

### Routes

| Page | URL | Générateur |
|------|-----|------------|
| Liste | `/blog/`, `/blog/page/<n>/` (n ≥ 2) | `src/pages/blog/index.astro`, `page/[page]/index.astro` |
| Article | `/blog/<slug>/` | `[slug]/index.astro` (`getPublishedPosts()`) |
| Catégorie | `/blog/categorie/<slug>/` | `categorie/[categorie]/index.astro` |
| Tag | `/blog/tag/<slug>/` | `tag/[tag]/index.astro` (tags à 2 articles ou plus) |
| Série | `/blog/serie/<slug>/` | `serie/[serie]/index.astro` |

Ajouter une catégorie : l'ajouter à l'énumération `BLOG_CATEGORIES` de `src/content/schemas/blog.ts` (contrat C1 : demande à l'orchestrateur), puis publier un article de cette catégorie ; la page apparaît seule. Le filtre des catégories est un `details` replié sous 768 px et déplié au-dessus (`::details-content`), sans JavaScript ; les pages de liste n'utilisent ni `rel="prev"` ni `rel="next"`.

## Images et licences (T-009-12)

22 fichiers WebP copiés sans modification depuis `public/blog/` de la source vers `src/assets/blog/` (1,8 Mo, 227 664 octets au plus par fichier, aucun bloc EXIF ; sommes de contrôle vérifiées identiques à la source le 2026-10-15). Non migrés : `blog_post_12_1768850610966.webp`, `markdown.webp`, `welcome.webp` (inutilisés) et `og-image.png` (visuel de marque de l'ancien site). 20 images font 1200 × 630 ; `kanban-timelines-methodes.webp` (1200 × 943) et `team-equipes-humaines.webp` (1200 × 900) sont cadrées par CSS (`aspect-ratio`, `object-fit: cover`), jamais recadrées. Aucune image d'article ne vient d'Unsplash d'après la source (les références Unsplash sont dans `src/pages/services.astro`, non migré).

**À faire par le PO (CR-6)** : l'origine et le droit d'usage des 22 couvertures ne sont documentés nulle part dans la source ; plusieurs ressemblent à des photographies de banque d'images (par exemple `blog_post_1_1768848683359.webp`, `kanban-timelines-methodes.webp`). Déclarer création, génération ou achat, avec la licence, puis compléter le tableau.

| Fichier | Articles | SHA-256 (12 premiers caractères) | Origine | Droit d'usage | Date |
|---------|----------|----------------------------------|---------|---------------|------|
| `blog_post_10_1768850582328.webp` | `esn-agence-freelance-augmente-qui-survit-a-l-ia` | `47a0a83a2969` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_11_1768850597259.webp` | `la-dette-de-contexte-le-nouveau-risque-cache` | `ab4097b5466c` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_1_1768848683359.webp` | `le-vrai-developpeur-augmente-c-est-le-chef` | `14813e22577c` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_2_1768848698871.webp` | `la-spec-est-le-nouveau-code` | `b1acb933378d` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_3_1768848720552.webp` | `du-vibe-coding-a-l-agentic-engineering`, `le-junior-n-est-pas-le-probleme-le` | `ae03838dfc96` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_4_1768848735398.webp` | `agence-digitale-le-binome-augmente-remplace-t-il`, `amorcer-un-projet-agentic-coding-le-role-amoa` | `0f658e21c3e9` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_5_1768848750922.webp` | `ce-que-l-ia-ne-fera-jamais-a-votre-place`, `chiffrer-et-rassurer-autour-de-l-agentic-coding` | `c80835f41085` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_6_1768848765056.webp` | `comment-mesurer-le-roi-reel-d-un-workflow`, `piloter-un-projet-agentic-les-nouveaux-indicateurs` | `eafe83ec7a90` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_7_1768850538178.webp` | `mesurer-le-gain-reel-de-l-agentic-coding`, `recruter-et-evaluer-un-developpeur-a-l-ere-de-l-ia` | `8eb85a67ac23` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_8_1768850554501.webp` | `la-gestion-de-projet-ia-est-une-discipline` | `226c68edb677` | à déclarer par le PO | à déclarer par le PO | - |
| `blog_post_9_1768850568154.webp` | `ce-que-le-client-doit-savoir-sur-l`, `securite-agentic-rassurer-le-client-et-prouver-la-qualite` | `582ab29b7856` | à déclarer par le PO | à déclarer par le PO | - |
| `boite-a-outils-poweruser.webp` | `la-boite-a-outils-du-poweruser` | `8fe985298e9d` | à déclarer par le PO | à déclarer par le PO | - |
| `certifications-ia.webp` | `certifications-ia-signal-ou-bruit-au-recrutement` | `a49091e2116f` | à déclarer par le PO | à déclarer par le PO | - |
| `cout-token-reseau.webp` | `reduire-la-facture-token-caveman-codegraph` | `a7c613e9e52e` | à déclarer par le PO | à déclarer par le PO | - |
| `design-nuancier.webp` | `sortir-du-rendu-generique-hallmark-designmd-modern-web-guidance` | `dec1034fce9c` | à déclarer par le PO | à déclarer par le PO | - |
| `documents-ingestion.webp` | `donner-a-lire-a-un-agent-markitdown-et-mq` | `ac29c5c9fc98` | à déclarer par le PO | à déclarer par le PO | - |
| `kanban-timelines-methodes.webp` | `cycle-en-v-agile-sdd-comparaison-timelines` | `6cfb02c7cd1d` | à déclarer par le PO | à déclarer par le PO | - |
| `outils-etabli.webp` | `outils-agentic-engineering-qui-meritent-un-essai` | `0707f210beb5` | à déclarer par le PO | à déclarer par le PO | - |
| `shadow-it-agents.webp` | `shadow-it-agentique-perdre-la-trace-de-ses-agents` | `84a054a059b0` | à déclarer par le PO | à déclarer par le PO | - |
| `supervision-relecture.webp` | `le-cout-cache-de-la-supervision-agentique` | `d1da768982a7` | à déclarer par le PO | à déclarer par le PO | - |
| `team-equipes-humaines.webp` | `projet-classique-vs-sdd-ia-quelles-equipes-humaines` | `1f8d8f6106c7` | à déclarer par le PO | à déclarer par le PO | - |
| `vitesse-precipitation.webp` | `l-ia-vous-accelere-t-elle-ou-vous-precipite-t-elle` | `1183ce4e702e` | à déclarer par le PO | à déclarer par le PO | - |

## Structure de la collection et schéma

Fichiers : `src/content/blog/fr/<slug>.md` (identifiant d'entrée `fr/<slug>`) ; images : `src/assets/blog/<fichier>.webp`, référencées par `image: "../../../assets/blog/<fichier>.webp"`. Les 28 fichiers sont en `.md` (le glob accepte aussi `.mdx`, mais MDX interprète les `<` et `{` du texte).

| Champ | Règle |
|-------|-------|
| `title` | 1 à 100 caractères ; c'est le h1 |
| `seoTitle` | 20 à 60 caractères ; obligatoire quand `title` dépasse 60 ; c'est le `<title>` |
| `description` | 50 à 160 caractères, jamais tronquée ; méta description et extrait |
| `pubDate` | date ; sans heure = minuit UTC ; l'article n'est publié qu'à partir de cette date |
| `updatedDate` | optionnelle, jamais avant `pubDate` |
| `image`, `imageAlt` | ensemble ou aucun des deux ; l'alt décrit ce que l'on voit |
| `excerpt` | optionnel ; sinon `description` |
| `tags` | libellés ; un tag n'a une page qu'à partir de 2 articles |
| `category` | énumération du schéma (Business, Méthode, Métiers, Outils, Pilotage) |
| `series`, `seriesOrder` | ensemble ; ordre unique dans la série (contrôlé) |
| `draft` | `true` : aucun rendu |
| `validated` | validation du PO du lot ; **jamais passé à `true` par un agent** ; `REQUIRE_VALIDATED_CONTENT=1` fait échouer le build tant qu'un article publié n'est pas validé |
| `faq` | 1 question ou plus : section repliable et, côté lot B, données structurées |

Contrôle de contenu (`scripts/checks/blog.content.check.ts`, avant le build) : 28 articles publiés (constante `EXPECTED_ARTICLES`, message « Blog : 27 articles trouvés, 28 attendus »), schéma, slugs uniques, aucun attribut `style` ni balise `script` dans le corps, aucun titre de niveau 1 ni saut de niveau, liens internes au format cible, images présentes de 250 Ko au plus sans bloc EXIF, données personnelles, mention interdite « Operations Director » (E11), ordres de série uniques et un seul lecteur de la collection (`getCollection('blog')` n'est appelé que par `src/lib/blog-source.ts`).

## Ajouter un article

1. Créer `src/content/blog/fr/<slug>.md` (slug en kebab-case, jamais renommé ensuite : ADR-0008) avec `title`, `description` (50 à 160 caractères), `pubDate`, `category`, `tags`.
2. Si le titre dépasse 60 caractères, ajouter `seoTitle` (20 à 60).
3. Copier l'image WebP (1200 × 630 de préférence, 250 Ko au plus, sans EXIF) dans `src/assets/blog/`, renseigner `image` et `imageAlt`, déclarer l'origine et la licence dans le tableau ci-dessus.
4. Série : `series` et `seriesOrder` (ordre unique) ; sinon rien.
5. Corps en Markdown : titres à partir de `##` sans saut de niveau, liens internes avec barre finale, aucun HTML avec `style`, schémas SVG avec `<title>`, `role="img"` et classes (`w-full h-auto`), jamais d'attribut `style`.
6. `make checks` puis `make build` ; l'article est `validated: false` tant que le PO ne l'a pas relu.

## Publication programmée

`isPublished` compare `pubDate` à l'instant du build : un article daté de demain n'a ni page, ni entrée de sitemap, ni entrée de flux aujourd'hui. Il est publié au premier redéploiement après sa date : le workflow `scheduled.yml` relance le déploiement chaque jour à **06:00 UTC** ; une `pubDate` sans heure vaut minuit UTC, donc un article daté du jour J paraît au redéploiement de 06:00 UTC du jour J. Le contrôle `blog-schedule.dist.check.ts` fait échouer le build si `dist/` contient la page, le sitemap ou le flux d'un article non publié (message avec le slug).

## Origine des articles

Les 28 articles viennent d'un ancien blog. Ils ont été repris à la main dans `src/content/blog/fr/` ; l'outil de migration ponctuelle, la mention d'origine, le champ `originalUrl` et la table de redirections ont été retirés le 2026-10-20 (décision du PO) : le site ne référence plus l'ancien blog.

## Composants, styles et recherche

Composants dans `src/components/blog/` (`ArticleCard`, `Faq`, `AuthorNote`, `Pagination`, `TaxonomyList`, `SeriesNav`, `TagList`, `Breadcrumb`, `PostDate`, `SearchBox`), gabarit `src/layouts/ArticleLayout.astro`, styles de lecture `src/styles/article.css` (largeur de lecture 75 caractères ; les SVG reprennent les jetons du site par des alias `--color-*` ; `diagram-frame` garde un fond clair pour les schémas aux couleurs figées).

Rappel CSP (ADR-0009) : aucun attribut `style` ni script inline, pas de coloration syntaxique (`markdown.syntaxHighlight: false`), blocs de code en monospace défilant et focalisables. Les textes d'espaces insécables avant « : ; ? ! » concernent les valeurs écrites à la main (description, titre SEO, texte alternatif, FAQ).

## Écarts constatés au sprint 3 (lot A)

| # | Constat | Décision appliquée |
|---|---------|--------------------|
| A1 | Le tag « IA générative » compte 17 articles et « Agentic engineering » 10 : plus que la page de 12 articles prévue pour les taxonomies. | Pages de taxonomie non paginées, limite 24 articles avec erreur de build explicite. |
| A2 | Pagefind renvoie un résultat pour une requête absurde (« zzzzqq » surligne le « Z » de « colonnes X, Y, Z » de `la-spec-est-le-nouveau-code`). | `isRelevant` (`src/lib/search.ts`) garde un résultat seulement si un mot surligné partage 3 lettres de début avec la requête. |
| A3 | Les liens vers les pages non reprises de l'ancien site mènent à une page protégée. | Liens retirés, texte conservé (décision du PO du 2026-10-20). |
| A4 | Une mention d'« Operations Director » subsistait dans le récit de `le-vrai-developpeur-augmente-c-est-le-chef`. | Phrase adaptée (ancien rôle de delivery manager et directeur technique d'une agence digitale) ; contrôle bloquant sur la mention. |
| A5 | Les nombres d'étoiles GitHub des articles d'outils dataient du 22 septembre 2026. | Relevés par l'API GitHub le 2026-10-15 et mis à jour avec leur date dans les 4 articles concernés (`reduire-la-facture-token-caveman-codegraph`, `donner-a-lire-a-un-agent-markitdown-et-mq`, `outils-agentic-engineering-qui-meritent-un-essai`, `sortir-du-rendu-generique-hallmark-designmd-modern-web-guidance`). Les licences affichées par GitHub concordent, sauf Caveman : corrigé le 2026-10-20 (le dépôt est entièrement sous Apache 2.0 depuis la version 3.0.0, relevé du fichier `LICENSING.md`). |
| A7 | Citations d'un tiers introuvables dans `le-cout-cache-de-la-supervision-agentique` et deux autres articles. | Retirées le 2026-10-20 (décision du PO) : l'argument est reformulé sans attribution. |
