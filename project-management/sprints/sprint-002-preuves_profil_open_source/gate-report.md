# Gate Sprint Ready : sprint 002 « Preuves : profil complet et open source » (tentative 2)

Date : 2026-10-14. Gabarit `.claude/commands/gate/validate-sprint.md`, adapté site statique. Arbitrages E1 à E22 (`tasks/README.md`, section finale) pris comme référence. La tentative 1 (75/100, FAIL) portait sur l'alignement des stories ; les correctifs ont été relus fichier par fichier.

## Résultat : PASS (100/100)

| Critère | Poids | Requis | Résultat |
|---------|-------|--------|----------|
| Métadonnées Sprint | 20 | Oui | OK : bloc `metadata` dans `.bmad/sprint-status.yaml` (sprint-002, 2026-10-29 au 2026-11-11, 25 pts, goal) |
| Sprint Goal | 15 | Oui | OK : une phrase, mesurable |
| Stories prêtes | 25 | Oui | OK : 7 US `ready-for-dev`, Gherkin complet, AC alignés sur les arbitrages (tableau ci-dessous) |
| Stories estimées | 20 | Oui | OK : 3+5+5+5+3+2+2 = 25 pts, aucune US au-dessus de 8 |
| Capacité | 10 | Non | OK : 25 pts pour 25 (plage 19 à 29) |
| Dépendances | 10 | Non | OK : aucune prérequise vers un sprint ultérieur ; sprint 1 livré sur `main` (`f4f0df1`) ; `sprint-dependencies.md` présent, sans cycle |

## Correctifs vérifiés dans les stories

| Arbitrage | Fichier | Constat |
|-----------|---------|---------|
| E1 | US-020 | AC : `/open-source/sylius/purchase-approval/` ; ligne « Arbitrage sprint 2 » |
| E10 | US-007 | AC : « 7 entrées », « 7 expériences » |
| E9 | US-007 | Libellé « Télécharger mon CV (PDF, 2 pages) » dans l'AC et le critère WCAG ; `X-Robots-Tag: noindex` et `no-cache` dans l'AC et le critère SEO ; gabarit Typst à la place du gabarit d'impression |
| E11, E12 | US-006 | `/competences/?domaine=ia-appliquee` et `?domaine=inconnu` ; anonymisation par défaut |
| E13, E14 | US-021 | Le build lit le JSON commité ; scénarios en « WHEN la collecte s'exécute » ; collecte hebdomadaire par PR, plus de cron quotidien sans commit |
| E15 | US-019, 020, 022, 023 | JSON-LD reporté à US-024 dans les critères SEO |
| E16, E2, E3 | US-019 | Filtre JS léger, Pagefind en sprint 3 ; `/open-source/` hub ; livraison groupée avec US-020 |
| E18 | US-022 | Capture facultative (AC et critère d'alternative textuelle), version v1.6.2, pas de visuel provisoire |
| E20 | US-020 | Fiche sans Packagist pour `sylius-agentic-feeds-plugin` ; lien Packagist optionnel |

Les autres vérifications de la tentative 1 restent valables : couverture des AC par les tâches (échantillon de 2 AC ou plus par US), `[TEST]` RED avant implémentation, DoD, 9 risques documentés, 109 tâches et 303 h cohérentes avec les sommes par US et par type.

## Avertissements restants (non bloquants)

1. 303 h pour 10 jours (12,1 h/point contre 9,9 au sprint 1) : acceptable en exécution agentique ; lot 2 à 114,5 h.
2. Actions PO ouvertes avec repli : validation US-001 et US-029, domaine, Web3Forms, Umami, Calendly, secrets Railway, jeton E13, capture tailsfadmin, publication de `sylius-agentic-feeds-plugin`.
3. Checklist : cases « Backlog priorisé par le PO » et « Capacité validée par le PO » ouvertes ; disque à 5,0 Gio (limite).
4. US-007, notes techniques : le chemin `src/content/experiences/*.yaml` est périmé (les données sont dans `src/data/cv/experiences/`) ; à corriger.
5. Durée de la CI (Lighthouse × 3 sur environ 30 pages) à mesurer en T-900-03.
6. Correction de `content-model.md` (hors dossier du sprint) à demander à l'orchestrateur.
