// frontend/src/helpers/links.js

const IDS = {
  amazon: "eldecisor-20", 
  shein: "3J3AL",
  temu: "tu_id_temu" // Cámbialo cuando lo tengas de Temu
};

export const generateAffiliateLink = (urlStr) => {
  if (!urlStr || urlStr === "#") return "#";

  try {
    // 1. Limpieza y validación de protocolo
    const cleanUrl = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    const url = new URL(cleanUrl);
    const domain = url.hostname.toLowerCase();

    // --- CASO AMAZON ---
    if (domain.includes("amazon")) {
      const asinMatch = cleanUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
      if (asinMatch && asinMatch[1]) {
        return `https://www.amazon.es/dp/${asinMatch[1]}?tag=${IDS.amazon}`;
      }
      url.searchParams.set("tag", IDS.amazon);
      return url.toString();
    }

    // --- CASO SHEIN ---
    if (domain.includes("shein")) {
      // Forzamos los parámetros de afiliado en la URL
      url.searchParams.set("url_from", IDS.shein);
      url.searchParams.set("aff_code", IDS.shein);
      return url.toString();
    }

    // --- CASO TEMU ---
    if (domain.includes("temu")) {
      url.searchParams.set("referral_code", IDS.temu);
      return url.toString();
    }

    // Si no es ninguna de las anteriores, devolvemos la URL limpia
    return cleanUrl;
  } catch (error) {
    console.error("Error en affiliate link:", error);
    return urlStr;
  }
};