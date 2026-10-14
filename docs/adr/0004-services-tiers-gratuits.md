# ADR-0004 : Services tiers (analytics, formulaire, prise de RDV)

## Statut
Accepté (2026-10-14, validé par le PO)

## Contexte
Le site est statique, sans serveur applicatif. La gratuité est un critère impératif (CB-4). Le site ne dépose aucun cookie (CR-2) et le RGPD s'applique au formulaire (CR-1). Les KPI O2 et O3 exigent de mesurer des clics.

## Décision

### Analytics : Umami Cloud, offre Hobby
- Gratuit : 100 000 événements par mois, **1 site**, rétention de 6 mois ; **sans cookie** ; **événements personnalisés** inclus.
- Script officiel chargé en `defer`. Les événements sont déclarés en HTML (`data-umami-event="cv_download"`, `data-umami-event-motif="poste"`).
- Liste fermée des événements (contrat vérifié en CI, voir US-026) : `contact_submit{motif}`, `rdv_click`, `cv_download`, `outbound_github{repo}`, `outbound_packagist{package}`, `outbound_linkedin`.
- Région UE si l'offre gratuite le permet ; sinon, région États-Unis, mentionnée dans `/vie-privee/`.
- Respect de DNT et GPC : le script n'est pas chargé si `navigator.doNotTrack === "1"` ou `navigator.globalPrivacyControl === true`.

### Formulaire de contact : Web3Forms
- Envoi direct depuis le navigateur vers l'API Web3Forms (`access_key` publique par conception, liée au domaine), transmis par e-mail au PO.
- **Aucun stockage des envois** chez Web3Forms ; serveurs aux États-Unis (US-East) ; journaux purgés tous les 2 mois ; DPA disponible (version du 13/07/2026) → mention d'information sous le formulaire et dans `/vie-privee/`.
- Anti-spam : champ piège (`botcheck`), délai minimal de 3 s côté client et validation HTML5. Pas de captcha tiers (cookies, accessibilité).
- Champs : nom, e-mail, motif (mission, poste, autre), message. Rien d'autre (minimisation).
- Repli si l'API est indisponible : message d'erreur et adresse e-mail de contact affichée en clair, protégée contre le scraping basique.

### Prise de RDV : Calendly, offre gratuite
- **Lien sortant** (`target="_blank" rel="noopener noreferrer"`) vers un type d'événement unique, « Échange découverte (30 min) » (l'offre gratuite n'autorise qu'un type d'événement actif). Pas de widget embarqué : il déposerait des cookies tiers, alourdirait la page et la CSP.

## Alternatives considérées
| Besoin | Alternative | Rejet |
|--------|-------------|-------|
| Analytics | Cloudflare Web Analytics | Pas d'événements personnalisés |
| Analytics | Plausible | Payant |
| Analytics | Umami auto-hébergé sur Railway | Consommerait du crédit, avec une base de données à maintenir |
| Formulaire | Formspree Free | 50 envois par mois, également aux États-Unis ; aucun gain |
| Formulaire | Worker et Email Routing | Exigerait Cloudflare, et l'envoi sortant y est payant |
| RDV | Cal.com | Le PO a choisi Calendly |

## Conséquences
- ✅ Coût de 0 € ; aucun cookie, donc aucun bandeau de consentement.
- ✅ Chaque service est intégré par un seul script ou lien, donc remplaçable en moins d'une heure (risque R-04).
- ⚠️ Transferts de données vers les États-Unis (Web3Forms, éventuellement Umami) : encadrés par les DPA et mentionnés dans `/vie-privee/` (US-029).
- ⚠️ Plafonds des offres gratuites : 100 000 événements par mois et environ 250 envois de formulaire par mois, très au-delà des besoins (O2 vise ≥ 4 contacts par mois).
