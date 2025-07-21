# Dockerfile simplificado para resolver problemas de dependências
FROM node:20-alpine

# Instalar dependências do sistema necessárias
RUN apk add --no-cache python3 make g++ && \
    apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar todos os arquivos (incluindo package-lock.json)
COPY . .

# Configurar npm e instalar todas as dependências
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --no-optional

# Build da aplicação
RUN npm run build

# Remover devDependencies e limpar cache
RUN npm prune --production && \
    npm cache clean --force

# Mudar proprietário dos arquivos
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 8080

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Comando para iniciar a aplicação
CMD ["dumb-init", "node", "dist/server/node-build.mjs"]
