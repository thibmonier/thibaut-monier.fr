# Guide du blog

Migration des 28 articles d'Agentic Agency (US-009). Ce guide est créé en phase 0 du sprint 3 (T-009-01) : inventaire de la source, décisions de migration et contrats publiés. Le lot A le complète (composants, migration, relecture, T-009-27). Décisions structurantes : ADR-0008 (URL, collections, i18n), ADR-0009 (CSP).

## Inventaire du 2026-10-14

Source en lecture seule : `/Users/tmonier/Projects/blog/src/content/blog/` (aucune écriture dans ce dépôt). Les commandes se lancent depuis ce dossier (`cd /Users/tmonier/Projects/blog/src/content/blog`, avec `command grep` et `command ls` sur le poste de l'orchestrateur).

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
| « Agentic Agency » dans les corps | 0 | `command grep -il 'Agentic Agency' *.md \| wc -l` |
| Liens | 9 liens internes (7 vers des pages non migrées : `/services/sites-ia`, `/methode` ×2, `/boite-a-outils` ×2, `/boite-a-outils/zsh`, `/blog/category/outils` ; 2 vers un article sans barre finale) ; 8 URL externes distinctes (7 dépôts GitHub, 1 article arXiv) | `command grep -ho '](\\(https\\?://[^)]*\\|/[^)]*\\))' *.md \| sort \| uniq -c` |

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
| E8 | Les URL d'index changent (`/blog/category/` devient `/blog/categorie/`, `/blog/tags/` devient `/blog/tag/`, `/blog/<n>/` devient `/blog/page/<n>/`) : couvertes par la table de redirections |
| E9 | CSP sans style en ligne : SVG convertis en classes et attributs, contrôle bloquant « aucun `style` en ligne », `markdown.syntaxHighlight: false` |
| E10 | Liens vers les pages non migrées : URL absolue de l'ancien site tant que la Boîte à outils n'existe pas (à reprendre vers `/labo/` au sprint 4) ; autres liens réécrits au format cible |
| E11 | **Décision du PO** : note d'auteur sobre alignée sur le profil du site (COO/CTO, Delivery Manager, architecte e-commerce, IA appliquée au delivery) vers `/parcours/` ; les 3 pieds biographiques sont retirés, la phrase narrative adaptée ; aucune mention d'« Operations Director » |
| E12 | Non migrés : table des matières, bloc auteur et CTA de marque, boutons de partage, plugin de temps de lecture (remplacé par `readingMinutes`) |
| E13 | Titres et descriptions normalisés en une ligne ; on garde `.md` |

## Contrats publiés en phase 0

| Contrat | Module | Rôle |
|---------|--------|------|
| C1 schéma | `src/content/schemas/blog.ts` (`createBlogSchema(image)`, `BlogData`) | frontmatter : `strictObject`, `validated` à `false` par défaut, `seoTitle` obligatoire au-delà de 60 caractères, `image` avec `imageAlt`, `series` avec `seriesOrder`, `originalUrl` (https, `agentic-agency.fr`) avec `originalPublishedAt` |
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
