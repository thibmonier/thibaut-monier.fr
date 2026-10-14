# US-028 : Traduction EN des pages profil et vitrine open source

## Epic parent
EPIC-007 : Version anglaise

## Persona concerné
**P-003** : Julien - Lead dev et intégrateur Sylius/Symfony

## User Story

### Carte
**En tant que** P-003 : Julien, lead développeur anglophone
**Je veux** lire en anglais les pages profil et la vitrine open source (catalogue, fiches plugins, tailsfadmin, career-ops)
**Afin de** évaluer un plugin et son auteur dans ma langue, sans dépendre d'un traducteur automatique

### Conversation
- Périmètre : pages profil (US-004 accueil, US-005 parcours, au minimum ; US-006 à US-008 à arbitrer) et vitrine (US-019 à US-023). Hors périmètre : blog, labo d'outils.
- Méthode : traduction assistée par IA puis relecture humaine obligatoire (aucune page publiée sans relecture) ; glossaire des termes (plugin, bundle, B2B, conformité UE → « EU compliance », Factur-X, GPSR) pour la cohérence. À arbitrer par le PO.
- Les noms de paquets, commandes et liens ne se traduisent pas ; les intitulés de postes et réalisations chiffrées sont traduits sans changer les chiffres.
- Données personnelles : la version anglaise suit la même liste blanche de champs publiés (pas de téléphone, âge ni adresse).
- Maintenance : toute modification d'une page française traduite doit signaler la traduction à revoir.

### Validation INVEST
- [x] Independent (après US-027)
- [x] Negotiable : périmètre exact des pages
- [x] Valuable : critère d'abandon n°1 de P-003 levé
- [x] Estimable : volume connu (profil + 20 fiches + 2 pages)
- [x] Sized : 5 points, relecture comprise
- [x] Testable : parité de contenu et métadonnées vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Fiche plugin en anglais
GIVEN US-027 en production et la fiche Tier Pricing traduite
WHEN P-003 ouvre `/en/open-source/tier-pricing/`
THEN le titre, le problème résolu, les fonctionnalités, la matrice de compatibilité et la section Installation sont en anglais
AND les commandes, noms de paquets et liens sont identiques à la version française
AND les 20 fiches plugins, la page tailsfadmin et l'étude de cas career-ops existent sous `/en/`
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Filtre du catalogue en anglais
GIVEN le catalogue anglais affiché
WHEN P-003 sélectionne le thème « B2B »
THEN 9 cartes s'affichent et les libellés des 4 thèmes sont « B2B », « EU compliance », « Back-office », « AI & integrations »

Scenario: Traduction en retard sur le français
GIVEN une fiche française modifiée après sa traduction
WHEN le contrôle de fraîcheur s'exécute en CI
THEN un avertissement « Traduction à revoir : {slug} (source modifiée le {date}) » est émis
AND le build n'échoue pas
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Fiche anglaise incomplète
GIVEN une fiche anglaise sans section « Installation »
WHEN le build est lancé
THEN le build échoue avec le message « Plugin « {slug} » (en) invalide : champ « installation » manquant »

Scenario: Fuite d'information personnelle
GIVEN une page anglaise contenant un numéro de téléphone
WHEN le contrôle de contenu public s'exécute
THEN la CI échoue avec le message « Donnée non publiable détectée sur {url} : numéro de téléphone »
```

### Critères techniques (site statique)
- [ ] Schémas de contenu identiques aux versions françaises, avec champ `lang` et lien `traductionDe` vers la source
- [ ] Parité vérifiée au build (mêmes sections, mêmes liens sortants)
- [ ] Responsive, WCAG 2.2 AA (`lang` correct, textes alternatifs traduits)
- [ ] SEO : title et meta en anglais, hreflang réciproques avec le français, JSON-LD `inLanguage: "en"`
- [ ] Performance : Lighthouse ≥ 95 sur les pages anglaises

## Notes techniques (à confirmer en tech spec)
- Contenu dans `src/content/{collection}/en/` ou dossier de locale équivalent ; réutilisation des composants sans duplication.
- Volume indicatif : environ 25 pages à relire ; budget de relecture à confirmer avant le Sprint 5.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Could

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-027 | Infrastructure i18n FR/EN activée | Routage `/en/`, sélecteur, hreflang |
| US-005 | Parcours professionnel en frise (EPIC-002) | Pages profil à traduire |
| US-020 | Fiche détaillée d'un plugin | Pages vitrine à traduire |

### US dépendantes (BLOQUÉES)
Aucune.

## Sprint assigné
Sprint 5
