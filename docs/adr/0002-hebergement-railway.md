# ADR-0002 : Hébergement sur Railway (conteneur nginx)

## Statut
Accepté (2026-10-14, validé par le PO)

## Contexte
- Contrainte CB-3 : le coût d'hébergement doit être le plus bas possible.
- Contrainte CT-1 : tout est dockerisé.
- Le PO a un abonnement Railway Hobby (5 $/mois, 5 $ d'usage inclus) avec du **crédit disponible**. Plusieurs de ses projets y tournent déjà, dont Agentic Agency.
- Usage estimé d'un nginx statique (environ 20 Mo de RAM, CPU quasi nul) : de 0,2 à 0,5 $/mois (RAM à 10 $/Go/mois, egress à 0,05 $/Go), couvert par le crédit inclus.

## Décision
Héberger le site sur **Railway**, sous la forme d'un **conteneur `nginxinc/nginx-unprivileged:1.30.5-alpine`** (non root, port 8080) qui sert le contenu de `dist/`. L'image est construite à partir du même `Dockerfile` multi-étapes que l'environnement de développement (ADR-0003).

- **Domaine** : `thibaut-monier.fr` est le domaine principal. Si `thibaut-monier.com` est acheté, il redirige en 301 vers le `.fr` (au niveau du DNS ou d'un bloc `server` nginx).
- **TLS** : certificat géré par Railway sur le domaine personnalisé, avec HSTS servi par nginx.
- **Région** : UE (Amsterdam), au plus près de l'audience française.
- **Mise en veille désactivée** : elle provoque des démarrages à froid et des 502 à la première requête, et le gain serait nul puisque le crédit couvre l'usage.
- **Déploiement** : automatique à chaque push sur `main`, avec l'option Railway « attendre la CI » (*Wait for CI*) activée pour que seul un commit vert soit déployé (comportement à vérifier à l'implémentation d'US-001).
- **Publication programmée** : un cron GitHub Actions quotidien (06:00 UTC) déclenche un redéploiement, comme sur Agentic Agency, pour publier les contenus datés et rafraîchir les métriques.
- **En-têtes de sécurité et redirections** : dans `nginx.conf` (voir `architecture/security.md`).

## Alternatives considérées
| Option | Coût pour le PO | Raison du rejet ou du repli |
|--------|-----------------|-----------------------------|
| **Cloudflare Workers Static Assets** | 0 € | **Repli documenté.** Gratuit, sur CDN, avec prise en charge de `_headers` et `_redirects`. Écarté, car la production ne serait pas un conteneur (on perd la parité stricte entre développement et production) et cela ajoute un fournisseur au parc du PO. À reconsidérer si le crédit Railway venait à manquer ou si le trafic international devenait significatif |
| Cloudflare Pages | 0 € | Déconseillé par Cloudflare pour les nouveaux projets (« Start new projects with Workers ») |
| VPS | 4 à 6 €/mois | Maintenance d'un système à assurer, sans apport |

## Conséquences
- ✅ Coût marginal **nul**, dans le crédit Hobby existant.
- ✅ **Même image** du développement (`docker compose`) à la production : ce qui est validé en développement est ce qui part en production (exigence du PO).
- ✅ Configuration identique à celle des autres projets du PO (même console, mêmes habitudes).
- ⚠️ Une seule région, sans CDN : LCP à surveiller pour les visiteurs hors d'Europe (l'audience visée est surtout française ; Lighthouse est mesuré en CI). On pourra ajouter le proxy Cloudflare (gratuit) devant Railway si besoin, sans changer d'hébergeur.
- ⚠️ Le coût dépend de la persistance du crédit Hobby : à revoir si le parc Railway du PO grossit.
- Procédure de migration vers Cloudflare : `dist/` est portable, et il suffirait de traduire `nginx.conf` en `_headers` et `_redirects`.
