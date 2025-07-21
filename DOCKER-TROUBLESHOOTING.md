# Docker Build Troubleshooting - ATUALIZADO

## Problemas: npm ci/install falha no Docker build

### ⚡ SOLUÇÕES RÁPIDAS (por ordem de preferência):

## 1. 🎯 Dockerfile Principal (ATUALIZADO - Recomendado)
O `Dockerfile` foi simplificado para resolver problemas de dependências:
- ✅ Single-stage build mais robusto  
- ✅ Reinstalação limpa de node_modules
- ✅ Package-lock.json regenerado
- ✅ Usuário não-root para segurança

## 2. 🚀 Dockerfile Ultra-Simples (Para casos extremos)
Se ainda falhar, use a versão mais compatível:
```bash
# No EasyPanel, ou localmente:
mv Dockerfile Dockerfile.main
mv Dockerfile.ultra-simple Dockerfile
# Deploy novamente
```

**Características do ultra-simples:**
- Usa `node:20-slim` (Debian ao invés de Alpine)
- Build em uma única camada
- Máxima compatibilidade

## 3. 🔧 Dockerfile.simple (Backup)
Versão intermediária para testes.

---

## 🔍 PROBLEMAS ESPECÍFICOS E SOLUÇÕES:

### Erro: "eresolve" ou conflitos de dependências
**Solução:** Package-lock.json foi regenerado
```bash
# Se necessário fazer localmente:
rm package-lock.json
npm install
```

### Erro: "canvas-confetti" ou dependências nativas
**Status:** ✅ Já corrigido
- canvas-confetti movido para devDependencies
- Dependências Alpine adicionadas

### Erro: Multi-stage build problems
**Solução:** Dockerfile simplificado para single-stage

---

## 📋 CONFIGURAÇÕES ALTERNATIVAS

### Para EasyPanel (se Docker falhar):

**1. Build Manual:**
```
Build Command: npm install && npm run build
Start Command: npm start
Port: 8080
```

**2. Variáveis de Ambiente:**
```
NODE_ENV=production
PORT=8080
```

### Para MySQL externo:
```
DB_HOST=seu_host
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=senha
DB_NAME=convite
```

---

## 🧪 TESTE LOCAL

```bash
# Testar Dockerfile principal
docker build -t test-app .

# Se falhar, testar ultra-simples
mv Dockerfile Dockerfile.main
mv Dockerfile.ultra-simple Dockerfile
docker build -t test-app .

# Executar
docker run -p 8080:8080 test-app
```

---

## 📊 STATUS DAS CORREÇÕES

✅ **Fixado (v2):**
- Package-lock.json regenerado
- Dockerfile simplificado (single-stage)
- canvas-confetti em devDependencies
- Dependências Alpine otimizadas
- Dockerfile.ultra-simple para casos extremos

🔧 **Se ainda não funcionar:**
1. Use Dockerfile.ultra-simple
2. Configure build manual no EasyPanel
3. Reporte o problema com logs completos

---

## 🚨 ÚLTIMO RECURSO

Se nada funcionar, configure no EasyPanel:

**Source:** GitHub Repository  
**Build:** Custom  
**Install Command:** `npm install`  
**Build Command:** `npm run build`  
**Start Command:** `npm start`  
**Port:** `8080`

Isso evita completamente o Docker e usa build nativo do EasyPanel.
