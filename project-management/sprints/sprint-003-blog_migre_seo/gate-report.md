# Gate Sprint Ready : sprint 003 « Blog migré et SEO » (tentative 2)

Date : 2026-10-14. Gabarit `.claude/commands/gate/validate-sprint.md`, adapté site statique. Référence : `tasks/README.md` (C1 à C11, E1 à E26, section « Arbitrages de l'orchestrateur et du PO »). La tentative 1 (75/100, FAIL) portait sur l'alignement des stories ; chaque correctif a été relu dans les fichiers.

## Résultat : PASS (100/100)

| Critère | Poids | Requis | Résultat |
|---------|-------|--------|----------|
| Métadonnées Sprint | 20 | Oui | OK : bloc `metadata` du sprint 3 (sprint-003, 2026-11-12 au 2026-11-25, 25 pts, goal) |
| Sprint Goal | 15 | Oui | OK : une phrase, mesurable |
| Stories prêtes | 25 | Oui | OK : 8 US `ready-for-dev`, Gherkin complet, AC alignés sur les arbitrages (tableau ci-dessous) |
| Stories estimées | 20 | Oui | OK : 5+2+3+2+2+5+3+3 = 25 pts, aucune US au-dessus de 8 ; 142 tâches (120 + 22 transverses) et 409 h cohérentes |
| Capacité | 10 | Non | OK : 25 pts pour 25 (plage 19,6 à 29,4) |
| Dépendances | 10 | Non | OK : aucune dépendance vers un sprint ultérieur (US-002, 003, 005, 007, 008, 020 livrées) ; contrats souples sans cycle |

## Correctifs vérifiés

| Constat de la tentative 1 | Vérification |
|---------------------------|--------------|
| Ligne « Arbitrage sprint 3 » dans la Conversation des 8 US (E5, E11, E14 ; E15 ; E6, E7 ; E19 ; E20 ; E18, E23 ; E17, C9 ; C8) | Présente dans US-009 à 013, 024, 025, 026 |
| US-011 : tags à 1 article en `noindex` | AC « texte non lié, sans `noindex` » ; critère SEO réécrit |
| US-012 : `/recherche/` ; US-025 : `Seo.astro` au lieu de `SeoHead`, plus de Satori dans les AC ; US-010 : plus de domaine en dur ni de « risque accepté » | Confirmés par recherche dans les fichiers |
| C6 avant S0 | `T-010-01` à `T-010-03` en « Phase 0 » ; S0 : « C1 à C6 (C6 : T-010-01 à 03) » |
| Preuves E25 avant S0 | S0 exige `no-global-prune`, `make preflight`, `skip-allowlist`, `worktrees-agents.md` avant tout worktree ; `T-009-20` dépend de `T-900-04`, `T-009-08` de `T-900-05` |
| [TEST] RED avant implémentation | Dépendances ajoutées : `T-011-04` vers `T-011-05` à `07`, `T-013-08` vers `T-013-06`, `T-024-15` vers `T-024-05`/`06`, `T-025-08` vers `T-025-04`/`05`, `T-026-08` vers `T-026-06`/`07` ; aucun cycle |
| Tâches bloquées par le PO (E5, E6, E15) | Plus de « choisis par le PO » ni « à remplir par le PO » dans les tâches ; `sprint-goal.md` et `sprint-dependencies.md` alignés |

Autres vérifications : C1 à C5 précis (signatures, schéma, props, lecteur unique) et zones de fichiers à écrivain unique ; couverture d'au moins 2 AC par US largement assurée (e2e détaillés par scénario) ; tâches de phase 0 précèdent les lots.

## Avertissements (non bloquants)

1. 409 h pour 25 points (16,4 h/pt contre 12,1 au sprint 2) : acceptable en exécution agentique ; écartables dans l'ordre E24 : US-012, US-025, US-026.
2. Actions PO avec repli : provenance des 22 couvertures, compte Umami, domaine et DNS (sous-domaine Railway), validation des contenus avant le 2026-11-18, Search Console ; cases « backlog priorisé » et « capacité validée » de la checklist ouvertes ; disque à environ 6,1 Go (dérogation PO à consigner).
3. `T-024-11` (lot B) corrige « les contenus des pages signalées » : jeu de fichiers non borné, hors propriété exclusive du lot B ; lister les fichiers ou la confier à l'orchestrateur après S2.
4. C5 : les pages du blog (lot A) doivent passer un `breadcrumb` explicite (libellés non déductibles du chemin) ; à préciser. `tests/e2e/layout.spec.ts` (lot A) peut casser quand le lot B ajoute le lien RSS au pied de page.
5. Contrôle canonical du lot A et `lib/html-meta.ts` du lot B : risque de double analyseur de balises ; accepter explicitement ou placer le module en phase 0.
6. Type MIME `.wasm` de Pagefind : relevé en `T-900-07`, correctif nginx éventuel à prévoir dans `T-024-14` (lot B propriétaire de `nginx.conf`).
7. Durée de la CI (environ 62 pages de plus) : mesure en `T-900-25`.
8. `content-model.md` (hors dossier) à mettre à jour par l'orchestrateur (`T-900-20`).
