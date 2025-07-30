#!/usr/bin/env zx

import { $ } from 'zx';
import fg from 'fast-glob';
import { statSync, existsSync } from 'fs';
import path from 'path';

console.log('🔍 Verificando tamaño de funciones...');

// 1️⃣  Build local de Next.js
console.log('📦 Ejecutando build de Next.js...');
await $`pnpm run build`;

// 2️⃣  Verificar si existe .next/standalone
const standalonePath = '.next/standalone';
if (!existsSync(standalonePath)) {
  console.log('⚠️  No se encontró .next/standalone. Verificando .next/static...');
  
  // Verificar tamaño de .next/static
  const staticPath = '.next/static';
  if (existsSync(staticPath)) {
    const staticSize = getDirSize(staticPath);
    const limit = 250 * 1024 * 1024; // 250 MB en bytes
    
    if (staticSize > limit) {
      console.error(
        `❌  .next/static pesa ${(staticSize / 1024 / 1024).toFixed(1)} MB (límite 250 MB)`
      );
      console.error('🛑  Push abortado: el bundle supera los 250 MB.');
      process.exit(1);
    } else {
      console.log(`✅  .next/static pesa ${(staticSize / 1024 / 1024).toFixed(1)} MB (OK)`);
    }
  }
} else {
  // Verificar tamaño de .next/standalone
  const standaloneSize = getDirSize(standalonePath);
  const limit = 250 * 1024 * 1024; // 250 MB en bytes
  
  if (standaloneSize > limit) {
    console.error(
      `❌  .next/standalone pesa ${(standaloneSize / 1024 / 1024).toFixed(1)} MB (límite 250 MB)`
    );
    console.error('🛑  Push abortado: el bundle supera los 250 MB.');
    process.exit(1);
  } else {
    console.log(`✅  .next/standalone pesa ${(standaloneSize / 1024 / 1024).toFixed(1)} MB (OK)`);
  }
}

// 3️⃣  Verificar tamaño de node_modules (solo dependencias de producción)
console.log('📊 Verificando dependencias...');
const packageJson = JSON.parse(await $`cat package.json`);
const prodDeps = Object.keys(packageJson.dependencies || {});
const devDeps = Object.keys(packageJson.devDependencies || {});

// Solo contar dependencias de producción
let totalDepsSize = 0;
for (const dep of prodDeps) {
  const depPath = `node_modules/${dep}`;
  if (existsSync(depPath)) {
    totalDepsSize += getDirSize(depPath);
  }
}

const depsLimit = 250 * 1024 * 1024; // 250 MB para dependencias (mismo límite que Vercel)
if (totalDepsSize > depsLimit) {
  console.error(
    `❌  Dependencias de producción pesan ${(totalDepsSize / 1024 / 1024).toFixed(1)} MB (límite 250 MB)`
  );
  console.error('🛑  Push abortado: dependencias muy pesadas.');
  process.exit(1);
} else {
  console.log(`✅  Dependencias pesan ${(totalDepsSize / 1024 / 1024).toFixed(1)} MB (OK)`);
}

console.log('✅  Todo OK: ninguna función pasa los límites de tamaño.');

// Función auxiliar para calcular tamaño de directorio
function getDirSize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    if (existsSync(currentPath)) {
      const stats = statSync(currentPath);
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        try {
          const files = fg.sync('**/*', { cwd: currentPath, dot: false, follow: false });
          for (const file of files) {
            const filePath = path.join(currentPath, file);
            try {
              const fileStats = statSync(filePath);
              if (fileStats.isFile()) {
                totalSize += fileStats.size;
              }
            } catch (err) {
              // Ignorar archivos que no se pueden leer
            }
          }
        } catch (err) {
          // Ignorar directorios que no se pueden leer
        }
      }
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
} 