# ADR-0008 : Modèle de contenu, structure des URL et i18n

## Statut
Accepté (2026-10-14, validé par le PO)

## Contexte
Il y a 7 types de contenu (profil, expériences, blog, outils, tests d'outils, plugins, projets). Le site sera en FR d'abord, avec l'EN au sprint 5 (US-027, US-028), sans refonte. Les 28 articles migrés gardent leurs slugs (US-009, US-010). Le Content Layer est obligatoire depuis Astro 6.

## Décision

**Collections** (définies dans `src/content.config.ts`, schémas Zod ; détail dans `project-management/architecture/content-model.md`)
| Collection | Source | Loader |
|------------|--------|--------|
| `experiences` | `src/data/cv/experiences/*.yaml` (partagé avec Typst) | `glob` |
| `profile`, `skills`, `achievements` | `src/data/cv/*.yaml` (partagés avec Typst) | `file` |
| `comparisons` | `src/data/comparisons.yaml` (comparatifs déclarés, US-018) | `file` |
| `blog` | `src/content/blog/{fr,en}/*.mdx` | `glob` |
| `tools` | `src/content/tools/*.md` (57 fiches migrées) | `glob` |
| `toolTests` | `src/content/tool-tests/{fr,en}/*.mdx` (protocole imposé, US-014) | `glob` |
| `plugins` | `src/content/plugins/{fr,en}/*.mdx` | `glob` |
| `projects` | `src/content/projects/{fr,en}/*.mdx` (tailsfadmin, career-ops ; tailsfadmin n'est **pas** dans `plugins`, qui reste limitée aux 20 plugins Sylius) | `glob` |

Fichiers hors collections : `src/data/oss-metrics.json` (ADR-0006), `src/data/tokens.json` (ADR-0005), `src/config/legal.ts` (US-029). Les collections `blog` et `toolTests` gardent la structure `{fr,en}/` par uniformité, mais seul `fr/` est publié.

**URL** (le français est servi sans préfixe ; l'anglais sous `/en/` avec des slugs traduits si utile)
| Page | FR | EN (sprint 5) |
|------|----|---------------|
| Accueil | `/` | `/en/` |
| Parcours | `/parcours/` | `/en/experience/` |
| Compétences | `/competences/` (filtre `?domaine=` en amélioration progressive : toutes les entrées sont visibles sans JS) | `/en/skills/` |
| Contact | `/contact/`, `/contact/merci/` | `/en/contact/` |
| Blog | `/blog/`, `/blog/<slug-existant>/`, `/blog/categorie/<c>/`, `/blog/tag/<t>/` | — (le blog reste en FR) |
| Labo | `/labo/` (annuaire), `/labo/tests/<slug>/`, `/labo/comparatifs/<categorie>/` | — |
| Open source | `/open-source/`, `/open-source/sylius/<plugin>/`, `/open-source/tailsfadmin/`, `/open-source/career-ops/` | `/en/open-source/…` |
| Légal | `/mentions-legales/`, `/vie-privee/` | `/en/legal/`, `/en/privacy/` |
| Fichiers techniques | `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`, `/llms.txt`, `/thibaut-monier-cv.pdf` | `/en/thibaut-monier-cv.pdf` |

**i18n** : routage natif d'Astro, configuré **dès US-002** :
```js
i18n: { locales: ["fr", "en"], defaultLocale: "fr",
        routing: { prefixDefaultLocale: false }, fallback: { en: "fr" } }
```
Avant US-027, les pages anglaises ne sont pas générées. Le dictionnaire d'interface est dans `src/i18n/{fr,en}.ts`, et les liens `hreflang` sont générés par un composant `Seo` unique.

**Conventions** : barre oblique finale sur toutes les URL (`trailingSlash: "always"`), slugs ASCII en kebab-case, aucun changement de slug après publication (sinon redirection 301 dans `nginx.conf`).

## Alternatives considérées
- **Blog bilingue** : rejeté (charge de traduction, risque R-08). Le blog et le labo restent en FR ; les fiches plugins et le profil passent en EN.
- **Préfixe `/fr/`** : rejeté, car il imposerait des redirections et changerait les URL déjà publiées par Agentic Agency.

## Conséquences
- ✅ L'activation de l'anglais se résume à de l'ajout de contenu, sans refonte (US-027).
- ✅ Les slugs du blog sont conservés, et la table de correspondance d'US-010 devient triviale (`/blog/<slug>/` vers `/blog/<slug>/`).
- ⚠️ Les URL sont publiques et définitives dès le sprint 1 : la table ci-dessus est engageante.
