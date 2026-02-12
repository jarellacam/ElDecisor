import os
import json
import asyncio
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

async def analizar_contenido_ia(texto_sucio: str):
    # Texto más corto para ahorrar tokens y evitar el error 429
    texto_breve = texto_sucio[:2500] 
    
    # Lista de modelos a intentar en orden de prioridad
    modelos_a_probar = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
    
    prompt = f"""
    Responde SOLO JSON:
    {{
        "tipo_contenido": "producto",
        "nombre_producto": "Nombre",
        "puntos_clave": ["punto 1", "punto 2"],
        "veredicto": "recomendado",
        "resumen": "resumen corto"
    }}
    Texto: {texto_breve}
    """

    ultimo_error = ""

    for nombre_modelo in modelos_a_probar:
        try:
            print(f"Intentando con: {nombre_modelo}")
            modelo = genai.GenerativeModel(nombre_modelo)
            respuesta = await modelo.generate_content_async(prompt)
            
            if respuesta and respuesta.text:
                texto = respuesta.text
                if "```" in texto:
                    texto = texto.split("```")[1].replace("json", "").strip()
                return json.loads(texto.strip())
                
        except exceptions.ResourceExhausted:
            ultimo_error = "Cuota agotada en este modelo."
            print(f"{nombre_modelo} sin cuota. Probando siguiente...")
            continue 
        except Exception as e:
            ultimo_error = str(e)
            print(f"Error en {nombre_modelo}: {e}")
            continue

    return {"error": f"Ningún modelo funcionó. Último error: {ultimo_error}"}