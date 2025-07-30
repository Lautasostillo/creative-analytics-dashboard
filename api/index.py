from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.genome import router as genome_router
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Configurar CORS para desarrollo y producción
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios específicos
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir el router de la API
app.include_router(genome_router, prefix="/genome")

# Servir archivos estáticos exportados por Next.js
if os.path.exists("out"):
    app.mount("/", StaticFiles(directory="out", html=True), name="static")

@app.get("/api/{path:path}")
async def api_routes(path: str):
    # Las rutas de la API ya están manejadas por el router
    pass

@app.get("/")
async def root():
    # Servir el index.html exportado por Next.js
    if os.path.exists("out/index.html"):
        return FileResponse("out/index.html")
    else:
        return {"message": "API is running - Frontend not built yet"}
