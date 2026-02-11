from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from datetime import datetime
import logging

# Importamos tus servicios
from app.services.scraper import obtener_datos_url
from app.services.servicio_ia import analizar_contenido_ia
from app.services.db_service import buscar_analisis_existente, guardar_nuevo_analisis

logger = logging.getLogger(__name__)
router = APIRouter()

# Modelos de datos para las peticiones
class ProductoRequest(BaseModel):
    url: str

class SuscripcionRequest(BaseModel):
    email: str
    url: str
    slug: str

# --- 1. ANALIZAR (POST) ---
@router.post("/analizar")
async def analizar_producto(peticion: ProductoRequest):
    # Paso A: ¿Ya lo tenemos analizado?
    cache = await buscar_analisis_existente(peticion.url)
    if cache:
        return {
            "datos_web": {
                "titulo": cache["titulo"], 
                "url": cache["url"], 
                "precio": cache.get("precio")
            },
            "analisis_ia": cache["resultado_ia"], # Aquí ya vienen tus campos: tipo_contenido, resumen, etc.
            "fuente": "cache" 
        }

    # Paso B: Scrapeo
    datos = await obtener_datos_url(peticion.url)
    if "error" in datos:
        raise HTTPException(status_code=400, detail=datos["error"])

    # Paso C: Llamada a tu nueva función de IA (Gemini 2.5 Flash)
    resultado_ia = await analizar_contenido_ia(datos['contenido'])
    
    # Si la IA devuelve un error interno
    if "error" in resultado_ia:
        raise HTTPException(status_code=500, detail=resultado_ia["error"])

    # Paso D: Guardado en Supabase
    try:
        await guardar_nuevo_analisis(
            url=peticion.url, 
            titulo=datos["titulo"], 
            resultado_ia=resultado_ia, 
            precio=datos.get("precio", "No detectado")
        )
    except Exception as e:
        logger.error(f"Error guardando en DB: {e}")

    return {
        "datos_web": {
            "titulo": datos["titulo"], 
            "url": datos["url_original"], 
            "precio": datos.get("precio")
        },
        "analisis_ia": resultado_ia,
        "fuente": "fresca"
    }

# --- 2. TENDENCIAS (GET) ---
@router.get("/tendencias")
async def obtener_tendencias():
    from app.services.db_service import supabase
    res = supabase.table("analisis")\
        .select("url, titulo, resultado_ia, slug")\
        .order("created_at", desc=True)\
        .limit(6)\
        .execute()
    return res.data

# --- 3. DETALLE POR SLUG (GET) ---
@router.get("/analisis/{slug}")
async def obtener_por_slug(slug: str):
    from app.services.db_service import supabase
    res = supabase.table("analisis").select("*").eq("slug", slug).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="No encontrado")
        
    datos = res.data[0]
    return {
        "datos_web": {
            "titulo": datos["titulo"], 
            "url": datos["url"],
            "precio": datos.get("precio") 
        },
        "analisis_ia": datos["resultado_ia"]
    }

# --- 4. SUSCRIBIR (POST) ---
@router.post("/suscribir")
async def suscribir_chollo(peticion: SuscripcionRequest):
    from app.services.db_service import supabase
    data = {
        "email": peticion.email,
        "url_producto": peticion.url,
        "slug_producto": peticion.slug
    }
    supabase.table("suscripciones").insert(data).execute()
    return {"status": "ok"}

# --- 5. SEO (SITEMAP & ROBOTS) ---
@router.get("/sitemap.xml")
async def sitemap():
    from app.services.db_service import supabase
    res = supabase.table("analisis").select("slug, created_at").execute()
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for row in res.data:
        xml += f"<url><loc>https://tu-dominio.com/analisis/{row['slug']}</loc></url>\n"
    xml += "</urlset>"
    return Response(content=xml, media_type="application/xml")