# Guide : compétences et réalisations (US-006)

Page `/competences/` : réalisations filtrables par domaine, références clients et compétences. Tout le contenu est rendu au build (indexable sans JavaScript) ; le filtre est une amélioration progressive (`src/scripts/skill-filter.ts`, moins de 3 Ko).

## Décisions (T-006-01)

| Sujet | Décision |
|-------|----------|
| Domaines | 5 valeurs : `delivery`, `architecture`, `e-commerce`, `donnees-migrations`, `ia-appliquee` (libellés dans `src/lib/filters.ts`) ; une réalisation peut en porter plusieurs |
| Références clients | **Anonymisées par défaut** : « Référence confidentielle » (E12). Un client n'est cité que s'il figure dans `CITABLE_CLIENTS` (`scripts/checks/lib/achievements.ts`, vide aujourd'hui), liste validée par le PO |
| URL | `/competences/?domaine=ia-appliquee` (barre finale) ; paramètre inconnu : liste complète et message annoncé |
| Année | `year` = année de fin ou de livraison de la réalisation (à valider par le PO) |
| Niveau de compétence | Non renseigné (champ `level` facultatif, laissé vide tant que le PO ne l'a pas validé) |

## Ajouter une réalisation

`src/data/cv/achievements.yaml` (10 à 15 entrées) :

```yaml
- id: migration-magento-sylius # kebab-case ASCII, unique
  title: "Migration d'une plateforme B2C de Magento vers Sylius" # 120 caractères au plus
  domains: [e-commerce, donnees-migrations] # au moins un
  year: 2024
  clients: [] # vide = « Référence confidentielle »
  proofUrl: 'https://…' # facultatif : lien public et stable seulement
  experienceId: gingerminds # facultatif : nom d'un fichier de experiences/
  skills: [sylius, magento] # facultatif : identifiants de skills.yaml
```

Factuel et chiffré quand c'est vérifiable ; rien d'inventé ; aucune donnée personnelle ; espace insécable avant `:`, `;`, `?`, `!` et `%`.

## Ajouter une compétence

`src/data/cv/skills.yaml` : `id` (kebab-case), `label`, `domain` (un des 5), `level` facultatif (`expert`, `avance`, `pratique`). Chaque domaine doit avoir au moins une compétence.

## Contrôles au build

`scripts/checks/achievements.content.check.ts` : schémas (domaine hors liste : « Domaine « x » hors liste (…) »), identifiants uniques, 10 à 15 réalisations, références croisées (`skills`, `experienceId`), clients citables, données personnelles, un domaine sans compétence. Les messages citent le fichier, la réalisation et le champ.

## Accessibilité

Groupe de boutons à bascule (`aria-pressed`, cibles de 44 px), compteur dans une région `aria-live="polite"`, filtre masqué sans JavaScript (aucun contrôle inerte), liste défilante sous 768 px.
