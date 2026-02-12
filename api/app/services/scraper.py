import httpx
import os
import urllib.parse
from bs4 import BeautifulSoup

async def obtener_datos_url(url: str):
    # 1. Limpieza de URL
    url = url.strip()
    if not url.startswith("http"):
        url = f"https://www.amazon.es/dp/{url.split('/')[-1]}" if "/dp/" in url else f"https://{url}"

    # 2. API Key (Asegúrate de que en Vercel se llama WEB_SCRAPING_API_KEY)
    api_key = os.getenv("WEB_SCRAPING_API_KEY")
    
    if not api_key:
        return {"error": "Falta la configuración de WEB_SCRAPING_API_KEY"}

    # 3. Configuración del Proxy
    params = {
        "api_key": api_key,
        "url": url,
        "proxy": "datacenter", 
        "country": "es"
    }
    proxy_url = f"https://api.webscraping.ai/html?{urllib.parse.urlencode(params)}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            print(f"📡 Solicitando: {url}")
            response = await client.get(proxy_url)
            
            if response.status_code == 403:
                return {"error": "Créditos agotados en WebScraping.ai"}
            
            if response.status_code != 200:
                return {"error": f"Error del Proxy: {response.status_code}"}

            soup = BeautifulSoup(response.text, 'html.parser')
            
            titulo = _obtener_titulo(soup)
            precio = _obtener_precio(soup)
            
            # Verificación de bloqueo por Amazon
            if "Producto sin título" in titulo or "captcha" in response.text.lower():
                return {"error": "Amazon bloqueó el acceso. Intenta con un proxy residencial."}

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
    return tag.get_text(strip=True) if tag else "Precio no disponible"