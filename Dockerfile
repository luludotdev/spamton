# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
FROM base AS pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack && corepack enable && corepack prepare pnpm@latest-10 --activate

FROM pnpm AS deps-base

WORKDIR /app
COPY ./pnpm-lock.yaml ./
RUN pnpm fetch
COPY ./package.json ./

# ---
FROM deps-base AS deps-dev
RUN pnpm install --offline --frozen-lockfile

# ---
FROM deps-base AS deps-prod
RUN pnpm install --offline --frozen-lockfile --prod

# ---
FROM pnpm AS builder
WORKDIR /app

COPY . .
COPY --from=deps-dev /app/node_modules ./node_modules
RUN pnpm run build

# ---
FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

RUN mkdir /app/logs && \
  addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  chown -R nodejs:nodejs /app/dist && \
  chown -R nodejs:nodejs /app/logs

USER nodejs
VOLUME ["/app/logs"]

ARG GIT_SHA
ARG GITHUB_REPO

ENV GIT_SHA=${GIT_SHA}
ENV GITHUB_REPO=${GITHUB_REPO}

CMD ["node", "--enable-source-maps", "."]
