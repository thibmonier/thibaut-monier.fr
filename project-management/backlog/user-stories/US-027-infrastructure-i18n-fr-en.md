# US-027 : Infrastructure i18n FR/EN activée

## Epic parent
EPIC-007 : Version anglaise

## Persona concerné
**P-003** : Julien - Lead dev et intégrateur Sylius/Symfony

## User Story

### Carte
**En tant que** P-003 : Julien, lead développeur anglophone
**Je veux** basculer le site en anglais via un sélecteur de langue, sous l'URL `/en/`, avec un repli propre quand une page n'est pas traduite
**Afin de** lire le site dans ma langue et partager des liens anglais à mon équipe

### Conversation
- Règle du PRD (F6.1) : français sans préfixe, anglais sous `/en/`. L'architecture est prévue dès le socle ; cette US en assure l'**activation**.
- Politique de repli : une page non traduite n'est pas dupliquée en français sous `/en/` ; le sélecteur la désactive, et `/en/…` renvoie vers l'équivalent français avec un bandeau « Cette page n'est pas disponible en anglais. » (à arbitrer : redirection ou page minimale).
- Chaînes d'interface (menus, boutons, messages) dans des fichiers de traduction, pas dans les gabarits.
- Le blog (28 articles) reste en français ; seules les pages profil et vitrine sont traduites (US-028).
- Détection automatique de la langue du navigateur : non (YAGNI), le choix est explicite.

### Validation INVEST
- [x] Independent : ne dépend que de la page d'accueil (US-004) pour tester
- [x] Negotiable : repli et sélecteur discutables
- [x] Valuable : ouvre l'audience internationale
- [x] Estimable : routage, sélecteur, balises, fichiers de chaînes
- [x] Sized : 5 points
- [x] Testable : URL, balises et liens vérifiables en CI

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Bascule de langue sur une page traduite
GIVEN la page d'accueil disponible en français (`/`) et en anglais (`/en/`)
WHEN P-003 active « EN » dans le sélecteur de langue
THEN l'URL devient `/en/` et le contenu, la navigation et le pied de page sont en anglais
AND l'attribut `<html lang>` vaut `en`
AND les deux pages déclarent `hreflang="fr"`, `hreflang="en"` et `hreflang="x-default"` (pointant vers le français)
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Page non traduite
GIVEN un article de blog existant uniquement en français
WHEN P-003 consulte la page et ouvre le sélecteur de langue
THEN l'option « EN » est désactivée avec l'infobulle « Not available in English »
AND aucune balise hreflang EN n'est émise pour cet article

Scenario: Accès direct à une URL anglaise sans traduction
GIVEN l'URL `/en/blog/mon-article/` sans contenu anglais
WHEN P-003 l'ouvre
THEN il est redirigé (301) vers `/blog/mon-article/` avec le bandeau « This page is not available in English. »
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Chaîne d'interface manquante
GIVEN une clé de traduction présente en français et absente en anglais
WHEN le build est lancé
THEN le build échoue avec le message « Traduction manquante : clé « {clé} » absente de en.json »

Scenario: Hreflang non réciproque
GIVEN une page FR déclarant un équivalent EN dont la page n'existe pas
WHEN le contrôle CI des alternates s'exécute
THEN la CI échoue avec le message « hreflang non réciproque : {urlFR} → {urlEN} introuvable »
```

### Critères techniques (site statique)
- [ ] Routage i18n : français sans préfixe, anglais `/en/` ; sitemap avec alternates ; canonical par langue
- [ ] Sélecteur de langue accessible : `lang` sur chaque lien (`lang="en"`), état courant `aria-current`, atteignable au clavier ; WCAG 2.2 AA
- [ ] Fichiers de chaînes `fr.json` et `en.json` avec vérification de parité au build
- [ ] Responsive : sélecteur visible dans l'en-tête mobile
- [ ] SEO : hreflang réciproques, `inLanguage` dans le JSON-LD, formats de date localisés
- [ ] Performance : aucun surcoût client (pas de détection ni de JS pour le routage), Lighthouse ≥ 95 sur `/` et `/en/`

## Notes techniques (à confirmer en tech spec)
- Support i18n natif du framework (routage par locale, `prefixDefaultLocale: false`) ; sinon dossiers `src/pages/en/`.
- Redirections 301 déclarées dans la configuration nginx ou le fichier de redirections d'EPIC-003.
- Lien avec EPIC-006 : images Open Graph et llms.txt par langue.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Could

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-004 | Page d'accueil avec double parcours (EPIC-002) | Première page à servir dans les deux langues |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-028 | Traduction EN des pages profil et vitrine |

## Sprint assigné
Sprint 5
