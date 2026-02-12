import os
import json
import asyncio
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# --- SISTEMA DE SELECCIÓN AUTOMÁTICA ---
def seleccionar_modelo():
    try:
        modelos_disponibles = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        print(f"🔍 Modelos detectados en tu cuenta: {modelos_disponibles}")
        
        # Prioridad 1: Flash 1.5 (el que queremos por cuota)
        for m in modelos_disponibles:
            if 'gemini-1.5-flash' in m:
                return m
        
        # Prioridad 2: Flash 2.0 (el que te dio 429 antes)
        for m in modelos_disponibles:
            if 'gemini-2.0-flash' in m:
                return m
                
        return 'gemini-pro' # Último recurso
    except Exception as e:
        print(f"⚠️ No se pudo listar modelos: {e}")
        return 'gemini-1.5-flash' # Intento por defecto

# Configuramos el modelo dinámicamente
nombre_modelo = seleccionar_modelo()
print(f"✅ Usando modelo: {nombre_modelo}")
modelo = genai.GenerativeModel(nombre_modelo)

async def analizar_contenido_ia(texto_sucio: str):
    texto_breve = texto_sucio[:3500] 
    
    prompt = f"""
    Responde SOLO JSON puro:
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
        respuesta = await modelo.generate_content_async(prompt)
        
        if not respuesta.text:
            return {"error": "Respuesta vacía de la IA."}

        texto = respuesta.text
        if "```" in texto:
            texto = texto.split("```")[1].replace("json", "").strip()
        
        return json.loads(texto.strip())

    except exceptions.ResourceExhausted:
        return {"error": "Cuota 429 agotada. Google te pide esperar un poco."}
    except Exception as e:
        return {"error": str(e)}