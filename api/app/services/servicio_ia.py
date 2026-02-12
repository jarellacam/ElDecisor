import os
import json
import asyncio
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

load_dotenv()

# Usamos GEMINI_API_KEY que es la que tienes en True en el debug
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Usamos 'gemini-pro': es el más estable y con cuota gratuita más generosa
modelo = genai.GenerativeModel('gemini-pro')

async def analizar_contenido_ia(texto_sucio: str):
    texto_breve = texto_sucio[:3500] 
    
    prompt = f"""
    Analiza este producto y responde SOLO en JSON:
    {{
        "tipo_contenido": "producto",
        "nombre_producto": "Nombre",
        "puntos_clave": ["punto 1", "punto 2"],
        "veredicto": "recomendado/no recomendado",
        "resumen": "resumen corto"
    }}
    Texto: "{texto_breve}"
    """

    try:
        # Generación de contenido
        respuesta = await modelo.generate_content_async(prompt)
        
        # Limpieza de markdown
        limpio = respuesta.text.replace("```json", "").replace("```", "").strip()
        return json.loads(limpio)

    except exceptions.ResourceExhausted:
        # Error 429: Cuota agotada
        return {"error": "IA saturada (límite de cuota gratuita). Reintenta en 1 minuto."}
    except Exception as e:
        # Cualquier otro error (404, etc)
        print(f"Error IA: {e}")
        return {"error": "La IA no ha podido procesar este enlace."}