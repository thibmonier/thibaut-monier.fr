# Contrôle d'environnement avant un lot (action 4 des rétros des sprints 2 et 3, E25).
# Aucun prune global ici : seul `docker builder prune -f` est permis (contrôle no-global-prune).
.PHONY: preflight

PREFLIGHT_MIN_GB ?= 8

preflight: ## Contrôle disque (>= 8 Go), Docker démarré, branche propre
	@PREFLIGHT_MIN_GB="$(PREFLIGHT_MIN_GB)" sh scripts/preflight.sh
