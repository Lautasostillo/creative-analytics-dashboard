#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Optimizando para deployment en Vercel...');

// Limpiar archivos innecesarios
const filesToRemove = [
  '.next',
  'node_modules/.cache',
  'venv',
  'api',
  'scripts',
  'data',
  'src_genome',
  'src'
];

filesToRemove.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Limpiando ${file}...`);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } catch (err) {
      console.log(`⚠️  No se pudo limpiar ${file}:`, err.message);
    }
  }
});

// Optimizar package.json para producción
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Mover duckdb-wasm a devDependencies para reducir bundle
  if (packageJson.dependencies && packageJson.dependencies['@duckdb/duckdb-wasm']) {
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.devDependencies['@duckdb/duckdb-wasm'] = packageJson.dependencies['@duckdb/duckdb-wasm'];
    delete packageJson.dependencies['@duckdb/duckdb-wasm'];
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('📦 Optimizado package.json');
  }
}

console.log('✅ Optimización completada');