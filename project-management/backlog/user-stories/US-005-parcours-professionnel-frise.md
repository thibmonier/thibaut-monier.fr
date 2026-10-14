# US-005 : Parcours professionnel en frise

## Epic parent
EPIC-002 : Profil et CV

## Persona concerné
**P-001** : Claire - DG d'une scale-up qui recrute

## User Story

### Carte
**En tant que** P-001 : Claire, DG d'une scale-up qui recrute
**Je veux** parcourir une frise de 8 expériences avec rôle, période, contexte et réalisations chiffrées
**Afin de** vérifier la cohérence du parcours de direction et l'expérience de pilotage, de SQLI à aujourd'hui

### Conversation
- Source unique : une collection `experiences` (8 entrées : consultant indépendant, Gingerminds, DTA Ingénierie, Digital Garden, Orange Applications for Business, Smile (2 postes), SQLI) qui alimentera aussi le CV PDF (US-007).
- Smile compte deux rôles dans le CV source : **fusion par défaut en une entrée à deux rôles** (revue de conception du 2026-10-14), soit 8 entrées ; antérieure à 2016, elle est de toute façon résumée selon D-6.
- **Décision PO (2026-10-14, risque R-07)** : la frise met en avant les **10 dernières années** (expériences détaillées). Les expériences antérieures sont résumées dans un bloc « Avant 2016 » repliable (rôles et employeurs, sans détail). Aucune date de naissance ni âge.
- Liste blanche de champs publics : le téléphone, l'âge et l'adresse du CV source ne sont jamais importés.
- Les réalisations chiffrées doivent être sourcées ; les noms de clients cités le sont-ils avec leur accord ?

### Validation INVEST
- [x] Independent : ne dépend que du layout
- [x] Negotiable : présentation de la frise (verticale, repliable)
- [x] Valuable : cœur de la lecture du recruteur
- [x] Estimable : contenu connu (CV source)
- [x] Sized : 5 points (≤ 8)
- [x] Testable : 8 entrées, champs obligatoires, rendu vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Frise complète du parcours
GIVEN la collection "experiences" contenant 8 entrées valides
WHEN P-001 ouvre la page "Parcours"
THEN 8 jalons sont affichés du plus récent au plus ancien
AND chaque jalon affiche rôle, entreprise, période, contexte et au moins 2 réalisations
AND la première expérience est la plus récente
```

### Scénarios alternatifs
```gherkin
Scenario: Dépliage d'une expérience
GIVEN la frise affichée sur mobile
WHEN P-001 active le bouton "Voir le détail" d'un jalon au clavier ou au toucher
THEN les réalisations détaillées s'affichent
AND l'attribut aria-expanded passe à "true"

Scenario: Impression ou export en texte
GIVEN la page "Parcours"
WHEN P-001 imprime la page
THEN tous les jalons s'impriment dépliés sur 2 pages A4 maximum
```

### Scénarios d'erreur
```gherkin
Scenario: Expérience sans période
GIVEN une entrée de la collection sans "startDate"
WHEN le build s'exécute
THEN le build échoue avec le message "experiences/<fichier> : champ 'startDate' requis"

Scenario: Donnée personnelle présente dans le contenu
GIVEN une entrée contenant un numéro de téléphone ou un âge
WHEN le contrôle de la liste blanche s'exécute au build
THEN le build échoue avec le message "Donnée personnelle interdite détectée dans <fichier>"
```

### Critères techniques (site statique)
- [ ] Schéma `experiences` (role, company, startDate, endDate?, context, achievements[], tags[], order) validé au build
- [ ] Page `/parcours` et composant `Timeline`
- [ ] Responsive : frise verticale en une colonne sous 768 px
- [ ] WCAG 2.2 AA : structure en liste ordonnée, boutons de dépliage accessibles au clavier, contraste ≥ 4,5:1
- [ ] SEO : `title` et `description` propres ; données prêtes pour JSON-LD (US-024)
- [ ] Performance : rendu sans JavaScript obligatoire (`details`/`summary` possible), Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Collection de contenu Astro `experiences` en Markdown/YAML ; tri par date décroissante.
- Contrôle de la liste blanche : test au build (motifs de numéros de téléphone, mentions d'âge).
- Les champs `tags[]` serviront au filtrage de US-006.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system et layout | Composants et tokens |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-006 | Compétences et réalisations filtrables |
| US-007 | CV PDF généré au build |
| US-024 | SEO technique et données structurées |

## Sprint assigné
Sprint 1
