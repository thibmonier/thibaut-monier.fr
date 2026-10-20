# Porte locale avant push (action 1 de la rétro du sprint 3) : rejoue le job `quality` de la CI.
# La cible `test` du Dockerfile ne voit que le contexte Docker : un test ou un script qui lit un fichier
# exclu par .dockerignore (.github/, .bmad/, project-management/...) échoue ici comme en CI.
# Valeurs publiques factices identiques à ci.yml.
.PHONY: prepush

PREPUSH_ARGS := \
	--build-arg PUBLIC_SITE_URL=https://thibaut-monier.fr \
	--build-arg PUBLIC_UMAMI_WEBSITE_ID=00000000-0000-4000-8000-0000000000a1 \
	--build-arg PUBLIC_WEB3FORMS_KEY=00000000-0000-4000-8000-000000000000 \
	--build-arg PUBLIC_CALENDLY_URL=https://calendly.com/exemple/echange-decouverte

prepush: ## Avant chaque push : build Docker complet, lint, types, tests (sans e2e)
	@start=$$(date +%s); \
	docker buildx build --target test --output type=cacheonly $(PREPUSH_ARGS) . \
	&& echo "make prepush : vert en $$(( $$(date +%s) - start )) s"
