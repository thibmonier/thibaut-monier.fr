# PRD — Site personnel de Thibaut Monier

| Champ | Valeur |
|-------|--------|
| Version | 1.1 (après phase d'Analyse) |
| Date | 2026-10-14 |
| Auteur | Thibaut Monier (PO) — rédaction assistée |
| Track workflow | Enterprise |
| Statut | Planification |

---

## 1. Résumé exécutif

Créer le site personnel de Thibaut Monier : à la fois **CV en ligne**, **blog** (reprise des articles d'Agentic Agency), **laboratoire de tests d'outils** approfondis et **vitrine open source** (20 plugins Sylius 2, le bundle Symfony tailsfadmin, les contributions à career-ops).

Le site sert deux objectifs menés en parallèle :
1. **Décrocher un poste** (objectif final) : COO/CTO, Delivery Manager, directeur de projets IT, architecte e-commerce.
2. **Signer des missions freelance** en attendant (portage salarial, forfait) : delivery augmenté par IA, Sylius/Symfony, reprise d'applicatifs.

La thèse du site : **prouver plutôt qu'affirmer**. Chaque compétence revendiquée renvoie à une preuve consultable (plugin publié, PR mergée, article, test d'outil documenté, référence client).

## 2. Énoncé du problème

| Constat | Conséquence |
|---------|-------------|
| Le profil est dispersé : CV (fichier), LinkedIn, GitHub (20+ dépôts), Packagist, blog Agentic Agency rattaché à une marque d'agence. | Un recruteur ou un client ne voit jamais l'ensemble ; la cohérence du parcours (25 ans, du développement à la direction technique, puis l'IA appliquée au delivery) se perd. |
| Les 20 plugins Sylius représentent un travail important mais ne sont visibles que dépôt par dépôt sur GitHub. | La preuve d'expertise Sylius/B2B/conformité UE la plus forte du profil est sous-exploitée. |
| La « Boîte à outils » d'Agentic Agency compte 57 fiches, dont la plupart n'ont que des métadonnées et un lien. | Pas de valeur ajoutée par rapport à une liste de liens ; pas de démonstration de la rigueur d'évaluation, qui est pourtant un argument clé pour un poste de direction technique. |
| Le blog est publié sous la marque Agentic Agency. | L'autorité acquise (28 articles, SEO) ne profite pas au nom propre, alors que c'est la personne qu'on recrute. |
| Profil senior (plus de 25 ans d'expérience) sur un marché qui valorise l'actualité technique. | Il faut montrer de façon visible et datée une pratique actuelle : agentic engineering, Sylius 2, Symfony 8, MCP, Symfony AI. |

**Si rien n'est fait** : les candidatures et les prospections renvoient vers des supports éclatés, le taux de conversion des prises de contact reste faible et les preuves accumulées (open source, articles) ne pèsent pas dans la décision.

## 3. Objectifs et métriques de succès

### Objectifs (SMART)

| # | Objectif | Indicateur | Cible | Échéance |
|---|----------|------------|-------|----------|
| O1 | Mettre en ligne un CV crédible et complet | Site en production avec accueil, parcours et contact (sprint 1), puis CV PDF et preuves open source (sprint 2) | 100 % | Fin du sprint 1, puis fin du sprint 2 |
| O2 | Générer des opportunités | Prises de contact qualifiées (formulaire et RDV), étiquetées mission ou poste | ≥ 4 / mois | 3 mois après la mise en ligne |
| O3 | Valoriser l'open source | Visites des fiches plugins ; clics sortants vers GitHub et Packagist | ≥ 300 visites / mois ; ≥ 15 % de clics sortants | 3 mois après la mise en ligne |
| O4 | Conserver l'audience du blog migré | Trafic organique du blog par rapport à la période précédant la migration | ≥ 90 % à M+2 | 2 mois après la migration |
| O5 | Démontrer la rigueur d'évaluation | Tests d'outils complets publiés selon le protocole | ≥ 3 au lancement du labo, puis 2 / mois | Sprint 4, puis en continu |
| O6 | Qualité technique exemplaire (le site est lui-même une preuve) | Lighthouse (Performance, Accessibilité, Bonnes pratiques, SEO) | ≥ 95 sur chaque axe ; WCAG 2.2 AA | À chaque déploiement |

### KPI suivis

- Conversions : envois du formulaire de contact (avec le motif mission ou poste), clics de prise de RDV, téléchargements du CV PDF, clics vers LinkedIn.
- Engagement : pages par session sur le parcours de recrutement (accueil → parcours → open source → contact).
- Acquisition : trafic organique, citations par les moteurs IA (contrôle manuel mensuel sur ChatGPT, Perplexity et Claude).

## 4. Utilisateurs cibles

Le détail est dans [personas.md](personas.md).

| ID | Persona | Rôle | Priorité |
|----|---------|------|----------|
| P-001 | Claire Morel | DG ou DRH d'une scale-up ou ESN qui recrute un CTO, COO ou Delivery Manager | **Primaire** (objectif final : le poste) |
| P-002 | Marc Delaunay | Dirigeant e-commerce B2B ou d'agence, qui cherche un expert Sylius ou un pilote de delivery IA en mission | **Primaire** (revenus à court terme) |
| P-003 | Julien Ferreira | Lead dev ou intégrateur Sylius/Symfony qui évalue des plugins | Secondaire |
| P-004 | Sophie Lambert | Dev senior ou tech lead qui pratique l'agentic engineering et lit le blog et les tests d'outils | Secondaire |

## 5. Exigences fonctionnelles

Priorités : **P0** = indispensable au lancement, **P1** = important, **P2** = souhaitable.

### F1 — Profil et CV (EPIC-002)
| ID | Exigence | Priorité |
|----|----------|----------|
| F1.1 | Page d'accueil avec une proposition de valeur claire et **deux parcours explicites** : « Me confier une mission » et « Me recruter » | P0 |
| F1.2 | Parcours professionnel sous forme de frise : les 10 dernières années détaillées (rôle, période, contexte, réalisations chiffrées), les expériences antérieures résumées | P0 |
| F1.3 | Compétences et réalisations clés filtrables par domaine (delivery, architecture, e-commerce, données et migrations, IA appliquée), avec les références clients | P1 |
| F1.4 | CV PDF téléchargeable, généré au build avec Typst depuis **les mêmes données YAML** que les pages (pas de double saisie) | P0 |
| F1.5 | Page contact : formulaire avec un motif (mission, poste, autre) et un lien de prise de RDV | P0 |

### F2 — Blog (EPIC-003)
| ID | Exigence | Priorité |
|----|----------|----------|
| F2.1 | Migration des 28 articles d'Agentic Agency (contenu, images, frontmatter, FAQ) | P0 |
| F2.2 | Canonical vers le nouveau domaine sur chaque article migré ; table de correspondance prête pour de futures redirections 301 (agentic-agency.fr reste intact pour le moment) | P0 |
| F2.3 | Navigation par catégories, tags et séries, avec pagination | P1 |
| F2.4 | Recherche plein texte côté client | P1 |
| F2.5 | Flux RSS | P1 |

### F3 — Labo d'outils (EPIC-004)
| ID | Exigence | Priorité |
|----|----------|----------|
| F3.1 | Un **protocole de test standardisé**, imposé par le schéma de contenu : contexte et besoin, environnement (versions, OS, date du test), installation, scénarios de test reproductibles, résultats observés ou mesurés, limites, verdict, note multicritère, alternatives, date de dernière revérification | P0 |
| F3.2 | Au moins 3 tests complets publiés au lancement du labo | P0 |
| F3.3 | Annuaire des 57 outils migré depuis la Boîte à outils, avec un badge « testé » et un lien vers le test complet quand il existe | P1 |
| F3.4 | Médias de démonstration intégrés au test : captures, enregistrement de terminal, vidéo courte | P1 |
| F3.5 | Comparatifs entre outils d'une même catégorie, à partir des critères communs | P2 |

### F4 — Vitrine open source (EPIC-005)
| ID | Exigence | Priorité |
|----|----------|----------|
| F4.1 | Catalogue des 20 plugins Sylius 2 filtrable par thème : B2B, conformité UE, back-office, IA et intégrations | P0 |
| F4.2 | Fiche détaillée par plugin : problème résolu, fonctionnalités, compatibilité (versions de PHP, Sylius et Symfony), dépendances entre plugins, installation, captures, liens GitHub et Packagist | P0 |
| F4.3 | Données récupérées au moment du build (dernière version, étoiles, téléchargements Packagist, date de release), avec une valeur de repli si l'API est indisponible | P1 |
| F4.4 | Page du bundle Symfony **tailsfadmin** (thème admin Tailwind v4 publié sur Packagist, version 1.6, CI) | P1 |
| F4.5 | Étude de cas des **contributions à career-ops** (projet à 74k étoiles, membre de l'équipe Contributors) : 3 PR mergées (#3496, #3808, #3866), avec pour chacune le problème, le correctif et les tests de non-régression | P1 |

### F5 — SEO, GEO et mesure (EPIC-006)
| ID | Exigence | Priorité |
|----|----------|----------|
| F5.1 | Données structurées JSON-LD (Person, ProfilePage, BlogPosting, SoftwareSourceCode, BreadcrumbList, FAQPage), sitemap, robots.txt et llms.txt | P0 |
| F5.2 | Images Open Graph générées pour chaque page | P1 |
| F5.3 | Mesure d'audience sans cookie, avec suivi des conversions (Umami Cloud, offre gratuite) | P1 |

### F7 — Conformité légale (EPIC-001)
| ID | Exigence | Priorité |
|----|----------|----------|
| F7.1 | Mentions légales (LCEN) et politique de vie privée (RGPD : finalités, sous-traitants, durées, droits, absence de cookie), liées depuis toutes les pages et sous le formulaire | P0 |

### F6 — Internationalisation (EPIC-007)
| ID | Exigence | Priorité |
|----|----------|----------|
| F6.1 | Architecture i18n prévue dès le socle : le français est servi sans préfixe, l'anglais sous `/en/` | P1 (socle), P2 (activation) |
| F6.2 | Traduction anglaise des pages profil et vitrine open source, l'audience Sylius étant internationale | P2 |

## 6. Exigences non fonctionnelles

| Domaine | Exigence |
|---------|----------|
| Performance | Site statique ; LCP < 1,5 s, CLS < 0,05, INP < 200 ms (4G, mobile médian) ; Lighthouse ≥ 95 |
| Accessibilité | WCAG 2.2 AA ; navigation au clavier ; contrastes conformes ; `prefers-reduced-motion` respecté |
| SEO | URLs stables et lisibles ; aucune perte d'URL lors de la migration (100 % des anciennes URL redirigées) |
| Sécurité | Aucune base de données propre : les messages de contact transitent par un service tiers de formulaire conforme au RGPD (Web3Forms ou équivalent, voir la tech spec), avec anti-spam par champ piège (honeypot) et délai minimal ; en-têtes HTTP de sécurité (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) ; formulaire protégé contre le spam ; secrets uniquement en variables de build |
| Vie privée (RGPD) | Analytics sans cookie et **gratuit** (Umami Cloud Hobby), donc pas de bandeau de consentement ; mentions légales ; **le numéro de téléphone, l'âge et l'adresse précise ne sont pas publiés** (ils figurent dans le CV source) |
| Maintenabilité | Contenu en Markdown/MDX versionné ; une seule source de vérité pour le CV ; schémas de contenu typés et validés au build |
| Déploiement | Build reproductible, déploiement continu ; publication programmée des contenus datés dans le futur |
| Hébergement | **Coût marginal nul** : Railway (abonnement Hobby existant avec crédit disponible) ou Cloudflare Workers Static Assets (gratuit) ; choix par ADR en Conception (voir `analysis/technical-options.md`) |
| Environnements | **Tout est dockerisé, développement compris** : aucun outil sur le poste hors Docker ; chaque évolution est visible en environnement de développement avant le déploiement |
| Versions | Versions stables **les plus récentes** dans la limite des compatibilités (relevé du 2026-10-14 : Node 26, Astro 7.3.8, Tailwind 4.3.3, **TypeScript 6.0.3**, car la 7.0 n'est pas prise en charge par `@astrojs/check`) ; mises à jour automatisées (Renovate) |
| Qualité | Lint et formatage, vérification des liens cassés et Lighthouse CI dans la CI ; le build échoue si le schéma de contenu est invalide |

## 7. Périmètre

### Inclus
- Les blocs F1 à F6 décrits ci-dessus.
- Migration du blog et de la Boîte à outils d'Agentic Agency.
- Table de correspondance des anciennes URL, prête pour de futures redirections (non appliquée).

### Exclu (explicitement)
- Espace membre, commentaires, newsletter avec envoi d'e-mails (le flux RSS suffit, principe YAGNI).
- CMS headless ou back-office d'édition : le contenu reste dans Git.
- Toute modification d'agentic-agency.fr, y compris les redirections : le site reste en l'état (décision du 2026-10-14).
- Application mobile.
- Paiement ou prise de RDV payante.

## 8. Aperçu des EPICs et user stories

| EPIC | Nom | US | Points | Priorité |
|------|-----|----|--------|----------|
| EPIC-001 | Socle et walking skeleton | US-001 → US-003, US-029 | 13 | Must |
| EPIC-002 | Profil et CV | US-004 → US-008 | 19 | Must |
| EPIC-003 | Blog migré | US-009 → US-013 | 14 | Must |
| EPIC-004 | Labo d'outils | US-014 → US-018 | 19 | Must/Should |
| EPIC-005 | Vitrine open source | US-019 → US-023 | 17 | Must/Should |
| EPIC-006 | SEO, GEO et mesure | US-024 → US-026 | 11 | Must/Should |
| EPIC-007 | Version anglaise | US-027 → US-028 | 10 | Could |
| | **Total** | **29 US** | **103** | |

Le détail est dans `backlog/epics/` et `backlog/user-stories/`.

### Roadmap proposée (sprints de 2 semaines, vélocité 20 à 26 points)

| Sprint | But | Points |
|--------|-----|--------|
| 001 | Walking skeleton : site en production avec accueil, parcours, contact et mentions légales | 24 |
| 002 | Profil complet et vitrine open source (les preuves) | 25 |
| 003 | Blog migré et SEO | 25 |
| 004 | Labo d'outils | 19 |
| 005 | Version anglaise et réserve | 10 + réserve |

L'ordre suit l'urgence : recherche active de poste et de missions, donc le profil et les preuves passent d'abord ; le blog vient ensuite, car la migration comporte un risque SEO à préparer.

## 9. Contraintes et hypothèses

### Contraintes
- Un seul contributeur (développement agentique), disponible en parallèle de missions.
- Réutilisation recommandée du socle technique d'Agentic Agency (Astro, MDX, Tailwind v4, Pagefind, Docker/nginx, Railway). **La décision finale est prise en phase Conception (ADR).**
- Sources de contenu existantes : `career-ops/cv.md`, `sylius_plugins/docs/2026-10-14-catalogue-plugins.md`, captures du 2026-10-12, dépôt `blog/`.

### Hypothèses
- H1 : un recruteur passe moins de 2 minutes sur le site. La proposition de valeur et les preuves doivent donc être visibles sans défilement profond.
- H2 : les plugins et les PR mergées sont plus convaincants qu'une liste de compétences.
- H3 : des tests d'outils documentés et reproductibles différencient le profil des listes d'outils habituelles.
- H4 : les redirections 301 conservent l'essentiel du référencement du blog.
- H5 : l'API GitHub publique (sans jeton, ou avec un jeton en lecture seule en CI) et l'API Packagist suffisent pour les données affichées.

## 10. Risques et questions ouvertes

### Risques
| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Contenu dupliqué entre agentic-agency.fr et le nouveau site (aucune redirection possible tant que l'ancien site reste intact) | Élevée | Moyen | **Risque accepté par le PO** ; canonical autoréférent sur le nouveau site, mention de la première publication, table de correspondance prête pour une bascule ultérieure, suivi dans la Search Console |
| Double positionnement (mission et poste) qui brouille le message | Moyenne | Élevé | Proposition de valeur unique (« direction technique et delivery augmenté par IA »), puis deux appels à l'action distincts ; suivi du motif de contact |
| Contenu des tests d'outils long à produire | Élevée | Moyen | Gabarit imposé par le schéma, 3 tests au lancement puis rythme soutenable ; les 57 fiches existantes restent en annuaire |
| Données GitHub et Packagist indisponibles au build | Faible | Faible | Cache et valeurs de repli ; le build n'échoue jamais pour une métrique |
| Divulgation d'informations personnelles du CV source | Faible | Moyen | Liste blanche des champs publiés ; le CV PDF public est une variante sans téléphone ni âge |
| Contenu obsolète (versions, tests d'outils) | Moyenne | Moyen | Champ « dernière revérification » obligatoire ; alerte au-delà de 6 mois |

### Décisions prises (2026-10-14)
1. **Domaine** : thibaut-monier.fr ou .com (l'un redirige vers l'autre, à arbitrer en tech spec).
2. **Prise de RDV** : Calendly, par lien sortant.
3. **agentic-agency.fr** : conservé en l'état, sans aucune modification. Le nouveau site est canonique pour les articles migrés, et le contenu dupliqué est un risque accepté.
4. **Labo d'outils** : les 3 premiers tests portent sur les outils existants ; de nouvelles fiches (dont des outils agentiques) viendront ensuite.
5. **Analytics** : **Umami Cloud Hobby** (gratuit, sans cookie, événements personnalisés). Cloudflare Web Analytics a été écarté : il ne gère pas les événements personnalisés.
6. **Hébergement** à coût marginal nul (Railway avec crédit Hobby, ou Cloudflare gratuit ; la production non conteneurisée sur Cloudflare est acceptée), environnement entièrement dockerisé (développement compris), versions les plus récentes : voir §6.
7. **CV PDF** : Typst (phase d'Analyse).
8. **Frise** : 10 dernières années détaillées, antériorité résumée ; ni âge ni date de naissance (risque d'âgisme R-07).

### Questions ouvertes restantes
1. **Disponibilité** affichée : faut-il un statut visible (« Disponible pour mission / ouvert aux postes de… ») ?
2. **Témoignages et recommandations** : en existe-t-il qu'on peut publier (LinkedIn) ?
