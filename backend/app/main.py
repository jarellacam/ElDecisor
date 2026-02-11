import os
import re
import unicodedata
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Importamos tus servicios (Asegúrate de que existan)
from app.services.scraper import obtener_datos_url
from app.services.servicio_ia import analizar_contenido_ia
from app.services.db_service import supabase

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción cambia esto por tu dominio real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MODELOS DE DATOS
class AnalisisRequest(BaseModel):
    url: str

class SuscripcionRequest(BaseModel):
    email: str
    url: str
    slug: str | None = None 

# CREADOR DE SLUGS 
def crear_slug(texto: str) -> str:
    """Convierte 'La Huérfana' en 'la-huerfana' sin caracteres raros"""
    if not texto: return "producto-sin-nombre"
    # (quitar tildes: é -> e, ñ -> n)
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('utf-8')
    # Convertir a minúsculas
    texto = texto.lower()
    # Reemplazar todo lo que no sea letra o número por guiones
    texto = re.sub(r'[^a-z0-9]+', '-', texto)
    # Quitar guiones extra
    texto = texto.strip('-')
    return texto[:80]

# ENDPOINTS 

@app.get("/")
def read_root():
    return {"status": "El Decisor API funcionando 🚀"}

@app.post("/api/analizar")
async def analizar_url(request: AnalisisRequest):
    url = request.url.strip()
    
    # Comprobar caché con VALIDACIÓN
    try:
        existente = supabase.table("analisis").select("*").eq("url", url).execute()
        if existente.data and len(existente.data) > 0:
            cache = existente.data[0]
            # Solo devolvemos el caché si tiene slug y análisis válido.
            # Si es un dato viejo corrupto, lo ignoramos y re-analizamos.
            if cache.get('slug') and cache.get('analisis_ia') and cache.get('datos_web'):
                print(f"Recuperado de caché (Válido): {url}")
                return cache
            else:
                print(f"Caché corrupto detectado para {url}. Re-analizando...")
                supabase.table("analisis").delete().eq("id", cache['id']).execute()
                
    except Exception as e:
        print(f"Nota: No se pudo consultar caché ({e})")


    # Si no existe, SCRAPING
    print(f" Scrapeando: {url}")
    datos_web = await obtener_datos_url(url)
    
    if "error" in datos_web:
        raise HTTPException(status_code=400, detail=datos_web["error"])

    # ANÁLISIS IA
    print("Consultando a Gemini...")
    analisis_ia = await analizar_contenido_ia(datos_web['contenido'])
    
    if "error" in analisis_ia:
        raise HTTPException(status_code=503, detail=analisis_ia["error"])

    # GENERAR SLUG LIMPIO
    slug = crear_slug(datos_web['titulo'])

    # GUARDAR EN SUPABASE
    nuevo_analisis = {
        "url": url,
        "slug": slug,
        "datos_web": datos_web,     # JSONB en Supabase
        "analisis_ia": analisis_ia, # JSONB en Supabase
        "votos": 0
    }
    
    try:
        guardado = supabase.table("analisis").insert(nuevo_analisis).execute()
        # Devolvemos el objeto completo (importante para que el frontend tenga el slug)
        if guardado.data:
            return guardado.data[0]
        else:
            return nuevo_analisis # Fallback si supabase no devuelve data
            
    except Exception as e:
        print(f"Error guardando en DB: {e}")
        # Si falla la DB, devolvemos el resultado igual para que el usuario lo vea
        return nuevo_analisis

@app.get("/api/analisis/{slug}")
async def obtener_analisis(slug: str):
    try:
        # Buscamos por slug exacto
        response = supabase.table("analisis").select("*").eq("slug", slug).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Análisis no encontrado")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error buscando análisis")

@app.post("/api/suscribir")
async def suscribir_usuario(request: SuscripcionRequest):
    try:
        datos = {
            "email": request.email,
            "url_producto": request.url,
            "slug_producto": request.slug
        }
        supabase.table("suscripciones").insert(datos).execute()
        return {"msg": "Suscripción guardada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tendencias")
async def obtener_tendencias():
    try:
        # Pedimos los últimos 10 (para tener margen si hay basura)
        response = supabase.table("analisis").select("*").order('created_at', desc=True).limit(10).execute()
        raw_data = response.data
        
        # FILTRO PYTHON: Solo aceptamos si tiene título real y veredicto
        validos = []
        for item in raw_data:
            titulo = item.get('datos_web', {}).get('titulo', '')
            veredicto = item.get('analisis_ia', {}).get('veredicto_valor', '')
            
            # Condición de calidad: Debe tener título y no ser el default
            if titulo and titulo != "Producto sin nombre" and veredicto:
                validos.append(item)
                
        # Devolvemos solo los 4 primeros válidos
        return validos[:4]
        
    except Exception as e:
        print(f"Error tendencias: {e}")
        return []
    
@app.post("/api/suscribir")
async def suscribir_usuario(request: SuscripcionRequest):
    try:
        # El diccionario debe usar las claves EXACTAS de tus columnas en Supabase
        datos = {
            "email": request.email,
            "url_producto": request.url,
            "slug_producto": request.slug # Ahora sí funcionará porque creamos la columna
        }
        
        # Insertamos en la tabla
        supabase.table("suscripciones").insert(datos).execute()
        
        return {"mensaje": "Suscripción guardada correctamente"}
        
    except Exception as e:
        print(f"Error suscripción: {e}")
        # Importante: Imprimimos el error real en la consola para verlo si falla
        raise HTTPException(status_code=500, detail=str(e))