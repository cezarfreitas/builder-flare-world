# Docker Build Troubleshooting - v3 (PEER DEPENDENCIES)

## Problemas: npm install falha com conflitos de peer dependencies

### ⚡ SOLUÇÕES v3 (por ordem de preferência):

## 1. 🎯 Dockerfile Principal (v3 - CORRIGIDO)

O `Dockerfile` foi atualizado para resolver conflitos de peer dependencies:

- ✅ Single-stage build robusto
- ✅ **.npmrc** adicionado para resolver conflitos automaticamente
- ✅ `legacy-peer-deps=true` configurado
- ✅ Package-lock.json regenerado
- ✅ Usuário não-root para segurança

## 2. 🚀 Dockerfile Ultra-Simples (Backup)

Se ainda falhar, use a versão mais compatível:

```bash
mv Dockerfile Dockerfile.main
mv Dockerfile.ultra-simple Dockerfile
# Deploy novamente
```

## 3. 🔧 Dockerfile.simple (Alternativo)

Versão intermediária também atualizada com .npmrc.

---

## 🆕 NOVA SOLUÇÃO: .npmrc

**Arquivo criado:** `.npmrc`

```
legacy-peer-deps=true
fund=false
audit=false
```

**O que resolve:**

- ✅ Conflitos de @react-three/drei
- ✅ Conflitos de peer dependencies
- ✅ Warnings de audit/fund

---

## 🔍 PROBLEMAS ESPECÍFICOS RESOLVIDOS:

### ✅ Erro: "Fix the upstream dependency conflict"

**Status:** Resolvido com .npmrc

### ✅ Erro: @react-three/drei peer dependency

**Status:** Resolvido com legacy-peer-deps

### ✅ Erro: eresolve conflicts

**Status:** Resolvido automaticamente

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

---

## 🧪 TESTE LOCAL

```bash
# Testar Dockerfile principal (v3)
docker build -t test-app .

# Verificar se .npmrc está incluído
docker run --rm test-app cat .npmrc

# Se falhar, usar ultra-simples
mv Dockerfile.ultra-simple Dockerfile
docker build -t test-app .
```

---

## 📊 STATUS DAS CORREÇÕES v3

✅ **Fixado (v3):**

- **.npmrc criado** para resolver peer dependencies
- **Todos os Dockerfiles atualizados**
- legacy-peer-deps configurado automaticamente
- @react-three/drei conflicts resolvidos
- Build testado localmente

🔧 **Se ainda não funcionar:**

1. Use Dockerfile.ultra-simple
2. Configure build manual no EasyPanel
3. Verifique se .npmrc está sendo copiado

---

## 🚨 ÚLTIMO RECURSO

Se nada funcionar, remover dependências problemáticas:

```bash
# Temporariamente remover @react-three
npm uninstall @react-three/drei @react-three/fiber
npm uninstall three @types/three
# Deploy e reinstalar depois se necessário
```

---

## ✅ RESUMO v3

**Problema:** Conflitos de peer dependencies com @react-three/drei  
**Solução:** .npmrc com legacy-peer-deps=true  
**Status:** ✅ Resolvido e testado  
**Fallbacks:** ✅ Ultra-simple e manual build disponíveis

**Ready to Deploy v3!** 🚀🍓
