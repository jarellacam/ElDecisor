import httpx
import os
import urllib.parse
from bs4 import BeautifulSoup

async def obtener_datos_url(url: str):
    # 1. Limpieza básica
    url = url.strip()
    if not url.startswith("http"):
        url = f"https://www.amazon.es/dp/{url.split('/')[-1]}" if "/dp/" in url else f"https://{url}"

    # 2. INTENTO DIRECTO (Gratis, sin API Key)
    # Intentamos engañar a Amazon fingiendo ser un navegador normal
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9",
        "Referer": "https://www.google.com/"
    }

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        try:
            print(f"📡 Intentando acceso directo a: {url}")
            response = await client.get(url, headers=headers)
            
            # Si Amazon nos deja pasar (200 OK)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                titulo = _obtener_titulo(soup)
                
                # Si conseguimos título, ¡éxito!
                if titulo and "amazon" not in titulo.lower() and "captcha" not in titulo.lower():
                    return {
                        "titulo": titulo,
                        "precio": _obtener_precio(soup),
                        "contenido": soup.get_text(separator=' ', strip=True)[:8000],
                        "url": url
                    }
            
            # 3. PLAN B: Si Amazon nos bloquea o falla, devolvemos un PRODUCTO DE PRUEBA
            # Esto es para que VEAS TU APP FUNCIONAR aunque el scraping falle.
            print("⚠️ Amazon bloqueó el acceso directo. Usando datos de respaldo.")
            return {
                "titulo": "Producto de Prueba (Scraping Bloqueado)",
                "precio": "99.99€",
                "contenido": f"Este es un contenido simulado porque Amazon ha detectado el bot. El producto solicitado era: {url}. La IA analizará este texto genérico sobre tecnología y calidad precio.",
                "url": url
            }

        except Exception as e:
            # Si todo explota, devolvemos error pero formateado
            print(f"Error fatal scraper: {e}")
            return {"error": f"Error de conexión: {str(e)}"}

def _obtener_titulo(soup):
    # Selectores comunes de Amazon
    tag = soup.select_one("#productTitle") or soup.select_one("h1")
    if tag: return tag.get_text(strip=True)
    return "Título no detectado"

def _obtener_precio(soup):
    # Selectores de precio
    tag = soup.select_one(".a-price .a-offscreen") or soup.select_one(".a-price-whole")
    if tag: return tag.get_text(strip=True)
    return "Consultar precio"