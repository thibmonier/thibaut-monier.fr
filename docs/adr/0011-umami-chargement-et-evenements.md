# ADR-0011 : Chargement d'Umami et contrat des événements

## Statut
Proposé (2026-10-15, lot B du sprint 3) : à valider par le PO. Précise la section « Analytics » de l'ADR-0004.

## Contexte
L'ADR-0004 retient Umami Cloud (offre Hobby) et une liste fermée d'événements déclarés par `data-umami-event`. Trois points sont à fixer avant le code (US-026) : le chargement du script, le contrat des événements et la CSP. Relevé du 2026-10-15 sur `https://cloud.umami.is/script.js` (en-têtes et code lus par `curl`) :

- le script se charge depuis `https://cloud.umami.is/script.js` ;
- il envoie les mesures en `POST` vers `https://gateway.umami.is/api/send` (hôte par défaut, modifiable par `data-host-url`). L'hôte `api-gateway.umami.dev` indiqué dans la CSP du sprint 1 n'est pas utilisé : il est retiré ;
- il ne dépose aucun cookie ; il lit seulement `localStorage` (clé `umami.disabled`, jamais écrite) ;
- il écoute lui-même les clics sur `[data-umami-event]` ; avec `data-do-not-track="true"`, il respecte DNT ;
- l'offre Hobby, relevée sur `https://umami.is/pricing` le 2026-10-15 : 100 000 événements par mois, 1 site, 6 mois de rétention ; la région des données n'est pas précisée pour cette offre (serveurs aux États-Unis et dans l'UE).

## Décision
1. **Chargeur maison, différé.** `Analytics.astro` n'émet qu'une balise `<meta name="analytics-website-id">` quand `PUBLIC_UMAMI_WEBSITE_ID` est défini (aucun script sinon). `src/scripts/analytics.ts` (module externe) décide du chargement par `shouldLoadAnalytics` : pas d'identifiant, ou DNT (`navigator.doNotTrack`), ou GPC (`navigator.globalPrivacyControl`), ou navigateur automatisé (`navigator.webdriver`, vrai pour Playwright et Lighthouse) : aucun script, aucune requête. Les visites automatisées ne sont pas des visiteurs, et la CI n'appelle ainsi jamais Umami même avec un identifiant factice. Sinon il injecte `script.js` en `defer`, avec `data-website-id` et `data-do-not-track="true"`.
2. **Un seul mécanisme d'événements.** Les liens portent `data-event="<nom>"` (jamais `data-umami-event`, que le script d'Umami traiterait en double), sinon le motif de l'URL de destination décide. Un écouteur de clic délégué appelle `window.umami?.track` dans un `try/catch` : un script bloqué ne produit aucune erreur. L'ADR-0004 mentionnait `data-umami-event` : `data-event` le remplace.
3. **Contrat fermé** (`src/lib/analytics-events.ts`, seul lecteur de l'identifiant et de la liste) :

   | Événement | Propriété | Déclenché par |
   |-----------|-----------|---------------|
   | `contact_submit` | `motif` (poste, mission, autre) | envoi réussi du formulaire |
   | `rdv_click` | aucune | lien de prise de rendez-vous |
   | `cv_download` | aucune | lien de téléchargement du CV |
   | `outbound_github` | `repo` (`owner/nom`) | lien `github.com/<owner>/<repo>` |
   | `outbound_packagist` | `package` (`vendor/nom`) | lien `packagist.org/packages/<vendor>/<nom>` |
   | `outbound_linkedin` | aucune | lien `linkedin.com` |

   Aucune saisie libre : le motif est borné aux trois valeurs du formulaire ; toute autre propriété (`email`, `message`, `name`) est refusée. Le contrôle de build `analytics-events` parcourt `src/` et échoue sur un nom ou une propriété hors liste.
4. **CSP** (domaines exacts, ADR-0009) : `script-src` garde `https://cloud.umami.is` ; `connect-src` passe à `https://gateway.umami.is` (en remplacement de `cloud.umami.is` et `api-gateway.umami.dev`, inutiles). Aucun `unsafe-inline`.

## Alternatives considérées
| Alternative | Rejet |
|-------------|-------|
| Balise `<script defer src=…>` directe dans le layout | Aucun contrôle de DNT et de GPC avant la requête (le script ne respecte que DNT, et seulement si l'attribut est posé) |
| `data-umami-event` | Double comptage avec l'écouteur maison ; pas de contrôle de contrat à la source |
| Proxy du script sur le domaine du site | Un composant serveur à maintenir, contraire au site statique |

## Conséquences
- ✅ Aucun script ni requête sans identifiant, avec DNT ou avec GPC ; aucune donnée saisie dans les événements ; contrat vérifié à chaque build.
- ✅ CSP resserrée à deux domaines exacts (`cloud.umami.is`, `gateway.umami.is`).
- ⚠️ Le comportement du vrai script (cookies, stockage) n'est pas testable en CI : il est contrôlé en production (T-900-28).
- ⚠️ Si Umami change son hôte de collecte, la CSP bloque les mesures sans erreur visible : relire la source du script à chaque montée de version du service.
