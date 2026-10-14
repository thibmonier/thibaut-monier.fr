# US-002 : Design system et layout

## Epic parent
EPIC-001 : Socle et walking skeleton

## Persona concerné
**P-001** : Claire - DG d'une scale-up qui recrute

## User Story

### Carte
**En tant que** P-001 : Claire, DG d'une scale-up qui recrute
**Je veux** un site lisible, cohérent et navigable (en-tête, menu, pied de page, thème clair ou sombre) sur mobile comme sur ordinateur
**Afin de** me repérer sans effort entre deux réunions et conclure en moins de 2 minutes que le profil est soigné

### Conversation
- Palette et typographie : sobriété « direction technique » ou identité plus marquée ? Polices auto-hébergées pour la performance.
- Le thème suit-il la préférence système par défaut, avec un bouton de bascule mémorisé ?
- Menu initial : Accueil, Parcours, Blog, Contact ; Labo et Open source s'ajouteront avec EPIC-004 et EPIC-005.
- « i18n-ready » : seule la structure est posée (français sans préfixe, `/en/` réservé), aucune traduction n'est livrée ici.

### Validation INVEST
- [x] Independent : ne dépend que du squelette (US-001)
- [x] Negotiable : style et jeux de tokens discutables
- [x] Valuable : cohérence visuelle et accessibilité pour toutes les pages futures
- [x] Estimable : composants connus
- [x] Sized : 3 points (≤ 8)
- [x] Testable : critères d'accessibilité et de contraste mesurables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Layout commun affiché sur chaque page
GIVEN une page du site ouverte
WHEN P-001 charge la page sur un écran de 1280 px
THEN l'en-tête affiche le nom du site et 4 liens de navigation (Accueil, Parcours, Blog, Contact)
AND le pied de page affiche les mentions légales et les liens LinkedIn et GitHub
AND le lien actif porte l'attribut aria-current="page"
```

### Scénarios alternatifs
```gherkin
Scenario: Thème sombre selon la préférence système
GIVEN un système configuré en mode sombre et aucune préférence enregistrée
WHEN P-001 ouvre le site
THEN le thème sombre s'applique dès le premier affichage, sans flash de thème clair
AND tous les textes respectent un contraste ≥ 4,5:1

Scenario: Menu mobile et navigation au clavier
GIVEN un écran de 375 px de large
WHEN P-001 appuie sur le bouton "Menu" puis navigue avec la touche Tab
THEN le menu s'ouvre, le focus reste piégé dans le menu et Échap le referme
AND chaque cible tactile mesure au moins 24 x 24 px
```

### Scénarios d'erreur
```gherkin
Scenario: JavaScript désactivé
GIVEN un navigateur sans JavaScript
WHEN P-001 ouvre le site
THEN la navigation reste utilisable (liens visibles et fonctionnels)
AND le thème suit la préférence système

Scenario: Mouvement réduit demandé
GIVEN un système avec "prefers-reduced-motion: reduce"
WHEN P-001 navigue sur le site
THEN aucune animation ni transition de plus de 0 ms n'est jouée
```

### Critères techniques (site statique)
- [ ] Schéma de configuration du site (nom, liens de navigation, réseaux) validé au build
- [ ] Composants : `BaseLayout`, `Header`, `Footer`, `ThemeToggle`, lien d'évitement "Aller au contenu"
- [ ] Responsive 320 px à 1920 px
- [ ] WCAG 2.2 AA : contrastes, focus visible, cible tactile ≥ 24 px, `prefers-reduced-motion`
- [ ] SEO : gabarit de balises `meta` et `canonical` mutualisé ; `lang="fr"`
- [ ] Performance : polices auto-hébergées, aucun CSS ni JS bloquant inutile, Lighthouse ≥ 95
- [ ] Tokens de design (couleurs, espacements, typographie) centralisés ; routage i18n : français sans préfixe

## Notes techniques (à confirmer en tech spec)
- Tailwind v4 avec tokens en variables CSS ; thème via attribut `data-theme` et script inline minimal.
- Configuration i18n Astro avec `defaultLocale: "fr"` et `prefixDefaultLocale: false`.
- Navigation décrite dans une collection ou un fichier de données unique.

## Estimation
- **Story Points** : 3
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-001 | Squelette du site publié en production | Base de code et déploiement |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-004 | Page d'accueil |
| US-005 | Parcours professionnel en frise |
| US-008 | Page contact |
| US-009 | Migration des 28 articles |
| US-025 | Images Open Graph |

## Sprint assigné
Sprint 1
