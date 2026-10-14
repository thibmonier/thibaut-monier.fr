# Definition of Done

> Adaptée à un site de contenu statique. La stack visée (Astro, MDX, Tailwind v4) est une hypothèse à confirmer dans la tech spec. Les critères sont formulés pour rester valables quelle que soit la stack retenue.

Une user story est **Done** quand **tous** les critères applicables sont cochés.

## 1. Code
- [ ] Revue (auto-revue et revue d'agent) faite, commentaires traités
- [ ] Conventional Commits ; branche `feature/…` fusionnée par squash merge
- [ ] Lint et formatage passent sans erreur ; TypeScript en mode strict, sans `any` non justifié
- [ ] Composants à responsabilité unique (SOLID, KISS) ; pas de code mort

## 2. Contenu
- [ ] Le contenu respecte le **schéma de la collection** ; le build échoue sinon
- [ ] Français relu (orthographe, accents, typographie : espaces insécables avant `: ; ? !`)
- [ ] Aucune donnée personnelle non autorisée (téléphone, âge, adresse précise)
- [ ] Les dates et versions citées sont exactes et datées (pour les tests d'outils : « testé le » et « revérifié le »)
- [ ] Les images ont un texte alternatif pertinent, ou `alt=""` si elles sont décoratives

## 3. Tests et vérifications
- [ ] Tests unitaires de la logique non triviale (transformations de données, filtres, génération du PDF, redirections) ; couverture ≥ 80 % sur `src/lib/`
- [ ] Test end-to-end du parcours concerné quand la story touche un parcours de conversion
- [ ] Les scénarios Gherkin de la story sont vérifiés (automatiquement ou manuellement, avec une preuve dans la PR)
- [ ] Aucun lien interne ou externe cassé
- [ ] CI verte

## 4. Accessibilité (WCAG 2.2 AA)
- [ ] Navigation au clavier complète, focus visible
- [ ] Contrastes conformes dans les deux thèmes, clair et sombre
- [ ] Hiérarchie des titres correcte, landmarks présents
- [ ] `prefers-reduced-motion` respecté
- [ ] Audit axe sans violation sérieuse ni critique

## 5. Performance et SEO
- [ ] Lighthouse ≥ 95 sur Performance, Accessibilité, Bonnes pratiques et SEO (mobile)
- [ ] Images optimisées (AVIF ou WebP, dimensions explicites, lazy-loading sous la ligne de flottaison)
- [ ] `title`, `description`, URL canonique, Open Graph et JSON-LD pertinents
- [ ] La page est présente dans le sitemap si elle est publique

## 6. Sécurité
- [ ] Aucun secret dans le dépôt ; variables de build documentées
- [ ] En-têtes de sécurité conservés (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [ ] Scripts tiers justifiés, de versions fixées et déclarés dans la CSP

## 7. Responsive
- [ ] Rendu vérifié à 360 px, 768 px et 1280 px ; aucun défilement horizontal

## 8. Documentation
- [ ] README mis à jour si le setup ou la procédure de contenu change
- [ ] CHANGELOG mis à jour
- [ ] ADR créé pour toute décision structurante

## 9. Environnements et dépendances
- [ ] Fonctionnalité vérifiée en **environnement de développement dockerisé** avant le déploiement
- [ ] Aucun outil requis hors Docker (pas de Node ni de gestionnaire de paquets sur le poste)
- [ ] Dépendances ajoutées dans leur dernière version stable, version fixée et lockfile commité

## 10. Déploiement
- [ ] Déployé en production via la CI
- [ ] Contrôle de fumée après déploiement (page accessible, code 200, pas d'erreur console)
- [ ] Validation PO sur la production
