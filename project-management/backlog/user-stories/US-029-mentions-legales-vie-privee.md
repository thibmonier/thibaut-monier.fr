# US-029 : Mentions légales et politique de vie privée

## Epic parent
EPIC-001 : Socle et walking skeleton

## Persona concerné
**P-002** : Marc - Dirigeant e-commerce B2B qui cherche un expert en mission

## User Story

### Carte
**En tant que** P-002 : Marc, dirigeant e-commerce B2B
**Je veux** savoir qui édite le site, qui l'héberge et ce que deviennent les données que je saisis dans le formulaire de contact
**Afin de** prendre contact en confiance, avec un prestataire qui applique lui-même les obligations légales (LCEN, RGPD) qu'il conseille à ses clients

### Conversation
- Obligation LCEN (contrainte CR-3) : éditeur (nom et moyen de contact, **sans adresse personnelle ni téléphone** : vérifier les options légales pour un particulier ou une activité en portage salarial), directeur de la publication, hébergeur (raison sociale, adresse, téléphone de l'hébergeur retenu par l'ADR : Railway ou Cloudflare).
- RGPD (CR-1, CR-2) : finalité du formulaire (répondre à une demande de contact), base légale (mesures précontractuelles ou intérêt légitime), sous-traitants (Web3Forms aux États-Unis : aucun stockage, DPA ; Umami Cloud : sans cookie ; Calendly : lien sortant, soumis à sa propre politique), durée de conservation des e-mails reçus, droits (accès, rectification, effacement) et contact pour les exercer, droit de réclamation auprès de la CNIL.
- Absence de cookie : à affirmer explicitement, ce qui justifie l'absence de bandeau.
- Lien depuis le pied de page de toutes les pages et sous le formulaire de contact (mention courte avec renvoi).

### Validation INVEST
- [x] Independent : ne dépend que du layout (US-002)
- [x] Negotiable : formulation et niveau de détail
- [x] Valuable : conformité légale et confiance (P-002, P-001)
- [x] Estimable : 2 pages de contenu et 2 liens
- [x] Sized : 2 points (≤ 8)
- [x] Testable : présence des pages, des liens et des mentions obligatoires vérifiée en CI

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Consultation des mentions légales
GIVEN le site déployé en production
WHEN P-002 clique sur « Mentions légales » dans le pied de page
THEN la page /mentions-legales/ s'affiche en moins de 1,5 s (LCP)
AND elle indique l'éditeur, le directeur de la publication et l'hébergeur (raison sociale, adresse, téléphone)
```

### Scénarios alternatifs
```gherkin
Scenario: Information RGPD sous le formulaire
GIVEN la page contact
WHEN P-002 consulte le formulaire avant de l'envoyer
THEN une mention courte indique la finalité, le sous-traitant Web3Forms (États-Unis) et la durée de conservation
AND un lien « En savoir plus » mène à /vie-privee/#formulaire

Scenario: Exercice des droits
GIVEN la page /vie-privee/
WHEN P-002 cherche comment faire effacer ses données
THEN il trouve la liste de ses droits, le moyen de contact pour les exercer et le lien vers la CNIL
AND la mention « Ce site ne dépose aucun cookie » est présente
```

### Scénarios d'erreur
```gherkin
Scenario: Donnée personnelle interdite dans les pages légales
GIVEN un contenu des pages légales contenant un numéro de téléphone mobile personnel ou une adresse personnelle
WHEN le contrôle de liste blanche s'exécute au build
THEN le build échoue avec le message "Donnée personnelle interdite dans <fichier> : <type>"

Scenario: Lien légal manquant
GIVEN une page générée sans lien « Mentions légales » ou « Vie privée » dans le pied de page
WHEN le test end-to-end de pied de page s'exécute en CI
THEN le job échoue avec le message "Liens légaux absents sur <URL>"
```

### Critères techniques (site statique)
- [ ] Pages `/mentions-legales/` et `/vie-privee/` en Markdown, avec un schéma de frontmatter (date de mise à jour obligatoire)
- [ ] Liens dans le pied de page de toutes les pages et mention courte sous le formulaire (US-008)
- [ ] WCAG 2.2 AA ; titres hiérarchisés ; ancres de section
- [ ] SEO : pages indexables mais exclues du llms.txt ; `dateModified` affichée
- [ ] Performance : Lighthouse ≥ 95

## Notes techniques (à confirmer en tech spec)
- Informations de l'hébergeur paramétrées dans `src/config/legal.ts` selon l'ADR hébergement.
- Contrôle de liste blanche partagé avec US-005, US-007 et US-024.
- À relire par le PO, et idéalement par sa société de portage salarial, avant la mise en production.

## Estimation
- **Story Points** : 2
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system et layout | Pied de page commun |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| — | Aucune (US-008, dans le même sprint, renvoie vers /vie-privee/#formulaire) |

## Sprint assigné
Sprint 1
