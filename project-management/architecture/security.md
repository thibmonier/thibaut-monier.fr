# Sécurité du site thibaut-monier.fr

> Statut : proposé (2026-10-14). Référentiels : OWASP Top 10:2025, règle projet `11-security.md`, SLSA 1.2.
> Périmètre : site statique Astro 7.3.8 servi par `nginxinc/nginx-unprivileged:1.30.5-alpine` sur Railway (TLS terminé par Railway), domaine `thibaut-monier.fr`. Aucun code serveur applicatif, aucune base de données, aucun cookie.

## 1. Modèle de menaces (STRIDE léger)

**Actifs** : intégrité du contenu publié ; réputation du PO ; e-mail du PO (cible de spam/phishing) ; données du formulaire (nom, e-mail, message : RGPD) ; secrets CI (`GITHUB_TOKEN`, `RAILWAY_TOKEN`) ; clé Web3Forms (publique par conception, non secrète).

**Acteurs** : bot de spam ; attaquant opportuniste (scan de vulnérabilités) ; attaquant de la chaîne d'approvisionnement (paquet npm, image Docker, action GitHub compromis) ; fournisseur tiers compromis (Umami, Web3Forms) ; usurpateur de domaine (DNS, expiration).

| Surface | Menace (STRIDE) | Mesure principale |
|---|---|---|
| Formulaire | Spam (D), détournement d'envoi (S/T), injection d'en-têtes e-mail (T) | Honeypot, délai, validation, filtrage côté Web3Forms (§4) |
| Scripts tiers (Umami) | Altération du script (T), fuite de données (I) | CSP stricte, un seul tiers, chargement conditionnel DNT/GPC |
| Supply chain npm/Docker/Actions | Code malveillant au build (T/E) | Versions et digests épinglés, SHA d'actions, Trivy, SBOM (§5) |
| CI/CD | Vol de jeton, déploiement non autorisé (E/S) | `permissions:` minimales, protection de `main`, rotation (§6) |
| DNS / domaine | Détournement, expiration (S) | Verrouillage du registrar, 2FA, renouvellement auto, CAA |
| Conteneur nginx | Méthodes inattendues, fuite de fichiers (I) | GET/HEAD seuls, dotfiles bloqués, non-root (§3) |

Hors périmètre : DDoS volumétrique (absorbé par Railway, sans SLA ; accepté).

## 2. Matrice OWASP Top 10:2025

| # | Catégorie | Applicable | Mesure sur ce site |
|---|---|---|---|
| A01 | Broken Access Control (SSRF inclus) | Faible | Contenu 100 % public ; aucune route authentifiée ; pas de proxy ni de fetch côté serveur (SSRF non applicable) ; GET/HEAD seuls ; dotfiles bloqués ; accès Railway/GitHub protégés par 2FA |
| A02 | Security Misconfiguration | **Oui** | `nginx.conf` durci (§3) ; `server_tokens off` ; image non-root ; test d'en-têtes en CI ; pas de page par défaut |
| A03 | Software Supply Chain Failures | **Oui** | Section 5 : épinglage, SBOM, Trivy, Renovate, `npm ci --ignore-scripts`, actions par SHA |
| A04 | Cryptographic Failures | Faible | TLS 1.2+ géré par Railway (viser TLS 1.3 : à vérifier) ; HSTS preload ; aucune donnée stockée ; aucun secret dans le dépôt |
| A05 | Injection | Faible | Pas de SQL ni de templating serveur ; XSS limité par CSP sans `unsafe-inline` ; contenu Markdown/MDX maîtrisé par le PO ; pas de `set:html` sur du contenu non fiable ; injection d'en-têtes e-mail traitée par Web3Forms (§4) |
| A06 | Insecure Design | Oui | Modèle de menaces ci-dessus ; minimisation des données ; pas de widget tiers embarqué (Calendly en lien sortant) |
| A07 | Authentication Failures | Non (site) / Oui (comptes) | Aucune authentification sur le site ; 2FA obligatoire sur GitHub, Railway, Web3Forms, Umami, registrar |
| A08 | Software or Data Integrity Failures | **Oui** | Dépôt protégé (PR + CI vertes), JSON `oss-metrics.json` validé par schéma Zod au build, SRI non applicable au script Umami (mutable ; voir §3.2) |
| A09 | Logging and Alerting Failures | Partiel | Logs nginx sur stdout (Railway) ; alerte e-mail Railway sur échec de déploiement ; pas de détection d'intrusion (proportionné) ; test de santé quotidien via le cron de redéploiement |
| A10 | Mishandling of Exceptional Conditions | Oui | Page 404 statique personnalisée ; pages 4xx/5xx sans trace ; message d'erreur du formulaire avec repli e-mail (ADR-0004) ; build en échec sur schéma invalide |

## 3. Configuration nginx de sécurité

### 3.1 Choix des en-têtes

- **CSP Level 3** : `default-src 'none'` puis liste blanche explicite. Pas de `unsafe-inline` ni de `unsafe-eval`.
- **Scripts inline Astro** : privilégier **aucun script inline**. Réglages Astro : `build.inlineStylesheets: 'never'` et `vite.build.assetsInlineLimit: 0` pour que scripts et styles soient des fichiers `/_astro/*.js|css` (couverts par `'self'`). Les scripts de page (`<script>` Astro) sont déjà émis en modules externes ; proscrire `is:inline` et `define:vars` (qui génèrent de l'inline). Si un inline reste indispensable (JSON-LD `application/ld+json` n'est pas exécuté : non concerné par `script-src`), utiliser un **hash SHA-256** calculé au build (`security.csp` d'Astro, ou script de post-build qui injecte les hash dans `csp.conf`). Un nonce est exclu : le site est statique, il serait figé.
- **Pagefind** : le moteur est en WebAssembly → `'wasm-unsafe-eval'` dans `script-src` (moins large que `unsafe-eval`). L'interface `pagefind-ui` pose des attributs `style` : si la recherche est utilisée avec son UI par défaut, ajouter `style-src-attr 'unsafe-inline'` (compromis limité aux attributs, pas aux balises) ; sinon, écrire une UI maison et ne rien ajouter. **À vérifier à l'intégration.**
- **Umami Cloud** : script `https://cloud.umami.is/script.js` et envoi vers `https://api-gateway.umami.dev` (ou `cloud.umami.is/api/send` selon la version). **À vérifier** dans le tableau de bord Umami et dans l'onglet réseau avant de figer la CSP ; les deux origines sont listées par prudence.
- **Web3Forms** : envoi par `fetch` (JavaScript) vers `https://api.web3forms.com/submit` → origine en **`connect-src`**. `form-action` n'encadre que la soumission HTML native : si le formulaire est aussi fonctionnel sans JS (amélioration progressive), ajouter l'origine à `form-action` ; sinon `form-action 'self'`. Décision recommandée : `fetch` seul, `form-action 'self'`.
- **COEP** : `require-corp` exige que chaque ressource cross-origin (script Umami) envoie `Cross-Origin-Resource-Policy` ou CORS ; Umami et Web3Forms n'y sont pas tenus, donc risque de blocage. `credentialless` n'est pas pris en charge par Safari (à vérifier) et n'apporte rien sans besoin de `SharedArrayBuffer`. **Décision : COEP non activé** (justifié : aucune ressource n'exige l'isolation cross-origin ; le gain de sécurité est nul pour un site sans données sensibles). COOP `same-origin` et CORP `same-origin` sont activés. Écart assumé vs règle 11, à consigner dans l'ADR sécurité.
- **HSTS preload** : `max-age=63072000; includeSubDomains; preload`. Prérequis : tous les sous-domaines en HTTPS, y compris `www` et l'éventuel `.com` redirigé. Inscription à hstspreload.org seulement après validation (irréversible en pratique). Railway termine TLS : nginx voit du HTTP, donc l'en-tête est émis sans condition (`always`).
- **Piège nginx** : un `add_header` dans un bloc `location` annule ceux hérités du `server`. Solution : tous les en-têtes dans `snippets/security-headers.conf`, inclus dans chaque `location` qui ajoute un en-tête.

### 3.2 `snippets/security-headers.conf`

```nginx
add_header Content-Security-Policy "default-src 'none'; script-src 'self' 'wasm-unsafe-eval' https://cloud.umami.is; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev https://api.web3forms.com; manifest-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Cross-Origin-Resource-Policy "same-origin" always;
# COEP volontairement absent (voir 3.1)
```

`X-Frame-Options` est redondant avec `frame-ancestors` mais gardé pour les anciens navigateurs. L'absence de SRI sur `script.js` est assumée : le script est modifié par l'éditeur sans préavis ; le risque est borné par la CSP (origine unique) et par le chargement conditionnel.

### 3.3 `nginx.conf`

```nginx
worker_processes auto;
pid /tmp/nginx.pid;
events { worker_connections 1024; }

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    client_body_temp_path /tmp/client_temp;
    proxy_temp_path /tmp/proxy_temp;
    fastcgi_temp_path /tmp/fastcgi_temp;
    uwsgi_temp_path /tmp/uwsgi_temp;
    scgi_temp_path /tmp/scgi_temp;

    sendfile on;
    tcp_nopush on;
    server_tokens off;
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;   # fichiers précompressés si besoin
    client_max_body_size 1k;           # aucun corps attendu
    client_header_timeout 10s;
    client_body_timeout 10s;
    keepalive_timeout 15s;
    limit_conn_zone $binary_remote_addr zone=perip:1m;

    # Journaux sur stdout/stderr (Railway) sans IP (voir §7)
    log_format minimal '$time_iso8601 "$request_method $uri" $status $body_bytes_sent';
    access_log /dev/stdout minimal;
    error_log /dev/stderr warn;

    server {
        listen 8080;
        server_name thibaut-monier.fr _;
        root /usr/share/nginx/html;
        index index.html;
        absolute_redirect off;
        port_in_redirect off;
        limit_conn perip 30;

        # Seulement GET/HEAD (OPTIONS inutile : pas de CORS servi)
        if ($request_method !~ ^(GET|HEAD)$) { return 405; }

        include /etc/nginx/snippets/security-headers.conf;

        # Dotfiles interdits (.git, .env…), sauf /.well-known/
        location ~ /\.(?!well-known/) { return 404; }
        # Fichiers de source ou de sauvegarde
        location ~* \.(map|bak|old|orig|swp|ts|md|env|yml|yaml|lock)$ { return 404; }

        # Redirections 301 (anciens slugs) : reprendre celles de ../blog/nginx.conf ici

        location / {
            try_files $uri $uri/index.html $uri.html =404;
            add_header Cache-Control "no-cache" always;          # HTML : revalidation
            include /etc/nginx/snippets/security-headers.conf;
        }

        # Assets hachés par Astro/Vite
        location /_astro/ {
            expires 1y;
            add_header Cache-Control "public, max-age=31536000, immutable" always;
            include /etc/nginx/snippets/security-headers.conf;
        }
        # Index Pagefind : non haché → revalidation
        location /pagefind/ {
            add_header Cache-Control "no-cache" always;
            include /etc/nginx/snippets/security-headers.conf;
        }
        # Images/polices/CV non hachés
        location ~* \.(png|jpe?g|webp|avif|svg|ico|woff2?|pdf)$ {
            expires 30d;
            add_header Cache-Control "public, max-age=2592000" always;
            include /etc/nginx/snippets/security-headers.conf;
        }

        error_page 404 /404.html;
        location = /404.html { internal; include /etc/nginx/snippets/security-headers.conf; }
        error_page 405 500 502 503 504 /50x.html;               # page statique générique, sans trace
        location = /50x.html { internal; include /etc/nginx/snippets/security-headers.conf; }
    }
}
```

Écarts avec `../blog/nginx.conf` : CSP sans `unsafe-inline` ni domaines Vercel ; ajout HSTS, COOP, CORP ; `default-src 'none'` ; `img-src https:` supprimé (images locales seulement) ; en-têtes non perdus dans les `location` ; filtrage de méthodes et de dotfiles ; cache différencié ; journal sans IP. Reprendre les 301 de slugs si les anciens articles sont migrés.

`$request_method` dans un `if` au niveau `server` est un usage sûr (`return` seulement). Le `.com`, s'il existe, redirige en 301 vers le `.fr` via un second `server` (ADR-0002).

## 4. Formulaire de contact

- **Pas de secret côté client** : l'`access_key` Web3Forms est publique par conception. Elle est exposée dans le HTML et ne permet que d'envoyer un e-mail **au PO**. Risque résiduel : un tiers réutilise la clé pour inonder la boîte du PO. Mesures : restriction par domaine (**fonction du plan Pro de Web3Forms d'après leur documentation, « Restrict to Domain » ; à vérifier si disponible en gratuit**) ; sinon filtre Gmail dédié et rotation de la clé si abus.
- **Anti-spam** (ADR-0004) : champ piège `botcheck` (case à cocher masquée par CSS, `tabindex="-1"`, `aria-hidden`, `autocomplete="off"`) ; rejet côté client si coché ; délai minimal de 3 s entre le chargement et l'envoi ; validation HTML5 + validation JS (longueurs : nom ≤ 100, e-mail ≤ 254, message 10 à 5000). Le filtre anti-spam serveur de Web3Forms s'ajoute. Pas de captcha (cookies tiers, accessibilité).
- **Validation** : côté client pour l'ergonomie, mais la seule validation faisant autorité est celle de Web3Forms ; aucun contenu du formulaire n'est réaffiché dans le DOM via `innerHTML` (utiliser `textContent`).
- **Injection d'en-têtes e-mail (CRLF)** : l'e-mail est construit par Web3Forms, pas par le site. Le site ne compose aucun en-tête, n'utilise pas `_replyto` dynamique sans nettoyage ; rejeter côté client toute valeur contenant `\r` ou `\n` dans nom et e-mail. L'étanchéité côté service **reste à vérifier** (test manuel avec `Nom\r\nBcc: x@y.z`).
- **Erreurs** : message générique ; adresse e-mail affichée en repli. Pas de journalisation du contenu.
- **Test E2E** : envoi simulé (`page.route` vers `api.web3forms.com`) ; vérifier honeypot, délai, échec réseau, absence de requête vers un autre domaine.

## 5. Supply chain

Cible **SLSA 1.2 Build niveau 2** : build sur plateforme hébergée (GitHub Actions), provenance générée par la plateforme. Niveau 3 hors de proportion pour ce site.

- **Dépendances npm** : `package-lock.json` commité ; versions exactes (`save-exact=true` dans `.npmrc`) ; installation par `npm ci --ignore-scripts` (puis `npm rebuild` ciblé pour les rares paquets qui l'exigent, ex. binaires `sharp` ou `esbuild` : lister explicitement) ; `npm audit --omit=dev --audit-level=moderate` bloquant en CI ; `npm audit signatures` (provenance) en information.
- **Docker** : images de base épinglées par **tag + digest** (`node:26-alpine@sha256:…`, `nginxinc/nginx-unprivileged:1.30.5-alpine@sha256:…`, typst, Playwright) ; hadolint en CI ; `USER` non root ; image `runtime` sans outils de build.
- **Trivy** : `trivy image --severity HIGH,CRITICAL --exit-code 1 --ignore-unfixed` sur l'image `runtime` ; `trivy fs` sur le dépôt (lockfile, secrets, Dockerfile) ; base de vulnérabilités mise en cache.
- **SBOM** : CycloneDX 1.7 par `syft` ou `trivy image --format cyclonedx`, publié comme artefact de workflow (rétention 90 jours) et joint aux releases.
- **GitHub Actions** : toutes les actions tierces épinglées par **SHA complet** (commentaire de version à côté) ; `permissions:` explicites par workflow (`contents: read` par défaut ; `id-token: write` / `attestations: write` seulement pour le job d'attestation) ; `persist-credentials: false` sur `checkout` ; pas de `pull_request_target` ; secrets non exposés aux PR de forks.
- **Renovate** : regroupement hebdomadaire ; `pinDigests: true` pour Docker et actions ; PR validées par `ci.yml` ; délai de maturité de 3 jours (`minimumReleaseAge`) contre les paquets fraîchement publiés malveillants ; alertes de sécurité activées.
- **Protection de `main`** : PR obligatoire, statuts requis, 2FA, pas de force-push.
- **Provenance** : `actions/attest-build-provenance` sur l'artefact `dist/` (niveau SLSA 2 crédible).
- **Cosign** : **optionnel, non retenu en V1**. Railway reconstruit l'image depuis le Dockerfile : l'image déployée n'est pas celle signée en CI, donc la signature ne serait jamais vérifiée au déploiement. Alternative réaliste : signer et publier l'image sur GHCR depuis la CI, puis faire déployer à Railway cette image par digest (réévaluer si le contrôle supplémentaire le justifie).

## 6. Secrets

| Secret | Emplacement | Portée / privilèges | Rotation |
|---|---|---|---|
| `GITHUB_TOKEN` | Automatique (Actions) | Éphémère, `permissions:` minimales | Automatique |
| `RAILWAY_TOKEN` | GitHub Secrets (environnement `production`) | Jeton de projet limité au service du site | Tous les 6 mois ou en cas de fuite |
| PAT lecture seule (métriques, optionnel) | Variable de build Railway ou GitHub Secrets | Dépôts publics, lecture | Tous les 6 mois ; non requis si JSON commité (ADR-0006) |
| `access_key` Web3Forms | Variable publique de build (`PUBLIC_…`) | Publique par conception, envoi seulement | Sur abus |
| Identifiant de site Umami | Variable publique | Publique (`data-website-id`) | Non |
| Comptes (GitHub, Railway, Umami, Web3Forms, registrar) | Gestionnaire de mots de passe | 2FA (clé FIDO2 si possible) | Revue annuelle |

Règles : aucun secret dans le dépôt (gitleaks en pre-commit et CI, `trivy fs --scanners secret`) ; environnement GitHub `production` avec approbateur ; jeton Railway masqué dans les logs ; en cas de fuite : révoquer, redéployer, auditer les logs d'accès Railway.

## 7. Confidentialité

- **Liste blanche de données publiées** (contrôle de build, ADR-0007) : nom, métier, e-mail professionnel, liens publics (GitHub, LinkedIn, Packagist), expériences et compétences. **Interdits** : téléphone, âge ou date de naissance, adresse postale, situation familiale, photo d'identité du CV non souhaitée ; le test de build échoue si le PDF ou les pages contiennent des motifs (numéro de téléphone, date de naissance, adresse) ; métadonnées PDF nettoyées (auteur, chemins).
- **DNT / GPC** : script Umami non chargé si `navigator.doNotTrack === "1"` ou `navigator.globalPrivacyControl === true` (ADR-0004) ; le script est injecté dynamiquement depuis un fichier externe (pas d'inline). Option `data-do-not-track="true"` d'Umami en défense en profondeur.
- **Sans cookie** : aucun bandeau ; vérifié par un test E2E (`context.cookies()` vide).
- **Journaux nginx** : format minimal sans IP ni User-Agent ni Referer (ci-dessus). Limite : Railway journalise en amont (proxy) et conserve les logs selon son plan ; l'IP côté Railway n'est pas contrôlable. À mentionner dans `/vie-privee/` avec les transferts vers les États-Unis (Web3Forms, Umami si région US).
- **Mentions légales** : éditeur, hébergeur (Railway, région UE), contact RGPD, finalité et durée de conservation du formulaire (les envois ne sont pas stockés par Web3Forms ; l'e-mail est conservé dans la boîte du PO), droits d'accès/suppression.
- **Referrer-Policy** `strict-origin-when-cross-origin` ; liens sortants avec `rel="noopener noreferrer"`.

## 8. Checklist par sprint et tests associés

**Sprint 1 (Walking Skeleton)**
- [ ] `nginx.conf` + `security-headers.conf` en place, image non root, port 8080
- [ ] HTTPS forcé (redirection HTTP→HTTPS gérée par Railway : à vérifier), HSTS actif ; domaine `www` couvert
- [ ] CSP sans `unsafe-inline` ; aucun script inline dans `dist/`
- [ ] Formulaire : honeypot, délai, validation, repli e-mail
- [ ] Mentions légales et `/vie-privee/` publiées
- [ ] 2FA sur tous les comptes ; protection de `main` ; permissions `contents: read`
- Tests : E2E Playwright sur `preview` qui vérifie les en-têtes de réponse (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP, absence de `Server` version et de COEP) ; test de build « aucun `<script>` sans `src`, aucun attribut `on*=` dans `dist/` » ; test `405` sur `POST` ; test `404` sur `/.git/config` et `/.env` ; test cookies vides

**Sprint 2** (recherche, analytics, métriques)
- [ ] Pagefind : `'wasm-unsafe-eval'` validé sans violation CSP (console propre en E2E : événement `securitypolicyviolation` = 0)
- [ ] Umami : domaines réels confirmés ; chargement conditionnel DNT/GPC testé
- [ ] Trivy image + fs, `npm audit`, gitleaks bloquants en CI ; SBOM publié
- [ ] Actions épinglées par SHA ; Renovate actif
- Tests : E2E avec DNT activé (aucune requête vers Umami) ; contrat d'événements (US-026)

**Sprint 3 et suivants**
- [ ] Attestation de provenance ; revue des permissions de jetons ; rotation `RAILWAY_TOKEN`
- [ ] Inscription HSTS preload (après 1 mois sans incident) ; CAA DNS ; verrou du registrar
- [ ] Contrôle PDF CV : aucune donnée interdite
- Tests manuels avant mise en production et après tout changement de CSP : securityheaders.com (cible A+), Mozilla Observatory (cible ≥ A+), SSL Labs, hstspreload.org (vérification), `curl -sI https://thibaut-monier.fr`

**Revue trimestrielle** : mise à jour des digests, relecture de la CSP, vérification des domaines tiers, audit des accès (GitHub, Railway), test du formulaire de bout en bout.

## Points à vérifier

1. Domaines exacts d'Umami Cloud (`cloud.umami.is/script.js` ; collecte `api-gateway.umami.dev` ou `cloud.umami.is/api/send`) : non confirmés par la documentation consultée.
2. Restriction de l'`access_key` Web3Forms par domaine : annoncée comme fonction Pro ; endpoint `https://api.web3forms.com/submit` et nom du champ `botcheck` à confirmer dans leur documentation.
3. Version de TLS minimale et redirection HTTP→HTTPS offertes par Railway ; certificat du `.com` éventuel.
4. Besoin de `style-src-attr 'unsafe-inline'` selon l'UI Pagefind retenue.
5. Sûreté CRLF côté Web3Forms (test manuel).
