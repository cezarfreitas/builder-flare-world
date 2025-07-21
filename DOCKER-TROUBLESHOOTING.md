# Docker Build Troubleshooting

## Problema: npm ci falha no Docker build

### Soluções por ordem de preferência:

## 1. Dockerfile Principal (Recomendado)
Use o `Dockerfile` principal que já está corrigido com:
- Multi-stage build
- Dependências Alpine necessárias
- Usuário não-root para segurança

## 2. Dockerfile Simplificado (Se o principal falhar)
Se o build principal falhar, use:
```bash
# Renomear arquivos
mv Dockerfile Dockerfile.main
mv Dockerfile.simple Dockerfile

# Fazer deploy normalmente
```

## 3. Configurações Alternativas

### Para EasyPanel:
Se ainda houver problemas, configure:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
```
NODE_ENV=production
PORT=8080
```

## 4. Soluções Específicas

### Se erro persiste com canvas-confetti:
```bash
# Remover da imagem Docker se necessário
npm uninstall canvas-confetti
```

### Se erro com mysql2:
Adicionar ao Dockerfile:
```dockerfile
RUN apk add --no-cache mysql-client
```

### Se erro de memória:
No EasyPanel, aumentar:
- Memory Limit: 1GB
- Build Memory: 2GB

## 5. Verificação Local

Testar localmente:
```bash
# Build da imagem
docker build -t test-app .

# Se falhar, usar versão simples
docker build -f Dockerfile.simple -t test-app .

# Executar
docker run -p 8080:8080 test-app
```

## 6. Logs de Debug

Para mais informações:
```bash
# Build com verbose
docker build --progress=plain --no-cache -t test-app .

# Ver logs da aplicação
docker logs <container-id>
```

## 7. Configuração de Fallback

Se nada funcionar, use deploy simples:

1. **EasyPanel > Source > GitHub**
2. **Build Command:** `npm install && npm run build`  
3. **Start Command:** `npm start`
4. **Port:** `8080`

## 8. Dependências Problemáticas

Estas dependências podem causar problemas no Alpine:
- `canvas-confetti` (movido para devDependencies)
- `sharp` (se adicionado)
- `sqlite3` (se usado)

## Status Atual

✅ **Fixado:**
- canvas-confetti movido para devDependencies
- Dockerfile otimizado com multi-stage
- Dependências Alpine adicionadas
- Usuário não-root configurado

🔧 **Em caso de problema:**
1. Use Dockerfile.simple
2. Configure build manual no EasyPanel
3. Verifique logs detalhados
