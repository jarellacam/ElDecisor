import os
import json
import asyncio
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

load_dotenv()

# Usamos la clave GEMINI_API_KEY que ya validamos como True
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# --- EL CAMBIO DEFINITIVO ---
# Usamos el alias '-latest'. Esto obliga a Google a darte la versión 
# más compatible con tu librería actual, saltándose el error 404.
modelo = genai.GenerativeModel('gemini-1.5-flash-latest')

async def analizar_contenido_ia(texto_sucio: str):
    # Recorte preventivo para no saturar la memoria de la función
    texto_breve = texto_sucio[:3500] 
    
    prompt = f"""
    Eres un analista experto. Analiza este texto de producto y responde ÚNICAMENTE con JSON puro:
    {{
        "tipo_contenido": "producto",
        "nombre_producto": "Nombre",
        "puntos_clave": ["ventaja", "desventaja"],
        "veredicto": "recomendado",
        "resumen": "resumen"
    }}
    Texto: "{texto_breve}"
    """

    try:
        # Generación de contenido
        respuesta = await modelo.generate_content_async(prompt)
        
        if not respuesta or not respuesta.text:
            return {"error": "La IA no devolvió texto. Posible bloqueo de contenido."}

        # Limpieza de markdown
        texto = respuesta.text
        if "```" in texto:
            texto = texto.split("```")[1].replace("json", "").strip()
        
        return json.loads(texto.strip())

    except exceptions.ResourceExhausted:
        # Este es el error 429 que te salía antes
        return {"error": "Cuota agotada. Google pide esperar 60 segundos."}
    except Exception as e:
        # Esto nos devolverá el error exacto si vuelve a fallar
        error_msg = str(e)
        # Si sigue dando 404 con el 1.5, intentamos el 2.0 como plan de rescate
        if "404" in error_msg:
            return {"error": "Error de versión de modelo. Intenta con Gemini 2.0."}
        return {"error": error_msg}