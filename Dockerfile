# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar dependências do sistema necessárias para build
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Configurar npm para usar registry seguro e instalar dependências
RUN npm config set registry https://registry.npmjs.org/ && \
    npm ci --no-optional

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Instalar apenas dependências mínimas de runtime
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production --no-optional && \
    npm cache clean --force

# Copiar arquivos built do stage anterior
COPY --from=builder /app/dist ./dist

# Mudar proprietário dos arquivos
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 8080

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Comando para iniciar a aplicação com dumb-init
CMD ["dumb-init", "node", "dist/server/node-build.mjs"]
