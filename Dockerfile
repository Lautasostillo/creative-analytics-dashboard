# Usar la imagen "slim" de Node.js que está basada en Debian
FROM node:20-slim

WORKDIR /app

# Instalar Python y pip usando apt-get
RUN apt-get update && apt-get install -y python3 python3-pip --no-install-recommends && rm -rf /var/lib/apt/lists/*

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

# Comando de inicio
CMD ["pnpm", "start"]