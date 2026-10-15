# Contrôle d'environnement avant un lot (action 4 de la rétro du sprint 2, E25).
# Aucun prune global ici : seul `docker builder prune -f` est permis (contrôle no-global-prune).
.PHONY: preflight

PREFLIGHT_MIN_GB ?= 5

preflight: ## Contrôle disque (>= 5 Go), Docker démarré, branche propre
	@PREFLIGHT_MIN_GB="$(PREFLIGHT_MIN_GB)" sh scripts/preflight.sh
