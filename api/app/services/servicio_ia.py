import os
import json
import asyncio
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

# Cargamos variables .env
load_dotenv()

# Configuramos IA
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Cambiamos a 1.5-flash para mayor estabilidad y cuota
modelo = genai.GenerativeModel('gemini-2.5-flash')

async def analizar_contenido_ia(texto_sucio: str):
    texto_breve = texto_sucio[:3000] 
    max_reintentos = 3
    espera_inicial = 5  # segundos

    prompt = f"""
    Analiza el siguiente texto extraído de una web:
    "{texto_breve}"
    
    Responde ÚNICAMENTE en formato JSON puro, sin bloques de código markdown, con esta estructura:
    {{
        "tipo_contenido": "producto" o "noticia" o "otro",
        "resumen_ejecutivo": "máximo 20 palabras",
        "puntos_clave": ["punto 1", "punto 2", "punto 3"],
        "veredicto_valor": "alto/medio/bajo",
        "explicacion": "breve explicación de por qué"
    }}
    """

    for intento in range(max_reintentos):
        try:
            # Llamada asíncrona a la IA
            respuesta = await modelo.generate_content_async(prompt)
            texto_respuesta = respuesta.text

            # Limpieza de seguridad
            limpio = texto_respuesta.replace("```json", "").replace("```", "").strip()
            return json.loads(limpio)

        except exceptions.ResourceExhausted:
            # Error 429: Cuota excedida
            tiempo_espera = espera_inicial * (intento + 1)
            print(f"Cuota agotada. Reintento {intento + 1}/{max_reintentos} en {tiempo_espera}s...")
            await asyncio.sleep(tiempo_espera)
            continue

        except json.JSONDecodeError:
            return {
                "error": "La IA no devolvió un formato válido",
                "respuesta_cruda": texto_respuesta[:100] if 'texto_respuesta' in locals() else ""
            }
            
        except Exception as e:
            # Si es el último intento y falla, devolvemos el error
            if intento == max_reintentos - 1:
                return {"error": f"La IA se ha mareado tras varios intentos: {str(e)}"}
            
            await asyncio.sleep(2)
            continue

    return {"error": "No se pudo obtener respuesta de la IA después de varios reintentos."}