#!/usr/bin/env zx

import { $, cd } from 'zx';
import fg from 'fast-glob';
import { statSync } from 'fs';

// 1️⃣  Build local (igual que Vercel)
await $`rm -rf .vercel_ci`;
await $`npx vercel build --prod --output .vercel_ci`;

// 2️⃣  Recorremos todas las funciones
cd('.vercel_ci/output/functions');
const bundles = await fg('**/*.func');

const limit = 250 * 1024 * 1024; // 250 MB en bytes
let oversized = false;

for (const file of bundles) {
  const size = statSync(file).size;
  if (size > limit) {
    console.error(
      `❌  ${file} pesa ${(size / 1024 / 1024).toFixed(1)} MB (límite 250 MB)`
    );
    oversized = true;
  }
}

if (oversized) {
  console.error('🛑  Push abortado: alguna función supera los 250 MB.');
  process.exit(1);
} else {
  console.log('✅  Todo OK: ninguna función pasa los 250 MB.');
} 