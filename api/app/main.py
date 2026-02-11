import os
import re
import unicodedata
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Importamos tus servicios
from app.services.scraper import obtener_datos_url
from app.services.servicio_ia import analizar_contenido_ia
from app.services.db_service import supabase

app = FastAPI(title="El Decisor API")

# --- CONFIGURACIÓN DE CORS (SEGURIDAD) ---
# Sustituye 'tu-dominio.com' por el dominio que has comprado
# --- CONFIGURACIÓN DE CORS REFORZADA ---
origins = [
    "http://localhost:5173",
    "https://eldecisor.com",
    "https://www.eldecisor.com",
    "https://el-decisor.vercel.app",
    # Añadimos los esquemas de extensiones de Chrome por seguridad
    "chrome-extension://*", 
]

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
    """Genera una URL amigable basada en el título"""
    if not texto: return "producto"
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('utf-8')
    texto = texto.lower()
    texto = re.sub(r'[^a-z0-9]+', '-', texto)
    return texto.strip('-')[:80]

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "API de El Decisor Online en dominio propio"}

@app.post("/api/analizar")
async def analizar_url(request: AnalisisRequest):
    url = request.url.strip()
    
    # 1. Comprobar caché
    try:
        existente = supabase.table("analisis").select("*").eq("url", url).execute()
        if existente.data:
            cache = existente.data[0]
            if cache.get('slug') and cache.get('analisis_ia'):
                return cache
            else:
                # Borrar si está corrupto
                supabase.table("analisis").delete().eq("id", cache['id']).execute()
    except Exception as e:
        print(f"Caché omitido: {e}")

    # 2. Scraping
    datos_web = await obtener_datos_url(url)
    if "error" in datos_web:
        raise HTTPException(status_code=400, detail=datos_web["error"])

    # 3. Análisis IA
    analisis_ia = await analizar_contenido_ia(datos_web['contenido'])
    if "error" in analisis_ia:
        raise HTTPException(status_code=503, detail="La IA está saturada. Inténtalo de nuevo.")

    # 4. Guardar y retornar
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
        return {"mensaje": "¡Perfecto! Te avisaremos si el precio baja. 🕵️‍♂️"}
    except Exception as e:
        print(f"Error suscripción: {e}")
        raise HTTPException(status_code=500, detail="No se pudo guardar la suscripción.")