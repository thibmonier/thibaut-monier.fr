# syntax=docker/dockerfile:1
# Dockerfile multi-étapes unique (ADR-0003) : développement, tests et production.
# IMPORTANT : `runtime` doit rester la DERNIÈRE étape (Railway construit l'étape finale).

# ---- base : Node + utilisateur non root --------------------------------------
FROM node:26-alpine@sha256:143494b1da2945f061539253adc65e4f1569ddf07da2d384c022c791a9d90a4a AS base
WORKDIR /app
ENV NODE_ENV=development \
    ASTRO_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false
RUN chown node:node /app
USER 1000

# ---- deps : dépendances (lockfile strict, sans scripts d'installation) -------
FROM base AS deps
COPY --chown=node:node package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 \
    npm ci --ignore-scripts

# ---- dev : serveur de développement avec rechargement à chaud ----------------
FROM deps AS dev
EXPOSE 4321
CMD ["npx", "astro", "dev", "--host", "0.0.0.0", "--port", "4321"]

# ---- typst : binaire seul pour le CV (gabarit ajouté par US-007) -------------
FROM ghcr.io/typst/typst:0.15.1@sha256:032e292249bcd378480cc7c142cfa324b63ef8aadeb88d7e7230320c4c9c422f AS typst

# ---- build : site statique ---------------------------------------------------
FROM deps AS build
# Variables publiques injectées au build (Astro inline les PUBLIC_*). Aucune valeur secrète par défaut.
ARG PUBLIC_SITE_URL=""
ARG PUBLIC_UMAMI_WEBSITE_ID=""
ARG PUBLIC_WEB3FORMS_KEY=""
ARG PUBLIC_CALENDLY_URL=""
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_UMAMI_WEBSITE_ID=$PUBLIC_UMAMI_WEBSITE_ID \
    PUBLIC_WEB3FORMS_KEY=$PUBLIC_WEB3FORMS_KEY \
    PUBLIC_CALENDLY_URL=$PUBLIC_CALENDLY_URL \
    NODE_ENV=production
COPY --chown=node:node . .
RUN npm run build

# ---- test : lint, types, tests unitaires avec couverture ---------------------
FROM build AS test
ENV NODE_ENV=development
RUN npm run lint \
    && npm run format:check \
    && npm run check \
    && npm test

# ---- dist : export du site statique seul (CI : artefact consommé par Lighthouse) ----
FROM scratch AS dist
COPY --from=build /app/dist /

# ---- e2e : Playwright, axe et Lighthouse (jamais dans l'image de production) -
FROM mcr.microsoft.com/playwright:v1.64.1-noble@sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf AS e2e
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    CI=true
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# ---- runtime : nginx non root servant dist/ ----------------------------------
FROM nginxinc/nginx-unprivileged:1.30.5-alpine@sha256:56b8272e43a0525f67aed68d1e0794a712d10e3e45a563e118e9a77c817e6f86 AS runtime
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx/snippets/ /etc/nginx/snippets/
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
