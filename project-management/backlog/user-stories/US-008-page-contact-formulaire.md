# US-008 : Page contact avec motif, anti-spam et prise de RDV

## Epic parent
EPIC-002 : Profil et CV

## Persona concerné
**P-002** : Marc - Dirigeant e-commerce B2B qui cherche un expert en mission

## User Story

### Carte
**En tant que** P-002 : Marc, dirigeant e-commerce B2B qui cherche un expert en mission
**Je veux** envoyer un message en indiquant mon motif (mission, poste, autre) ou réserver directement un créneau
**Afin de** qualifier mon besoin avec Thibaut en moins de 5 minutes, sans attendre une réponse par e-mail

### Conversation
- Réception du formulaire sur un site statique : service tiers (Formspree, Getform…), fonction serverless ou simple lien `mailto` en repli ? Cela touche la contrainte « aucune donnée utilisateur stockée côté serveur » : à arbitrer en tech spec.
- **Décision PO du 2026-10-14 : Calendly.** Intégration par lien sortant plutôt que par widget embarqué, pour la performance, la CSP et l'absence de cookies tiers sur le site.
- Anti-spam sans cookie : champ piège (honeypot) plus validation temporelle, ou Turnstile ? Contrainte RGPD.
- Aucune adresse postale ni téléphone n'est publié ; seule l'adresse e-mail est exposée via le formulaire.

### Validation INVEST
- [x] Independent : ne dépend que du layout
- [x] Negotiable : service de réception du formulaire (outil de RDV : Calendly, tranché)
- [x] Valuable : conversion, objectif O2
- [x] Estimable : formulaire standard, service à choisir
- [x] Sized : 3 points (≤ 8)
- [x] Testable : envoi, validation et anti-spam vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Envoi d'un message avec motif
GIVEN la page contact affichant les champs Nom, E-mail, Motif (Mission, Poste, Autre) et Message
WHEN P-002 renseigne les champs avec le motif "Mission" et valide
THEN le message "Merci, votre message est bien envoyé. Réponse sous 48 h ouvrées." s'affiche en moins de 3 s
AND le motif "Mission" est transmis avec le message
```

### Scénarios alternatifs
```gherkin
Scenario: Motif pré-sélectionné depuis l'accueil
GIVEN l'adresse "/contact?motif=poste"
WHEN P-001 ouvre la page
THEN le motif "Poste" est pré-sélectionné

Scenario: Prise de rendez-vous directe
GIVEN la page contact
WHEN P-002 clique sur "Réserver un créneau de 30 min"
THEN l'outil de prise de RDV s'ouvre dans un nouvel onglet avec rel="noopener noreferrer"
```

### Scénarios d'erreur
```gherkin
Scenario: Champ obligatoire manquant
GIVEN le formulaire avec le champ E-mail vide
WHEN P-002 valide
THEN le message "Veuillez renseigner votre adresse e-mail." s'affiche sous le champ
AND le focus se place sur ce champ
AND aucun envoi n'a lieu

Scenario: Envoi détecté comme robot
GIVEN le champ piège rempli ou un envoi en moins de 3 s après le chargement
WHEN le formulaire est validé
THEN l'envoi est rejeté silencieusement côté service
AND l'utilisateur voit le message de confirmation générique sans que le message soit transmis

Scenario: Service de réception indisponible
GIVEN un service de réception répondant en erreur
WHEN P-002 valide
THEN le message "L'envoi a échoué. Écrivez-moi directement à l'adresse ci-dessous." s'affiche avec un lien mailto
AND les données saisies restent dans le formulaire
```

### Critères techniques (site statique)
- [ ] Schéma de configuration contact (motifs, URL de RDV, adresse de repli) validé au build
- [ ] Page `/contact`, composant `ContactForm` fonctionnant sans JavaScript (envoi natif) avec amélioration progressive
- [ ] Responsive : champs pleine largeur, cibles ≥ 44 px
- [ ] WCAG 2.2 AA : étiquettes liées, erreurs reliées via `aria-describedby`, `autocomplete` adapté, pas de CAPTCHA visuel bloquant
- [ ] SEO : page indexable, `title` et `description` propres
- [ ] Sécurité : CSP compatible, `form-action` restreint, aucun secret côté client, mentions RGPD en bas du formulaire
- [ ] Performance : aucun script tiers au chargement ; Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Réception : service de formulaires tiers ou fonction serverless ; arbitrage avec la contrainte « aucune donnée stockée côté serveur ».
- Motif transmis par champ caché ou sujet préfixé `[Mission]`/`[Poste]`/`[Autre]`.
- Événements de conversion branchés dans US-026.

## Estimation
- **Story Points** : 3
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system et layout | Composants de formulaire et tokens |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-026 | Mesure d'audience et conversions |

## Sprint assigné
Sprint 1
