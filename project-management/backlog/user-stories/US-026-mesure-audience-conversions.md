# US-026 : Mesure d'audience sans cookie et suivi des conversions

## Epic parent
EPIC-006 : SEO, GEO et mesure

## Persona concerné
**P-001** : Claire - DG d'une scale-up qui recrute

## User Story

### Carte
**En tant que** P-001 : Claire, DG d'une scale-up qui recrute (visiteuse respectueuse de sa vie privée)
**Je veux** consulter le site sans bandeau de cookies ni pistage individuel, tout en permettant au propriétaire de mesurer les actions clés
**Afin de** naviguer sans friction (aucun bandeau, aucune donnée personnelle collectée) pendant que le PO suit les contacts qualifiés (objectif O2 : ≥ 4 par mois) et les clics sortants (O3 : ≥ 15 %)

### Conversation
- **Décision PO du 2026-10-14 : Umami Cloud, offre Hobby** (gratuite : 100 000 événements par mois, 1 site, rétention de 6 mois ; sans cookie ; événements personnalisés). Cloudflare Web Analytics a été écarté car il ne gère pas les événements personnalisés, indispensables aux KPI O2 et O3.
- Événements : envoi du formulaire avec motif (mission, poste, autre), clic « Réserver un créneau », téléchargement du CV, clics sortants vers GitHub et Packagist, et clic LinkedIn (KPI du PRD).
- Les événements de conversion ne doivent contenir aucune donnée saisie par l'utilisateur (ni nom, ni e-mail, ni message).
- Arbitrage sprint 3 (2026-10-14) : marquage par `data-event` (contrat C8, `analytics-events.ts`) ; en CI le script est simulé (aucun appel réel à Umami), l'enregistrement dans Umami est vérifié en production avec le PO (T-900-28) ; sans `PUBLIC_UMAMI_WEBSITE_ID`, aucun script n'est chargé et aucune erreur n'apparaît.
- Blocage par les bloqueurs de publicité : acceptable ; la mesure est indicative.
- Persona : P-001 est la visiteuse type dont on évite de dégrader l'expérience ; le bénéficiaire métier est le PO.

### Validation INVEST
- [x] Independent : ne dépend que des actions à mesurer (CV, formulaire)
- [x] Negotiable : outil d'analytics et liste des événements
- [x] Valuable : pilotage des objectifs O2 et O3
- [x] Estimable : intégration d'un script léger
- [x] Sized : 3 points (≤ 8)
- [x] Testable : événements visibles dans l'outil

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Conversion enregistrée sans cookie
GIVEN le site déployé avec l'outil d'audience
WHEN P-001 envoie le formulaire avec le motif "Poste"
THEN un événement "contact_submit" avec la propriété motif = "poste" est émis vers le script d'audience simulé en CI, en moins de 5 s
AND l'enregistrement dans Umami est vérifié en production avec le PO
AND aucun cookie ni entrée de stockage local n'est créé par le site
AND aucun bandeau de consentement n'est affiché
```

### Scénarios alternatifs
```gherkin
Scenario: Téléchargement du CV et clics sortants
GIVEN les liens "Télécharger mon CV", "Réserver un créneau", GitHub et Packagist
WHEN P-001 clique sur chacun d'eux
THEN les événements "cv_download", "rdv_click", "outbound_github" et "outbound_packagist" sont enregistrés une fois par clic

Scenario: Respect de Do Not Track
GIVEN un navigateur avec l'en-tête DNT:1 ou Global Privacy Control actif
WHEN P-001 navigue
THEN aucune requête vers l'outil d'audience n'est émise
```

### Scénarios d'erreur
```gherkin
Scenario: Identifiant de site absent
GIVEN la variable "PUBLIC_UMAMI_WEBSITE_ID" non définie
WHEN P-001 navigue sur le site construit
THEN aucun script d'audience n'est chargé
AND aucune erreur n'apparaît dans la console

Scenario: Outil d'audience indisponible ou bloqué
GIVEN un script d'audience bloqué ou en échec
WHEN P-001 navigue et envoie le formulaire
THEN le site fonctionne normalement sans erreur visible
AND aucune erreur bloquante n'apparaît dans la console

Scenario: Donnée personnelle dans un événement
GIVEN un événement tentant d'envoyer une adresse e-mail ou le texte du message
WHEN le test de contrat des événements s'exécute en CI
THEN la CI échoue avec le message "Événement <nom> : propriété interdite '<propriété>'"
```

### Critères techniques (site statique)
- [ ] Liste des événements et propriétés autorisées déclarée dans un fichier typé, vérifiée en CI
- [ ] Script unique chargé en différé (`defer`), sans cookie ni stockage ; marquage des liens par attribut `data-event`
- [ ] Aucun impact visuel ; WCAG 2.2 AA inchangé
- [ ] SEO : aucun effet ; domaine de collecte ajouté à la CSP (`script-src`, `connect-src`) et documenté
- [ ] Performance : un seul script tiers, chargé en différé ; Lighthouse ≥ 95 conservé ; aucune dégradation du LCP
- [ ] Mentions légales : section vie privée indiquant l'outil, l'absence de cookie et la base légale

## Notes techniques (à confirmer en tech spec)
- Umami Cloud : script de suivi officiel en `defer` ; événements déclenchés par l'attribut `data-event` (contrat C8) et transmis au script ; choisir la région UE si l'offre gratuite le permet.
- Mise à jour de la CSP définie en US-001 ; test de non-régression des en-têtes.
- Tableau de bord de suivi des objectifs O2 et O3 configuré dans l'outil.

## Estimation
- **Story Points** : 3
- **MoSCoW** : Should

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-007 | CV PDF généré au build | Événement de téléchargement |
| US-008 | Page contact avec motif et anti-spam | Événements formulaire et RDV |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| — | Aucune |

## Sprint assigné
Sprint 3
