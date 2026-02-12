import os
import json
import asyncio
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

load_dotenv()

# Usamos la clave que ya sabemos que funciona
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Usamos 1.5-flash que es el más rápido
modelo = genai.GenerativeModel('gemini-1.5-flash')

async def analizar_contenido_ia(texto_sucio: str):
    # Reducimos un poco el texto para no saturar la memoria
    texto_breve = texto_sucio[:3000] 
    
    prompt = f"""
    Analiza este producto y responde SOLO un JSON puro, sin bloques de código:
    {{
        "tipo_contenido": "producto",
        "nombre_producto": "Nombre",
        "puntos_clave": ["punto 1", "punto 2"],
        "veredicto": "recomendado",
        "resumen": "resumen"
    }}
    Texto: "{texto_breve}"
    """

    try:
        # Llamada directa
        respuesta = await modelo.generate_content_async(prompt)
        
        # Si la respuesta está vacía o bloqueada
        if not respuesta.text:
            return {"error": "Google bloqueó la respuesta por seguridad o contenido."}

        # Limpieza manual de la respuesta
        texto = respuesta.text
        if "```" in texto:
            texto = texto.split("```")[1]
            if texto.startswith("json"):
                texto = texto[4:]
        
        return json.loads(texto.strip())

    except exceptions.ResourceExhausted:
        return {"error": "Cuota de Google agotada. Espera 60 segundos."}
    except Exception as e:
        # Esto nos dirá si es un 404, un 400 o qué
        return {"error": str(e)}