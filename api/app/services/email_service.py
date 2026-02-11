import resend
import os

resend.api_key = os.getenv("RESEND_API_KEY")

def enviar_aviso_chollo(email_destino, nombre_producto, precio_viejo, precio_nuevo, url_afiliado):
    params = {
        "from": "El Decisor IA <ofertas@tu-dominio.com>",
        "to": [email_destino],
        "subject": f"¡BAJADA DE PRECIO! {nombre_producto}",
        "html": f"""
            <h1>¡El producto que vigilabas ha bajado!</h1>
            <p>Buenas noticias, el <strong>{nombre_producto}</strong> ha bajado de precio.</p>
            <p>Antes: <strike>{precio_viejo}</strike> | <strong>Ahora: {precio_nuevo}</strong></p>
            <a href="{url_afiliado}" style="background: #4f46e5; color: white; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold;">
                APROVECHAR CHOLLO 🛒
            </a>
            <p>Date prisa, las ofertas suelen volar.</p>
        """,
    }
    resend.Emails.send(params)