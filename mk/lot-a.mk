# Cibles du lot A (blog, redirections, navigation, recherche). Voir docs/guides/worktrees-agents.md.
.PHONY: redirects

redirects: ## Redirections de l'ancien site (reports/redirects/, jamais déployées)
	$(TOOLS) node scripts/build-redirects.ts
