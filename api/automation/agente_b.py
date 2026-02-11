import os
import requests
import time
import random
from bs4 import BeautifulSoup

API_URL = os.getenv("VITE_API_URL", "https://eldecisor.com/api/analizar")

# Cabeceras para que Amazon crea que somos un navegador normal (y no un robot)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
}

def agente_a_cazador_amazon():
    """
    Agente A: Entra en 'Movers and Shakers' de Amazon y extrae los top productos.
    """
    print("AGENTE A: Escaneando tendencias en Amazon España...")
    
    # URL de "Los más deseados" o "Movers & Shakers" en Electrónica/Hogar
    url_objetivo = "https://www.amazon.es/gp/movers-and-shakers/electronics" 
    
    lista_productos = []
    
    try:
        response = requests.get(url_objetivo, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Buscamos los enlaces de los productos en la rejilla
            # Amazon suele usar clases como 'a-link-normal' dentro de los div de producto
            enlaces = soup.find_all('a', class_='a-link-normal')
            
            for link in enlaces:
                href = link.get('href')
                # Filtramos para quedarnos solo con enlaces de productos reales (/dp/)
                if href and '/dp/' in href:
                    # Construimos la URL completa limpia
                    url_completa = "https://www.amazon.es" + href.split('/ref=')[0]
                    
                    if url_completa not in lista_productos:
                        lista_productos.append(url_completa)
            
            # Limitamos a 5 productos para no saturar tu API al principio
            top_5 = lista_productos[:5]
            print(f"Agente A: Encontrados {len(top_5)} productos en tendencia.")
            return top_5
        else:
            print(f"Error al conectar con Amazon: {response.status_code}")
            return []
            
    except Exception as e:
        print(f" Agente A ha fallado: {e}")
        return []

def agente_b_analizador(lista_urls):
    """
    Agente B: Recibe la lista y la procesa con tu IA.
    """
    print(f"AGENTE B: Procesando {len(lista_urls)} productos...")
    
    for i, url in enumerate(lista_urls, 1):
        print(f"\n[{i}/{len(lista_urls)}] ⚙️ Analizando: {url}")
        
        try:
            response = requests.post(
                API_URL, 
                json={"url": url}, 
                timeout=90 
            )
            
            if response.status_code == 200:
                data = response.json()
                slug = data.get('slug')
                print(f"PUBLICADO: https://eldecisor.com/analisis/{slug}")
            elif response.status_code == 429:
                print("Rate Limit: Demasiadas peticiones. Saltando...")
            else:
                print(f"Error API: {response.status_code}")
                
        except Exception as e:
            print(f"Error conexión: {e}")
        
        # Pausa aleatoria entre 5 y 10 segundos para parecer humano
        time.sleep(random.uniform(5, 10))

def main():
    print("INICIANDO SISTEMA AUTOMÁTICO 'EL DECISOR'")
    
    # 1. Ejecutamos el Cazador
    productos_tendencia = agente_a_cazador_amazon()
    
    # 2. Si encontramos algo, lo analizamos
    if productos_tendencia:
        agente_b_analizador(productos_tendencia)
    else:
        print("⚠️ No se encontraron productos nuevos. Usando lista de respaldo...")
        # Lista de seguridad por si Amazon nos bloquea
        backup = ["https://www.amazon.es/dp/B0CXF2997B"]
        agente_b_analizador(backup)
    
    print("\n✅ CICLO DIARIO COMPLETADO")

if __name__ == "__main__":
    main()