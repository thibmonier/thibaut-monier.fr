# Sprint 2 : checklist de démarrage (Preuves : profil complet et open source)

Stack : Astro (site statique), Docker (développement et production), Railway (hébergement), GitHub Actions (CI), Typst 0.15.1 (CV PDF). Date de préparation : 2026-10-14.

## Calcul de capacité

| Élément | Valeur |
|---------|--------|
| Période | 2026-10-29 au 2026-11-11 (10 jours ouvrés) |
| Équipe | 1 contributeur (Thibaut) + orchestrateur et workers agentiques |
| Vélocité historique | Sprint 1 : 24 points planifiés et livrés (17 acceptés, 7 en attente PO) |
| Capacité | 24 pts ± 20 % (19 à 29), ajustée selon le risque |
| Engagement | 25 points (7 US) : dans la plage, justification : sources de contenu existantes, pas de nouveau socle |
| Pilotage | Points et cycles de vérification, pas d'heures (action 4 de la rétro) |

## 1. Sprint précédent clôturé

- [x] Sprint Review préparée (`sprint-001-walking_skeleton/sprint-review.md`)
- [x] Rétrospective faite le 2026-10-14 (`sprint-retro.md`)
- [ ] US-001 et US-029 passées de `done-pending-po` à `done` (validation PO)
- [ ] PR n°1 fusionnée sur `main`
- [ ] Vélocité du sprint 1 (24 pts / 7 US) consignée dans `.bmad/sprint-status.yaml` (action 4)

## 2. Actions de la rétrospective du sprint 1 (à jour)

| # | Action | Échéance | Statut | Condition pour ce sprint |
|---|--------|----------|--------|--------------------------|
| 1 | Garde-fou « zéro test e2e ignoré » (CI + DoD) | 2026-10-21 | 🔄 en partie fait (`af34b69`) | CI rouge si un e2e est ignoré hors liste autorisée |
| 2 | `make preflight` : espace disque, nettoyage Docker | Avant `/workflow:start 2` | 🔲 (cible absente du Makefile au 2026-10-14) | Espace noté au démarrage |
| 3 | `docs/guides/worktrees-agents.md` | 2026-10-24 | 🔲 | 0 relance de worker causée par une base erronée |
| 4 | Recalibrage de la vélocité en points | Avant 2026-10-28 | 🔲 | Capacité fixée ici (25 pts) |
| 5 | `contenu-a-valider.md` + test anti-marqueur | Liste 2026-10-17 ; validation 2026-10-28 | 🔲 | Étendre aux contenus du sprint 2 |
| 6 | Pièges d'environnement (aliases, Railway, runner) | 2026-10-24 | 🔲 | Build à blanc Railway et runner avant le premier merge |

## 3. Actions PO en attente (issues de la Sprint Review 1)

| Statut | Action | Variable / élément | Bloquant pour le sprint 2 ? | Repli |
|--------|--------|--------------------|-----------------------------|-------|
| 🔲 | Valider US-001 et US-029 et la production | — | Non | — |
| 🔲 | Fusionner la PR n°1 ; source Railway = `main` + *Wait for CI* | Railway | Oui pour déployer le sprint 2 proprement | Branche du sprint |
| 🔲 | Domaine et DNS | `PUBLIC_SITE_URL` | Non | `*.up.railway.app` |
| 🔲 | Clé Web3Forms, e-mail de repli | `PUBLIC_WEB3FORMS_KEY` | Non | Repli « service indisponible + LinkedIn » |
| 🔲 | Compte Umami (US-026, sprint 3) | `PUBLIC_UMAMI_WEBSITE_ID` | Non | Mesure désactivée |
| 🔲 | URL Calendly | `PUBLIC_CALENDLY_URL` | Non | Bouton RDV masqué |
| 🔲 | Secrets `RAILWAY_TOKEN`, `SMOKE_URL` | GitHub | Non | Smoke manuel |
| 🔲 | Coordonnées de l'hébergeur (facture Railway), relecture juridique | Mentions légales | Non | — |
| 🔲 | Relecture des contenus du sprint 1 (accueil, frise) | `contenu-a-valider.md` | Non | — |
| 🔲 | Arbitrages A1 à A5, lien « Blog » | `tasks/README.md` | Non | — |

## 4. Prérequis spécifiques au sprint 2

### 4.1 Sources de contenu

| Statut | Source | Usage | Vérifié le 2026-10-14 |
|--------|--------|-------|-----------------------|
| ✅ | `/Users/tmonier/Projects/career-ops/cv.md` | US-007 (CV PDF), US-006 (compétences, réalisations) | Présent |
| ✅ | `/Users/tmonier/Projects/sylius_plugins/docs/2026-10-14-catalogue-plugins.md` | US-019, US-020 (20 plugins) | Présent |
| ✅ | `/Users/tmonier/Projects/sylius_plugins/captures-2026-10-12/` | US-020 (captures des fiches) | Présent |
| ✅ | `/Users/tmonier/Projects/tailsfadmin/README.md` | US-022 | Présent |
| 🔲 | PR career-ops #3496, #3808, #3866 (état, liens, résumés) | US-023 | À vérifier avec `gh pr view` |
| 🔲 | Validation PO des contenus tirés de ces sources (chiffres, confidentialité, captures) | Toutes les US de contenu | Avant publication |

### 4.2 Outillage et données

| Statut | Élément | Remarque |
|--------|---------|----------|
| 🔲 | Typst 0.15.1 épinglé dans l'image Docker (ADR-0005) | US-007 ; PDF généré au build, sans dépendance locale |
| 🔲 | Polices du CV disponibles dans l'image | À vérifier avant US-007 |
| 🔲 | Métriques GitHub/Packagist au build (ADR-0006) | US-021 ; repli sur données figées si API indisponible |
| 🔲 | `GITHUB_TOKEN` disponible en CI (et variable de build Docker) | Évite la limite de débit ; jamais dans l'image finale |
| 🔲 | Garde-fous : aucune ressource externe au runtime, CSP inchangée | ADR-0009 |

### 4.3 Environnement (leçons du sprint 1)

| Statut | Contrôle | Valeur |
|--------|----------|--------|
| ⚠️ | Espace disque libre avant implémentation : **≥ 5 Go** | 5,0 Gio libres le 2026-10-14 (98 % utilisé) : limite. Libérer de l'espace (cible 10 Go, action 2) puis relever la valeur au démarrage |
| 🔲 | `docker system df` puis nettoyage si nécessaire | Avant tout build d'image Playwright |
| 🔲 | Worktrees créés depuis la branche du sprint, pas `main` | Guide action 3 |
| 🔲 | Commandes shell sans aliases interactifs (`command curl`, chemins absolus, `mv -f`) | Action 6 |
| 🔲 | Build à blanc sur Railway et sur le runner avant le premier merge | Pas de `--mount=type=cache` sans `id`, pas de `--no-build` |

## 5. Backlog et Definition of Ready

- [x] Sprint précédent clôturé côté équipe (validation PO en attente, voir §1)
- [ ] Backlog priorisé par le PO (7 US, 25 points)
- [ ] Gate `/gate:validate-sprint 2` exécuté

| US | Description et critères Gherkin | Estimée | Dépendances | Contenu / maquettes | Bloqueur |
|----|--------------------------------|---------|-------------|---------------------|----------|
| US-007 (5) | ✅ | ✅ | US-005 (livrée) | `cv.md`, Typst 0.15.1 | Disque, validation PO du CV |
| US-019 (5) | ✅ | ✅ | US-002 (livrée) | Catalogue des 20 plugins | Validation PO |
| US-020 (5) | ✅ | ✅ | US-019 | Captures 2026-10-12 | Droit de publier les captures |
| US-021 (3) | ✅ | ✅ | US-020 | GitHub/Packagist, `GITHUB_TOKEN` | Repli à définir |
| US-006 (3) | ✅ | ✅ | US-005 (livrée) | Compétences issues de `cv.md` | Validation PO |
| US-022 (2) | ✅ | ✅ | US-002 (livrée) | README tailsfadmin | Aucun |
| US-023 (2) | ✅ | ✅ | US-002 (livrée) | PR #3496, #3808, #3866 | Accès aux PR |

À confirmer par lecture des fichiers de story lors du planning (statut « ✅ » = déclaré par le backlog, non revérifié ici).

## 6. Cérémonies (contributeur unique)

| Cérémonie | Date proposée | Durée |
|-----------|---------------|-------|
| Planning partie 1 (QUOI) | 2026-10-29 | 1 h |
| Planning partie 2 (COMMENT, `/project:decompose-tasks 002`) | 2026-10-29 | 1 h |
| Daily asynchrone (`/common:daily-standup`) | Quotidien | 5 min |
| Affinage | 2026-11-05 | 30 min |
| Revue DoD indépendante à mi-sprint | 2026-11-04 | 1 h |
| Sprint Review (démo en production) | 2026-11-11 | 1 h |
| Rétrospective (Starfish) | 2026-11-11 | 45 min |

## 7. Checklist finale

### Avant le Planning
- [ ] Actions 2 et 4 de la rétro faites, action 5 engagée
- [ ] Espace disque ≥ 5 Go relevé et noté
- [ ] Sources de contenu et PR career-ops vérifiées
- [ ] Capacité validée par le PO (25 points)

### Pendant le Planning
- [ ] Sprint Goal accepté
- [ ] Scope engagé (25 points) ; pilotage en points et cycles de vérification
- [ ] Dépendances confirmées (`sprint-dependencies.md`)
- [ ] Découpage en tâches sans plan d'heures détaillé

### Après le Planning
- [ ] `task-board.md` créé
- [ ] Daily planifié
- [ ] `contenu-a-valider.md` complété pour les contenus du sprint 2
- [ ] Variables (`GITHUB_TOKEN`, `PUBLIC_*`) documentées dans `.env.example`

## Prochaine étape

1. Lever les points ⚠️ et 🔲 de §1 à §4
2. `/gate:validate-sprint 2`
3. `/project:decompose-tasks 002`
4. `/sprint:next-story` (US-007 en premier)
