# Catalogue et fiches des plugins Sylius (US-019, US-020)

Le hub `/open-source/` liste les 24 plugins Sylius 2 filtrables par thème ; chaque plugin a une fiche `/open-source/sylius/<slug>/`. Les deux pages sont livrées et déployées ensemble (les cartes pointent vers les fiches).

## Décisions

| Sujet | Décision |
|-------|----------|
| Slug | nom du dépôt sans `sylius-` ni `-plugin` (`company-accounts`, `facturx`, `b2b-mcp`), immuable |
| Dépôt et paquet | `repo` = `thibmonier/<dépôt>` (GitHub), `packagist` = `tmonier/<dépôt>` (vendor Packagist différent de l’organisation) |
| Thèmes | `b2b` (13), `conformite-ue` (3), `back-office` (5), `ia-integrations` (3) ; un seul thème par plugin |
| Périmètre | 24 plugins (décision du PO du 2026-10-20 : channel-access, registration-approval, punchout-cxml et customer-asset-management s’ajoutent aux 20 du 2026-10-14) ; Punchout cXML, exclu au sprint 2 faute de dépôt distant, est publié et inclus |
| Hub | `/open-source/` ; pas de page `/open-source/sylius/` ; tri alphabétique dans chaque thème |
| Statut marketplace | non affiché (YAGNI) ; JSON-LD reporté à US-024 |
| Plugin en conception | champ `status: design` (défaut `released`) : badge « En conception » sur la carte et la fiche, fonctionnalités « prévues », ni installation ni matrice de compatibilité ni paquet ; seul `customer-asset-management` l’utilise |
| Démo en ligne | champ `inDemo: true` : lien « Voir dans la démo » sur la fiche ; l’URL vit dans `src/config/demo.ts`, source unique (hub, fiches, tests) |
| Agentic Feeds | non publié sur Packagist : `packagist` omis, pas de lien ni de téléchargements, mention « Paquet bientôt publié sur Packagist » |

## Ajouter ou modifier un plugin

1. Créer `src/content/plugins/fr/<slug>.mdx`. Le frontmatter est validé par `src/content/schemas/plugins.ts` (clés inconnues refusées), le corps MDX est le « problème résolu » (3 phrases).
2. Champs : `name`, `tagline` (140 caractères au plus), `theme`, `repo`, `packagist` (optionnel), `license`, `features` (5 à 8), `compatibility` (`matrix` : `sylius`, `php`, `symfony[]` ; `databases`), `requires`, `complements`, `externalRequires`, `installSteps` (2 à 8, le code entre accents graves), `screenshots` (4 au plus, `alt` de 10 caractères au moins) ou `configExcerpt`, `status` (facultatif, `released` ou `design`), `inDemo` (facultatif, faux par défaut).
3. `requires` reprend le `require` Composer entre plugins, `complements` le `suggest`, `externalRequires` les paquets tiers (`sylius/invoicing-plugin`). Vérifier contre `composer.json`.
4. Mettre à jour les décomptes attendus dans `scripts/checks/lib/plugins.ts` (24 plugins, répartition par thème : 13, 3, 5, 3) si le catalogue change.
5. `make build` : le contrôle `plugins.content.check.ts` cite le fichier et le champ (« Plugin « x » invalide : compatibilité.php est requis »), contrôle les références, les cycles, les données personnelles et la présence des captures.

« Nécessite » est la liste `requires`, « Complété par » la liste `complements`, « Utilisé par » est calculé (inverse de `requires`).

## Filtre et recherche

Sans JavaScript, la page liste les 24 plugins par thème avec des ancres. Le script `src/scripts/plugin-filter.ts` (moins de 5 Ko, sans dépendance) révèle les commandes, filtre par thème (`?theme=b2b`, partageable) et classe les résultats de recherche : nom, puis accroche, puis fonctionnalités, accents et casse ignorés. La logique pure est dans `src/lib/plugins.ts`.

## Captures (E17)

Sélection de 24 captures pour 9 plugins (4 par fiche au plus ; PunchOut cXML/OCI : 2, dont l’adresse e-mail de la liste des acheteurs est masquée par un aplat), converties en WebP de 1200 px au plus, sans métadonnées, de 21 à 70 Ko, sous `src/assets/plugins/<slug>/`. Les 14 plugins livrés sans capture affichent un `configExcerpt`.

Critères d’exclusion appliqués à la revue visuelle : adresse e-mail, nom d’une personne dans une liste d’administration, adresse postale, jeton d’accès, nom de client réel. Les captures retenues ne montrent que des données de démonstration (société « Acme Industries », prénoms et noms fictifs de la fixture, boutique « Fashion Web Store »). Écartées : `b2b-mcp-admin-*` (e-mail), `company-accounts-admin-company-member*` (e-mails), `purchase-approval-shop-order-awaiting-approval` (adresse), `quick-order-06` et `07` (destinataires), `trade-credit-admin-*-open-items`, `trade-credit-shop-checkout` (e-mail, nom), `agentic-feeds-admin-product-feed-stripe` (jeton). Les trois `matrix-*` sont la matrice de commande de Quick Order.

Ajouter une capture : recadrer, convertir en WebP (1200 px, qualité adaptée pour rester sous 200 Ko, sans EXIF), la placer sous `src/assets/plugins/<slug>/`, la référencer dans `screenshots` avec un `alt` descriptif en français.

## Plugin en conception

Un plugin sans version publiée se déclare `status: design`. Le schéma refuse alors `compatibility`, `installSteps`, `packagist` et `inDemo` (rien n’est livré) et n’exige ni capture ni `configExcerpt` ; il garde 5 à 8 fonctionnalités, présentées comme « prévues ». La fiche remplace l’installation et la matrice par un avis, et la carte du catalogue affiche « En conception » à la place des versions de Sylius. Quand le plugin est publié : retirer `status`, ajouter compatibilité, installation, paquet et capture ou extrait de configuration.

## Démo en ligne

La démo « Fournitures Pro » (boutique B2B Sylius 2.3, 23 plugins installés, remise à zéro chaque nuit à 3 h) est décrite par `src/config/demo.ts` : `url` et `accountsUrl`, validées en HTTPS. Le bandeau de `/open-source/` et le lien « Voir dans la démo » des fiches (`inDemo: true`) lisent ce module ; ne jamais recopier l’URL ailleurs. Les identifiants de démonstration ne sont pas reproduits sur le site : le bandeau renvoie vers la page des comptes de la démo. Ce sont de simples liens sortants (`target="_blank"`, `rel="noopener noreferrer"`) : la CSP n’est pas concernée, et le contrôle des liens externes les vérifie comme les autres (avertissement seulement).

## Métriques vivantes

Voir [donnees-open-source.md](donnees-open-source.md).
