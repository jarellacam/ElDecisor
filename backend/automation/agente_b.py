import os
import requests
import time

# --- CONFIGURACIÓN DINÁMICA ---
API_URL = os.getenv("VITE_API_URL", "https://eldecisor.com/api/analizar")
def agente_a_buscador():
    """
    Este es el Agente A. Por ahora tiene una lista, pero aquí es donde 
    pondremos el scraper que busca en Amazon solo.
    """
    print("Agente A: Buscando tendencias en Amazon y Shein...")
    # Imagina que esto viene de un scraper automático
    links_encontrados = [
        "https://www.amazon.es/dp/B0CXF2997B",
        "https://www.amazon.es/dp/B0D1G5K6L2",
        "https://es.shein.com/pdsearch/sudadera-oversize-hombre"
    ]
    return links_encontrados

def ejecutar_agente_analizador(lista_urls):
    """
    Este es el Agente B. Recibe la lista y dispara la API.
    """
    print(f"Agente B: Procesando {len(lista_urls)} productos...")
    
    for i, url in enumerate(lista_urls, 1):
        print(f"\n[{i}/{len(lista_urls)}] ⚙️ Analizando: {url}")
        
        try:
            # Enviamos el JSON con la URL a tu API de Vercel
            response = requests.post(
                API_URL, 
                json={"url": url}, 
                timeout=90 # Damos margen por si la IA está lenta
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"CREADO: {data.get('slug')}")
            elif response.status_code == 429:
                print("Límite de velocidad. Saltando...")
            else:
                print(f" Error {response.status_code}: {response.text[:100]}")
                
        except Exception as e:
            print(f"Fallo de conexión: {e}")
        
        # Pausa para evitar que Amazon o tu API detecten tráfico bot masivo
        if i < len(lista_urls):
            time.sleep(5)

def main():
    print("INICIANDO SISTEMA AUTOMÁTICO 'EL DECISOR'")
    
    # 1. El Agente A busca los links
    productos = agente_a_buscador()
    
    # 2. El Agente B los procesa
    if productos:
        ejecutar_agente_analizador(productos)
    
    print("\nCICLO COMPLETADO CON ÉXITO")

if __name__ == "__main__":
    main()