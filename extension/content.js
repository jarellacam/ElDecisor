// ==========================================
// 1. ESTILOS (CSS) INYECTADOS
// ==========================================
const style = document.createElement('style');
style.textContent = `
  .el-decisor-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5); z-index: 9998;
    backdrop-filter: blur(2px);
    display: flex; justify-content: center; align-items: center;
    animation: fadeIn 0.2s ease-out;
  }
  .el-decisor-modal {
    background: white; width: 90%; max-width: 450px;
    border-radius: 20px; padding: 25px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    font-family: 'Segoe UI', sans-serif;
    position: relative; z-index: 9999;
    animation: slideUp 0.3s ease-out;
    text-align: left; color: #334155;
  }
  .el-decisor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
  .el-decisor-title { font-weight: 900; font-size: 18px; color: #1e293b; line-height: 1.3; margin: 0; }
  .el-decisor-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; }
  .el-decisor-veredicto { display: inline-block; padding: 5px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; margin-bottom: 15px; color: white; }
  .el-decisor-resumen { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
  .el-decisor-btn-main {
    display: block; width: 100%; background: #4F46E5; color: white;
    text-align: center; padding: 12px; border-radius: 12px;
    text-decoration: none; font-weight: bold; font-size: 14px;
    transition: transform 0.2s; border: none; cursor: pointer;
  }
  .el-decisor-btn-main:hover { background: #4338ca; transform: scale(1.02); }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;
document.head.appendChild(style);

// ==========================================
// 2. CREACIÓN DEL BOTÓN FLOTANTE
// ==========================================
const boton = document.createElement("button");
boton.innerText = "Realizar Análisis";
boton.id = "el-decisor-btn";

Object.assign(boton.style, {
  position: "fixed", bottom: "20px", right: "20px", zIndex: "9990",
  backgroundColor: "#4F46E5", color: "white", border: "none",
  borderRadius: "50px", padding: "12px 20px", fontSize: "15px",
  fontWeight: "bold", boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
  cursor: "pointer", transition: "transform 0.2s"
});

boton.onmouseover = () => boton.style.transform = "scale(1.05)";
boton.onmouseout = () => boton.style.transform = "scale(1)";
document.body.appendChild(boton);

// ==========================================
// 3. LÓGICA DE ANÁLISIS
// ==========================================
boton.addEventListener("click", async () => {
  const textoOriginal = boton.innerText;
  boton.innerText = "⏳ Pensando...";
  boton.disabled = true;

  try {
    const currentUrl = window.location.href;
    
    // FETCH AL BACKEND
    const response = await fetch('http://localhost:8000/api/analizar', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ url: currentUrl })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.detail || "Error de conexión");
    if (!data.analisis_ia) throw new Error("Datos incompletos");

    // PREPARAR DATOS
    const veredicto = data.analisis_ia.veredicto_valor.toLowerCase();
    const esPositivo = veredicto === 'alto' || veredicto === 'positivo';
    const colorVeredicto = esPositivo ? "#10B981" : "#F59E0B";
    const textoVeredicto = esPositivo ? "✅ COMPRA RECOMENDADA" : "⚠️ PRECAUCIÓN";
    
    // CREAR LA VENTANA MODAL (HTML)
    const modalHTML = `
      <div class="el-decisor-overlay" id="decisor-modal">
        <div class="el-decisor-modal">
          <div class="el-decisor-header">
            <h3 class="el-decisor-title">Análisis Rápido IA</h3>
            <button class="el-decisor-close" id="cerrar-modal">×</button>
          </div>
          
          <div class="el-decisor-veredicto" style="background-color: ${colorVeredicto}">
            ${textoVeredicto}
          </div>

          <div class="el-decisor-resumen">
            "${data.analisis_ia.resumen_ejecutivo}"
          </div>

          <a href="http://localhost:5173/analisis/${data.slug}" target="_blank" class="el-decisor-btn-main">
            Ver ofertas alternativas y detalle
          </a>
        </div>
      </div>
    `;

    // INYECTAR MODAL
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    // FUNCION CERRAR
    document.getElementById('cerrar-modal').onclick = () => {
        modalContainer.remove();
    };
    
    // CERRAR SI CLIC FUERA
    document.getElementById('decisor-modal').onclick = (e) => {
        if(e.target.id === 'decisor-modal') modalContainer.remove();
    };

    // RESTAURAR BOTÓN
    boton.innerText = "Analizado";
    boton.style.backgroundColor = colorVeredicto;
    
    setTimeout(() => {
        boton.disabled = false;
        boton.innerText = textoOriginal;
        boton.style.backgroundColor = "#4F46E5";
    }, 3000);

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
    boton.innerText = "❌ Error";
    boton.disabled = false;
  }
});