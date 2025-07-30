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

# Solo copiar los archivos necesarios del build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Usar node directamente en lugar de pnpm
CMD ["node", "server.js"]