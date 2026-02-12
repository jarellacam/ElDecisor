import os
import json
from google import genai
from google.genai import types

async def analizar_contenido_ia(texto_web: str):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "Falta GEMINI_API_KEY en Vercel"}

    try:
        # Iniciamos el cliente con la nueva librería
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        Eres un experto analista de compras forense. Analiza el siguiente texto extraído de una tienda online y devuelve un JSON estricto con esta estructura exacta:
        {{
            "nombre_producto": "Nombre corto del producto",
            "puntos_clave": ["✅ Punto positivo 1", "✅ Punto positivo 2", "❌ Punto negativo 1", "❌ Punto negativo 2"],
            "veredicto": "Compra Recomendada" o "Precaución" o "No Recomendada",
            "resumen": "Un resumen de 2 líneas sobre si merece la pena.",
            "veredicto_valor": "alto", # Usa "alto", "medio" o "bajo" (en minúsculas)
            "metricas": [
                {{"subject": "Calidad", "A": 90}},
                {{"subject": "Precio", "A": 60}},
                {{"subject": "Fiabilidad", "A": 85}},
                {{"subject": "Opiniones", "A": 80}},
                {{"subject": "Popularidad", "A": 95}}
            ]
        }}
        
        TEXTO A ANALIZAR:
        {texto_web[:4000]} 
        """

        # Llamada a la IA forzando que devuelva un JSON válido
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        return json.loads(response.text)

    except Exception as e:
        print(f"Error en Gemini GenAI: {e}")
        return {"error": str(e)}