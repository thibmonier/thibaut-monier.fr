# US-009 : Migration des 28 articles d'Agentic Agency

## Epic parent
EPIC-003 : Blog migré

## Persona concerné
**P-004** : Sophie - Tech lead qui pratique l'agentic engineering

## User Story

### Carte
**En tant que** P-004 : Sophie, tech lead qui pratique l'agentic engineering
**Je veux** retrouver les 28 articles du blog avec leur contenu, leurs images et leur FAQ à une adresse stable
**Afin de** relire, citer et partager les retours d'expérience sans perte de contenu ni lien cassé

### Conversation
- Source : `blog/src/content/blog` (Astro). Le frontmatter (title, description, pubDate, updatedDate, author, image, imageAlt, excerpt, tags, category, series, draft, faq) est-il conservé tel quel ? Le champ `author` doit pointer vers Thibaut Monier.
- Structure d'URL cible : `/blog/<slug>` en conservant les slugs existants ; cette décision conditionne US-010.
- Les articles `draft: true` éventuels restent-ils non publiés ? Les contenus datés dans le futur sont-ils programmés (exigence PRD) ?
- Mentions de la marque Agentic Agency dans le corps : à conserver, adapter ou signaler ? Liens internes à réécrire.

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
THEN 28 pages d'article sont générées sous "/blog/<slug>"
AND la page d'index du blog liste 28 articles par date décroissante
AND chaque article affiche titre, date, catégorie, image avec texte alternatif et temps de lecture
```

### Scénarios alternatifs
```gherkin
Scenario: Article avec FAQ
GIVEN un article dont le frontmatter contient un champ "faq" de N questions
WHEN P-004 ouvre l'article
THEN les N questions s'affichent en section repliable avec réponses visibles au clavier

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
- [ ] Collection `blog` avec schéma strict (champs du frontmatter existant ; `image` + `imageAlt` obligatoires ensemble ; `faq` optionnel)
- [ ] Routes `/blog` et `/blog/[slug]` ; composants `ArticleCard`, `ArticleLayout`, `Faq`
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
