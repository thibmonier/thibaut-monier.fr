# Guide du SEO technique

Données structurées (JSON-LD), sitemap, `robots.txt` et `llms.txt` (US-024). Contrats : C4 (`src/lib/site-url.ts`, seul module qui rend une URL absolue) et C5 (`src/lib/page-meta.ts`). Décisions structurantes : ADR-0008 (URL), ADR-0009 (CSP).

## Décisions du 2026-10-15 (T-024-01)

Statut : proposées par le lot B, **à valider par le PO**.

| Sujet | Décision |
|-------|----------|
| Types par page | `Person` sur l'accueil ; `ProfilePage` (avec `Person` en `mainEntity`) sur `/parcours/` ; `BlogPosting` sur les articles (le blog source émettait `TechArticle`, l'US demande `BlogPosting`) ; `FAQPage` sur les articles qui ont une FAQ ; `SoftwareSourceCode` sur les fiches de plugins ; `ItemList` sur `/open-source/` ; `BreadcrumbList` sur toutes les pages indexables, accueil compris (un seul élément) |
| Types écartés | Pas d'`Article` pour l'étude de cas career-ops ni pour tailsfadmin (YAGNI) ; pas de `WebSite` ni d'`Organization` |
| Liste blanche de `Person` | `name`, `jobTitle`, `url`, `sameAs` (LinkedIn et GitHub), `address` réduit au pays (`PostalAddress` avec `addressCountry` seul). Aucune autre propriété : ni téléphone, ni date de naissance, ni adresse précise |
| `lastmod` du sitemap | Date du contenu quand elle existe (`updatedDate ?? pubDate` pour un article, `updatedDate` d'une page légale), sinon date du build ; jamais une date future (écart E18) |
| `llms.txt` | Généré au build au format [llmstxt.org](https://llmstxt.org/) : titre, citation de résumé, sections de liens `- [titre](url): description`, au moins 10 liens (profil, parcours, plugins, projets, articles) |
| Pages exclues du sitemap | Les pages `noindex` : `/contact/merci/`, `/recherche/`, la 404. Le contrôle `sitemap-coherence` compare la liste d'exclusion au HTML réel |
| `hreflang` | Aucun tant que l'anglais n'est pas activé (sprint 5) |
| Insertion | Un script `application/ld+json` par objet : bloc de données non exécutable, hors du périmètre de `script-src` (ADR-0009) |

## Fonctionnement

### Un seul module de construction

Aucune page n'assemble de JSON-LD à la main : tout passe par `src/lib/jsonld/` (un fichier par type, plus `index.ts` avec `serializeJsonLd`). Les types sont écrits à la main (aucune dépendance `schema-dts`). Toutes les URL passent par `absoluteUrl` de `src/lib/site-url.ts` (contrat C4).

| Type | Constructeur | Posé par |
|------|--------------|----------|
| `BreadcrumbList` | `buildBreadcrumbList` | `Seo.astro`, sur toute page indexable |
| `BlogPosting`, `FAQPage` | `buildBlogPosting`, `buildFaqPage` | `Seo.astro`, quand la page passe `article` (contrat C5) |
| `Person` ; `ProfilePage` | `buildPerson` ; `buildProfilePage` | `PersonJsonLd.astro` (accueil ; `/parcours/`) |
| `SoftwareSourceCode` | `buildSoftwareSourceCode` | `PluginLayout.astro` |
| `ItemList` | `buildItemList` | `src/pages/open-source/index.astro` |

Les pages qui ajoutent un type placent `<JsonLd slot="head" data={[…]} />` : le layout expose le slot `head`.

### Fil d'Ariane

Explicite si la page passe `breadcrumb` ; sinon dérivé du chemin par `src/lib/breadcrumb.ts` (segments connus seulement, `/blog/categorie/` ou `/open-source/sylius/` n'ayant pas de page). Le dernier maillon est le titre de la page. Un maillon intermédiaire sans lien est retiré du JSON-LD. Les pages du blog passent toujours un fil explicite (le libellé `Méthode` ne se déduit pas de `methode`).

### Sérialisation et poids

`<`, `>` et `&` sont échappés en séquences Unicode : un titre contenant `</script>` ne ferme pas la balise (test d'injection). Le JSON-LD d'une page pèse moins de 5 Ko (contrôlé).

### Liste blanche de `Person`

`assertPersonProperties` (`src/lib/jsonld/person.ts`) refuse toute propriété hors `name`, `jobTitle`, `url`, `sameAs`, `address` (pays seul). Message : « JSON-LD Person : propriété interdite 'telephone' ». Le contrôle de build réutilise la même fonction.

### Sitemap, robots.txt, llms.txt

- `@astrojs/sitemap` est dans le bloc `integrations` d'`astro.config.mjs` ; `filter` retire les pages de `SITEMAP_EXCLUDED_PATHS` (`src/lib/sitemap.ts`), `serialize` renseigne `lastmod` par `lastmodFor` (date du contenu lue dans le frontmatter des articles et des pages légales, sinon date du build, jamais le futur).
- `src/pages/robots.txt.ts` autorise tout et référence `/sitemap-index.xml`.
- `src/pages/llms.txt.ts` s'appuie sur `loadLlms` (`src/lib/site-pages.ts`) : pages principales, projets, plugins et articles publiés ; au moins 10 liens, sinon le build échoue.
- `nginx.conf` sert ces fichiers avec leur type et le charset UTF-8 (`text/plain`, `application/xml`), en revalidation, et réinclut le snippet de sécurité.

### Contrôles de build

| Contrôle | Phase | Échoue si… | Exemple de message |
|----------|-------|-----------|--------------------|
| `jsonld` | dist | JSON invalide, type attendu absent, `Person` hors liste blanche, `FAQPage` sans FAQ visible, plus de 5 Ko | `JSON-LD BlogPosting invalide : datePublished requis (la-spec)` |
| `meta` | dist | titre de plus de 60 caractères, description hors de 50 à 160, doublon | `Titre trop long (72 > 60) : /blog/x/` |
| `sitemap-coherence` | dist | page indexable absente du sitemap, page `noindex` présente, entrée sans page | `Page noindex présente dans le sitemap : /contact/merci/` |
| `no-hardcoded-domain` | content | le domaine du site apparaît dans `src/` hors liste blanche (pages légales, objet du message du formulaire) | `Domaine du site en dur : src/lib/x.ts:2` |

`CHECK_META_EXCLUDE_BLOG=1` limite le contrôle `meta` aux pages hors blog tant que les articles ne sont pas relus.

### Ajouter un type de données structurées

1. Écrire le test dans `tests/unit/lib/jsonld/`, puis le constructeur dans `src/lib/jsonld/<type>.ts`.
2. Le poser depuis la page (slot `head`) ou depuis `Seo.astro` s'il se déduit du contrat C5.
3. Ajouter le type attendu à `expectedTypes` de `scripts/checks/lib/jsonld.ts` si la page est reconnaissable par son chemin.

### Variable

`PUBLIC_SITE_URL` : origine des URL absolues, sans barre finale. Vide, le repli est `https://thibaut-monier.fr` (`astro.config.mjs`). Tout est relatif à cette origine : un sous-domaine provisoire change tous les fichiers générés d'un coup.

### Écarts connus

- Aucune page du sprint 1 ou 2 n'a eu de titre ou de description hors limites une fois `buildTitle` corrigé (relevé du 2026-10-15 : 30 pages, titres de 24 à 59 caractères, descriptions de 110 à 160). Le suffixe « — Thibaut Monier » n'est ajouté que s'il tient dans 60 caractères.
- Les scénarios sur les articles réels (`BlogPosting`, `FAQPage`, titres du blog) se vérifient après la fusion du lot A.
