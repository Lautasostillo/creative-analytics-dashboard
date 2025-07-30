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
- `python api/index.py` or `uvicorn api.index:app --reload` - Start FastAPI backend on port 8000
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
- **FastAPI Backend**: Python server (`api/index.py`) serving data APIs
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

## Development Workflow

### Starting the Full Stack Application

1. **Activate Python Virtual Environment**:
   ```bash
   source venv/bin/activate  # macOS/Linux
   # or
   venv\Scripts\activate     # Windows
   ```

2. **Start Backend Services**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

3. **Start Frontend Applications** (in separate terminals):
   ```bash
   # Main Next.js app
   npm run dev
   
   # Alternative Vite genome app
   npm run dev:genome
   ```

### Key Implementation Notes

- **Data Handling**: Backend (`api/genome.py`) includes robust NaN value handling for JSON serialization
- **Creative Data**: Frontend hooks (`hooks/useRealCreativeData.ts`) provide simplified data loading patterns
- **Media Components**: Gallery components support video playback and thumbnail generation
- **AI Analysis**: Modal components display structured AI analysis including High Fidelity Descriptions and Scene Breakdowns
- **Cross-Origin**: Backend configured with CORS for development on ports 3001 and 3004