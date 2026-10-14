# Gate Sprint Ready : sprint 001 « Walking skeleton » (tentative 2)

Date : 2026-10-14. Gabarit `.claude/commands/gate/validate-sprint.md`, adapté site statique. Arbitrages A1 à A5 de `tasks/README.md` pris en compte.

## Résultat : PASS (100/100)

| Critère | Poids | Requis | Résultat |
|---------|-------|--------|----------|
| Métadonnées Sprint | 20 | Oui | OK : bloc `metadata` présent dans `.bmad/sprint-status.yaml` (sprint-001, 2026-10-15 au 2026-10-28, 24 pts, goal) |
| Sprint Goal | 15 | Oui | OK : une phrase, mesurable |
| Stories prêtes | 25 | Oui | OK : 7 US `ready-for-dev`, Gherkin complet (nominal, alternatifs, erreurs, critères techniques) |
| Stories estimées | 20 | Oui | OK : 5+3+3+3+5+3+2 = 24 pts, aucune US au-dessus de 8 |
| Capacité | 10 | Non | OK : 24 pts pour 24 de capacité |
| Dépendances | 10 | Non | OK : ordre interne 001 → (002, 003) → (004, 005, 008, 029), aucune prérequise vers un sprint ultérieur |

## Vérifications détaillées

- **Couverture des critères** : chaque tableau de couverture des fichiers `tasks/US-*-tasks.md` couvre tous les scénarios. Échantillon (2 critères ou plus par US) : redirection HTTPS et échec de build bloquant (US-001) ; thème sombre et JS désactivé (US-002) ; cache et seuil Lighthouse (US-003) ; preuve invalide et `headline` manquant (US-004) ; donnée personnelle et impression A4 (US-005) ; honeypot et service indisponible (US-008) ; lien légal manquant et donnée interdite (US-029).
- **TDD** : les tâches `[TEST]` RED précèdent l'implémentation dans chaque US. L'outillage (Docker, compose) précède les tests, ce qui est normal.
- **Cohérence 7 expériences** : plus aucune mention de 8 expériences (A2) dans le sprint ni dans US-005.
- **DoD** : `definition-of-done.md` applicable (équivalent site statique) ; chaque US a une tâche `[REV]` citant ses sections.
- **Risques** : 4 risques avec probabilité, impact et mitigation.
- **Structure** : `task-board.md`, `sprint-dependencies.md`, `pre-sprint-checklist.md` présents. 90 tâches de 0,5 à 6 h.
- **Checklist** : cases « Definition of Ready » et « Gate exécuté » cochées. « Backlog priorisé par le PO » et « Capacité validée par le PO » restent au PO.

## Avertissements restants (non bloquants)

1. 236,5 h estimées pour 10 jours : acceptable en exécution agentique, à recalibrer en rétrospective.
2. Actions PO ouvertes (domaine, Umami, Web3Forms, Calendly, contenus) avec replis documentés.
3. Repli Web3Forms de la checklist formulé « mailto » alors que A3 limite `mailto` au message d'erreur : harmoniser.
4. Cycle US-001 / US-003 : T-001-14 à 20 exigent `ci.yml` (T-003-07), donc ne pas clore US-001 avant.
5. Liens de preuves d'US-004 vers des pages du sprint 2 : destinations provisoires à décider avec le PO.
