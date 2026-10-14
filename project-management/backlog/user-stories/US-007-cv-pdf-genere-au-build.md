# US-007 : CV PDF téléchargeable généré au build

## Epic parent
EPIC-002 : Profil et CV

## Persona concerné
**P-001** : Claire - DG d'une scale-up qui recrute

## User Story

### Carte
**En tant que** P-001 : Claire, DG d'une scale-up qui recrute
**Je veux** télécharger en un clic un CV PDF propre, à jour et transmissible tel quel au comité
**Afin de** partager le profil sans retaper d'information et sans exposer de données personnelles (téléphone, âge)

### Conversation
- Variante publique : sans téléphone ni âge ni adresse précise ; la localisation reste « Nantes (France) ».
- **Décision d'analyse (2026-10-14) : Typst** génère le PDF à partir des **mêmes données YAML** que la collection `experiences` (Typst lit YAML et JSON nativement). Pas de navigateur headless : l'image de build reste légère et la typographie est de qualité professionnelle.
- Mise en page : 2 pages A4 maximum ; version anglaise hors périmètre (EPIC-007).
- Nom du fichier : `thibaut-monier-cv.pdf`, avec date de génération dans les métadonnées.
- Arbitrage sprint 2 (2026-10-14) : la collection compte 7 expériences (arbitrage A2 du sprint 1, Smile fusionné) (E10).
- Arbitrage sprint 2 (2026-10-14) : libellé statique « Télécharger mon CV (PDF, 2 pages) » ; nombre de pages et poids vérifiés par le contrôle de build, poids non affiché ; `X-Robots-Tag: noindex` sur le PDF (la page Parcours reste la version indexée) ; revalidation (`no-cache`) au lieu du cache de 30 jours des `.pdf` dans `nginx.conf` (E9).
- Arbitrage sprint 2 (2026-10-14) : génération par Typst uniquement, sans gabarit d'impression HTML ni Chromium (ADR-0005).

### Validation INVEST
- [x] Independent : dépend seulement de la collection d'US-005
- [x] Negotiable : mise en page et outil de génération
- [x] Valuable : livrable attendu par tout recruteur
- [x] Estimable : outil choisi (Typst), gabarit 2 pages
- [x] Sized : 5 points (≤ 8)
- [x] Testable : contenu du PDF vérifiable par extraction de texte

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Téléchargement du CV public
GIVEN le site construit avec la collection "experiences" de 7 entrées
WHEN P-001 clique sur "Télécharger mon CV (PDF, 2 pages)"
THEN le fichier "thibaut-monier-cv.pdf" de moins de 500 Ko se télécharge
AND il contient les 7 expériences et le résumé, sur 2 pages A4 maximum
AND le texte est sélectionnable
AND la réponse HTTP porte `X-Robots-Tag: noindex` et une revalidation (`Cache-Control: no-cache`)
```

### Scénarios alternatifs
```gherkin
Scenario: Une seule source de vérité
GIVEN la modification d'une réalisation dans la collection "experiences"
WHEN le site est reconstruit
THEN le même texte apparaît dans la page "Parcours" et dans le PDF sans autre saisie

Scenario: Lecture accessible
GIVEN le PDF généré
WHEN un lecteur d'écran l'ouvre
THEN le document est balisé (titre, langue "fr", ordre de lecture logique)
```

### Scénarios d'erreur
```gherkin
Scenario: Donnée personnelle détectée dans le PDF
GIVEN un contenu contenant un numéro de téléphone ou un âge
WHEN l'étape de contrôle du PDF s'exécute au build
THEN le build échoue avec le message "CV public : donnée personnelle interdite (téléphone, âge ou adresse)"

Scenario: Échec de génération
GIVEN un moteur de rendu PDF indisponible dans l'environnement de build
WHEN le build s'exécute
THEN le build échoue avec le message "Génération du CV PDF impossible : <cause>"
AND aucun PDF obsolète n'est publié
```

### Critères techniques (site statique)
- [ ] Schéma `experiences` partagé avec US-005 ; liste blanche de champs publics validée au build
- [ ] Gabarit Typst `cv/cv.typ` (pas de gabarit d'impression HTML ni de navigateur headless)
- [ ] Bouton de téléchargement visible sur la page Parcours et la page contact ; cible ≥ 44 px
- [ ] WCAG 2.2 AA pour le lien (libellé « Télécharger mon CV (PDF, 2 pages) ») ; PDF balisé
- [ ] SEO : lien avec attribut `download`, fichier exclu de l'indexation par `X-Robots-Tag: noindex` ; revalidation (`no-cache`) du PDF dans `nginx.conf`, en réinjectant les en-têtes communs dans la `location`
- [ ] Performance : PDF < 500 Ko ; génération < 60 s dans la CI

## Notes techniques (à confirmer en tech spec)
- Étape dédiée du build multi-étapes Docker (image officielle Typst 0.15) : `typst compile cv.typ dist/thibaut-monier-cv.pdf` lisant `src/data/cv/experiences/*.yaml` filtrés par liste blanche.
- Test automatisé : extraction de texte du PDF et recherche de motifs interdits.
- Gabarit Typst versionné (`cv/cv.typ`), réutilisable pour des variantes de CV ciblées (opportunité O-04).
- Accessibilité du PDF : métadonnées (titre, langue, auteur) et structure balisée selon les capacités de Typst 0.15, à vérifier.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-005 | Parcours professionnel en frise | Source de données unique |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-026 | Mesure d'audience et conversions (événement « téléchargement du CV ») |

## Sprint assigné
Sprint 2
