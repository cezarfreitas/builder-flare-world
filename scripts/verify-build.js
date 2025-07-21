#!/usr/bin/env node

/**
 * Script de verificação pré-deploy
 * Verifica se a aplicação foi buildada corretamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔍 Verificando build da aplicação...\n');

// Verificar se dist existe
const distPath = path.join(rootDir, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Pasta dist/ não encontrada. Execute: npm run build');
  process.exit(1);
}

// Verificar SPA build
const spaPath = path.join(distPath, 'spa');
if (!fs.existsSync(spaPath)) {
  console.error('❌ Build do frontend não encontrado em dist/spa/');
  process.exit(1);
}

const indexPath = path.join(spaPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html não encontrado em dist/spa/');
  process.exit(1);
}

// Verificar server build
const serverPath = path.join(distPath, 'server');
if (!fs.existsSync(serverPath)) {
  console.error('❌ Build do servidor não encontrado em dist/server/');
  process.exit(1);
}

const serverFile = path.join(serverPath, 'node-build.mjs');
if (!fs.existsSync(serverFile)) {
  console.error('❌ Arquivo do servidor não encontrado: dist/server/node-build.mjs');
  process.exit(1);
}

// Verificar package.json
const packagePath = path.join(rootDir, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.error('❌ package.json não encontrado');
  process.exit(1);
}

// Verificar se tem dependências de produção
const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
if (!packageContent.dependencies || Object.keys(packageContent.dependencies).length === 0) {
  console.error('❌ Nenhuma dependência de produção encontrada');
  process.exit(1);
}

// Verificar arquivos Docker
const dockerfilePath = path.join(rootDir, 'Dockerfile');
if (!fs.existsSync(dockerfilePath)) {
  console.error('❌ Dockerfile não encontrado');
  process.exit(1);
}

const dockerignorePath = path.join(rootDir, '.dockerignore');
if (!fs.existsSync(dockerignorePath)) {
  console.warn('⚠️  .dockerignore não encontrado (recomendado)');
}

console.log('✅ Build do frontend verificado');
console.log('✅ Build do servidor verificado');
console.log('✅ package.json verificado');
console.log('✅ Dockerfile verificado');
console.log('✅ Dependências de produção encontradas');

console.log('\n🎉 Aplicação pronta para deploy!');
console.log('\n📝 Próximos passos:');
console.log('1. Configure as variáveis de ambiente no EasyPanel');
console.log('2. Configure o banco de dados MySQL');
console.log('3. Faça o deploy usando o Dockerfile');
console.log('\n🔗 Consulte DEPLOY.md para instruções detalhadas');
