# Usar la imagen oficial de Node.js
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN corepack enable

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN pnpm run build

# Puerto
EXPOSE 3000

# Comando de inicio - usar pnpm start para que sea consistente
CMD ["pnpm", "start"]