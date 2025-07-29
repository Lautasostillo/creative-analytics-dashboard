# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Next.js Dashboard (Main App)
- `npm run dev` - Start Next.js development server on port 3000
- `npm run build` - Build production Next.js app
- `npm run start` - Start production Next.js server
- `npm run lint` - Run ESLint on codebase

### Vite Genome App (Alternative Frontend)
- `npm run dev:genome` - Start Vite development server on port 3001 for genome app

### Python Backend
- `python main.py` or `uvicorn main:app --reload` - Start FastAPI backend on port 8000
- Activate virtual environment first: `source venv/bin/activate` (macOS/Linux) or `venv\Scripts\activate` (Windows)

### Data Processing Scripts
- `python scripts/data_prep.py` - Prepare data files
- `python scripts/genome_prep.py` - Process genome data
- `python scripts/insights.py` - Generate insights
- `python scripts/rebuild_clusters.py` - Rebuild clustering data

## Architecture Overview

This is a creative analytics dashboard with dual frontend implementations and a Python backend:

### Dual Frontend Architecture
- **Main App**: Next.js 14 app in root (`/app` directory) - Primary dashboard interface
- **Genome App**: Vite React app in `src_genome/` - Alternative visualization interface
- Both frontends share similar component structures but are separate applications

### Backend Services
- **FastAPI Backend**: Python server (`main.py`) serving data APIs
- **API Routes**: Genome-specific endpoints in `api/genome.py`
- **Data Processing**: Python scripts for ETL and analysis in `scripts/`

### Data Layer
- **DuckDB Integration**: Client-side analytics using DuckDB WASM (`hooks/useDuckDB.ts`)
- **Parquet Files**: Data stored in `/public/data/` as `.parquet` files
- **Data Types**: TypeScript interfaces in `lib/types.ts` for Creative, KPIData, ChartData, etc.

### Component Architecture
- **Shared UI Components**: Radix UI-based components in `components/ui/`
- **Chart Components**: ECharts and Recharts integration in `components/charts/`
- **Layout Components**: Sidebar, header, and filter components
- **State Management**: Zustand stores (see `components/genome/store/`)

### Key Technologies
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI
- Charts: ECharts, Recharts
- Data: DuckDB WASM, Parquet files
- Backend: FastAPI, Pandas
- State: Zustand, React Query

### Path Aliases
- `@/*` resolves to project root for main Next.js app
- Vite app uses `@/` pointing to `src_genome/`

### Port Configuration
- Next.js: Port 3000
- Vite Genome: Port 3001 (with proxy to backend)
- FastAPI: Port 8000

## Data Flow
1. Python scripts process raw data into Parquet files
2. Frontend loads Parquet data via DuckDB WASM for client-side analytics
3. FastAPI backend provides additional API endpoints for complex operations
4. Multiple visualization layers (charts, tables, genome views) consume processed data

---

**"Inicia el servidor con la última versión del Creative Analytics Dashboard que estábamos trabajando. Necesito que:**

1. **Active el entorno virtual de Python** (está en la carpeta `venv/`)
2. **Inicie el backend FastAPI** en el puerto 8000
3. **Inicie el frontend Next.js** en el puerto 3001
4. **Verifique que los datos estén funcionando correctamente**

**Los archivos principales que modificamos fueron:**
- `api/genome.py` - Backend con manejo de NaN y datos completos
- `hooks/useRealCreativeData.ts` - Hook simplificado para cargar datos
- `components/gallery/AIAnalysisModal.tsx` - Modal con High Fidelity Description y Scene Breakdown
- `components/gallery/CardMedia.tsx` - Componente para mostrar videos

**El sistema debería mostrar:**
- ✅ Videos y thumbnails en la galería
- ✅ High Fidelity Description y Scene by Scene Breakdown en el modal
- ✅ Datos completos sin errores 404"

---

**Comandos específicos que el agente debería ejecutar:**

```bash
# 1. Navegar al directorio del proyecto
cd /Users/lautarosostillo/Documents/creative-analytics-dashboard

# 2. Activar el entorno virtual
source venv/bin/activate

# 3. Iniciar el backend FastAPI
uvicorn main:app --reload --port 8000

# 4. En otra terminal, iniciar el frontend Next.js
npm run dev -- --port 3001
```