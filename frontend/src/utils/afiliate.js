// frontend/src/utils/affiliate.js

const IDS = {
  amazon: "eldecisor-20", 
  shein: "3J3AL",        // ✅ Tu código de referido
  temu: "tu_code_temu"   
};

export const generateAffiliateLink = (originalUrl) => {
  if (!originalUrl) return "#";

  try {
    const url = new URL(originalUrl);
    const domain = url.hostname;

    // --- LÓGICA PARA SHEIN ---
    if (domain.includes("shein")) {
      // 1. Quitamos todos los parámetros que ya traiga la URL
      const baseUrl = originalUrl.split('?')[0];
      
      // 2. Construimos el enlace con tus parámetros de afiliado
      // Usamos 'url_from' y 'aff_code' para asegurar la comisión
      return `${baseUrl}?url_from=${IDS.shein}&aff_code=${IDS.shein}`;
    }

    // --- LÓGICA PARA AMAZON ---
    if (domain.includes("amazon")) {
      const asinMatch = originalUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
      if (asinMatch && asinMatch[1]) {
        return `https://www.amazon.es/dp/${asinMatch[1]}?tag=${IDS.amazon}`;
      }
    }

    // Si no es ninguna de las anteriores, devolver la original
    return originalUrl;

  } catch (error) {
    return originalUrl;
  }
};