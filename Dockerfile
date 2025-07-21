# Dockerfile robusto para produção
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    dumb-init

# Definir diretório de trabalho
WORKDIR /app

# Copiar package files primeiro para cache layer
COPY package*.json ./

# Limpar cache npm e instalar dependências com resolução de conflitos
RUN npm cache clean --force && \
    npm install --production=false --no-optional --legacy-peer-deps

# Copiar resto do código
COPY . .

# Build da aplicação
RUN npm run build

# Limpar node_modules e reinstalar apenas produção
RUN rm -rf node_modules && \
    npm install --production --no-optional && \
    npm cache clean --force

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 8080

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Comando para iniciar a aplicação
CMD ["dumb-init", "node", "dist/server/node-build.mjs"]
