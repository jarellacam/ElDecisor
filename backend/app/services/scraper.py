import httpx
from bs4 import BeautifulSoup
import re
import random

# Lista de User-Agents para que Amazon no sepa que somos un robot
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
]

async def obtener_datos_url(url: str):
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Referer": "https://www.google.com/"
    }

    async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 1. TÍTULO
            titulo = _obtener_titulo(soup)
            
            # 2. PRECIO (MEJORADO PARA DECIMALES)
            precio = _obtener_precio(soup)
            
            # 3. CONTENIDO (Para la IA)
            contenido = _limpiar_texto(soup.get_text(separator=' ', strip=True))

            return {
                "titulo": titulo,
                "precio": precio,
                "contenido": contenido[:15000], # Limitamos para no saturar a Gemini
                "url": url
            }

        except Exception as e:
            print(f"Error scraping: {e}")
            return {"error": f"No se pudo leer la página: {str(e)}"}

def _obtener_titulo(soup):
    # Intentamos selectores comunes de Amazon, Shein, Temu, eBay
    selectores = [
        "span#productTitle",           # Amazon
        "h1#title",                    # Amazon secundario
        "h1.product-title-text",       # AliExpress/Shein
        "h1.detail-goods-name",        # Temu
        "h1.x-item-title__mainTitle",  # eBay
        "h1"                           # Genérico
    ]
    
    for selector in selectores:
        tag = soup.select_one(selector)
        if tag:
            return tag.get_text(strip=True)
    return "Producto sin título detectado"

def _obtener_precio(soup):
    """
    Lógica de francotirador para capturar el precio exacto (4,20 €)
    """
    
    # 1. ESTRATEGIA: BUSCAR EN BLOQUES PRINCIPALES (Los más fiables)
    # Amazon suele poner el precio principal dentro de estos IDs específicos.
    bloques_fiables = [
        "#corePriceDisplay_desktop_feature_div", # Diseño moderno
        "#corePrice_feature_div",                # Diseño estándar
        "#apex_desktop",                         # Diseño clásico
        "#price",                                # Libros / Kindle
        "#priceblock_ourprice",                  # Antiguo
        "#priceblock_dealprice"                  # Ofertas flash
    ]

    for bloque in bloques_fiables:
        contenedor = soup.select_one(bloque)
        if contenedor:
            # A) Intentamos el precio oculto "bonito" (ej: "14,99 €") dentro de ese bloque
            precio_oculto = contenedor.select_one(".a-offscreen")
            if precio_oculto:
                texto = precio_oculto.get_text(strip=True)
                if texto: return texto
            
            # B) Si no hay oculto, lo reconstruimos manualmente (Entero + Decimal)
            # Buscamos SOLO dentro de este contenedor para no mezclar datos
            entero = contenedor.select_one(".a-price-whole")
            fraccion = contenedor.select_one(".a-price-fraction")
            simbolo = contenedor.select_one(".a-price-symbol")
            
            if entero:
                txt_entero = entero.get_text(strip=True).replace('.', '').replace(',', '') # Limpiamos puntos
                txt_fraccion = fraccion.get_text(strip=True) if fraccion else "00"
                txt_simbolo = simbolo.get_text(strip=True) if simbolo else "€"
                
                # Devolvemos formato estándar español: 4,20 €
                return f"{txt_entero},{txt_fraccion} {txt_simbolo}"

    # 2. ESTRATEGIA: BUSQUEDA GENÉRICA INTELIGENTE (Para Shein, Temu, eBay)
    # Si fallan los bloques de Amazon, buscamos selectores universales
    
    # Intento 1: Precio offscreen genérico (el primero que aparezca)
    offscreen_generico = soup.select_one(".a-price .a-offscreen")
    if offscreen_generico:
        return offscreen_generico.get_text(strip=True)

    # Intento 2: Selectores de otras tiendas
    selectores_tiendas = [
        ".product-price-value",       # Shein
        ".g-price",                   # Temu
        ".x-price-primary",           # eBay
        "[data-test='product-price']",
        ".price",                     # Genérico
        ".current-price"              # Genérico tiendas ropa
    ]

    for selector in selectores_tiendas:
        tag = soup.select_one(selector)
        if tag:
            return tag.get_text(strip=True)

    return "No detectado"

def _limpiar_texto(texto):
    """Limpia espacios extra y saltos de línea"""
    return re.sub(r'\s+', ' ', texto).strip()