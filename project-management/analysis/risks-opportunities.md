# Registre des risques et opportunités

> Phase d'Analyse, 2026-10-14. Ce registre complète le §10 du PRD. Échelle : Faible, Moyen, Élevé.

## Risques

| ID | Risque | Probabilité | Impact | Atténuation | Propriétaire |
|----|--------|-------------|--------|-------------|--------------|
| R-01 | **Contenu dupliqué** entre agentic-agency.fr et le nouveau site, sans redirection possible. Google indique que la canonical est un « indice, pas une règle », et recommande la redirection permanente pour supprimer les doublons | Élevée | Moyen | Risque accepté par le PO ; canonical autoréférente, mention de la première publication, sitemap soumis ; table de correspondance prête (US-010) ; suivi dans la Search Console à M+1 et M+2 | PO |
| R-02 | **Incompatibilités de dernières versions** (ex. TypeScript 7.0.2, sorti le jour même, non pris en charge par `@astrojs/check`) | Élevée | Moyen | Matrice de compatibilité dans l'ADR de stack ; règles Renovate ; build CI bloquant | Tech |
| R-03 | **Dérive « tout dockerisé »** si la production est sur Cloudflare (CDN, pas de conteneur) | Moyenne | Faible | Décision explicite dans l'ADR ; `wrangler dev` dans Docker pour un environnement de développement fidèle à la production | PO + Tech |
| R-04 | **Offres gratuites révisées** (Umami, Web3Forms, Calendly, Cloudflare) | Moyenne | Moyen | Pas d'intégration profonde : un seul script ou lien par service, interchangeable ; revue semestrielle des offres | Tech |
| R-05 | **Transfert de données hors UE** (Web3Forms aux États-Unis) | Certaine | Faible | Aucun stockage chez le prestataire ; DPA ; mention d'information ; données minimales (nom, e-mail, motif, message) | PO |
| R-06 | **Message brouillé** par le double objectif poste et mission | Moyenne | Élevé | Proposition de valeur unique ; deux appels à l'action ; mesure du motif de contact (Umami) ; revue après 1 mois | PO |
| R-07 | **Âgisme** : profil de plus de 25 ans d'expérience sur un marché qui valorise l'actualité | Moyenne | Élevé | Mettre en avant la pratique récente et datée (plugins Sylius 2 de 2026, PR career-ops, agentic engineering) ; ne publier ni l'âge ni la date de naissance ; frise centrée sur les 10 dernières années, ancienneté résumée | PO |
| R-08 | **Charge de production de contenu** (28 articles à migrer, tests d'outils, traductions) | Élevée | Moyen | Migration scriptée ; protocole de test imposé par le schéma ; anglais en dernier | PO |
| R-09 | **Outillage Lighthouse CI peu maintenu** (@lhci/cli, dernière publication en 06/2025) | Moyenne | Faible | Alternative à évaluer en ADR (Lighthouse via Playwright) | Tech |
| R-10 | **Calendly gratuit limité à 1 type d'événement** | Faible | Faible | Un seul type « Échange découverte (30 min) », avec le motif demandé dans le formulaire Calendly | PO |
| R-11 | **Mentions légales absentes** du backlog (obligation LCEN) | Certaine | Moyen | Ajouter une story (voir le delta du backlog dans `research-summary.md`) | PO |
| R-12 | **Licences des images migrées** (Unsplash) | Faible | Faible | Contrôle de licence et d'attribution pendant US-009 | PO |

## Opportunités

| ID | Opportunité | Valeur | Effort | Piste |
|----|-------------|--------|--------|-------|
| O-01 | **Backlinks depuis les 21 README** (20 plugins + tailsfadmin) et Packagist vers les fiches du site | Élevée (SEO, trafic qualifié P-003) | Faible | Ajouter un lien « Documentation et démo » dans chaque README une fois US-020 livrée |
| O-02 | **Marketplace Sylius** (référencement en cours) | Élevée (visibilité P-002, P-003) | Faible | Pointer les fiches marketplace vers le site |
| O-03 | **GEO** : être cité par les moteurs IA sur « plugin Sylius B2B », « Factur-X Sylius », « delivery augmenté par IA » | Élevée | Moyen | JSON-LD Person, ProfilePage, SoftwareSourceCode et `sameAs` (GitHub, LinkedIn, Packagist) ; llms.txt (proposition non standard, coût marginal faible) ; contenus factuels et datés |
| O-04 | **Gabarit Typst du CV réutilisable** pour des CV ciblés (career-ops) | Moyenne | Faible | Même source YAML et variantes de gabarit |
| O-05 | **Le site comme preuve** : un dépôt public, une CI exemplaire et des ADR montrent la rigueur de direction technique | Moyenne (P-001) | Faible | Lien « Comment ce site est construit » dans le pied de page |
| O-06 | **Réutilisation du socle Agentic Agency** (composants, SEO, Pagefind) | Moyenne (vélocité) | Faible | Extraction des composants utiles au sprint 1 |
| O-07 | **Hébergement à 0 €** chez Cloudflare (compte existant) | Moyenne | Faible | ADR hébergement |
| O-08 | **Contenu de conférences et de méthode** (dossier « Agentic Devs Orga » : présentations, infographies SDD) | Moyenne (crédibilité P-001, P-004) | Moyen | Future story « Conférences et méthode » (hors backlog actuel) |
