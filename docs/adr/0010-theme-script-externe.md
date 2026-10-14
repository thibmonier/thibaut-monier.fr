# ADR-0010 : Thème sans flash avec un script externe et des jetons générés

## Statut
Accepté (2026-10-14, arbitrage A5 de l'orchestrateur)

## Contexte
Le site propose un thème clair et sombre (préférence système, choix mémorisé). Pour éviter le flash du mauvais thème, le choix doit être appliqué avant le premier rendu, donc par un script bloquant dans `<head>`. La CSP (ADR-0009) interdit `unsafe-inline` : aucun script ni style inline.

## Décision
1. **`/theme-init.js`** : script externe de moins de 1 Ko, chargé par `<script src>` synchrone dans `<head>` (avant la feuille de style). Il pose la classe `js` sur `<html>` et l'attribut `data-theme` si `localStorage` contient un choix valide ; sinon la préférence système s'applique par CSS (`prefers-color-scheme`). Tout accès au stockage est sous `try/catch`.
2. **Jetons** : `src/data/tokens.json` est la source unique (partagée avec Typst, ADR-0005). `npm run tokens` génère `src/styles/tokens.css` (variables, thème sombre par media query et `[data-theme]`, bloc `@theme inline` Tailwind). Un test unitaire vérifie que le fichier généré est à jour.
3. **Amélioration progressive** : sans JavaScript, le thème suit le système, la navigation reste visible et le bouton de thème est masqué.

## Alternatives considérées
- **Script inline avec empreinte** : rejeté, l'empreinte change à chaque édition et complique la CSP.
- **Thème par media query seule** : pas de choix persistant, rejeté.

## Conséquences
- Une requête bloquante supplémentaire (fichier de moins de 1 Ko, mis en cache 30 jours par nginx).
- Les contrastes des deux thèmes sont vérifiés par test unitaire (WCAG 2.2 AA) et par axe.
