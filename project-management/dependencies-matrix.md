# Matrice des dépendances

## Graphe entre EPICs

```mermaid
graph TD
    E1[EPIC-001 Socle] --> E2[EPIC-002 Profil & CV]
    E1 --> E3[EPIC-003 Blog migré]
    E1 --> E4[EPIC-004 Labo d'outils]
    E1 --> E5[EPIC-005 Vitrine open source]
    E2 --> E6[EPIC-006 SEO, GEO & mesure]
    E3 --> E6
    E5 --> E6
    E2 --> E7[EPIC-007 Version anglaise]
    E5 --> E7
```

## Tableau

| Epic | Dépend de | Bloque | Criticité |
|------|-----------|--------|-----------|
| EPIC-001 Socle | — | Tous | 🔴 Critique |
| EPIC-002 Profil & CV | EPIC-001 | EPIC-006, EPIC-007 | 🔴 Critique |
| EPIC-003 Blog migré | EPIC-001 | EPIC-006 | 🟠 Haute |
| EPIC-004 Labo d'outils | EPIC-001 | — | 🟡 Moyenne |
| EPIC-005 Vitrine open source | EPIC-001 | EPIC-006, EPIC-007 | 🟠 Haute |
| EPIC-006 SEO, GEO & mesure | EPIC-002, EPIC-003, EPIC-005 | — | 🟠 Haute |
| EPIC-007 Version anglaise | EPIC-002, EPIC-005 | — | 🟢 Basse |

## Chemin critique

EPIC-001 → EPIC-002 → EPIC-005 → EPIC-003 → EPIC-006

À l'échelle des US : US-001 → US-002 → US-005 → US-007 (CV PDF) et US-002 → US-019 → US-020 → US-024.

## Graphe inter-US

```mermaid
graph LR
    US001[US-001 Squelette] --> US002[US-002 Design system]
    US001 --> US003[US-003 CI qualité]
    US002 --> US004[US-004 Accueil]
    US002 --> US005[US-005 Parcours]
    US002 --> US008[US-008 Contact]
    US002 --> US029[US-029 Mentions légales]
    US005 --> US006[US-006 Compétences]
    US005 --> US007[US-007 CV PDF]
    US002 --> US009[US-009 Migration blog]
    US009 --> US010[US-010 Canonical & table]
    US009 --> US011[US-011 Navigation blog]
    US009 --> US012[US-012 Recherche]
    US009 --> US013[US-013 RSS]
    US002 --> US014[US-014 Modèle de test]
    US014 --> US015[US-015 3 tests]
    US014 --> US016[US-016 Annuaire]
    US014 --> US017[US-017 Médias]
    US015 --> US018[US-018 Comparatifs]
    US002 --> US019[US-019 Catalogue plugins]
    US019 --> US020[US-020 Fiche plugin]
    US020 --> US021[US-021 Données vivantes]
    US002 --> US022[US-022 tailsfadmin]
    US002 --> US023[US-023 career-ops]
    US005 --> US024[US-024 SEO & JSON-LD]
    US009 --> US024
    US020 --> US024
    US002 --> US025[US-025 Images OG]
    US007 --> US026[US-026 Analytics]
    US008 --> US026
    US004 --> US027[US-027 i18n]
    US027 --> US028[US-028 Traduction EN]
    US005 --> US028
    US020 --> US028
```

## Dépendances inter-US

| US source | US cible | Raison |
|-----------|----------|--------|
| US-001 | US-002, US-003 | Le projet et le déploiement doivent exister |
| US-002 | US-004, US-005, US-008, US-009, US-014, US-019, US-022, US-023, US-025, US-029 | Layout et design system communs |
| US-005 | US-006, US-007, US-024, US-028 | Collection « expériences » : source unique du CV |
| US-009 | US-010 à US-013, US-024 | Articles migrés requis |
| US-014 | US-015 à US-017 | Schéma du protocole de test |
| US-015 | US-018 | Il faut au moins 2 tests d'une même catégorie |
| US-019 | US-020 | Collection « plugins » |
| US-020 | US-021, US-024, US-028 | Fiche plugin à enrichir, décrire et traduire |
| US-007, US-008 | US-026 | Les conversions à mesurer doivent exister |
| US-004 | US-027 | Première page à rendre bilingue |
