# Guide : modifier la page d'accueil

## Où sont les données

`src/data/home.yaml`, entrée `accueil`. Le schéma est `src/content/schemas/home.ts` (`strictObject` : une clé inconnue fait échouer le build). Les composants sont `Hero`, `CtaPair` et `ProofList` (`src/components/ui/`), composés par `src/pages/index.astro`.

| Champ | Règle |
|-------|-------|
| `name` | Nom affiché au-dessus du `h1` |
| `headline` | Le `h1` de la page, 80 caractères au plus |
| `valueProp` | Phrase de valeur, **25 mots au plus** (compte vérifié au build) |
| `availability` | Statut de disponibilité, 120 caractères au plus |
| `metaTitle` | `title` de la page, 60 caractères au plus |
| `metaDescription` | `meta description`, 160 caractères au plus |
| `ctas` | Exactement 2 boutons : `label` et `motif` (`mission`, `poste` ou `autre`), motifs distincts |
| `proofs` | Exactement 4 preuves : `id` (kebab-case unique), `value`, `label`, `link`, `source` |

Une erreur de schéma cite le champ : `Champ 'headline' requis dans la collection home`.

## Règles des preuves

- **Aucun chiffre sans source consultable** : `link` renvoie vers un contenu que le visiteur peut vérifier, `source` nomme cette destination (texte du lien).
- `link` est soit un chemin interne avec barre finale (`/parcours/`), soit une URL externe en `https://`.
- Le contrôle `scripts/checks/proof-links.dist.check.ts` (étape `checks:dist` du build) relit `dist/index.html` : un lien interne vers une route absente ou un lien externe non https fait échouer le build avec `Lien de preuve invalide : <id>`. Les pages `/open-source/` n'existent qu'au sprint 2 : en attendant, les preuves pointent vers GitHub ou vers `/parcours/`.
- Pour changer une preuve : modifier `value`, `label`, `link` et `source` de l'entrée correspondante dans `home.yaml`, puis `make build`.

## Contrat du motif de contact

Chaque bouton mène à `/contact/?motif=<motif>`. Valeurs : `mission` (« Me confier une mission »), `poste` (« Me recruter »), `autre`. La page contact (US-008) lit ce paramètre pour présélectionner le motif ; toute nouvelle valeur doit être ajoutée aux deux côtés (`motifs` dans `home.ts` et le formulaire).

## Données interdites

Aucun téléphone, âge, date de naissance ni adresse : chaque texte passe la liste blanche (`src/lib/privacy.ts`). « 25 ans d'expérience » est autorisé, un âge ne l'est pas. Saisir `25+` dans `value` et `ans d'expérience…` dans `label`.

## Typographie

Dans `home.yaml`, utiliser un espace insécable (` ` dans une chaîne entre guillemets doubles, ou le caractère lui-même) avant `:`, `;`, `?`, `!` et `%`.
