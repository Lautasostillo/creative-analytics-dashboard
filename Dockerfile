# Usar la imagen oficial de Node.js
FROM node:20-alpine

WORKDIR /app

# Instalar Python y pip
RUN apk update && apk add --no-cache python3 py3-pip

# Instalar pnpm
RUN corepack enable

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./
COPY api/requirements.txt ./api/

# Instalar dependencias de Node.js y Python
RUN pnpm install --frozen-lockfile
RUN pip install -r ./api/requirements.txt

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN pnpm run build

# Puerto
EXPOSE 3000

# Comando de inicio - usar pnpm start para que sea consistente
CMD ["pnpm", "start"]