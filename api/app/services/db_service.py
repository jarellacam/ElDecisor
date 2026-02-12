import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Inicialización del cliente
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ ERROR: Faltan las credenciales de Supabase en las variables de entorno.")

supabase: Client = create_client(url, key)

async def buscar_analisis_existente(url_buscar: str):
    """Consulta rápida para evitar duplicados."""
    try:
        res = supabase.table("analisis").select("*").eq("url", url_buscar).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"Error al buscar en DB: {e}")
        return None

async def guardar_nuevo_analisis(data: dict):
    """Guarda un diccionario completo de análisis en la tabla."""
    try:
        res = supabase.table("analisis").insert(data).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"Error al insertar en DB: {e}")
        return None

async def obtener_analisis_por_slug(slug_buscar: str):
    """Busca un análisis específico por su URL amigable (slug)."""
    try:
        res = supabase.table("analisis").select("*").eq("slug", slug_buscar).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"Error al obtener slug de DB: {e}")
        return None