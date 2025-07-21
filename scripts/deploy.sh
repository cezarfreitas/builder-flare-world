#!/bin/bash

# Script de deploy para EasyPanel
# Execute: bash scripts/deploy.sh

set -e

echo "🚀 Iniciando processo de deploy..."
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script a partir da raiz do projeto"
    exit 1
fi

# Verificar se Docker está instalado (para teste local)
if command -v docker &> /dev/null; then
    echo "✅ Docker encontrado"
else
    echo "⚠️  Docker não encontrado (necessário apenas para teste local)"
fi

# Executar verificações
echo "🔍 Verificando dependências..."
npm run typecheck
echo "✅ TypeScript OK"

echo ""
echo "🔨 Executando build..."
npm run build
echo "✅ Build concluído"

echo ""
echo "🔍 Verificando build..."
npm run verify-build

echo ""
echo "📦 Informações do deploy:"
echo "├── Porta: 8080"
echo "├── Health check: /health"
echo "├── API base: /api"
echo "└── Banco: MySQL (configurar variáveis de ambiente)"

echo ""
echo "🎯 Configurações necessárias no EasyPanel:"
echo ""
echo "Variáveis de ambiente obrigatórias:"
echo "├── NODE_ENV=production"
echo "├── PORT=8080"
echo ""
echo "Variáveis de banco (se usar MySQL externo):"
echo "├── DB_HOST=seu_host"
echo "├── DB_PORT=3306"
echo "├── DB_USER=seu_usuario"
echo "├── DB_PASSWORD=sua_senha"
echo "└── DB_NAME=convite"

echo ""
echo "🔧 Para testar localmente:"
echo "docker build -t encontros-doces ."
echo "docker run -p 8080:8080 encontros-doces"

echo ""
echo "🎉 Projeto pronto para deploy no EasyPanel!"
echo "📖 Consulte DEPLOY.md para instruções detalhadas"
