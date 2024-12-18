# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
FROM base AS deps-base

WORKDIR /app
COPY ./package.json ./package-lock.json ./

RUN apk add --no-cache --virtual \
  build-deps \
  python3 \
  alpine-sdk \
  autoconf \
  libtool \
  automake

# ---
FROM deps-base AS deps-dev
RUN npm i -g npm
RUN npm ci

# ---
FROM deps-base AS deps-prod
RUN npm i -g npm
RUN npm ci --omit=dev

# ---
FROM base AS builder
WORKDIR /app

COPY . .
COPY --from=deps-dev /app/node_modules ./node_modules
RUN npm run build

# ---
FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache tini

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

ARG GIT_VERSION
ARG GIT_REPO

ENV GIT_VERSION=${GIT_VERSION}
LABEL org.opencontainers.image.source=${GIT_REPO}

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "."]
