import asyncio
from app.services.db_service import supabase
from app.services.scraper import obtener_datos_url
from app.services.email_service import enviar_aviso_chollo

async def ejecutar_vigilancia():
    print("Iniciando ronda de vigilancia de precios...")
    
    # 1. Traemos todas las suscripciones activas
    suscripciones = supabase.table("suscripciones").select("*").execute()
    
    for sub in suscripciones.data:
        email = sub['email']
        url = sub['url_producto']
        
        # 2. Scrapeamos el precio actual en vivo
        datos_frescos = await obtener_datos_url(url)
        precio_nuevo = datos_frescos.get("precio")
        
        # 3. Buscamos el precio original en nuestra tabla de analisis
        analisis = supabase.table("analisis").select("precio, titulo, slug").eq("url", url).single().execute()
        precio_antiguo = analisis.data['precio']
        titulo = analisis.data['titulo']
        
        # 4. Lógica de comparación simple (si el precio es distinto y no es "No detectado")
        if precio_nuevo != "No detectado" and precio_nuevo != precio_antiguo:
            print(f"!CHOLLO DETECTADO! {titulo}: {precio_antiguo} -> {precio_nuevo}")
            
            # Generamos URL de afiliado
            url_afiliado = f"{url}?tag=TU_TAG_AFILIADO"
            
            # 5. Enviamos el email
            enviar_aviso_chollo(email, titulo, precio_antiguo, precio_nuevo, url_afiliado)
            
            # 6. (Opcional) Borramos la suscripción o marcamos como avisado para no spamear
            supabase.table("suscripciones").delete().eq("id", sub['id']).execute()

if __name__ == "__main__":
    asyncio.run(ejecutar_vigilancia())