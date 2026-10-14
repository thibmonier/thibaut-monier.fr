# Mettre à jour les informations légales

Les pages `/mentions-legales/` et `/vie-privee/` combinent une configuration TypeScript et du Markdown.

| Information | Où la modifier |
|-------------|----------------|
| Éditeur, directeur de la publication, hébergeur (raison sociale, adresse, téléphone) | `src/config/legal.ts` (validé au build par `legalConfigSchema`) |
| Textes (propriété intellectuelle, droits, sous-traitants, durée de conservation) | `src/content/legal/mentions-legales.md` et `vie-privee.md` |

## Règles

- Aucune adresse ni téléphone pour l'éditeur : le schéma refuse ces clés. Le contact passe par `/contact/`.
- `updatedDate` (frontmatter) est obligatoire et affichée sur la page. La mettre à jour à chaque modification de fond.
- L'ancre `#formulaire` de `vie-privee.md` est liée depuis la mention du formulaire de contact : ne pas la renommer.
- Le contrôle `scripts/checks/legal-pii.content.check.ts` (lancé par `make checks`) fait échouer le build si une donnée personnelle (téléphone, adresse, âge) apparaît dans ces fichiers. Les coordonnées de l'hébergeur sont exclues du scan.
- À faire relire par le PO (et la société de portage salarial) avant toute mise en production.

## À vérifier

L'adresse officielle de Railway Corp. dans `src/config/legal.ts` est un marqueur « à vérifier » : la remplacer par les données publiées par l'hébergeur.
