import os
import json
import asyncio
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

load_dotenv()

# Configuramos la clave que ya tenemos validada en True
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# --- EL CAMBIO CLAVE ---
# Usamos el nombre completo con el prefijo 'models/' 
# Esto ayuda a que la API lo localice correctamente en cualquier versión (v1 o v1beta)
modelo = genai.GenerativeModel('models/gemini-1.5-flash')

async def analizar_contenido_ia(texto_sucio: str):
    texto_breve = texto_sucio[:3500] 
    
    prompt = f"""
    Eres un analista experto. Analiza este producto y responde ÚNICAMENTE con JSON puro:
    {{
        "tipo_contenido": "producto",
        "nombre_producto": "Nombre claro",
        "puntos_clave": ["ventaja 1", "ventaja 2", "desventaja 1"],
        "veredicto": "recomendado",
        "resumen": "resumen breve"
    }}
    Texto: "{texto_breve}"
    """

    try:
        # Llamada asíncrona a la IA
        respuesta = await modelo.generate_content_async(prompt)
        
        if not respuesta.text:
            return {"error": "La IA devolvió una respuesta vacía."}

        # Limpiamos posibles bloques de código que la IA suele añadir
        texto = respuesta.text
        if "```" in texto:
            texto = texto.split("```")[1]
            if texto.startswith("json"):
                texto = texto[4:]
        
        return json.loads(texto.strip())

    except exceptions.ResourceExhausted:
        return {"error": "Cuota agotada (429). Espera un minuto."}
    except Exception as e:
        # Aquí capturaremos el 404 si vuelve a ocurrir
        return {"error": str(e)}