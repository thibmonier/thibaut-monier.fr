# Docker uniquement : aucun Node requis sur le poste (ADR-0003).
.DEFAULT_GOAL := help
COMPOSE ?= docker compose
TOOLS   := $(COMPOSE) run --rm tools
E2E     := $(COMPOSE) --profile e2e run --rm e2e

.PHONY: help dev preview build shell down clean install lint format check test checks e2e lighthouse smoke ci

help: ## Affiche les cibles
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-12s %s\n", $$1, $$2}'

dev: ## Serveur de développement : http://localhost:4321
	$(COMPOSE) up --build dev

preview: ## Image de production (nginx) : http://localhost:8080
	$(COMPOSE) up --build -d --wait preview

build: ## Build statique + contrôles (dans un conteneur jetable)
	$(TOOLS) npm run build

shell: ## Shell dans le conteneur d'outils
	$(TOOLS) sh

install: ## Réinstalle les dépendances dans le volume node_modules
	$(TOOLS) npm ci --ignore-scripts

down: ## Arrête tous les conteneurs
	$(COMPOSE) --profile tools --profile e2e down

clean: ## Arrête tout et supprime volumes et sorties de build
	$(COMPOSE) --profile tools --profile e2e down -v --remove-orphans
	rm -rf dist .astro coverage reports test-results playwright-report

lint: ## ESLint + Prettier (vérification)
	$(TOOLS) npm run lint
	$(TOOLS) npm run format:check

format: ## Applique Prettier
	$(TOOLS) npm run format

check: ## Vérification de types (astro check)
	$(TOOLS) npm run check

test: ## Vitest avec couverture (seuils bloquants)
	$(TOOLS) npm test

checks: ## Contrôles de contenu puis de dist/ (liens, ancres...)
	$(TOOLS) npm run build

e2e: preview ## Playwright + axe contre preview
	$(E2E)

lighthouse: preview ## Lighthouse (3 exécutions, médiane, seuil 0,95)
	$(E2E) node scripts/checks/lighthouse.ts

smoke: ## Contrôle de fumée post-déploiement : make smoke URL=https://thibaut-monier.fr
	@test -n "$(URL)" || { echo 'Usage : make smoke URL=<url>'; exit 2; }
	$(COMPOSE) run --rm --no-deps -e SMOKE_URL="$(URL)" tools node scripts/checks/smoke.ts

ci: ## Enchaîne exactement les étapes de la CI
	$(MAKE) lint
	$(MAKE) check
	$(MAKE) test
	$(MAKE) checks
	$(MAKE) e2e
	$(MAKE) lighthouse
	$(MAKE) down
