# Gestion de projet : site personnel de Thibaut Monier

Site CV et portfolio : profil et parcours, blog (repris d'Agentic Agency), labo de tests d'outils approfondis, vitrine open source (20 plugins Sylius 2, bundle Symfony tailsfadmin, contributions career-ops). Double objectif : **poste** (objectif final) et **missions freelance** (en parallèle).

## Documents

| Document | Rôle |
|----------|------|
| [prd.md](prd.md) | Exigences produit, objectifs, KPI, risques, questions ouvertes |
| [personas.md](personas.md) | 4 personas, matrice des fonctionnalités, anti-personas |
| [definition-of-done.md](definition-of-done.md) | DoD adaptée à un site statique |
| [dependencies-matrix.md](dependencies-matrix.md) | Graphes Mermaid EPICs et US, chemin critique |
| [backlog/index.md](backlog/index.md) | Index des 7 EPICs et 29 US |
| [analysis/](analysis/research-summary.md) | Phase d'Analyse : recherche, contraintes, risques, options techniques |
| [workflow-status.yaml](workflow-status.yaml) | Avancement du workflow |

## Personas

| ID | Persona | Priorité |
|----|---------|----------|
| P-001 | Claire Morel : DG ou DRH qui recrute un CTO, COO ou Delivery Manager | Primaire |
| P-002 | Marc Delaunay : dirigeant e-commerce B2B ou d'agence, cherche un expert en mission | Primaire |
| P-003 | Julien Ferreira : lead dev ou intégrateur Sylius | Secondaire |
| P-004 | Sophie Lambert : tech lead qui pratique l'agentic engineering | Secondaire |

## Stack (hypothèse, à confirmer par ADR en phase Conception)

Site statique Astro, MDX, Tailwind v4, Pagefind ; tout dockerisé (développement compris) ; hébergement à coût nul (Railway avec crédit Hobby ou Cloudflare, ADR à venir) ; Umami Cloud ; CV PDF avec Typst ; CI GitHub Actions. Il s'agit de réutiliser le socle d'Agentic Agency (`../blog`).

## Roadmap

| Sprint | But | Points | US |
|--------|-----|--------|----|
| [001](sprints/sprint-001-walking_skeleton/sprint-goal.md) | Walking skeleton | 24 | US-001 à US-005, US-008, US-029 |
| [002](sprints/sprint-002-preuves_profil_open_source/sprint-goal.md) | Preuves : profil complet et open source | 25 | US-006, US-007, US-019 à US-023 |
| [003](sprints/sprint-003-blog_migre_seo/sprint-goal.md) | Blog migré et SEO | 25 | US-009 à US-013, US-024 à US-026 |
| [004](sprints/sprint-004-labo_outils/sprint-goal.md) | Labo d'outils | 19 | US-014 à US-018 |
| [005](sprints/sprint-005-version_anglaise/sprint-goal.md) | Version anglaise et réserve | 10 | US-027, US-028 |

**Total : 103 points, 29 US, 7 EPICs.**

## Statuts

| Icône | Statut |
|-------|--------|
| 🔴 | To Do |
| 🟡 | In Progress |
| ⏸️ | Blocked |
| 🟢 | Done |
