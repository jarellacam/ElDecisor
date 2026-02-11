from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import productos

app = FastAPI(title="El Decisor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permite que cualquier frontend se conecte
    allow_credentials=True,
    allow_methods=["*"],  # permite GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)

# incluimos las rutas
app.include_router(productos.router, prefix="/api")