# US-001 : Squelette du site publié en production

## Epic parent
EPIC-001 : Socle et walking skeleton

## Persona concerné
**P-001** : Claire - DG d'une scale-up qui recrute

## User Story

### Carte
**En tant que** P-001 : Claire, DG d'une scale-up qui recrute
**Je veux** ouvrir le site en HTTPS depuis un lien reçu d'un cabinet et voir immédiatement une page qui se charge vite
**Afin de** juger en moins de 2 minutes que le profil est sérieux, sans page d'erreur ni avertissement de sécurité

### Conversation
- **Décision PO du 2026-10-14** : domaine thibaut-monier.fr ou .com (l'un redirige vers l'autre, à arbitrer en tech spec). Un sous-domaine provisoire de l'hébergeur est acceptable tant que le DNS n'est pas en place.
- **Hébergement à 0 €** : Railway (abonnement Hobby déjà payé, crédit disponible ; conteneur nginx identique du développement à la production) ou Cloudflare Workers Static Assets (gratuit, CDN ; production non conteneurisée, acceptée par le PO). Choix tranché par l'ADR hébergement en phase Conception.
- **Tout est dockerisé**, développement compris : aucun outil (Node, gestionnaire de paquets) n'est requis sur le poste. Chaque évolution est visible en environnement de développement (conteneur avec rechargement à chaud) avant d'être déployée.
- Branche de déploiement : fusion sur `main` = déploiement en production, ou étape de pré-production ?
- Le contenu minimal de la page d'accueil se limite-t-il au nom, au titre et à un lien de contact (le contenu riche vient avec US-004) ?
- Politique des en-têtes : CSP stricte dès le départ, quitte à l'assouplir pour l'analytics (US-026) ?

### Validation INVEST
- [x] Independent : première US, aucune prérequise
- [x] Negotiable : choix d'hébergeur et de domaine à confirmer en tech spec
- [x] Valuable : le site existe publiquement
- [x] Estimable : chaîne connue (Docker, puis nginx sur Railway ou wrangler sur Cloudflare)
- [x] Sized : 5 points (≤ 8)
- [x] Testable : critères mesurables ci-dessous

## Critères d'acceptance (Format Gherkin + SMART)

### Scénario nominal
```gherkin
Scenario: Page d'accueil minimale servie en HTTPS après fusion
GIVEN une modification fusionnée sur la branche principale
WHEN la chaîne de déploiement continu se termine
THEN la page d'accueil répond en HTTP 200 en HTTPS en moins de 10 minutes après la fusion
AND elle affiche le nom "Thibaut Monier", le titre du profil et un lien vers la page contact
AND le LCP mesuré est inférieur à 1,5 s en 4G mobile simulée
```

### Scénarios alternatifs
```gherkin
Scenario: Redirection HTTP vers HTTPS
GIVEN le site déployé
WHEN P-001 saisit l'adresse en "http://"
THEN elle reçoit une redirection 301 vers la version "https://" en moins de 1 s

Scenario: En-têtes de sécurité présents
GIVEN le site déployé
WHEN une requête GET est envoyée sur la page d'accueil
THEN la réponse contient Content-Security-Policy, Strict-Transport-Security (max-age ≥ 31536000), X-Content-Type-Options "nosniff", Referrer-Policy "strict-origin-when-cross-origin" et Permissions-Policy
```

### Scénarios d'erreur
```gherkin
Scenario: URL inexistante
GIVEN le site déployé
WHEN P-001 ouvre "/page-inexistante"
THEN le statut HTTP est 404
AND la page affiche "Cette page n'existe pas" et un lien "Retour à l'accueil"
AND aucune trace de pile ni version de serveur n'est exposée

Scenario: Échec de build bloquant le déploiement
GIVEN une modification dont le build échoue
WHEN la chaîne de déploiement s'exécute
THEN la version précédente reste en production
AND l'échec est visible dans les journaux de la CI en moins de 5 minutes
```

### Critères techniques (site statique)
- [ ] Schéma de contenu de la page d'accueil validé au build (le build échoue si invalide)
- [ ] Page/composant : layout racine et page d'index
- [ ] Responsive de 320 px à 1920 px sans défilement horizontal
- [ ] WCAG 2.2 AA : un `h1` unique, langue `fr` déclarée, focus visible
- [ ] SEO : `title`, `meta description`, `canonical` sur la page d'accueil
- [ ] Performance : Lighthouse ≥ 95 sur chaque axe
- [ ] Déploiement : image Docker reproductible, secrets uniquement en variables de build
- [ ] Environnement de développement entièrement dockerisé (`docker compose up` suffit, rechargement à chaud), même image de base que la production
- [ ] Versions stables les plus récentes du framework, du runtime et des dépendances au démarrage (relevé daté dans le README) ; Renovate ou Dependabot configuré

## Notes techniques (à confirmer en tech spec)
- Générateur : Astro (sortie statique), Tailwind v4.
- Image : multi-étapes (build Node, service nginx) ; fichier de configuration nginx versionné pour les en-têtes.
- Hébergement : selon l'ADR (Railway ou Cloudflare Workers), déploiement à partir de la branche principale ; en-têtes de sécurité dans `nginx.conf` ou `_headers`.
- Route : `src/pages/index.astro` ; contenu dans `src/content/`.

## Estimation
- **Story Points** : 5
- **MoSCoW** : Must

## Dépendances

### US prérequises (BLOQUANTES)
| US | Titre | Raison |
|----|-------|--------|
| — | — | Première US du projet |

### US dépendantes (BLOQUÉES)
| US | Titre |
|----|-------|
| US-002 | Design system et layout |
| US-003 | Pipeline CI qualité |

## Sprint assigné
Sprint 1
