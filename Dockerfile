# Usar Node.js LTS
FROM node:20-alpine

# Instalar dependências do sistema necessárias para build
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Limpar cache npm e instalar dependências
RUN npm cache clean --force && npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Remover devDependencies para reduzir tamanho da imagem
RUN npm ci --only=production && npm cache clean --force

# Expor porta (EasyPanel detecta automaticamente)
EXPOSE 8080

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
