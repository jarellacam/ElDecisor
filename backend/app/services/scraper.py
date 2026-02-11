import re
import httpx
from bs4 import BeautifulSoup

async def obtener_datos_url(url: str):
    headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
        }
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            resp = await client.get(url, headers=headers, timeout=15.0)
            soup = BeautifulSoup(resp.text, 'html.parser')
            precio = "No detectado"

            # Lógica de detección por tienda
            if "amazon" in url:
                el = soup.select_one(".a-price-whole")
                if el: precio = f"{el.get_text().strip()}€"
            
            elif "temu" in url:
                # Temu suele usar clases descriptivas o atributos de datos
                el = soup.select_one("[class*='price'], [class*='Price']")
                if el: precio = el.get_text().strip()

            elif "shein" in url:
                # Shein usa etiquetas específicas para el precio de venta
                el = soup.select_one(".product-item__price, .price-discount")
                if el: precio = el.get_text().strip()
            
            # Si falla el selector específico, usamos el radar de Regex (el salvavidas)
            if precio == "No detectado":
                match = re.search(r'(\d+[,.]\d{2})\s?€', resp.text)
                if match: precio = f"{match.group(1)}€"

            # Limpieza de contenido para la IA
            for s in soup(['script', 'style', 'nav', 'footer']): s.decompose()
            
            return {
                "titulo": soup.title.string[:70] if soup.title else "Producto sin nombre",
                "contenido": soup.get_text(separator=' ', strip=True)[:4000],
                "precio": precio,
                "url_original": str(resp.url)
            }
        except Exception as e:
            return {"error": f"Error al leer la web: {str(e)}"}