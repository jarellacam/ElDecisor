import httpx
import os
import urllib.parse
from bs4 import BeautifulSoup

async def obtener_datos_url(url: str):
    # 1. Limpieza de URL para evitar errores de protocolo
    url = url.strip()
    if not url.startswith("http"):
        url = f"https://www.amazon.es/dp/{url.split('/')[-1]}" if "/dp/" in url else f"https://{url}"

    # 2. API Key de WebScraping.ai
    # OJO: Asegúrate de que en Vercel la variable se llama EXACTAMENTE así:
    api_key = os.getenv("WEB_SCRAPING_AI_KEY")
    
    if not api_key:
        return {"error": "Configura la variable WEB_SCRAPING_AI_KEY en Vercel"}

    # Construimos la petición al proxy
    params = {
        "api_key": api_key,
        "url": url,
        "proxy": "datacenter", 
        "country": "es"
    }
    proxy_url = f"https://api.webscraping.ai/html?{urllib.parse.urlencode(params)}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            print(f"📡 Solicitando vía Proxy a: {url}")
            response = await client.get(proxy_url)
            
            if response.status_code == 403:
                return {"error": "Límite de créditos agotado o API Key incorrecta."}
            
            if response.status_code != 200:
                return {"error": f"Error del Proxy: {response.status_code}"}

            soup = BeautifulSoup(response.text, 'html.parser')
            
            titulo = _obtener_titulo(soup)
            precio = _obtener_precio(soup)
            
            if "Producto sin título" in titulo:
                return {"error": "Amazon detectó el proxy. Reintentando..."}

            return {
                "titulo": titulo,
                "precio": precio,
                "contenido": soup.get_text(separator=' ', strip=True)[:10000],
                "url": url
            }
        except Exception as e:
            return {"error": f"Fallo de conexión: {str(e)}"}

def _obtener_titulo(soup):
    tag = soup.select_one("span#productTitle") or soup.select_one("h1")
    return tag.get_text(strip=True) if tag else "Producto sin título"

def _obtener_precio(soup):
    tag = soup.select_one(".a-price .a-offscreen") or soup.select_one(".a-price-whole")
    return tag.get_text(strip=True) if tag else "Consultar precio"