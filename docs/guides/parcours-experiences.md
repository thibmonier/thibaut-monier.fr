# Guide : ajouter ou modifier une expérience

## Un fichier par expérience

`src/data/cv/experiences/<slug>.yaml` (slug en kebab-case ASCII, immuable après publication). La collection `experiences` est enregistrée dans `src/content.config.ts`, le schéma est `src/content/schemas/experiences.ts`. Ces fichiers seront aussi lus par le CV PDF (US-007).

```yaml
company: 'GINGERMINDS'
role: 'Delivery Manager / CTO'
start: '2021-01' # AAAA-MM
end: '2025-12' # null ou absent = poste en cours
location: 'Nantes' # ville ou « remote », jamais d'adresse
context: "Contexte en 280 caractères au plus."
achievements: # 2 à 8 réalisations de 300 caractères au plus (au moins 2 si featured)
  - "Première réalisation chiffrée."
  - "Seconde réalisation chiffrée."
featured: true
```

Champs optionnels : `skills` (slugs), `clientsCited` (`false` par défaut : accord de citation des clients), `order` (départage deux postes terminés à la même date, le plus petit s'affiche en premier), `summaryOnly`.

## Règle des 10 ans (V7)

Toute expérience **terminée après l'année courante moins 10** (ou en cours) doit être `featured: true` : elle s'affiche en détail dans la frise. Les autres sont `featured: false` avec `summaryOnly` (160 caractères au plus) et rejoignent le bloc repliable « Avant 2016 ». Une expérience qui sort de la fenêtre fait échouer le build tant qu'elle n'est pas rétrogradée, la fenêtre glissant avec les années.

## Contrôles au build

`npm run checks:content` (début de `npm run build`) exécute `scripts/checks/experiences.content.check.ts` :

1. **liste blanche** : téléphone, âge, date de naissance, adresse (`Donnée personnelle interdite détectée dans <fichier> : <type>`) ; « 25 ans d'expérience » reste autorisé ;
2. schéma : une erreur cite le fichier et le champ (`experiences/<fichier> : start : …`) ; une clé inconnue comme `phone` est rejetée ;
3. règle des 10 ans (V7) ;
4. décompte (V8) : `EXPECTED_EXPERIENCES` dans `scripts/checks/lib/experiences.ts` vaut **7** (Smile fusionné en une entrée). Ajouter ou retirer une expérience impose de mettre à jour cette constante.

## Affichage

`/parcours/` : liste ordonnée du plus récent au plus ancien (poste en cours d'abord, puis fin décroissante, puis début décroissant, puis `order`). Chaque jalon replie ses réalisations dans `details`/`summary` (fonctionne sans JavaScript ; `src/scripts/experience-toggle.ts` synchronise `aria-expanded`). À l'impression, tout est déplié et le document tient sur 2 pages A4 au plus (testé par `tests/e2e/parcours.spec.ts`).

## Typographie

Espace insécable avant `:`, `;`, `?`, `!` et `%` ; guillemets doubles autour des textes YAML (les `:` y sont autorisés).
