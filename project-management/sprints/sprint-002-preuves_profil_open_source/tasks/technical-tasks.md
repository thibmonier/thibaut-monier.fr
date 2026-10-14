# Tâches transverses du sprint 002

Tâches qui ne relèvent d’aucune US en particulier : prérequis (phase 0) et intégration (phase 4). Les tâches « Phase 4 » rattachées à une US (`T-019-14`, `T-023-14`, `T-023-15`, `T-022-11`) figurent dans leur fichier et sont exécutées après la fusion des lots.

| ID | Type | Tâche | Estimation | Dépend de | Lot | Statut |
|----|------|-------|------------|-----------|-----|--------|
| T-900-00 | [OPS] | Phase 0 : prérequis hors backlog (publication Packagist et dépôts) | 1,5h | - | 0 | 🔲 |
| T-900-01 | [OPS] | Phase 4 : contrôle de fumée étendu (PDF, vitrine, compétences) | 2h | T-007-12, T-019-10, T-006-10 | 4 | 🔲 |
| T-900-02 | [TEST] | Phase 4 : scénarios e2e inter-US | 3,5h | T-007-13, T-019-14, T-023-14, T-023-15, T-022-11 | 4 | 🔲 |
| T-900-03 | [TEST] | Phase 4 : porte du sprint (`/gate:validate-sprint 002`) et budgets | 3h | T-900-01, T-900-02, T-007-16, T-006-13, T-019-13, T-020-21, T-021-12, T-023-13, T-022-10 | 4 | 🔲 |
| T-900-04 | [OPS] | Phase 4 : build Railway (Typst, poppler, images) et déploiement | 2,5h | T-900-03 | 4 | 🔲 |
| T-900-05 | [DOC] | Phase 4 : README, index des guides, CHANGELOG, mise à jour du modèle de contenu | 1,5h | T-900-03 | 4 | 🔲 |
| T-900-06 | [REV] | Phase 4 : revue transverse et validation du PO sur la production | 2h | T-900-04, T-900-05 | 4 | 🔲 |

**Total estimé** : 16h (7 tâches)

---

## Détail des tâches

#### T-900-00 : [OPS] Phase 0 : prérequis hors backlog (publication Packagist et dépôts)
- **Estimation** : 1,5h
- **Dépend de** : -
- **Lot** : 0

**Description** :
Le PO confirme que les 20 paquets `tmonier/*` et `tailsfadmin/tailsfadmin-bundle` sont publiés sur Packagist, que les 21 dépôts GitHub sont publics et que les releases existent (le sondage depuis ce poste n’a pas pu le prouver). À défaut, les liens Packagist feraient échouer la CI.

**Critères de validation** :
- [ ] Liste des 21 paquets et dépôts confirmée
- [ ] Écart éventuel remonté à l’orchestrateur

#### T-900-01 : [OPS] Phase 4 : contrôle de fumée étendu (PDF, vitrine, compétences)
- **Estimation** : 2h
- **Dépend de** : T-007-12, T-019-10, T-006-10
- **Lot** : 4

**Description** :
Ajouter `/competences/`, `/open-source/` et `/thibaut-monier-cv.pdf` (statut 200 et type `application/pdf`) à `OK_PATHS` du contrôle de fumée et à son test.

**Fichiers à créer/modifier** :
- `scripts/checks/lib/smoke.ts`
- `tests/unit/checks/smoke.test.ts`

**Critères de validation** :
- [ ] Test unitaire vert
- [ ] `make smoke URL=…` vert en préproduction locale

#### T-900-02 : [TEST] Phase 4 : scénarios e2e inter-US
- **Estimation** : 3,5h
- **Dépend de** : T-007-13, T-019-14, T-023-14, T-023-15, T-022-11
- **Lot** : 4

**Description** :
Parcours bout en bout : accueil → preuve plugins → `/open-source/` → fiche → dépendance → Packagist (lien) ; `/parcours/` → mention career-ops → retour au profil ; `/contact/` → téléchargement du CV ; hub → tailsfadmin. Aucun test ignoré.

**Fichiers à créer/modifier** :
- `tests/e2e/sprint-002.spec.ts`

**Critères de validation** :
- [ ] Scénarios verts sur `preview`
- [ ] Aucun `test.skip`

#### T-900-03 : [TEST] Phase 4 : porte du sprint (`/gate:validate-sprint 002`) et budgets
- **Estimation** : 3h
- **Dépend de** : T-900-01, T-900-02, T-007-16, T-006-13, T-019-13, T-020-21, T-021-12, T-023-13, T-022-10
- **Lot** : 4

**Description** :
`make ci` complet ; Lighthouse ≥ 95 sur au moins 6 pages types (accueil, parcours, compétences, catalogue, fiche, étude de cas) ; responsive 360/768/1280 sur toutes les pages (matrice existante) ; durée de la CI mesurée (Lighthouse × 3 sur ~30 pages : risque de dépassement) ; build Docker < 5 min.

**Fichiers à créer/modifier** :
- `reports/ (artefacts)`

**Critères de validation** :
- [ ] Rapport de porte archivé
- [ ] Durée CI et build mesurées et consignées

#### T-900-04 : [OPS] Phase 4 : build Railway (Typst, poppler, images) et déploiement
- **Estimation** : 2,5h
- **Dépend de** : T-900-03
- **Lot** : 4

**Description** :
Vérifier que l’étape finale `runtime` construit sur Railway avec les nouvelles couches (durée, taille de l’image, absence d’appel réseau), déployer via la CI, exécuter le contrôle de fumée en production, vérifier le téléchargement du PDF à la main.

**Critères de validation** :
- [ ] Production à jour
- [ ] Fumée verte
- [ ] Image `runtime` sans Typst ni poppler

#### T-900-05 : [DOC] Phase 4 : README, index des guides, CHANGELOG, mise à jour du modèle de contenu
- **Estimation** : 1,5h
- **Dépend de** : T-900-03
- **Lot** : 4

**Description** :
README (cibles `make cv`, `make metrics`, variable `GITHUB_TOKEN`), index des guides, CHANGELOG, corrections de `content-model.md` (vendor Packagist, `externalRequires`, domaines) et d’US-020 (URL) décidées dans les écarts.

**Fichiers à créer/modifier** :
- `README.md (append)`
- `docs/guides/README.md`
- `CHANGELOG.md`
- `project-management/architecture/content-model.md (hors dossier du sprint : demande à l’orchestrateur)`

**Critères de validation** :
- [ ] Aucune information dupliquée entre README et guides

#### T-900-06 : [REV] Phase 4 : revue transverse et validation du PO sur la production
- **Estimation** : 2h
- **Dépend de** : T-900-04, T-900-05
- **Lot** : 4

**Description** :
Revue d’intégration (zones partagées, `home.yaml`, `nav.ts`, `content.config.ts`, `package.json`), démonstration de l’incrément au PO sur la production.

**Critères de validation** :
- [ ] Checklist DoD (§10) cochée
- [ ] Validation PO
