# Deploy no EasyPanel

Este guia explica como fazer deploy da aplicação "Encontros Doces" no EasyPanel.

## 🚀 Configuração Rápida

### 1. Criar Aplicação no EasyPanel

1. Acesse seu painel do EasyPanel
2. Clique em "Create App"
3. Escolha "Docker"
4. Configure:
   - **Nome**: `encontros-doces`
   - **Fonte**: GitHub Repository ou Docker Image

### 2. Configuração do Dockerfile

O projeto já inclui um `Dockerfile` otimizado:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm ci --only=production && npm cache clean --force
EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080
CMD ["npm", "start"]
```

### 3. Variáveis de Ambiente

Configure as seguintes variáveis no EasyPanel:

#### Obrigatórias:

```env
NODE_ENV=production
PORT=8080
```

#### Banco de Dados (se usar MySQL externo):

```env
DB_HOST=seu_host_mysql
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=convite
```

### 4. Configuração de Banco de Dados

#### Opção A: MySQL Interno (Recomendado)

1. No EasyPanel, adicione um serviço MySQL
2. Configure as variáveis de ambiente apontando para o MySQL interno

#### Opção B: Banco Existente

- Use as configurações atuais (já funcionando)
- Não precisa configurar variáveis DB\_\*

### 5. Configuração de Rede

- **Porta**: 8080 (já configurada no Dockerfile)
- **Protocolo**: HTTP
- **Health Check**: `/api/ping`

## 🔧 Configurações Avançadas

### Health Check

URL: `/api/ping`
Resposta esperada: `{"message": "Hello from Express server v2!"}`

### Volumes (Opcional)

Não são necessários volumes persistentes, a aplicação é stateless.

### Domínio Personalizado

Configure seu domínio personalizado nas configurações do EasyPanel.

## 📱 Funcionalidades da Aplicação

### URLs Principais:

- `/` - Página principal (criar momentos)
- `/convite/{codigo}` - Página de confirmação de presença
- `/admin/{codigo}` - Administração do evento
- `/master-admin` - Painel master (senha: `morango2024`)

### API Endpoints:

- `GET /api/ping` - Health check
- `POST /api/events` - Criar evento
- `GET /api/events/{codigo}` - Detalhes do evento
- `POST /api/events/{codigo}/confirm` - Confirmar presença

## 🛠️ Troubleshooting

### Problema: Aplicação não inicia

- Verifique se a porta 8080 está configurada
- Confirme as variáveis de ambiente
- Verifique os logs do container

### Problema: Erro de banco de dados

- Verifique as credenciais MySQL
- Confirme se o banco está acessível
- Verifique a conectividade de rede

### Problema: Build falha

- Verifique se tem memória suficiente para o build
- Confirme se o Node.js 20 está disponível

## 📝 Notas Importantes

- A aplicação cria as tabelas automaticamente na primeira execução
- O fuso horário está configurado para São Paulo (-03:00)
- A senha do master admin é hardcoded: `morango2024`
- Todos os arquivos estáticos são servidos pelo Express em produção

## 🚀 Deploy Automático

Para deploy automático, configure webhook no GitHub conectado ao EasyPanel.

1. No GitHub: Settings > Webhooks > Add webhook
2. URL: `https://api.easypanel.io/webhooks/github/{seu_app_id}`
3. Content type: `application/json`
4. Events: `push` (branch main)
