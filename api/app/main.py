import os
import re
import unicodedata
import sys
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Parche de rutas para Vercel
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from services.scraper import obtener_datos_url
from services.servicio_ia import analizar_contenido_ia
from services.db_service import supabase

app = FastAPI(title="El Decisor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS DE DATOS ---
class AnalisisRequest(BaseModel):
    url: str

class SuscripcionRequest(BaseModel):
    email: str
    url: str
    slug: Optional[str] = None 

# --- UTILIDADES ---
def crear_slug(texto: str) -> str:
    if not texto: return "producto"
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('utf-8')
    texto = texto.lower()
    texto = re.sub(r'[^a-z0-9]+', '-', texto)
    return texto.strip('-')[:80]

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "API Online", "message": "El Decisor está listo."}

@app.post("/api/analizar")
async def analizar_url(request: AnalisisRequest):
    url = request.url.strip()
    
    # 1. Comprobar caché en Supabase
    try:
        existente = supabase.table("analisis").select("*").eq("url", url).execute()
        if existente.data:
            cache = existente.data[0]
            if cache.get('slug') and cache.get('analisis_ia'):
                return cache
            else:
                supabase.table("analisis").delete().eq("id", cache['id']).execute()
    except Exception as e:
        print(f"Caché omitido: {e}")

    # 2. Obtener datos de la web (Scraping)
    datos_web = await obtener_datos_url(url)
    if "error" in datos_web:
        raise HTTPException(status_code=400, detail=datos_web["error"])

    # 3. Procesar con IA
    analisis_ia = await analizar_contenido_ia(datos_web['contenido'])
    if "error" in analisis_ia:
        raise HTTPException(status_code=503, detail=f"Error de IA: {analisis_ia['error']}")

    # 4. Generar Slug y Guardar Resultado
    slug = crear_slug(datos_web['titulo'])
    nuevo_analisis = {
        "url": url,
        "slug": slug,
        "datos_web": datos_web,
        "analisis_ia": analisis_ia,
        "votos": 0
    }
    
    try:
        guardado = supabase.table("analisis").insert(nuevo_analisis).execute()
        return guardado.data[0] if guardado.data else nuevo_analisis
    except Exception as e:
        print(f"Error DB: {e}")
        return nuevo_analisis

@app.get("/api/analisis/{slug}")
async def obtener_analisis(slug: str):
    response = supabase.table("analisis").select("*").eq("slug", slug).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    return response.data[0]

@app.get("/api/tendencias")
async def obtener_tendencias():
    try:
        response = supabase.table("analisis").select("*").order('created_at', desc=True).limit(10).execute()
        validos = [
            item for item in response.data 
            if item.get('datos_web', {}).get('titulo') and item.get('analisis_ia')
        ]
        return validos[:4]
    except:
        return []

@app.post("/api/suscribir")
async def suscribir_usuario(request: SuscripcionRequest):
    try:
        datos = {
            "email": request.email,
            "url_producto": request.url,
            "slug_producto": request.slug
        }
        supabase.table("suscripciones").insert(datos).execute()
        return {"mensaje": "¡Suscripción guardada! Te avisaremos si hay cambios."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al guardar suscripción.")

@app.get("/api/debug-keys")
def debug_keys():
    return {
        "scraper_key": bool(os.getenv("WEB_SCRAPING_API_KEY")),
        "gemini_key": bool(os.getenv("GEMINI_API_KEY")),
        "supabase_key": bool(os.getenv("SUPABASE_URL")),
    }