# Synthèse de recherche

> Phase d'Analyse (track Enterprise), 2026-10-14. Ce document remplace `research-draft.md`. Détails : [constraints.md](constraints.md), [risks-opportunities.md](risks-opportunities.md), [technical-options.md](technical-options.md).

## 1. Domaine

| Question | Réponse |
|----------|---------|
| Problème résolu | Un profil hybride (25 ans, de la direction technique à l'IA appliquée au delivery) dispersé entre CV, LinkedIn, plus de 21 dépôts et le blog d'une autre marque. Les preuves les plus fortes (plugins Sylius 2, PR career-ops) sont invisibles pour un décideur |
| Parties prenantes | Le PO (Thibaut) ; recruteurs et dirigeants (P-001) ; clients en mission (P-002) ; intégrateurs Sylius (P-003) ; pairs praticiens de l'agentic engineering (P-004) |
| Moteurs | Recherche active de poste (objectif final) et de missions (revenus immédiats) |
| Succès | ≥ 4 contacts qualifiés par mois ; ≥ 300 visites par mois sur les fiches plugins ; Lighthouse ≥ 95 ; walking skeleton en production en 2 semaines |

## 2. Marché et bonnes pratiques

> Cette section repose sur l'expertise et sur les guides officiels de Google. La recherche d'exemples de portfolios de CTO n'a pas abouti dans le temps imparti ; elle est à compléter si nécessaire.

- **Données structurées de profil** (doc Google « ProfilePage », vérifiée) : `mainEntity` (Person) obligatoire, `name` requis, `dateCreated` et `dateModified` en ISO 8601, validation avec le Rich Results Test. C'est le levier SEO et GEO principal pour une page « À propos ».
- **llms.txt** : simple proposition (Answer.AI, 2024), dont l'adoption par les moteurs est contestée. Son coût est quasi nul, on le garde, mais on n'en attend rien de mesurable.
- **Ce qui convertit un décideur** (pratique établie des portfolios seniors) :
  - preuves chiffrées au-dessus de la ligne de flottaison ;
  - études de cas au format « problème, rôle, résultat » plutôt que des listes de technologies ;
  - un appel à l'action par intention, avec la disponibilité affichée ;
  - un CV PDF transmissible.
  Ces éléments sont **déjà couverts** par US-004 à US-008 et US-023.
- **Le labo d'outils comme différenciateur** : un protocole daté et reproductible se distingue des listes d'outils, ce qui confirme EPIC-004.
- **Contenu dupliqué** (Google Search Central) : la canonical est un « indice », la redirection permanente est la méthode recommandée. Comme agentic-agency.fr reste intact, le risque est accepté (R-01).

## 3. Technique : conclusions clés

1. **Stack confirmée** : Astro 7.3.8, Tailwind 4.3.3, Node 26 (LTS le 2026-10-28), Pagefind 1.5.2. Elle reprend le socle Agentic Agency avec des montées de versions mineures.
2. **Piège de version** : TypeScript 7.0.2, sorti le 2026-10-14, n'est pas pris en charge par `@astrojs/check` → **on fixe TypeScript 6.0.3**. La consigne « dernières versions » s'applique dans la limite des compatibilités, documentées en ADR.
3. **Hébergement** : Cloudflare Workers Static Assets est gratuit et illimité pour les fichiers statiques, et gère `_headers` (CSP, HSTS) et `_redirects`. Railway coûte au minimum 5 $/mois, sauf si un abonnement Hobby existant a du crédit libre. **Recommandation : Cloudflare**, avec un point à valider : la production ne serait pas un conteneur (R-03).
4. **Analytics** : Cloudflare Web Analytics ne gère pas les événements personnalisés. **Umami Cloud Hobby** est gratuit, sans cookie et gère les événements : recommandé pour mesurer O2 et O3.
5. **CV PDF** : **Typst** (léger, très bonne typographie, lit le YAML) plutôt que Chromium headless.
6. **Formulaire** : Web3Forms (aucun stockage, serveurs aux États-Unis, DPA disponible), avec une mention RGPD.
7. **Environnement de développement entièrement dockerisé** : l'existant (`../blog`) n'en a pas, il faut le créer (`compose.yaml` avec un service de développement et un service de build et de déploiement).

## 4. Delta proposé sur le PRD et le backlog (à valider avant la Conception)

| # | Changement | Type | Effet |
|---|-----------|------|-------|
| D-1 | **Nouvelle story : Mentions légales et vie privée** (éditeur, hébergeur, sous-traitants Web3Forms, Umami et Calendly, information RGPD) | Ajout, 2 points, Must, sprint 1 | Obligation LCEN et RGPD (CR-1, CR-3) ; sprint 1 porté à 24 points |
| D-2 | US-026 : outil d'analytics **Umami Cloud Hobby** au lieu de Cloudflare Web Analytics | Modification | Scénarios d'événements à nouveau mesurables tels qu'écrits |
| D-3 | US-007 : génération du PDF avec **Typst**, à partir des données YAML partagées | Précision des notes techniques | Pas de Chromium dans l'image ; le spike PDF devient inutile |
| D-4 | US-001 : **hébergement Cloudflare Workers** (sous réserve d'ADR), environnement de développement `wrangler dev` dans Docker ; sinon Railway | Précision | Coût de 0 € |
| D-5 | US-002 : routage i18n natif prévu dès le socle (`prefixDefaultLocale: false`) | Précision | Prévient la refonte relevée pour US-027 |
| D-6 | US-005 : frise centrée sur les 10 dernières années, ancienneté résumée (R-07) | Précision, à valider par le PO | Atténue le risque d'âgisme |
| D-7 | PRD : TypeScript 6.0.3 fixé, Node 26, mise à jour des contraintes | Mise à jour | Cohérence avec CT-3 et CT-4 |

## 5. Questions pour le PO

1. **Production sur Cloudflare (CDN, pas de conteneur)** : est-ce acceptable au regard de la consigne « tout dockerisé », sachant que le développement, la CI et le déploiement restent dans Docker ? Ton abonnement Railway Hobby a-t-il du crédit libre ?
2. **Umami Cloud au lieu de Cloudflare Web Analytics** : d'accord, pour pouvoir mesurer les clics de conversion ?
3. **D-6 (frise centrée sur les 10 dernières années)** : d'accord ?
