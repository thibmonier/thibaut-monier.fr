# Intégrations et contrats de données

> Ce document remplace le « api.md » du workflow : le site **n'expose aucune API**. Il **consomme** des API au build et des services tiers depuis le navigateur. Il **génère** aussi des fichiers techniques consommés par des tiers (moteurs, lecteurs RSS).

## 1. API consommées au build (ADR-0006)

| API | Requête | Champs utilisés | Auth et quota | Échec |
|-----|---------|-----------------|---------------|-------|
| GitHub REST | `GET /repos/thibmonier/{repo}` | `stargazers_count`, `pushed_at`, `html_url`, `archived` | `GITHUB_TOKEN` (1 000 requêtes/h) | Valeur précédente conservée + avertissement |
| GitHub REST | `GET /repos/thibmonier/{repo}/releases/latest` | `tag_name`, `published_at` | idem | idem (404 → « aucune release ») |
| Packagist | `GET https://packagist.org/packages/{vendor}/{package}.json` | `package.downloads.total`, `package.downloads.monthly`, dernière version stable de `package.versions` | Aucune ; cache serveur de 12 h | idem |

**Contrat de sortie** : `src/data/oss-metrics.json`

```json
{
  "fetchedAt": "2026-10-14T06:00:00Z",
  "items": {
    "sylius-facturx-plugin": {
      "stars": 1, "pushedAt": "2026-10-10T12:00:00Z",
      "latestTag": "v1.2.0", "releasedAt": "2026-10-01T09:00:00Z",
      "packagist": { "name": "tmonier/sylius-facturx-plugin", "downloadsTotal": 0, "downloadsMonthly": 0 },
      "stale": false
    }
  }
}
```
Les valeurs de l'exemple sont fictives. Le schéma Zod se trouve dans `content-model.md`. `stale: true` signale une valeur conservée après un échec.

## 2. Services appelés depuis le navigateur (ADR-0004)

| Service | Appel | Données envoyées | Déclencheur | CSP |
|---------|-------|------------------|-------------|-----|
| Web3Forms | `POST https://api.web3forms.com/submit` (JSON) | `access_key` (publique), `name`, `email`, `motif`, `message`, `botcheck` (vide), `subject` | Envoi du formulaire `/contact/` | `connect-src` |
| Umami Cloud | Script de suivi et `POST` des événements | URL, référent, langue, taille d'écran, événements (`contact_submit{motif}`, `rdv_click`, `cv_download`, `outbound_*`) ; **aucune donnée saisie** | Pages vues et clics `data-umami-event` | `script-src` et `connect-src` |
| Calendly | Lien sortant `https://calendly.com/<compte>/echange-decouverte` | Aucune (navigation) | Clic sur « Réserver un créneau » | Aucune |

### Formulaire : comportement attendu
| Cas | Réponse Web3Forms | Interface |
|-----|-------------------|-----------|
| Succès | `200 {"success": true}` | Redirection vers `/contact/merci/?motif=<m>` et événement `contact_submit` |
| Erreur de validation | `4xx {"success": false, "message": …}` | Message en ligne, annoncé par `aria-live`, saisie conservée |
| Réseau ou 5xx | — | « L'envoi a échoué. Écrivez-moi directement : <e-mail protégé> », saisie conservée |
| Champ piège rempli ou envoi en moins de 3 s | Non envoyé | Faux succès (on ne renseigne pas le robot) |

## 3. Fichiers techniques générés (consommés par des tiers)

| Fichier | Consommateur | Contenu | US |
|---------|--------------|---------|----|
| `/sitemap-index.xml` | Moteurs | Toutes les pages publiques (hors `/contact/merci/`) | US-024 |
| `/robots.txt` | Moteurs | Autorise tout, référence le sitemap | US-024 |
| `/llms.txt` | Moteurs IA | Présentation, liens vers profil, plugins, tests et articles clés (format llmstxt.org) | US-024 |
| `/rss.xml` | Lecteurs RSS | 20 derniers articles et tests | US-013 |
| JSON-LD inline | Moteurs | `Person` et `ProfilePage` (accueil, parcours), `BlogPosting`, `SoftwareSourceCode` (plugins), `BreadcrumbList`, `FAQPage` | US-024 |
| `/og/<route>.png` | Réseaux sociaux | Images 1200 × 630 générées au build | US-025 |
| `/thibaut-monier-cv.pdf` | Recruteurs | CV Typst, 2 pages | US-007 |
| Artefact CI `redirects.agentic-agency.conf` | Usage futur (non déployé) | Table de redirections 301 | US-010 |

## 4. Variables de build et secrets

| Nom | Où | Secret ? | Usage |
|-----|----|----------|-------|
| `PUBLIC_WEB3FORMS_KEY` | Railway (variable de build), GitHub (CI) | Non (publique par conception) | Formulaire |
| `PUBLIC_UMAMI_WEBSITE_ID` | idem | Non | Analytics |
| `PUBLIC_CALENDLY_URL` | `src/config/contact.ts` (versionné) | Non | Lien de RDV |
| `GITHUB_TOKEN` | GitHub Actions (automatique) | Oui | Métriques OSS (workflow `metrics.yml`) |
| `RAILWAY_TOKEN` | GitHub Secrets | Oui | Redéploiement par cron (`scheduled.yml`) |
