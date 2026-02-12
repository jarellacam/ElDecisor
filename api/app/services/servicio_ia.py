import os
import json
import asyncio
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

# Cargamos variables .env
load_dotenv()

# Usamos la variable que definiste en Vercel
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR CRÍTICO: No se encontró la variable GEMINI_API_KEY")

genai.configure(api_key=api_key)

# --- CAMBIO DE MODELO ---
# Usamos 'gemini-pro' que es el modelo estándar (v1.0) y funciona en todas las versiones de la API.
modelo = genai.GenerativeModel('gemini-2.0-flash')

async def analizar_contenido_ia(texto_sucio: str):
    texto_breve = texto_sucio[:4000]
    max_reintentos = 3
    
    prompt = f"""
    Eres un experto analista de productos. Analiza este texto de una web de producto:
    "{texto_breve}"
    
    Responde ÚNICAMENTE con un JSON válido (sin markdown ```json) con esta estructura:
    {{
        "tipo_contenido": "producto",
        "nombre_producto": "Nombre corto y claro",
        "puntos_clave": ["Lo bueno 1", "Lo bueno 2", "Lo malo 1"],
        "veredicto": "Compra recomendada" o "Buscar alternativa",
        "resumen": "Resumen en 2 frases"
    }}
    """

    for intento in range(max_reintentos):
        try:
            # Llamada asíncrona
            respuesta = await modelo.generate_content_async(prompt)
            texto_respuesta = respuesta.text

            # Limpieza de seguridad
            limpio = texto_respuesta.replace("```json", "").replace("```", "").strip()
            
            return json.loads(limpio)

        except Exception as e:
            print(f"Intento {intento+1} fallido: {e}")
            if intento == max_reintentos - 1:
                return {"error": "La IA no pudo procesar este producto."}
            await asyncio.sleep(2)

    return {"error": "Error desconocido en IA"}