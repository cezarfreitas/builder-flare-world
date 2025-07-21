# Deploy no EasyPanel - Instruções Atualizadas

## 🚀 SOLUÇÃO ATUAL (Após correções)

### Opção 1: Docker (Recomendado)
1. **Criar App no EasyPanel**
2. **Source:** GitHub Repository
3. **Dockerfile:** Usar o principal (já corrigido)
4. **Port:** 8080
5. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=8080
   ```

### Opção 2: Build Nativo (Se Docker falhar)
1. **Source:** GitHub Repository  
2. **Type:** Node.js App
3. **Install Command:** `npm install`
4. **Build Command:** `npm run build`
5. **Start Command:** `npm start`
6. **Port:** 8080

---

## 🔧 CONFIGURAÇÃO DE BANCO DE DADOS

### Opção A: Banco Atual (Mais fácil)
**Não precisa configurar nada** - usa as configurações existentes.

### Opção B: MySQL do EasyPanel
Adicionar essas variáveis:
```env
DB_HOST=mysql_container_name
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=convite
```

---

## 🎯 VARIÁVEIS DE AMBIENTE ESSENCIAIS

```env
# Obrigatórias
NODE_ENV=production
PORT=8080

# Banco (opcional se usar o existente)
DB_HOST=seu_host
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=senha
DB_NAME=convite
```

---

## 🚨 TROUBLESHOOTING NO EASYPANEL

### Se Docker Build Falhar:
1. **Ver logs completos** no EasyPanel
2. **Trocar para ultra-simples:**
   - Editar Dockerfile no GitHub
   - Usar conteúdo de `Dockerfile.ultra-simple`
3. **Usar build nativo** (Opção 2 acima)

### Se App não Iniciar:
1. **Verificar logs** da aplicação
2. **Confirmar variáveis** de ambiente
3. **Testar conexão** com banco

### Se Banco não Conectar:
1. **Verificar credenciais** MySQL
2. **Testar conectividade** de rede
3. **Usar banco interno** do EasyPanel

---

## 📋 CHECKLIST DE DEPLOY

### Antes do Deploy:
- [ ] Código commitado no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Dockerfile testado localmente (opcional)

### Configuração no EasyPanel:
- [ ] App criado com source GitHub
- [ ] Port 8080 configurado
- [ ] NODE_ENV=production setado
- [ ] Banco de dados configurado

### Pós Deploy:
- [ ] App iniciou sem erros
- [ ] Health check `/health` funcionando
- [ ] Criar evento de teste
- [ ] Confirmar presença teste
- [ ] Acessar master admin

---

## 🔗 URLS IMPORTANTES

Após deploy, testar:
- `https://seu-dominio.com/` - Homepage
- `https://seu-dominio.com/health` - Health check
- `https://seu-dominio.com/master-admin` - Admin (senha: morango2024)

---

## 📞 SUPORTE

Se nada funcionar:
1. **Copiar logs completos** do EasyPanel
2. **Verificar** se todas as dependências estão corretas
3. **Usar build nativo** como fallback
4. **Testar localmente** primeiro se possível

### Logs Importantes:
- Build logs (se Docker)
- Application logs (runtime)
- Error logs (se falhar)

---

## ✅ STATUS ATUAL

**Docker:** ✅ Corrigido e simplificado  
**Dependencies:** ✅ Canvas-confetti movido para dev  
**Package-lock:** ✅ Regenerado  
**Fallbacks:** ✅ Ultra-simple e build nativo disponíveis  
**Documentation:** ✅ Completa e atualizada  

**Ready to Deploy!** 🚀🍓
