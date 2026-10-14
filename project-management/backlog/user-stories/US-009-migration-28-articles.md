# US-009 : Migration des 28 articles d'Agentic Agency

## Epic parent
EPIC-003 : Blog migré

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead qui pratique l'agentic engineering
**Je veux** retrouver les 28 articles du blog avec leur contenu, leurs images et leurs FAQ (3 articles) à une adresse stable
**Afin de** relire, citer et partager les retours d'expérience sans perte de contenu ni lien cassé

### Conversation
- Source : `blog/src/content/blog` (Astro). Le frontmatter source est normalisé vers le schéma C1 (description de 50 à 160 caractères réécrite à la main, `seoTitle` obligatoire au-delà de 60 caractères de titre, champ `validated`) ; le champ `author` pointe vers Thibaut Monier.
- Structure d'URL cible : `/blog/<slug>/` (barre finale, C10) en conservant les slugs existants ; cette décision conditionne US-010.
- Les articles `draft: true` éventuels restent-ils non publiés ? Les contenus datés dans le futur sont-ils programmés (exigence PRD) ?
- Mentions de la marque Agentic Agency dans le corps : aucun corps d'article ne la cite (E12) ; le bloc auteur, les CTA de marque et les boutons de partage ne sont pas migrés. Pieds biographiques « Operations Director » retirés et remplacés par une note d'auteur sobre alignée sur le profil du site (E10, E11). Liens vers les pages non migrées : URL absolue de l'ancien site.
- Arbitrage sprint 3 (2026-10-14) : l'agent rédige 3 FAQ de 3 questions pour 3 articles qu'il choisit, à partir du contenu de l'article uniquement, marquées `validated: false` (à valider par le PO) ; bio alignée sur le profil du site (E11), aucune mention d'« Operations Director » ; l'index livré par US-009 est une liste unique, remplacée par la pagination de 12 par page d'US-011 (E14).

### Validation INVEST
- [x] Independent : ne dépend que du layout
- [x] Negotiable : structure d'URL, traitement des mentions de marque
- [x] Valuable : conserve 28 articles et leur autorité
- [x] Estimable : source structurée, volume connu
- [x] Sized : 5 points (≤ 8)
- [x] Testable : 28 articles, images et FAQ vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Les 28 articles sont publiés
GIVEN le dépôt contenant 28 fichiers d'articles au frontmatter valide
WHEN le site est construit
THEN 28 pages d'article sont générées sous "/blog/<slug>/"
AND l'index du blog donne accès aux 28 articles par date décroissante (liste unique à la livraison d'US-009, paginée par US-011)
AND chaque article affiche titre, date, catégorie, image avec texte alternatif et temps de lecture
```

### Scénarios alternatifs
```gherkin
Scenario: Article avec FAQ
GIVEN un des 3 articles à FAQ (3 questions rédigées, "validated: false")
WHEN P-004 ouvre l'article
THEN les 3 questions s'affichent en section repliable, réponses accessibles au clavier

Scenario: Pied biographique aligné
GIVEN les 28 articles migrés
WHEN P-004 parcourt leurs pieds d'article et leurs liens
THEN aucun article ne contient "Operations Director"
AND une note d'auteur renvoie vers "/parcours/"
AND les liens vers les pages non migrées pointent vers l'URL absolue de l'ancien site

Scenario: Publication programmée
GIVEN un article dont "pubDate" est dans le futur
WHEN le site est construit avant cette date
THEN l'article n'est ni listé ni accessible
AND il apparaît au premier build suivant la date de publication
```

### Scénarios d'erreur
```gherkin
Scenario: Frontmatter invalide
GIVEN un article sans "description" ou avec une "category" hors de Business, Méthode, Métiers, Outils, Pilotage
WHEN le build s'exécute
THEN le build échoue avec un message citant le fichier et le champ fautif

Scenario: Image manquante
GIVEN un article dont "image" référence un fichier absent
WHEN le build s'exécute
THEN le build échoue avec le message "Image introuvable : <chemin> (article <slug>)"
```

### Critères techniques (site statique)
- [ ] Collection `blog` avec schéma strict (schéma C1 : `description` de 50 à 160 caractères, `seoTitle` obligatoire au-delà de 60 caractères de titre, `validated` ; `image` + `imageAlt` obligatoires ensemble ; `faq` optionnel)
- [ ] Routes `/blog/` et `/blog/[slug]/` (barre finale, `trailingSlash: 'always'`) ; composants `ArticleCard`, `ArticleLayout`, `Faq`
- [ ] Responsive : largeur de lecture ≤ 75 caractères, images adaptatives
- [ ] WCAG 2.2 AA : hiérarchie de titres, textes alternatifs non vides, blocs de code défilables au clavier
- [ ] SEO : `title`, `description`, `canonical`, dates `datePublished`/`dateModified` ; données structurées traitées en US-024
- [ ] Performance : images optimisées (WebP/AVIF, `srcset`, `loading="lazy"` hors LCP), Lighthouse ≥ 95 sur un article type

## Notes techniques (à confirmer en tech spec)
- Copie du contenu et des images du dépôt `blog/`, puis normalisation du frontmatter par script de migration idempotent.
- Slugs conservés pour faciliter la table de correspondance (US-010) et de futures redirections ; agentic-agency.fr reste intact (décision du 2026-10-14).
- Programmation des articles : comparaison de `pubDate` au moment du build, avec build quotidien planifié.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system et layout | Gabarits de page |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-010 | Canonical et table de correspondance |
| US-011 | Navigation blog |
| US-012 | Recherche plein texte |
| US-013 | Flux RSS |
| US-024 | SEO technique et données structurées |

## Sprint assigné
Sprint 3
