import httpx
from bs4 import BeautifulSoup
import re
import random
import asyncio

# Lista de User-Agents modernos y reales
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0"
]

async def obtener_datos_url(url: str):
    # Cabeceras "Pro" para engañar a Amazon
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "es-ES,es;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1", # Do Not Track
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Referer": "https://www.google.com/",
    }

    # Usamos límites de conexión más realistas
    limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)
    
    async with httpx.AsyncClient(
        follow_redirects=True, 
        timeout=20.0, 
        limits=limits,
        http2=True # Amazon prefiere HTTP/2
    ) as client:
        try:
            # Añadimos un pequeño retraso aleatorio para no ser tan "robóticos"
            await asyncio.sleep(random.uniform(0.5, 1.5))
            
            response = await client.get(url, headers=headers)
            
            # Si Amazon nos da 500 o 503, es un bloqueo de IP
            if response.status_code in [500, 503]:
                print(f"Amazon ha bloqueado la petición (Status {response.status_code})")
                return {"error": "Amazon ha bloqueado el acceso temporalmente. Inténtalo en unos minutos."}
            
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Verificación de CAPTCHA
            if "api-services-support@amazon.com" in response.text or "captcha" in response.text.lower():
                return {"error": "Amazon solicita verificación humana (CAPTCHA)."}

            titulo = _obtener_titulo(soup)
            precio = _obtener_precio(soup)
            contenido = _limpiar_texto(soup.get_text(separator=' ', strip=True))

            return {
                "titulo": titulo,
                "precio": precio,
                "contenido": contenido[:15000],
                "url": url
            }

        except httpx.HTTPStatusError as e:
            print(f"Error de estado: {e.response.status_code} para {url}")
            return {"error": f"Amazon respondió con error {e.response.status_code}"}
        except Exception as e:
            print(f"Error scraping crítico: {e}")
            return {"error": "No se pudo extraer la información del producto."}

def _obtener_titulo(soup):
    selectores = ["span#productTitle", "h1#title", "h1", ".product-title"]
    for selector in selectores:
        tag = soup.select_one(selector)
        if tag:
            return tag.get_text(strip=True)
    return "Producto sin título"

def _obtener_precio(soup):
    # Amazon cambia mucho el precio, buscamos en varios sitios
    selectores_precio = [
        ".a-price .a-offscreen", 
        "#priceblock_ourprice", 
        "#priceblock_dealprice",
        ".a-price-whole"
    ]
    for selector in selectores_precio:
        tag = soup.select_one(selector)
        if tag:
            return tag.get_text(strip=True)
    return "Consultar precio"

def _limpiar_texto(texto):
    return re.sub(r'\s+', ' ', texto).strip()