// frontend/src/utils/affiliate.js

const IDS = {
  amazon: "eldecisor-20", 
  shein: "3J3AL",
  temu: "tu_id_temu" // Cámbialo cuando lo tengas
};

export const generateAffiliateLink = (urlStr) => {
  if (!urlStr) return "#";

  try {
    // 1. Limpieza básica y validación
    const cleanUrl = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    const url = new URL(cleanUrl);
    const domain = url.hostname.toLowerCase();

    // --- CASO AMAZON ---
    if (domain.includes("amazon")) {
      // Intentamos sacar el ASIN para un link más limpio
      const asinMatch = cleanUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
      if (asinMatch && asinMatch[1]) {
        return `https://www.amazon.es/dp/${asinMatch[1]}?tag=${IDS.amazon}`;
      }
      url.searchParams.set("tag", IDS.amazon);
      return url.toString();
    }

    // --- CASO SHEIN (Funciona para productos y para BÚSQUEDAS) ---
    if (domain.includes("shein")) {
      // Shein usa url_from y aff_code para rastrear sesiones de búsqueda también
      url.searchParams.set("url_from", IDS.shein);
      url.searchParams.set("aff_code", IDS.shein);
      return url.toString();
    }

    // --- CASO TEMU ---
    if (domain.includes("temu")) {
      url.searchParams.set("referral_code", IDS.temu);
      return url.toString();
    }

    return cleanUrl;
  } catch (error) {
    console.error("Error en affiliate link:", error);
    return urlStr;
  }
};