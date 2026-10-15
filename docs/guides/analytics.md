# Guide de la mesure d'audience

Umami Cloud, sans cookie (US-026). Décision et relevé des domaines : [ADR-0011](../adr/0011-umami-chargement-et-evenements.md).

## Fonctionnement

1. `PUBLIC_UMAMI_WEBSITE_ID` (variable de build) est lue **uniquement** par `configuredWebsiteId` de `src/lib/analytics-events.ts`. Absente, `Analytics.astro` ne rend ni balise ni chargeur : aucun script, aucune requête.
2. Renseignée, `Analytics.astro` pose `<meta name="analytics-website-id">` et le module externe `src/scripts/analytics.ts`. Celui-ci charge `https://cloud.umami.is/script.js` en `defer` sauf si `shouldLoadAnalytics` refuse : Do Not Track, Global Privacy Control ou navigateur automatisé (`navigator.webdriver`).
3. Un écouteur de clic délégué appelle `eventForLink` puis `trackEvent`. Un script bloqué ou en échec ne produit aucune erreur (`try/catch`).

## Contrat des événements

| Événement | Propriété | Marquage |
|-----------|-----------|----------|
| `contact_submit` | `motif` (mission, poste, autre) | `contact-form.ts` après un envoi réussi |
| `rdv_click` | aucune | `data-event="rdv_click"` (`RdvLink.astro`) |
| `cv_download` | aucune | `data-event="cv_download"` (`CvDownload.astro`) |
| `outbound_github` | `repo` | `data-event` du pied de page ; fiches et projets par motif d'URL |
| `outbound_packagist` | `package` | motif d'URL |
| `outbound_linkedin` | aucune | `data-event` du pied de page |

`data-event` explicite d'abord, sinon motif d'URL (`github.com/<owner>/<repo>`, `packagist.org/packages/<vendor>/<nom>`, `linkedin.com`). Aucune propriété de saisie libre : le motif est borné par `motifValue`. Les articles n'ont rien à marquer.

## Ajouter un événement

1. Ajouter son nom et ses propriétés à `EVENTS` (`src/lib/analytics-events.ts`) avec un test dans `tests/unit/lib/analytics-events.test.ts`.
2. Le marquer par `data-event="<nom>"` ou l'envoyer par `trackEvent('<nom>', {…})`.
3. `make checks` : le contrôle `analytics-events` parcourt `src/` (Markdown des articles compris) et échoue sur un nom ou une propriété hors liste : « Événement email_envoye : nom inconnu (src/…:12) ».
4. Mettre à jour la liste de `/vie-privee/` et l'ADR-0011.

## Test local

Le vrai script n'est jamais appelé en test : `tests/e2e/analytics.spec.ts` le simule par `page.route` (script et collecteur). Construire l'image avec un identifiant factice : `PUBLIC_UMAMI_WEBSITE_ID=00000000-0000-4000-8000-0000000000a1 make preview`. Les scénarios se présentent comme un visiteur ordinaire (`navigator.webdriver` forcé à `false`) puisque le chargeur ignore les navigateurs automatisés.

## Tableau de bord

Objectifs : O2, au moins 4 contacts qualifiés par mois (`contact_submit`) ; O3, au moins 15 % de clics sortants (`outbound_*` rapportés aux pages vues). L'offre Hobby conserve les données 6 mois ; 100 000 événements par mois.

## À contrôler en production

Le comportement du vrai script (absence de cookie et d'écriture dans le stockage) n'est pas testable en CI : à vérifier dans les outils du navigateur après le déploiement (T-900-28).

## Variable

`PUBLIC_UMAMI_WEBSITE_ID` : identifiant de site Umami Cloud. Valeur par défaut : vide (aucune mesure). Documentée dans `.env.example`.
