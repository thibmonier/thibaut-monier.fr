# Sprint Review : Sprint 002 « Preuves : profil complet et open source »

> Préparée le 2026-10-14 (workflow:review, adapté site statique Astro/Docker/Railway). Branche `feature/sprint-002-preuves_profil_open_source`, PR n°2 ouverte (https://github.com/thibmonier/thibaut-monier.fr/pull/2), HEAD `0053c07`, 16 commits depuis `main`. Format : sprint 1 (`../sprint-001-walking_skeleton/sprint-review.md`).
>
> **La production Railway n'est PAS encore mise à jour pour ce sprint.** Le déploiement a lieu après la fusion de la PR sur `main`. Le déploiement automatique depuis `main` reste à configurer par le PO (Wait for CI, déclenchement sur `main`). La démo se fait donc sur un build local ou sur la CI, jusqu'à ce déploiement.

**Sprint Goal** : « Rendre les preuves d'expertise consultables (CV PDF, compétences, 20 plugins Sylius, tailsfadmin, contributions career-ops) pour transformer une visite en prise de contact. »

## 1. Atteinte du Sprint Goal : OUI sur le plan technique, PARTIELLEMENT à ce stade (⚠️)

| Volet du goal | État | Preuve |
|---------------|------|--------|
| CV PDF consultable | ✅ | `thibaut-monier-cv.pdf` généré au build avec Typst : 2 pages A4, 65 Ko, balisé, 7 expériences, sans donnée personnelle ni nom de client |
| Compétences | ✅ | `/competences/` : réalisations et compétences filtrables par domaine, partageables par URL, utilisables sans JavaScript |
| 20 plugins Sylius | ✅ | Catalogue filtrable `/open-source/` (hub) et 20 fiches `/open-source/sylius/<slug>/` avec matrices de compatibilité, dépendances, métriques vivantes |
| tailsfadmin | ✅ | `/open-source/tailsfadmin/` |
| Contributions career-ops | ✅ | `/open-source/career-ops/` (étude de cas, faits vérifiés sur les PR) |
| « Transformer une visite en prise de contact » | ⚠️ | Les pages sont reliées entre elles (hub, parcours, accueil) mais le formulaire de contact reste inactif en production (clé Web3Forms du sprint 1 toujours absente) ; rien du sprint n'est visible en production avant fusion et déploiement |
| Validation PO | ⚠️ | Les 7 stories sont `done-pending-po` : contenus et production à valider (section 6) |

Le goal est atteint dans le code, la CI et la revue DoD (85/100). Il ne l'est pleinement qu'une fois la PR fusionnée, le site déployé et les contenus validés par le PO.

## 2. Incrément démontrable

Branche testable en local (`make` du projet) ou sur le build de la CI. **Pas encore en production.**

| Page | Contenu |
|------|---------|
| `/competences/` | 13 réalisations et 35 compétences, filtre par domaine (`?domaine=ia-appliquee`), message pour un domaine inconnu, « Référence confidentielle » à la place des clients |
| `/open-source/` | Hub : catalogue de 20 plugins filtrable par thème (B2B 9, etc.) avec recherche par mot-clé, puis section « Autres projets » |
| `/open-source/sylius/<slug>/` (20 fiches) | Matrice Sylius 2.2 / 2.3 (PHP et Symfony séparés), dépendances (« Nécessite », « Utilisé par »), copie de la commande Composer, métriques vivantes, captures sélectionnées pour 9 plugins |
| `/open-source/career-ops/` | Étude de cas : résumé de 3 lignes, 4 blocs par PR (#3496, #3808, #3866), chiffres vérifiés |
| `/open-source/tailsfadmin/` | Fiche du bundle v1.6.2 (MIT, 7 ADR, PHPStan max), sans capture (aucun visuel provisoire, E18) |
| CV PDF | Lien « Télécharger mon CV (PDF, 2 pages) » depuis le parcours ; en-têtes `noindex` et `no-cache` |
| Liens entre pages | Mention « Contributeur career-ops » sur `/parcours/`, preuves de l'accueil re-pointées vers `/open-source/` et l'étude de cas |
| Métriques vivantes | Collecte GitHub et Packagist, JSON commité, workflow hebdomadaire (`metrics.yml`) ; bloc « Données au … » sur 21 pages |

Défauts connus : release GitHub v1.6.2 de tailsfadmin inexistante (la page affiche la version sans date de release, B2 corrigé à la lecture) ; `sylius-agentic-feeds-plugin` non publié sur Packagist (fiche sans lien ni téléchargements, E20) ; sitemap toujours absent (N13, US-024 au sprint 3).

## 3. User stories livrées (25 points planifiés)

| ID | Titre | Pts | Démo | Statut |
|----|-------|-----|------|--------|
| US-006 | Compétences et réalisations filtrables | 3 | ✅ | ✅ Done sous réserve PO (années des réalisations, T-006-01) |
| US-007 | CV PDF généré au build | 5 | ✅ | ✅ Done sous réserve PO (T-007-01, T-007-16 ; N5) |
| US-019 | Catalogue des plugins Sylius | 5 | ✅ | ✅ Done sous réserve PO (N8) |
| US-020 | Fiche détaillée d'un plugin | 5 | ✅ | ✅ Done sous réserve PO (N6) |
| US-021 | Données vivantes GitHub/Packagist | 3 | ✅ | ✅ Done sous réserve PO (N2) |
| US-022 | Page tailsfadmin | 2 | ✅ | ✅ Done sous réserve PO (date de release, arbitrage) |
| US-023 | Étude de cas career-ops | 2 | ✅ | ✅ Done sous réserve PO |

**Livré côté équipe : 25/25 points (100 %).** Statut `.bmad` : 7 US `done-pending-po`, sprint en `review`. Aucune story reportée. Acceptation PO : 0 point à ce jour.

## 4. Métriques

| Métrique | Valeur |
|----------|--------|
| Points planifiés / livrés | 25 / 25 (0 accepté par le PO) |
| Vélocité | 25 (sprint 1 : 24) ; cumul ~50 points sur 2 sprints |
| Taux de complétion | 100 % (0 % accepté) |
| Tests unitaires (Vitest) | 512 (499 à la première passe de la revue DoD), couverture lignes ~96,7 %, branches ~89,7 % |
| Tests e2e (Playwright) | 427 passés, 0 échec, 0 flaky, 3 ignorés voulus (2 scénarios « sans clé » contact, 1 impression PDF sur mobile) |
| Lighthouse | 1,0 sur 4 axes, sur 29 pages (seuil 0,95) |
| Pages générées | 31 (7 au sprint 1) |
| CI | verte sur HEAD `0053c07` (run 38616206639 : quality, dockerfile, supply-chain, e2e, external-links, GitGuardian) ; durée 15 min 51 s, contre 3 à 8 min au sprint 1 |
| Runs CI sur la branche | 3 : 1 échec (e2e, test axe), 2 succès |
| Revue DoD | 2 passes : **52/100** (HEAD `8bf7d6b`, 7 stories « Non done », 4 bloquants) puis **85/100** (HEAD `0053c07`, 7 stories « Done sous réserve PO ») |
| Gate Sprint Ready | 100/100 en tentative 2 (75/100 en tentative 1) |
| Tâches | 109 planifiées, 303 h estimées ; task-board non à jour (N7) |

Points d'attention : la CI a presque triplé de durée (Lighthouse sur 29 pages) ; le plafond du job e2e est de 20 minutes, la marge se réduit. Le décompte de 303 h pour 10 jours (12,1 h/point contre 9,9) est resté tenable en exécution parallèle.

## 5. Incidents et enseignements

| Incident | Effet | Traitement |
|----------|-------|------------|
| Disque saturé (5,0 Gio libres au gate) | Builds Docker et images lourds limités en local | Nettoyage à prévoir ; la CI reste la référence |
| **Perte de 5 volumes MySQL Sylius** | Constatée le 2026-10-14 : volumes de base de données locaux de 5 plugins (admin-order-creation, ai-catalog-copilot, bulk-actions, quote-request, tier-pricing) disparus entre 15 h et 19 h. Contenu exact inconnu (fixtures régénérables ou données saisies : à confirmer par le PO). Cause non établie, la plus probable étant un nettoyage Docker global par un worker du sprint 1 | Interdiction explicite des `docker volume prune`, `system prune` et `image prune -a` dans tous les prompts de workers (seuls `builder prune -f` et `compose -p <projet> down -v` sont permis), règle enregistrée en mémoire. Dépôts Git des plugins non touchés |
| Worktrees parallèles (3 workers W1 à W3) | Livraisons par lots, fusions `merge: lot N` (`8bf7d6b`, `6ee2059`, `38f7199`) | Conflits de fusion résolus aux fusions de lots ; commits `merge:` hors Conventional Commits (N12), corrigé par le squash merge |
| **Test axe trop long (B1)** | CI rouge sur HEAD `8bf7d6b` : le délai de 30 s dépassé quand le site passe de 7 à 31 pages ; Lighthouse jamais lancé | Délai proportionnel au nombre de pages découvertes (`433c63e`) ; CI verte ensuite |
| **4 bloquants DoD (B1 à B4)** | Score 52/100, 7 stories « Non done » | B1 délai axe ; B2 date de release incohérente avec la version (`f879596`) ; B3 matrices de compatibilité inexactes sur 10 fiches (`2017bd3`) ; B4 pages orphelines et phase 4 d'intégration absente (`e730511`). Score révisé 85/100 |
| Dépôt non publié | `sylius-agentic-feeds-plugin` absent de Packagist | Repli prévu et testé (E20) |

Enseignements : (1) la revue DoD indépendante a trouvé quatre défauts réels que la CI seule ne détectait pas (fait faux publié, compatibilités impossibles, pages inaccessibles) ; (2) un test qui parcourt toutes les pages doit adapter son délai au volume ; (3) les workers ne doivent jamais toucher aux volumes Docker partagés ; (4) le task-board doit être tenu à jour au fil des lots (N7).

## 6. Réserves et actions PO en attente

**Contenus à valider** : profil (accroche, `profile.yaml`) ; 13 réalisations (années, `achievements.yaml:2`) ; 35 compétences ; 20 fiches plugins ; étude de cas career-ops ; page tailsfadmin ; confirmation de l'exclusion de Punchout cXML (E4) ; anonymisation des clients (E12).

**Non bloquants N5 à N8** (revue DoD) :
- N5 : le scénario US-007 « Échec de génération » n'a ni test ni preuve manuelle ;
- N6 : T-020-05 et T-020-06 non faits, pas de contrôle de build du poids et des EXIF des captures (22 WebP conformes aujourd'hui) ;
- N7 : task-board incohérent (79 tâches « À faire » alors que les lots 2 et 3 sont faits), à resynchroniser ;
- N8 : title du catalogue différent de la story US-019, à aligner par le PO dans la story.

**Phase 4 inachevée** : T-900-01 partiel (contrôle du type `application/pdf` restant) ; T-900-02 (scénarios e2e inter-US), T-900-03 (porte `/gate:validate-sprint 002` et budgets CI), T-900-04 (build Railway avec Typst et poppler, déploiement), T-900-05 (README, index des guides, CHANGELOG, modèle de contenu), T-900-06 (revue transverse et validation PO sur la production) restent à faire.

**Actions de déploiement et de fusion** :
1. Fusionner la PR n°2 sur `main` en squash merge (DoD §1).
2. Configurer le déploiement automatique depuis `main` sur Railway (Wait for CI) puis déployer ; vérifier que le build Railway installe Typst et poppler (T-900-04).
3. Exécuter `make smoke` sur la production et valider les 7 stories sur le site déployé (DoD §10).
4. Reprises du sprint 1 toujours ouvertes : clé Web3Forms, Calendly, e-mail de repli, domaine et DNS, secrets `RAILWAY_TOKEN` et `SMOKE_URL`, validation de US-001 et US-029.
5. Jeton de la collecte hebdomadaire (E13) ; publication de `sylius-agentic-feeds-plugin` sur Packagist ; release GitHub v1.6.2 de tailsfadmin ou arbitrage sur la date ; capture facultative de tailsfadmin.
6. Corriger hors dépôt les README sources des plugins (compatibilité PHP/Symfony, B3).

## 7. Mise à jour du backlog et de la vélocité

- Statuts `.bmad/sprint-status.yaml` : US-006, 007, 019, 020, 021, 022, 023 `done-pending-po` ; sprint 2 en `review`.
- Vélocité de référence : 24 (sprint 1) et 25 (sprint 2), soit ~50 points cumulés ; capacité suggérée pour le sprint 3 : 24 à 26 points, à confirmer après acceptation PO.
- Reports vers le sprint 3 : sitemap et JSON-LD (US-024, N13, E15), Pagefind (US-012), N2 et N11 (duplications), N5, N6, N9, N10, T-900-02 à T-900-06 si non terminés avant la fusion, mesure et optimisation de la durée de la CI (échantillonnage Lighthouse des fiches).
- À aligner dans les stories : title du catalogue (N8), chemin périmé `src/content/experiences/*.yaml` de US-007, `content-model.md` (slug, vendor), Markdown plutôt que MDX (N9).
- Nouvelles demandes issues de la review : à consigner pendant la session.

## 8. Démo proposée (60 min)

| Durée | Contenu |
|-------|---------|
| 5 min | Rappel du goal, état de la PR n°2, CI verte (`0053c07`), précision : production non mise à jour |
| 8 min | US-007 : parcours puis CV PDF (2 pages, texte sélectionnable, sans donnée personnelle) |
| 7 min | US-006 : `/competences/`, filtre « E-commerce », partage `?domaine=ia-appliquee`, JavaScript désactivé |
| 10 min | US-019 : catalogue, filtre « B2B » (9 cartes), recherche « facture » (Factur-X en premier) |
| 10 min | US-020 : fiche `purchase-approval` (matrice, dépendances, copie Composer), fiche sans Packagist (Agentic Feeds) |
| 5 min | US-021 : métriques vivantes, « Données au … », workflow hebdomadaire |
| 4 min | US-022 : tailsfadmin (« En bref », liens) |
| 4 min | US-023 : étude de cas career-ops, lien depuis `/parcours/` et l'accueil |
| 4 min | Qualité : 512 tests unitaires, 427 e2e, Lighthouse 1,0 sur 29 pages ; incident des 4 bloquants DoD (52 puis 85/100) |
| 3 min | Actions PO, déploiement, priorités du sprint 3 |

Scénario : accueil → preuve open source → hub `/open-source/` → filtre B2B → fiche `purchase-approval` → `tailsfadmin` → career-ops → `/competences/` → CV PDF. Prérequis de démo : build local de la branche (Docker, aucune dépendance à la production).

**Feedback à collecter** : les contenus du profil, des 13 réalisations et des 35 compétences sont-ils acceptables (confidentialité des clients) ? Les 20 fiches sont-elles assez lisibles pour un non-technicien ? Faut-il publier Punchout cXML ? Priorités du sprint 3 (SEO, EN, sitemap) ? Date de mise en production souhaitée ?
