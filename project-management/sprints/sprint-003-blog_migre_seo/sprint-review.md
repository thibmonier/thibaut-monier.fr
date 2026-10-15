# Sprint Review : Sprint 003 « Blog migré et SEO »

> Préparée le 2026-10-15 (workflow:review, adapté site statique Astro/Docker/Railway). Branche `feature/sprint-003-blog_migre_seo`, PR n°3 ouverte en brouillon (https://github.com/thibmonier/thibaut-monier.fr/pull/3, « feat: sprint 3, blog migré et SEO »), 29 commits, 307 fichiers modifiés (+21 173 / -159). Format : sprint 2 (`../sprint-002-preuves_profil_open_source/sprint-review.md`).
>
> **La production Railway n'est PAS mise à jour pour ce sprint.** Railway déploie `main` : le sprint 3 n'y sera qu'après la fusion de la PR n°3 (squash) et la configuration des variables (`PUBLIC_SITE_URL` avec schéma, `PUBLIC_UMAMI_WEBSITE_ID`). La démo se fait sur un build local de la branche ou sur le build de la CI.

**Sprint Goal** : « Rapatrier les articles d'Agentic Agency sur le nom propre, avec le nouveau domaine comme référence, et rendre tout le site lisible par les moteurs classiques et IA. »

## 1. Atteinte du Sprint Goal : OUI sur le plan technique, PARTIELLEMENT à ce stade (⚠️)

| Volet du goal | État | Preuve |
|---------------|------|--------|
| Articles rapatriés | ✅ | 28 articles sous `/blog/<slug>/`, 22 images, index, 5 catégories, 19 tags, 6 séries |
| Nouveau domaine comme référence | ✅ | Canonical autoréférente (`blog-canonical.spec.ts`), mention d'origine datée, table de 95 entrées, fichier nginx généré **sans être déployé** (artefact CI `redirections-nginx`, 2 190 octets, au moins 56 règles) ; aucune URL de domaine en dur (contrôle `no-hardcoded-domain`) |
| Lisible par les moteurs classiques | ✅ | `sitemap-index.xml` (90 URL avec `lastmod`), `robots.txt`, JSON-LD (`Person`, `ProfilePage`, `SoftwareSourceCode`, `ItemList`, `BlogPosting`, `FAQPage`, `BreadcrumbList`), titres ≤ 60 et uniques, images Open Graph 1200 × 630 |
| Lisible par les moteurs IA | ✅ | `llms.txt` (55 liens), flux `rss.xml` (20 articles) |
| Conversions mesurées | ⚠️ | Code et CSP livrés (Umami sans cookie, DNT et GPC respectés) ; **aucun enregistrement réel** tant que le compte Umami et `PUBLIC_UMAMI_WEBSITE_ID` n'existent pas (T-900-28) |
| Validation PO | ⚠️ | 0 article validé sur 28, 3 FAQ et 22 licences d'images en attente ; les 8 stories sont `done-pending-po` |

Le goal est atteint dans le code, la CI et la revue DoD (95/100 en seconde passe, 0 bloquant). Il ne l'est pleinement qu'après validation des contenus, fusion, déploiement et fumée réelle sur la production.

## 2. Incrément démontrable

Branche testable en local (`make` du projet, Docker) ou sur le build de la CI. **Pas encore en production.**

| Page / ressource | Contenu |
|------------------|---------|
| `/blog/` et `/blog/page/N/` | Liste paginée (12 articles, 3 pages), filtre par catégorie repliable sous 768 px ; `/blog/page/1/` et `/blog/page/9/` en 404 avec « Retour au blog » |
| `/blog/<slug>/` (28) | Article, FAQ repliable au clavier (3 articles), note d'auteur, mention d'origine avec date, encart « article N sur M » pour les séries, canonical autoréférente |
| `/recherche/` | Pagefind chargé à la première interaction (« tokens » en moins de 300 ms, « methode » sans accent), `noindex`, repli sans JavaScript, index ≤ 500 Ko |
| `/rss.xml` | 20 articles, programmés exclus, découverte automatique, lien « S'abonner (RSS) » en pied de page |
| `/sitemap-index.xml`, `/robots.txt`, `/llms.txt` | Exhaustifs, sans pages `noindex` |
| `/og/<page>.png` | Image Open Graph 1200 × 630, moins de 300 Ko, titre tronqué à 90 caractères |
| Mesure d'audience | Chargeur différé, événements `contact_submit`, `cv_download`, `rdv_click`, `outbound_*` ; section « Mesure d'audience » de `/vie-privee/` |
| Artefact CI `redirections-nginx` | Fichier de redirections généré, non déployé |

Défauts connus : lien d'origine vers `agentic-agency.fr` (répond 401, m4) ; `/recherche/` hors Lighthouse (m2) ; intitulé de profil hétérogène (m7) ; statuts de 16 tâches à solder (m9) ; environ 420 lignes de corps d'articles avec espace ordinaire avant `: ; ? !` (m1, décision PO).

## 3. User stories livrées (25 points planifiés)

| ID | Titre | Pts | Démo | Statut |
|----|-------|-----|------|--------|
| US-009 | Migration des 28 articles | 5 | ✅ | ✅ Done sous réserve PO (0/28 validés, 3 FAQ, licences de 22 images, anomalies de contenu, typographie des corps) |
| US-010 | Canonical et table de correspondance | 2 | ✅ | ✅ Done sous réserve PO (m4 : lien d'origine ; redirections volontairement non déployées) |
| US-011 | Navigation du blog | 3 | ✅ | ✅ Done sous réserve PO (validation des contenus) |
| US-012 | Recherche plein texte | 2 | ✅ | ✅ Done sous réserve PO (m2 : `/recherche/` hors Lighthouse) |
| US-013 | Flux RSS | 2 | ✅ | ✅ Done sous réserve PO |
| US-024 | SEO technique et JSON-LD | 5 | ✅ | ✅ Done sous réserve PO (Search Console, Rich Results, domaine : T-900-28) |
| US-025 | Images Open Graph | 3 | ✅ | ✅ Done sous réserve PO (ADR-0012 « Proposé » ; « maximum 3 lignes » validé à la revue visuelle) |
| US-026 | Analytics sans cookie et conversions | 3 | ✅ | ✅ Done sous réserve PO (ADR-0011 « Proposé », compte Umami, enregistrement réel) |

**Livré côté équipe : 25/25 points (100 %).** Statut `.bmad` : 8 US `done-pending-po`, sprint en `review`. Aucune story reportée. Acceptation PO : 0 point à ce jour.

## 4. Métriques

| Métrique | Valeur |
|----------|--------|
| Points planifiés / livrés (équipe) / acceptés (PO) | 25 / 25 / 0 |
| Vélocité | 25 pts (sprint 1 : 24, sprint 2 : 25) ; moyenne glissante des 3 sprints : 24,7 |
| Tâches | 142 : 121 terminées, 10 en cours, 6 en revue, 5 à faire au board du jour (les statuts « en cours » et « revue » sont à solder, m9) ; 24 de phase 0, 55 du lot A, 54 du lot B, 9 de phase 4 |
| Tests unitaires | 990 (91 fichiers), couverture lignes 96,3 %, instructions 95,75 % |
| Tests e2e (CI, run 38713520394, `095eb39`) | **615 exécutés / 3 ignorés, 0 hors liste d'exceptions** (`tests/e2e/skip-allowlist.json`) ; sprint 2 : 427 / 3 |
| Lighthouse | 26 pages échantillonnées (46 pages × 3 au départ, ramenées par échantillonnage), médiane de 3, ≥ 0,95 sur les 4 axes, minimum 0,99 en performance |
| Revue DoD indépendante | 88/100 en première passe (0 bloquant, 4 majeurs), **95/100** en seconde passe ; M1, M2, M4 corrigés ; M3 (phase 4) partiellement corrigé |
| Runs CI sur la branche | 8 runs : 2 annulés (remplacés par un push), 4 échecs (timeout Lighthouse, contrôle de domaine en dur, test de `ci.yml`, test e2e de la typographie), succès sur `c964f3b` puis `095eb39` ; run 38716132128 sur `79cbae1` en cours à la rédaction |
| Espace disque | Pic à 1,2 Go libres ; 2 workers séquencés ; e2e local abandonné au profit de la CI (décision PO) ; 0 perte de volume Docker (contrôle `no-global-prune` vert) |
| Durée de la CI | Non mesurée formellement (T-900-25 à faire) ; Lighthouse reste dans le job `e2e` (environ 15 min sur un délai porté à 30 min) |

## 5. Sprint précédent : actions de rétro et incidents

Actions de la rétro du sprint 2 (voir `sprint-retro.md` pour les preuves) : contrôle `no-global-prune` et `make preflight` faits, liste d'exceptions e2e versionnée et décompte exécutés/ignorés faits, guide `worktrees-agents` et section « Pièges d'environnement » faits, `contenu-a-valider.md` créé, zones anti-conflit (`mk/`, `changelog.d/`) en place.

Incidents du sprint : CI rouge en série (cinq causes distinctes, toutes corrigées), déploiement Railway en échec à cause de `PUBLIC_SITE_URL` sans schéma (corrigé par le PO, message explicite ajouté dans `1ded799`), rapports de sous-agents de workers routés vers l'orchestrateur, worker de phase 0 bloqué 45 minutes puis repris.

Enseignements : (1) l'orchestrateur doit relancer le build complet avant chaque push, la CI n'est pas un banc d'essai ; (2) tout test qui lit un fichier du dépôt doit tenir compte du contexte Docker ; (3) la revue DoD à mi-sprint a de nouveau trouvé des écarts réels (artefact de redirections absent, board contradictoire, `wasm-unsafe-eval` global) ; (4) un sprint mené sans Docker local pour les e2e est viable si la CI est rapide.

## 6. Réserves et actions PO en attente

**Contenus à valider** (`contenu-a-valider.md`, jalon n°2 au 2026-11-18) :
- 28 articles en 6 lots (5, 5, 5, 5, 5, 3) : descriptions, `seoTitle`, textes alternatifs, tags, ordre des 6 séries ; 3 FAQ (`validated: false`) ;
- licences et origine des 22 images de couverture (CR-6, aucune information dans la source) ;
- anomalies de contenu à arbitrer : pieds « Prochain article » vers des contenus inexistants, numéros de série périmés, licence de Caveman (Apache-2.0 sur GitHub, double licence MIT et BSL 1.1 dans l'article) ;
- typographie des corps : environ 420 lignes avec espace ordinaire avant `: ; ? !` (les 19 titres sont déjà corrigés).

**Décisions** : sort du lien vers `agentic-agency.fr` (401, m4) ; ADR-0011 (Umami) et ADR-0012 (Open Graph) à passer de « Proposé » à « Accepté » ; intitulé de profil (« COO/CTO » ou « Directeur de projets IT », m7).

**Hors dépôt** : compte Umami Hobby et `PUBLIC_UMAMI_WEBSITE_ID` ; relecture de la section vie privée (hébergement États-Unis et UE) ; Search Console (soumission du sitemap), Rich Results ; domaine définitif et DNS ; variables Railway.

**Phase 4 inachevée** : T-900-21 (partie : Lighthouse séparé), T-900-25 (mesure de durée de la CI), T-900-26 (porte du sprint, build à blanc Railway, déploiement), T-900-28 (actions en production). Le déploiement et la fumée réelle (`make smoke`, `OK_PATHS` étendu au blog, RSS, sitemap, `robots.txt`, `llms.txt`, image Open Graph) restent à exécuter après la fusion.

**Actions de fusion** : marquer la PR n°3 prête, attendre la CI du dernier commit, squash merge, déclarer les variables Railway, déployer, lancer la fumée, valider les 8 stories sur la production (DoD §10).

## 7. Mise à jour du backlog et de la vélocité

- Statuts `.bmad/sprint-status.yaml` : US-009, 010, 011, 012, 013, 024, 025, 026 `done-pending-po` ; sprint 3 en `review`.
- Vélocité de référence : 24, 25, 25 points (moyenne 24,7). Capacité suggérée pour le sprint 4 : 24 à 26 points, **à confirmer après acceptation PO** (la vélocité compte les US réellement `done`).
- Reports vers le sprint 4 : m1 (typographie des corps), m2 (`/recherche/` dans Lighthouse), m7, m9, T-900-21 (Lighthouse séparé), T-900-25, ainsi que les redirections 301 effectives sur `agentic-agency.fr` (hors périmètre du sprint 3, décision PO à prendre après la mise en production).
- Nouvelles demandes issues de la review : à consigner pendant la session.

## 8. Démo proposée (60 min)

| Durée | Contenu |
|-------|---------|
| 5 min | Rappel du goal, état de la PR n°3, CI verte (`095eb39`), précision : production non mise à jour |
| 10 min | US-009 : liste du blog, un article avec FAQ, note d'auteur, mention d'origine |
| 5 min | US-010 : canonical autoréférente, table de 95 entrées, artefact CI `redirections-nginx` (non déployé) |
| 7 min | US-011 : catégorie, tag, série « article N sur M », pagination, 404 de page inexistante |
| 6 min | US-012 : recherche « tokens », « methode », clavier, JavaScript désactivé |
| 4 min | US-013 : `rss.xml`, découverte automatique, lien de pied de page |
| 8 min | US-024 : sitemap, `llms.txt`, JSON-LD d'un article et du profil (Rich Results après déploiement) |
| 5 min | US-025 : image Open Graph d'un article, titre long tronqué |
| 5 min | US-026 : script absent sans identifiant, DNT, événements, section vie privée |
| 3 min | Qualité : 990 tests unitaires, 615 e2e, Lighthouse ≥ 0,95, revue DoD 88 puis 95/100 |
| 2 min | Actions PO, déploiement, priorités du sprint 4 |

Scénario : accueil → Blog → article → série → recherche → RSS → `sitemap-index.xml` → `llms.txt`. Prérequis de démo : build local de la branche avec `PUBLIC_SITE_URL` en URL absolue (Docker, aucune dépendance à la production).

**Feedback à collecter** : le ton et la mise en forme des articles migrés conviennent-ils ? Faut-il garder le lien vers l'ancien site tant qu'il répond 401 ? Priorités du sprint 4 (Boîte à outils) ? Date de mise en production et achat du domaine ? Acceptation de l'hébergement Umami ?
