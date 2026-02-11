import os
from supabase import create_client, Client
from dotenv import load_dotenv
import re
import unicodedata

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

async def buscar_analisis_existente(url_buscar: str):
    """Busca si ya analizamos esta URL antes para no gastar IA de nuevo."""
    respuesta = supabase.table("analisis").select("*").eq("url", url_buscar).execute()
    return respuesta.data[0] if respuesta.data else None

async def guardar_nuevo_analisis(url: str, titulo: str, resultado_ia: dict):
    """Guarda el resultado en la base de datos."""
    data = {
        "url": url,
        "titulo": titulo,
        "resultado_ia": resultado_ia
    }
    supabase.table("analisis").insert(data).execute()

async def obtener_analisis_por_slug(slug_buscar: str):
    respuesta = supabase.table("analisis").select("*").eq("slug", slug_buscar).execute()
    return respuesta.data[0] if respuesta.data else None

def crear_slug(texto: str) -> str:
    """Genera un identificador limpio para la URL (Slug)"""
    if not texto: return "sin-titulo"
    # 1. Normalización para quitar acentos
    texto = unicodedata.normalize('NFD', texto)
    texto = texto.encode('ascii', 'ignore').decode('utf-8')
    # 2. Minúsculas y limpieza de símbolos
    texto = re.sub(r'[^a-z0-9]+', '-', texto.lower())
    # 3. Limpiar guiones de los extremos
    return texto.strip('-')

async def guardar_nuevo_analisis(url: str, titulo: str, resultado_ia: dict, precio: str = "No detectado"):
    """
    Guarda el análisis en Supabase. 
    Ahora acepta el argumento 'precio'.
    """
    slug_limpio = crear_slug(titulo)
    
    data = {
        "url": url,
        "titulo": titulo,
        "resultado_ia": resultado_ia,
        "slug": slug_limpio,
        "precio": precio  
    }
    
    try:
        # Insertamos en la tabla 'analisis'
        res = supabase.table("analisis").insert(data).execute()
        return res
    except Exception as e:
        print(f"Error crítico al guardar en Supabase: {e}")
        return None