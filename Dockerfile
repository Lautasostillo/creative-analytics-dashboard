# -- build stage -------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Force cache invalidation
ARG CACHEBUST=1

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build         # genera .next/

# -- run stage ---------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Archivos necesarios para el server
COPY --from=builder /app/.next/standalone ./

# ⬇️  Copia estáticos y public
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public

ENV NODE_ENV=production
CMD ["node", "server.js"]