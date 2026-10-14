# US-019 : Catalogue des 20 plugins Sylius 2 filtrable par thème

## Epic parent
EPIC-005 : Vitrine open source

## Persona concerné
**P-003** : Julien - Lead dev et intégrateur Sylius/Symfony

## User Story

### Carte
**En tant que** P-003 : Julien, lead développeur Sylius
**Je veux** parcourir les 20 plugins et les filtrer par thème (B2B, conformité UE, back-office, IA et intégrations)
**Afin de** trouver en moins de 30 secondes le plugin qui couvre mon besoin avant de réécrire quoi que ce soit

### Conversation
- Répartition actuelle du catalogue : B2B 9 (Company Accounts, Purchase Approval, Quick Order, Quote Request, Tier Pricing, Trade Credit, Container Fill, B2B MCP, Order Hold), conformité UE 3 (Factur-X, GPSR, Withdrawal), back-office 5 (Admin Order Creation, Audit Log, Bulk Actions, Command Palette, Timeline), IA et intégrations 3 (Agentic Feeds, AI Catalog Copilot, Webhook Outbox). Total 20. Un plugin n'a qu'un thème principal ; un second thème est-il utile ? Proposition : non (YAGNI).
- Contenu d'une carte : nom, accroche d'une phrase, thème, versions Sylius supportées, lien vers la fiche. Le détail est dans US-020.
- Source des données : catalogue du 2026-10-14 et README des dépôts ; une seule source de vérité par plugin (fichier de contenu), pas de saisie en double.
- Les plugins en cours de référencement sur la marketplace Sylius : afficher le statut ? À arbitrer plus tard.

### Validation INVEST
- [x] Independent : ne dépend que du design system
- [x] Negotiable : cartes et filtres discutables
- [x] Valuable : objectif O3, besoin de P-002 et P-003
- [x] Estimable : schéma + page + filtre
- [x] Sized : 5 points
- [x] Testable : décomptes par thème vérifiables

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Catalogue complet puis filtre par thème
GIVEN les 20 plugins renseignés
WHEN P-003 ouvre la page du catalogue puis sélectionne le thème « B2B »
THEN 9 cartes s'affichent, chacune avec nom, accroche, thème et lien vers la fiche
AND le compteur indique « 9 plugins »
AND l'URL devient `?theme=b2b` et le partage de l'URL restitue le même filtre
```

### Scénarios alternatifs (minimum 2)
```gherkin
Scenario: Recherche par mot-clé
GIVEN le catalogue affiché sans filtre
WHEN P-003 saisit « facture »
THEN la carte Factur-X est la première affichée
AND les cartes sans correspondance sont masquées avec un compteur mis à jour

Scenario: Accès sans JavaScript
GIVEN le JavaScript désactivé
WHEN P-003 ouvre le catalogue
THEN les 20 plugins sont listés, regroupés par thème avec des ancres de navigation
```

### Scénarios d'erreur (minimum 2)
```gherkin
Scenario: Aucun résultat
GIVEN la recherche « blockchain »
WHEN P-003 valide
THEN le message « Aucun plugin ne correspond à « blockchain ». Essayez un autre mot-clé ou parcourez les 4 thèmes. » s'affiche

Scenario: Fiche plugin avec thème inconnu
GIVEN un plugin dont le thème vaut « paiement »
WHEN le build est lancé
THEN le build échoue avec le message « Plugin « {slug} » invalide : thème doit valoir b2b, conformite-ue, back-office ou ia-integrations »
```

### Critères techniques (site statique)
- [ ] Collection `plugins` typée (slug, nom, accroche, thème, dépôt, paquet) validée au build ; un test CI vérifie le décompte de 20
- [ ] Page de catalogue, carte `PluginCard`, filtre en amélioration progressive
- [ ] Responsive (1 à 3 colonnes), WCAG 2.2 AA : filtres en boutons à bascule (`aria-pressed`), résultats annoncés (`aria-live`), focus visible
- [ ] SEO : title « Plugins Sylius 2 open source : B2B, conformité UE, back-office, IA », `ItemList` en JSON-LD (à confirmer avec EPIC-006)
- [ ] Performance : Lighthouse ≥ 95, aucun appel réseau à l'exécution

## Notes techniques (à confirmer en tech spec)
- Import initial scripté depuis le catalogue Markdown, puis fichiers de contenu maintenus à la main.
- Pagefind (recherche) peut couvrir la recherche en mot-clé ; sinon filtre JS léger sur les cartes.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Must

## Dépendances
### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| US-002 | Design system | Cartes, grille, filtres |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-020 | Fiche détaillée d'un plugin |

## Sprint assigné
Sprint 2
