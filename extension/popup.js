document.addEventListener('DOMContentLoaded', function() {
  // 1. Obtener URL de la pestaña activa
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    document.getElementById('url-actual').textContent = currentUrl;

    // 2. Evento del botón
    document.getElementById('btn-analizar').addEventListener('click', async () => {
      const btn = document.getElementById('btn-analizar');
      const resultadoDiv = document.getElementById('resultado');
      
      btn.textContent = "Analizando...";
      btn.disabled = true;

      try {
        // LLAMADA A TU BACKEND (Ahora local, luego será https://api.eldecisor.com)
        const response = await fetch('http://localhost:8000/api/analizar', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ url: currentUrl })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.detail);

        // 3. Mostrar resultados
        document.getElementById('veredicto-texto').textContent = "VEREDICTO: " + data.analisis_ia.veredicto_valor;
        document.getElementById('precio-texto').textContent = data.datos_web.precio;
        
        // Enlace al análisis completo en tu web
        const slug = data.datos_web.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Cuando despliegues, cambia localhost:5173 por https://eldecisor.com
        document.getElementById('link-completo').href = `http://localhost:5173/analisis/${slug}`; 

        resultadoDiv.style.display = 'block';
        btn.style.display = 'none'; // Ocultamos el botón tras analizar

      } catch (error) {
        btn.textContent = "Error: Intenta de nuevo";
        btn.disabled = false;
        alert("Error: " + error.message);
      }
    });
  });
});