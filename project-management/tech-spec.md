# Spécification technique : thibaut-monier.fr

| Champ | Valeur |
|-------|--------|
| Version | 1.0 |
| Date | 2026-10-14 |
| Entrées | [PRD 1.1](prd.md), [analyse](analysis/research-summary.md), [backlog](backlog/index.md) (29 US, 103 points) |
| Décisions | [ADR-0001 à ADR-0009](../docs/adr/) |
| Annexes | [C4](architecture/c4.md) · [Modèle de contenu](architecture/content-model.md) · [Intégrations](architecture/integrations.md) · [Sécurité](architecture/security.md) |

---

## 1. Vue d'ensemble de l'architecture

Le site est **statique**, généré par Astro 7.3.8 et servi par **nginx 1.30.5** dans un conteneur sur **Railway** (UE). Il n'a ni serveur applicatif ni base de données. La logique dynamique est poussée :
- **au build** : collections typées, CV PDF Typst, métriques GitHub et Packagist, index Pagefind, images Open Graph ;
- **dans le navigateur**, vers 3 services gratuits : Web3Forms, Umami Cloud et Calendly.

**Principes directeurs**
1. **Prouver plutôt qu'affirmer** (thèse du PRD) : chaque revendication renvoie à une preuve (plugin, PR, test, référence).
2. **Une source de vérité par information** : les données du CV en YAML alimentent à la fois les pages et le PDF ; le contenu éditorial est séparé des métriques automatiques.
3. **Tout est dockerisé**, développement compris. La parité entre le développement et la production est stricte : le service `preview` utilise l'image de production (ADR-0003).
4. **Zéro coût et zéro cookie** (ADR-0002, ADR-0004).
5. **Le site est lui-même une preuve** de rigueur : CI exigeante, ADR, dépôt public.

**Diagrammes** : contexte, conteneurs, composants et flux de déploiement dans [architecture/c4.md](architecture/c4.md).

## 2. Stack et versions

Le détail et la politique de versions sont dans [ADR-0001](../docs/adr/0001-stack-et-versions.md) (relevé du 2026-10-14). Résumé : **Node 26.11.1 · Astro 7.3.8 · TypeScript 6.0.3 · Tailwind 4.3.3 · MDX 8.0.3 · Pagefind 1.5.2 · Typst 0.15.1 · nginx 1.30.5 · Vitest 5.0.4 · Playwright 1.64.1 · axe 4.13 · Lighthouse 13.5 · ESLint 10.12 · Prettier 3.9.10**. Toutes les versions sont exactes, et Renovate se charge des mises à jour. TypeScript reste en 6.x tant que `@astrojs/check` ne prend pas en charge la 7.

## 3. Structure du dépôt

```
thibaut-monier.fr/
├── Dockerfile                  # base → deps → dev → typst → build → test → runtime (ADR-0003)
├── compose.yaml                # dev :4321 · preview :8080 · tools · e2e
├── Makefile                    # dev, preview, lint, test, e2e, ci (Docker uniquement)
├── nginx.conf                  # en-têtes de sécurité, cache, 404, redirections
├── renovate.json
├── astro.config.mjs            # site, i18n (fr, en ; prefixDefaultLocale false), intégrations
├── cv/cv.typ                   # gabarit Typst du CV (ADR-0005)
├── docs/adr/                   # décisions d'architecture
├── scripts/
│   ├── fetch-oss-metrics.ts    # ADR-0006
│   └── checks/                 # pdf-privacy, internal-links, canonical, redirects-coverage, lighthouse
├── src/
│   ├── content.config.ts       # collections et schémas Zod (content-model.md)
│   ├── config/                 # site.ts, contact.ts, legal.ts, analytics.ts
│   ├── data/
│   │   ├── cv/                 # profile.yaml, skills.yaml, achievements.yaml, experiences/*.yaml
│   │   ├── tokens.json  # partagé avec Typst
│   │   └── oss-metrics.json    # cache commité des métriques
│   ├── content/                # blog/, tools/, tool-tests/, plugins/, projects/, legal/
│   ├── i18n/                   # fr.ts, en.ts, utils.ts
│   ├── lib/                    # logique pure et testée (privacy, filters, metrics, seo, events, staleness)
│   ├── components/             # ui/, seo/, cv/, oss/, labo/, contact/
│   ├── layouts/                # BaseLayout, ArticleLayout, ToolTestLayout, PluginLayout
│   ├── pages/                  # routes (ADR-0008) + rss.xml.ts, llms.txt.ts, robots.txt.ts, og/[...route].png.ts
│   └── styles/global.css       # Tailwind 4 (@theme, tokens)
├── tests/
│   ├── unit/                   # Vitest (src/lib)
│   └── e2e/                    # Playwright + axe + contrôle des en-têtes
└── .github/workflows/          # ci.yml, scheduled.yml, metrics.yml
```

## 4. Composants

| Composant | Responsabilité | US |
|-----------|----------------|----|
| `BaseLayout` (`Header`, `Footer`, `ThemeToggle`, `SkipLink`, `Seo`) | Structure, thème clair et sombre (`prefers-color-scheme` + choix persistant), landmarks, liens légaux | US-002, US-029 |
| `Seo` + `lib/seo.ts` | `title`, description, canonical absolue, Open Graph, `hreflang`, JSON-LD par type de page | US-024, US-025, US-027 |
| `Hero` + `CTAPair` + `ProofStrip` | Proposition de valeur, double parcours mission ou poste, 4 preuves chiffrées | US-004 |
| `Timeline` + `ExperienceCard` + `EarlierCareer` | Frise des 10 dernières années, bloc antérieur repliable (`<details>`) | US-005 |
| `SkillFilter` (îlot JS minimal) + `lib/filters.ts` | Filtrage des compétences et réalisations par domaine, sans JS : tout est visible, le filtre est une amélioration progressive | US-006 |
| `CvDownload` | Lien vers le PDF, poids et nombre de pages affichés, événement `cv_download` | US-007 |
| `ContactForm` + `lib/contact.ts` | Motif, validation, champ piège, délai, `fetch` Web3Forms, états `aria-live` | US-008 |
| `ArticleLayout`, `CategoryNav`, `TagList`, `SeriesNav`, `Pagination` | Blog migré | US-009, US-011 |
| `Search` (Pagefind UI) | Recherche plein texte, chargée à la demande | US-012 |
| `ToolTestLayout`, `ToolTestScore`, `ProtocolBlock`, `StalenessBadge` + `lib/staleness.ts` | Protocole de test, note multicritère, « testé le / revérifié le », alerte au-delà de 6 mois | US-014, US-015, US-017 |
| `ToolDirectory`, `TestedBadge` | Annuaire des 57 outils | US-016 |
| `ComparisonTable` | Comparatif par critères communs (`scenarioId`) | US-018 |
| `PluginGrid` + `ThemeFilter` + `PluginCard` | Catalogue filtrable par thème | US-019 |
| `PluginLayout`, `CompatMatrix`, `PluginDeps`, `InstallSnippet`, `Gallery` + `lib/oss-metrics.ts` | Fiche plugin et métriques vivantes | US-020, US-021 |
| `ProjectLayout` | tailsfadmin, étude de cas career-ops | US-022, US-023 |
| `Analytics` + `lib/analytics-events.ts` | Chargement conditionnel d'Umami (DNT, GPC), contrat des événements | US-026 |
| `LocaleSwitcher` + `src/i18n/` | Sélecteur de langue et dictionnaire d'interface | US-027, US-028 |

**Règles de conception** : les composants Astro sont statiques par défaut. Le JavaScript client se limite à des îlots ciblés : thème, filtres, formulaire, recherche, chacun de moins de 5 Ko hors Pagefind. Toute logique non triviale vit dans `src/lib/`, en fonctions pures testées (règle de couverture de 80 %). Les composants dépassant 150 lignes sont découpés (KISS).

## 5. Modèle de données

Il n'y a pas de base de données. Le « modèle » est celui des **collections de contenu**, validées par Zod au build : `experiences`, `profile`, `skills`, `achievements`, `blog`, `tools`, `toolTests`, `plugins`, `projects`, plus deux fichiers de données (`oss-metrics.json`, `tokens.json`). Diagramme entité-relation, schémas Zod et exemples : [architecture/content-model.md](architecture/content-model.md). Emplacements et URL : [ADR-0008](../docs/adr/0008-structure-contenu-urls-i18n.md).

## 6. Contrats d'intégration

Le site n'expose pas d'API. Il consomme GitHub et Packagist au build, et Web3Forms, Umami et Calendly depuis le navigateur. Il génère sitemap, robots, llms.txt, RSS, images OG et PDF. Les requêtes, champs, quotas, cas d'erreur et variables sont détaillés dans [architecture/integrations.md](architecture/integrations.md).

## 7. Sécurité

Le détail est dans [architecture/security.md](architecture/security.md) : modèle de menaces, OWASP Top 10:2025, configuration nginx complète, supply chain. Points clés :
- **Surface minimale** : fichiers statiques, nginx non root, méthodes `GET` et `HEAD` uniquement.
- **En-têtes** : CSP Level 3 stricte (`'self'` plus les domaines Umami et Web3Forms, sans `unsafe-inline`), HSTS avec preload, `nosniff`, Referrer-Policy, Permissions-Policy, COOP, CORP, `frame-ancestors 'none'`.
- **Formulaire** : aucun secret côté client (clé Web3Forms publique par conception), anti-spam par champ piège et délai, données minimales.
- **Supply chain** : versions et digests fixés, actions GitHub épinglées par SHA, `permissions:` minimales, SBOM CycloneDX et scan Trivy de l'image en CI, Renovate.
- **Confidentialité** : liste blanche des données publiées, contrôlée au build ; ni cookie, ni téléphone, ni âge, ni adresse.

## 8. Performance

| Exigence (PRD) | Moyen |
|----------------|-------|
| LCP < 1,5 s, CLS < 0,05, INP < 200 ms | HTML statique ; polices auto-hébergées en WOFF2 (sous-ensemble latin, `font-display: swap`, préchargement de la principale) ; images `astro:assets` en AVIF ou WebP avec dimensions explicites ; CSS Tailwind purgé en ligne pour le critique ; aucun JS bloquant |
| Lighthouse ≥ 95 | Contrôle bloquant en CI (ADR-0007) sur 6 pages types |
| Poids | Page HTML < 50 Ko compressée ; JS total < 30 Ko hors Pagefind (chargé à la demande) ; PDF < 500 Ko |
| Cache | nginx : `immutable`, 1 an pour `/_astro/*` (assets hashés) ; 5 min et `must-revalidate` pour le HTML ; `gzip_static` et `brotli` (les fichiers précompressés au build par @playform/compress, si le module brotli est disponible dans l'image, sinon gzip) |
| Région unique Railway | Mesure du LCP depuis la CI ; proxy Cloudflare gratuit en option si le trafic hors UE devient significatif (ADR-0002) |

## 9. Gestion des erreurs

| Situation | Comportement |
|-----------|--------------|
| Contenu invalide (schéma Zod, référence croisée inconnue, donnée personnelle interdite) | **Build en échec**, avec un message précis : fichier, champ, règle |
| API GitHub ou Packagist en échec | Build **non bloqué** : valeur précédente avec `stale: true`, et avertissement dans le journal (ADR-0006) |
| Échec de compilation Typst | Build en échec : « Génération du CV PDF impossible : <cause> » ; aucun PDF obsolète n'est publié |
| Test d'outil non revérifié depuis plus de 6 mois | Avertissement au build et badge « À revérifier » sur la page (non bloquant) |
| 404 | Page `404.astro` personnalisée (recherche et liens principaux), servie par `error_page 404` d'nginx, statut 404 réel |
| Formulaire en échec (réseau ou 5xx) | Message accessible avec l'adresse e-mail de repli ; saisie conservée |
| Script Umami bloqué | Aucun effet visible, aucune erreur bloquante (les appels sont protégés par une garde) |
| Erreur nginx 5xx | Page statique `50x.html` minimale, sans détail technique (OWASP A10) |

## 10. Stratégie de tests

Le détail est dans [ADR-0007](../docs/adr/0007-qualite-ci-tests.md). Tous les tests tournent dans Docker (`make ci` reproduit la CI).

| Niveau | Part | Outil | Contenu |
|--------|------|-------|---------|
| Unitaire | ~70 % | Vitest 5 | `src/lib/*` : liste blanche, filtres, fusion des métriques, contrat des événements, SEO et JSON-LD, ancienneté des tests, mapping de la frise des 10 ans. **TDD** : les tests sont écrits avant le code |
| Contrôles de build | — | Scripts Node | Données interdites dans le PDF, couverture de la table de correspondance à 100 %, canonical absolue, liens internes, unicité des slugs |
| End-to-end | ~20 % | Playwright 1.64 contre `preview` | Scénarios Gherkin des parcours : double appel à l'action, frise, téléchargement du CV, formulaire (Web3Forms simulé par `page.route`), filtres plugins, recherche, 404 ; **contrôle des en-têtes de sécurité** |
| Accessibilité | ~5 % | axe 4.13 | Toutes les pages types : 0 violation sérieuse ou critique |
| Performance et SEO | ~5 % | Lighthouse 13.5 | 6 pages, mobile, médiane de 3 exécutions, ≥ 95 |
| Manuel | — | Revue PO | Relecture du contenu, rendu du PDF, Mozilla Observatory après déploiement |

**Couverture** : ≥ 80 % de lignes et ≥ 75 % de branches sur `src/lib/`. Les composants Astro sont couverts par l'end-to-end.

## 11. Déploiement et environnements

| Environnement | Où | Comment | But |
|---------------|-----|---------|-----|
| Développement | Poste (Docker) | `make dev` → http://localhost:4321 (rechargement à chaud) | Écrire et voir chaque évolution |
| Préproduction locale | Poste (Docker) | `make preview` → http://localhost:8080 (image de production réelle) | Valider en-têtes, redirections, PDF et Pagefind avant de pousser |
| CI | GitHub Actions (Docker) | `ci.yml` sur chaque PR et sur `main` | Contrôles bloquants |
| Production | Railway (UE), `thibaut-monier.fr` | Build `--target runtime` à chaque push sur `main` **une fois la CI verte** ; cron à 06:00 UTC | Public |

- **Flux Git** : GitHub Flow, branches `feature/US-XXX-…`, Conventional Commits, squash merge, CI requise (règle 09 du projet).
- **Retour arrière** : redéploiement d'un déploiement précédent depuis la console Railway (en un clic), ou `git revert` sur `main`.
- **Après déploiement** : contrôle de fumée (statut 200 sur `/`, `/parcours/` et le PDF ; présence de l'en-tête CSP) dans `scheduled.yml` et après chaque déploiement.
- **Préalables à US-001** : dépôt GitHub `thibmonier/thibaut-monier.fr` (public), service Railway, DNS du domaine, comptes Umami et Calendly, clé Web3Forms.

## 12. Traçabilité des exigences

| Exigence du PRD | Couverture technique | US |
|-----------------|----------------------|----|
| F1 Profil et CV | Collections CV en YAML, Timeline, CvDownload (Typst), ContactForm | US-004 à US-008 |
| F2 Blog | Collection `blog`, Pagefind, RSS, canonical et table de correspondance | US-009 à US-013 |
| F3 Labo | Collection `toolTests` (protocole imposé par Zod), staleness, ComparisonTable | US-014 à US-018 |
| F4 Open source | Collections `plugins` et `projects`, oss-metrics (ADR-0006) | US-019 à US-023 |
| F5 SEO, GEO et mesure | `Seo` et `lib/seo.ts`, astro-og-canvas, Umami | US-024 à US-026 |
| F6 i18n | Routage natif, `src/i18n` | US-027, US-028 |
| F7 Conformité légale | Pages légales, `config/legal.ts`, liste blanche | US-029 |
| Exigences de performance, accessibilité, sécurité, qualité | nginx, CI (ADR-0007), DoD | Transverse |
| Dockerisation et versions | ADR-0001, ADR-0003, Renovate | US-001, US-003 |

## 13. Risques techniques résiduels

| Risque | Mitigation |
|--------|------------|
| Rechargement à chaud lent ou absent sur macOS (fichiers montés) | Polling Vite activable par variable d'environnement (ADR-0003) |
| Brotli absent de l'image nginx-unprivileged officielle | gzip statique en repli ; mesure de l'écart Lighthouse |
| CSP stricte et scripts inline générés par Astro | Scripts externalisés (bundle Vite) ; empreintes (hash) CSP générées au build pour les inline résiduels (voir security.md) |
| Accessibilité du PDF Typst (balisage) | Vérification au sprint 2 ; lien vers la version HTML accessible |
| Option *Wait for CI* de Railway | À vérifier à l'implémentation d'US-001 ; sinon déploiement déclenché par la CI (`railway up` avec `RAILWAY_TOKEN`) |
