# US-006 : Compétences et réalisations filtrables par domaine

## Epic parent
EPIC-002 : Profil et CV

## Persona concerné
**P-002** : Marc - Dirigeant e-commerce B2B qui cherche un expert en mission

## User Story

### Carte
**En tant que** P-002 : Marc, dirigeant e-commerce B2B qui cherche un expert en mission
**Je veux** filtrer les compétences et réalisations par domaine et voir les références clients associées
**Afin de** vérifier en moins de 2 minutes que Thibaut a déjà résolu un besoin proche du mien (B2B, conformité UE, migration)

### Conversation
- Domaines retenus (PRD) : delivery, architecture, e-commerce, données et migrations, IA appliquée. Un domaine par réalisation ou plusieurs ?
- Références clients : accord de citation non confirmé ; par défaut, libellé anonymisé (« Référence confidentielle ») ; seuls les clients validés par le PO sont cités.
- Filtrage sans JavaScript (liens avec paramètre) ou amélioration progressive ?
- Récupération des 10 à 15 réalisations depuis la section Key Achievements du CV source, sans donnée personnelle.
- Arbitrage sprint 2 (2026-10-14) : références clients anonymisées par défaut (« Référence confidentielle ») ; seuls les clients validés par le PO en T-006-01 sont cités (E12), cohérent avec `clientsCited: false` du sprint 1.
- Arbitrage sprint 2 (2026-10-14) : URL `/competences/?domaine=ia-appliquee` avec barre finale (ADR-0008) ; valeur de l'énumération `ia-appliquee` (E11) ; paramètre inconnu = liste complète avec message.

### Validation INVEST
- [x] Independent : réutilise la collection d'US-005 sans la modifier
- [x] Negotiable : liste des domaines et présentation
- [x] Valuable : réponse directe au besoin de P-002
- [x] Estimable : filtres sur données statiques
- [x] Sized : 3 points (≤ 8)
- [x] Testable : nombre de résultats par filtre vérifiable

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Filtre par domaine
GIVEN la page "Compétences" affichant toutes les réalisations
WHEN P-002 sélectionne le domaine "E-commerce"
THEN seules les réalisations marquées "e-commerce" sont affichées
AND le compteur indique le nombre exact de résultats, par exemple "6 réalisations"
AND chaque réalisation affiche la mention "Référence confidentielle" par défaut, ou le nom d'un client uniquement s'il figure dans la liste validée par le PO
```

### Scénarios alternatifs
```gherkin
Scenario: Réinitialisation du filtre
GIVEN le filtre "Données et migrations" actif
WHEN P-002 active "Tous les domaines"
THEN la liste complète s'affiche et le compteur reflète le total

Scenario: Filtre partagé par lien
GIVEN l'adresse "/competences/?domaine=ia-appliquee"
WHEN P-002 ouvre ce lien
THEN le filtre "IA appliquée" est déjà actif et sa case est marquée comme sélectionnée
```

### Scénarios d'erreur
```gherkin
Scenario: Domaine inconnu dans l'adresse
GIVEN l'adresse "/competences/?domaine=inconnu"
WHEN P-002 ouvre ce lien
THEN la liste complète s'affiche
AND le message "Domaine inconnu, affichage de toutes les réalisations" est annoncé

Scenario: Filtre sans résultat
GIVEN un domaine ne contenant aucune réalisation
WHEN P-002 le sélectionne
THEN le message "Aucune réalisation pour ce domaine pour le moment" s'affiche avec un lien "Voir toutes les réalisations"
```

### Critères techniques (site statique)
- [ ] Schéma `achievements` (title, domains[] parmi 5 valeurs, clients[], year, proofUrl?) validé au build ; domaine hors liste = build en échec
- [ ] Page `/competences/` ; composants `DomainFilter` et `AchievementCard`
- [ ] Responsive : filtres en liste défilante ou boutons repliables sous 768 px
- [ ] WCAG 2.2 AA : groupe de boutons avec `aria-pressed`, compteur annoncé via `aria-live="polite"`
- [ ] SEO : contenu rendu au build (indexable sans JavaScript)
- [ ] Performance : script de filtrage < 3 Ko, Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Collection `achievements` distincte ou champ dérivé de `experiences` : à arbitrer pour éviter la double saisie.
- Rendu complet au build, masquage côté client ; paramètre `domaine` lu par un script minimal.

## Estimation
- **Story Points** : 3
- **MoSCoW** : Should

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-005 | Parcours professionnel en frise | Collection de données et conventions de contenu |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| — | Aucune |

## Sprint assigné
Sprint 2
