const API_URL = 'https://eldecisor-production.up.railway.app';
const WEB_URL = 'https://eldecisor.com';             // <--- PEGA TU URL DE VERCEL

// ==========================================
// 1. ESTILOS (CSS) INYECTADOS
// ==========================================
const style = document.createElement('style');
style.textContent = `
  .el-decisor-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.6); z-index: 999999;
    backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center;
    animation: fadeIn 0.2s ease-out;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  .el-decisor-modal {
    background: white; width: 90%; max-width: 420px;
    border-radius: 28px; padding: 30px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    position: relative; 
    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-align: left; color: #1e293b;
  }
  .el-decisor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .el-decisor-title { font-weight: 800; font-size: 20px; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px; }
  .el-decisor-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #64748b; font-weight: bold; font-size: 18px; transition: all 0.2s; }
  .el-decisor-close:hover { background: #e2e8f0; color: #0f172a; }
  .el-decisor-veredicto { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 18px; color: white; }
  .el-decisor-resumen { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; background: #f8fafc; padding: 20px; border-radius: 20px; border: 1px solid #f1f5f9; font-style: italic; }
  .el-decisor-btn-main {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; background: #4F46E5; color: white;
    padding: 16px; border-radius: 16px;
    text-decoration: none; font-weight: 700; font-size: 15px;
    transition: all 0.2s; border: none; cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
  }
  .el-decisor-btn-main:hover { background: #4338ca; transform: translateY(-2px); box-shadow: 0 15px 20px -3px rgba(79, 70, 229, 0.4); }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;
document.head.appendChild(style);

// ==========================================
// 2. CREACIÓN DEL BOTÓN FLOTANTE
// ==========================================
const boton = document.createElement("button");
boton.innerHTML = `<span style="font-size: 18px;"></span> Analizar Chollo`;
boton.id = "el-decisor-btn";

Object.assign(boton.style, {
  position: "fixed", bottom: "30px", right: "30px", zIndex: "99999",
  backgroundColor: "#0f172a", color: "white", border: "none",
  borderRadius: "16px", padding: "14px 24px", fontSize: "15px",
  fontWeight: "800", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
  cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex", alignItems: "center", gap: "10px"
});

boton.onmouseover = () => {
    boton.style.transform = "translateY(-5px) scale(1.05)";
    boton.style.backgroundColor = "#4F46E5";
};
boton.onmouseout = () => {
    boton.style.transform = "translateY(0) scale(1)";
    boton.style.backgroundColor = "#0f172a";
};
document.body.appendChild(boton);

// ==========================================
// 3. LÓGICA DE ANÁLISIS
// ==========================================
boton.addEventListener("click", async () => {
  const textoOriginal = boton.innerHTML;
  boton.innerHTML = `⌛ <span style="margin-left:5px">IA Analizando...</span>`;
  boton.disabled = true;

  try {
    const currentUrl = window.location.href;
    
    const response = await fetch(`${API_URL}/api/analizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: currentUrl }),
      mode: 'cors', // Aseguramos modo CORS
      credentials: 'omit' // <--- ESTO evita el conflicto con el backend
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Error de conexión");

    const veredicto = data.analisis_ia.veredicto_valor.toLowerCase();
    const esPositivo = veredicto === 'alto' || veredicto === 'positivo';
    const colorVeredicto = esPositivo ? "#10B981" : "#F59E0B";
    const textoVeredicto = esPositivo ? "Veredicto: Compra Segura" : "Veredicto: Precaución";
    const iconoVeredicto = esPositivo ? "✅" : "⚠️";
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
      <div class="el-decisor-overlay" id="decisor-modal">
        <div class="el-decisor-modal">
          <div class="el-decisor-header">
            <h3 class="el-decisor-title">El Decisor </h3>
            <button class="el-decisor-close" id="cerrar-modal">✕</button>
          </div>
          
          <div class="el-decisor-veredicto" style="background-color: ${colorVeredicto}">
            <span>${iconoVeredicto}</span> ${textoVeredicto}
          </div>

          <div class="el-decisor-resumen">
            "${data.analisis_ia.resumen_ejecutivo}"
          </div>

          <a href="${WEB_URL}/analisis/${data.slug}" target="_blank" class="el-decisor-btn-main">
            Ver ofertas en Temu/Shein 💸
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modalContainer);

    document.getElementById('cerrar-modal').onclick = () => modalContainer.remove();
    document.getElementById('decisor-modal').onclick = (e) => {
        if(e.target.id === 'decisor-modal') modalContainer.remove();
    };

    boton.innerHTML = `Analizado`;
    boton.style.backgroundColor = colorVeredicto;
    
    setTimeout(() => {
        boton.disabled = false;
        boton.innerHTML = textoOriginal;
        boton.style.backgroundColor = "#0f172a";
    }, 3000);

  } catch (error) {
    console.error(error);
    alert("Vaya, la IA está saturada. Prueba en un momento.");
    boton.innerHTML = `Reintentar`;
    boton.disabled = false;
  }
});