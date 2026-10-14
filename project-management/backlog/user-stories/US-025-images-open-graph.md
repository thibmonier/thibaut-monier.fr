# US-025 : Images Open Graph générées par page

## Epic parent
EPIC-006 : SEO, GEO et mesure

## Persona concerné
**P-001** : Claire - DG d'une scale-up qui recrute

## User Story

### Carte
**En tant que** P-001 : Claire, DG d'une scale-up qui recrute
**Je veux** voir une vignette soignée avec le titre de la page lorsqu'un lien du site est partagé (LinkedIn, e-mail, messagerie)
**Afin de** identifier tout de suite de quoi il s'agit et accorder du crédit au lien reçu d'un cabinet

### Conversation
- Gabarit : nom, titre de la page, catégorie ou type, logo discret. Une seule mise en page ou une par type de contenu ?
- Génération au build avec `astro-og-canvas` 0.13.2 (`canvaskit-wasm`, ADR-0012) : durée de build acceptable pour une centaine de pages ?
- Arbitrage sprint 3 (2026-10-14) : `astro-og-canvas` 0.13.2 (et non Satori + resvg, E17) ; police Inter déjà présente dans `cv/fonts/` ; URL des images obtenue uniquement via `getOgImageUrl` (C9).
- Les articles ayant déjà une image de couverture : l'utiliser telle quelle ou la composer avec le titre ?
- Polices : les mêmes que le site (auto-hébergées).

### Validation INVEST
- [x] Independent : ne dépend que des tokens de design
- [x] Negotiable : gabarit et couverture des pages
- [x] Valuable : meilleure conversion des liens partagés
- [x] Estimable : outillage connu
- [x] Sized : 3 points (≤ 8)
- [x] Testable : dimensions et présence des balises vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Image Open Graph générée pour chaque page indexable
GIVEN le site construit
WHEN le build s'achève
THEN chaque page indexable possède une image PNG de 1200 x 630 px de moins de 300 Ko
AND la balise og:image de la page contient l'URL absolue de cette image
AND les balises og:image:width et og:image:height valent 1200 et 630
```

### Scénarios alternatifs
```gherkin
Scenario: Titre long
GIVEN une page dont le titre fait plus de 90 caractères
WHEN l'image est générée
THEN le titre est tronqué avec une ellipse sur 3 lignes maximum sans débordement du cadre

Scenario: Cartes Twitter et LinkedIn
GIVEN une page avec image générée
WHEN P-001 partage son lien
THEN les balises twitter:card "summary_large_image", og:title et og:description sont présentes
```

### Scénarios d'erreur
```gherkin
Scenario: Police introuvable
GIVEN un fichier de police absent du dépôt
WHEN le build génère les images
THEN le build échoue avec le message "Génération Open Graph : police introuvable (<chemin>)"

Scenario: Caractères accentués ou émoji
GIVEN un titre contenant "é", "œ" et un caractère hors police
WHEN l'image est générée
THEN les caractères accentués s'affichent correctement
AND le caractère non supporté est omis sans faire échouer le build
```

### Critères techniques (site statique)
- [ ] Champs `title` et `description` obligatoires dans tous les schémas de page (déjà validés au build)
- [ ] Endpoint statique `/og/<clé>.png` généré par `astro-og-canvas`, URL obtenue via `getOgImageUrl` (C9) ; les pages n'écrivent jamais `/og/` elles-mêmes
- [ ] Composant `Seo.astro` existant : balises og:* et twitter:* dérivées de la page (pas de nouveau composant `SeoHead`)
- [ ] Contraste du gabarit ≥ 4,5:1 ; texte alternatif `og:image:alt` renseigné
- [ ] SEO : URL absolues ; image de repli pour la page d'accueil et les pages sans gabarit
- [ ] Performance : génération < 3 min pour l'ensemble du site ; aucune image OG chargée par les visiteurs

## Notes techniques (à confirmer en tech spec)
- `astro-og-canvas` 0.13.2 (ADR-0012), exécuté au build ; cache entre builds.
- Compatible avec l'image de l'article si `image` existe (à arbitrer).

## Estimation
- **Story Points** : 3
- **MoSCoW** : Should

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system et layout | Tokens, polices et composant d'en-tête de page |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| — | Aucune |

## Sprint assigné
Sprint 3
