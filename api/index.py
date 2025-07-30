from fastapi import FastAPI
from api.genome import router as genome_router
# --- CORS para permitir front en 3001 ---
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3004"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(genome_router, prefix="/genome")

@app.get("/")
async def root():
    return {"message": "API is running"}
