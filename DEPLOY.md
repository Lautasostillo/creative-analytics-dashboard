# 🚀 Creative Analytics Dashboard - Deploy Guide

## Problemas Solucionados

### ✅ Errores Corregidos:

1. **Archivo `grid.parquet` corrupto**: Regenerado correctamente
2. **Error de React #31**: Corregido con ErrorBoundary y mejor manejo de datos
3. **Archivo `insights.json` vacío**: Regenerado con datos reales
4. **Inconsistencias en el API**: Corregido para usar solo `creatives.parquet`
5. **Problemas de configuración**: Mejorada configuración de Next.js y Railway

### 🔧 Cambios Realizados:

- **API (`api/genome.py`)**: Eliminada dependencia de `grid.parquet` corrupto
- **Hooks**: Corregidos para manejar ambos formatos de datos
- **ErrorBoundary**: Agregado para manejar errores de React
- **Configuración Next.js**: Mejorada para archivos estáticos
- **Scripts de datos**: Corregidos y verificados
- **Railway config**: Agregada configuración específica

## 🚀 Deploy a Railway

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar script de deploy completo
./scripts/deploy.sh
```

### Opción 2: Pasos Manuales

```bash
# 1. Activar entorno virtual
source venv/bin/activate

# 2. Regenerar archivos de datos
python scripts/data_prep.py
python scripts/genome_prep.py
python scripts/rebuild_clusters.py
python scripts/insights.py

# 3. Verificar datos
python scripts/verify_data.py

# 4. Instalar dependencias
npm install

# 5. Build de la aplicación
npm run build

# 6. Commit y push
git add .
git commit -m "Fix deploy issues"
git push railway main
```

## 📁 Archivos Clave Verificados

- ✅ `public/data/creatives.parquet` (159 registros, 33 columnas)
- ✅ `public/data/grid.parquet` (143 registros, 5 columnas)
- ✅ `public/data/ads.parquet` (151 registros, 27 columnas)
- ✅ `public/data/clusters_tags.parquet` (3 clusters)
- ✅ `public/data/insights.json` (5 insights generados)

## 🔍 Verificación Post-Deploy

Después del deploy, verifica que:

1. **Gallery**: Carga correctamente con datos
2. **Explorer**: Muestra gráficos sin errores
3. **Compare**: Funciona con selección de creatives
4. **Clusters**: Muestra agrupaciones correctas
5. **Creative Genome**: Visualización del grid funciona

## 🐛 Troubleshooting

### Si aparecen errores:

1. **Error de archivo Parquet**: Ejecuta `python scripts/verify_data.py`
2. **Error de React**: Revisa la consola del navegador
3. **Datos no cargan**: Verifica que los archivos estén en `/public/data/`
4. **Build falla**: Ejecuta `npm run build` localmente primero

### Logs útiles:

```bash
# Ver logs de Railway
railway logs

# Verificar archivos en Railway
railway shell
ls -la public/data/
```

## 📞 Soporte

Si persisten problemas:

1. Ejecuta `python scripts/verify_data.py` y comparte la salida
2. Revisa los logs de Railway
3. Verifica que todos los archivos estén en el repositorio

---

**¡Tu Creative Analytics Dashboard debería funcionar perfectamente en Railway ahora!** 🎉 