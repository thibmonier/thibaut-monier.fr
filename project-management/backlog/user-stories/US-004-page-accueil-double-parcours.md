# US-004 : Page d'accueil : proposition de valeur et double parcours

## Epic parent
EPIC-002 : Profil et CV

## Persona concerné
**P-001** : Claire - DG d'une scale-up qui recrute

## User Story

### Carte
**En tant que** P-001 : Claire, DG d'une scale-up qui recrute
**Je veux** comprendre dès l'écran d'accueil qui est Thibaut Monier, ce qu'il apporte, et choisir « Me recruter » ou « Me confier une mission »
**Afin de** décider en moins de 2 minutes si le profil mérite un entretien, sans défiler ni subir de jargon

### Conversation
- Formulation de la proposition de valeur unique (« direction technique et delivery augmenté par IA ») et du statut de disponibilité (question ouverte n°5).
- Révision PO du 2026-10-20 : l'accueil met le profil en avant (titre LinkedIn en h1, section « Mon profil » issue du CV) ; les quatre preuves passent sous le profil. Preuves d'origine : 20 plugins Sylius 2, PR mergées sur career-ops, ERP de 12 modules livré en agentique, 25 ans d'expérience. Les liens vers les pages plugins et career-ops (EPIC-005, Sprint 2) pointent vers des destinations provisoires au Sprint 1 : à décider avec le PO.
- Les deux appels à l'action mènent à la page contact avec le motif pré-sélectionné (US-008).
- Aucun chiffre non sourcé : chaque preuve doit renvoyer à un contenu consultable.

### Validation INVEST
- [x] Independent : ne dépend que du layout (US-002)
- [x] Negotiable : textes et ordre des preuves
- [x] Valuable : première impression et conversion
- [x] Estimable : page unique pilotée par des données
- [x] Sized : 3 points (≤ 8)
- [x] Testable : présence et visibilité mesurables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Profil et proposition de valeur visibles sans défilement (révisé le 2026-10-20)
GIVEN la page d'accueil ouverte sur un écran de 1280 x 720 px
WHEN P-001 charge la page
THEN le titre h1 et une phrase de proposition de valeur de 25 mots maximum sont visibles
AND les boutons "Me confier une mission" et "Me recruter" sont visibles sans défilement
AND la section « Mon profil » (résumé du CV, liens vers le parcours et le CV PDF) précède les 4 preuves
```

### Scénarios alternatifs
```gherkin
Scenario: Parcours "Me recruter"
GIVEN la page d'accueil
WHEN P-001 clique sur "Me recruter"
THEN elle arrive sur la page contact avec le motif "Poste" pré-sélectionné en moins de 1 s

Scenario: Affichage sur mobile
GIVEN un écran de 375 x 667 px
WHEN P-002 ouvre la page d'accueil
THEN les deux boutons d'action sont visibles sans défilement
AND les 4 preuves s'affichent en une colonne sans défilement horizontal
```

### Scénarios d'erreur
```gherkin
Scenario: Preuve sans destination
GIVEN une preuve dont le lien cible n'existe pas encore
WHEN le build s'exécute
THEN le build échoue avec le message "Lien de preuve invalide : <identifiant>" (aucune preuve ne pointe vers une 404)

Scenario: Champ obligatoire manquant dans les données d'accueil
GIVEN un fichier de données d'accueil sans le champ "headline"
WHEN le build s'exécute
THEN le build échoue avec le message "Champ 'headline' requis dans la collection home"
```

### Critères techniques (site statique)
- [ ] Schéma de contenu `home` (headline, valueProp, ctas[2], proofs[4] avec libellé, valeur, lien) validé au build
- [ ] Page `index` composée de `Hero`, `ProofList`, `CtaPair`
- [ ] Responsive 320 px à 1920 px ; boutons ≥ 44 px de haut
- [ ] WCAG 2.2 AA : un seul `h1`, contraste ≥ 4,5:1, libellés de boutons explicites
- [ ] SEO : `title` ≤ 60 caractères, `meta description` ≤ 160 caractères, balises Open Graph
- [ ] Performance : pas d'image bloquante, LCP < 1,5 s, Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Collection de données `home` (YAML ou JSON) avec schéma Zod.
- Le motif est transmis à la page contact par paramètre de requête (`?motif=poste`) ou ancre, à arbitrer en US-008.
- Aucun numéro de téléphone, âge ni adresse n'est affiché.

## Estimation
- **Story Points** : 3
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system et layout | Composants et tokens |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| — | Aucune (les liens de preuves vers les pages EPIC-005 seront complétés au Sprint 2) |

## Sprint assigné
Sprint 1
