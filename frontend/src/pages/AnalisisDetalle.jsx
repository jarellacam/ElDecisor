import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import '../index.css';

export default function AnalisisDetalle() {
  const { state } = useLocation();
  const { slug } = useParams();
  
  const [resultado, setResultado] = useState(state?.resultado || null);
  const [cargando, setCargando] = useState(!state?.resultado);
  const [error, setError] = useState(false);

  // Estado para el formulario de suscripción
  const [email, setEmail] = useState('');
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  useEffect(() => {
    if (!resultado) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      fetch(`${apiUrl}/api/analisis/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error("Error en petición");
          return res.json();
        })
        .then(data => {
          if(data.error) throw new Error(data.error);
          setResultado(data);
          setCargando(false);
        })
        .catch(err => {
          console.error(err);
          setError(true);
          setCargando(false);
        });
    }
  }, [slug, resultado]);

  // Función para manejar la suscripción
  const manejarSuscripcion = async (e) => {
    e.preventDefault();
    setEnviandoEmail(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiUrl}/api/suscribir`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          email: email, 
          url: resultado.url, // ✅ CORRECTO: Usamos la URL raíz de la DB
          slug: slug
        })
      });

      if(res.ok) {
        alert("¡Genial! El Vigilante te avisará si detecta una bajada de precio. 🕵️‍♂️");
        setEmail('');
      } else {
        const data = await res.json();
        console.error("Error backend:", data);
        alert("Hubo un error al guardar tu suscripción.");
      }
    } catch(err) { 
      console.error(err); 
      alert("Error de conexión.");
    } finally {
      setEnviandoEmail(false);
    }
  };

  if (cargando) return (
  <div className="min-h-screen bg-slate-50 p-12">
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-6 w-24 bg-slate-200 rounded mb-8"></div>
      <div className="bg-white p-8 rounded-[3rem] shadow-xl">
        <div className="h-10 w-3/4 bg-slate-200 rounded mb-6"></div>
        <div className="flex gap-4 mb-12">
          <div className="h-12 w-32 bg-indigo-100 rounded-xl"></div>
          <div className="h-12 w-32 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 bg-slate-50 rounded-3xl"></div>
            <div className="h-10 bg-slate-50 rounded-xl"></div>
            <div className="h-10 bg-slate-50 rounded-xl"></div>
          </div>
          <div className="lg:col-span-1 h-64 bg-slate-50 rounded-3xl"></div>
        </div>
      </div>
    </div>
  </div>
);
  
  if (error || !resultado) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <h2 className="text-3xl font-black text-slate-800 mb-4">Ocurrió un error</h2>
      <p className="text-slate-500 mb-6">La IA está saturada o el producto no existe.</p>
      <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">
        ← Probar otro producto
      </Link>
    </div>
  );

  const titulo = resultado?.datos_web?.titulo || "";
  const precio = resultado?.datos_web?.precio || "";
  const urlOriginal = resultado?.datos_web?.url || "";

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pb-40 font-sans">
      <Helmet>
        <title>⚠️ ¿Estafa? Análisis: {titulo} | El Decisor</title>
        <meta name="description" content={`Descubre si ${titulo} es seguro, su precio real y alternativas más baratas en Temu y Shein.`} />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-indigo-600 font-bold mb-8 inline-block hover:underline">← Volver al buscador</Link>

        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          
          {/* CABECERA */}
          <header className="mb-10">
            <div className="flex items-start justify-between gap-4 mb-4">
               <h1 className="text-3xl md:text-4xl font-black text-slate-800">{titulo}</h1>
               
               {/* --- BOTÓN DE COMPARTIR (VIRALIDAD) --- */}
               <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("¡Enlace copiado! Pásalo por WhatsApp para avisar a tus amigos. 🔗");
                  }}
                  className="shrink-0 p-3 bg-slate-100 rounded-full hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 transition-all active:scale-95"
                  title="Copiar enlace para compartir"
                >
                  🔗
               </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
               <span className="text-2xl font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                 {precio !== "No detectado" ? precio : "Precio Variable"}
               </span>
               <span className={`px-4 py-2 rounded-xl font-bold text-white text-sm ${
                 resultado.analisis_ia.veredicto_valor === 'alto' ? 'bg-green-500' : 'bg-amber-500'
               }`}>
                 VEREDICTO: {resultado.analisis_ia.veredicto_valor?.toUpperCase()}
               </span>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* ANÁLISIS (Izquierda) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Resumen IA</h3>
                <p className="text-xl text-slate-700 italic leading-relaxed">"{resultado.analisis_ia.resumen_ejecutivo}"</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 mb-2">Puntos Clave</h3>
                {resultado.analisis_ia.puntos_clave?.map((punto, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-white rounded-xl border border-slate-50 shadow-sm">
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <p className="text-slate-600 text-sm md:text-base">{punto}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPARADOR Y SUSCRIPCIÓN (Derecha) */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-50 shadow-xl">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <span className="text-2xl">🔥</span>
                  <h3 className="font-black text-slate-800">Caza del Chollo</h3>
                </div>

                <div className="space-y-4">
                  {/* TARJETA TEMU: Siempre presente para gadgets/hogar */}
                  <div className="group relative bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-orange-400 transition-all cursor-pointer">
                    <div className="absolute -top-3 -right-2 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md rotate-12">
                      AHORRA HASTA 60%
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Alternativa Directa</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-slate-700 text-lg">Temu</span>
                      <span className="text-orange-600 font-bold text-sm">~{ (parseFloat(precio.replace(/[^0-9,.]/g, '').replace(',', '.')) * 0.4).toFixed(2) }€*</span>
                    </div>
                    <a href={`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(titulo)}`} 
                      target="_blank"
                      className="block w-full text-center py-2 bg-[#ff6900] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-shadow">
                      Ver Precio en Temu
                    </a>
                  </div>

                  {/* TARJETA SHEIN: Solo si detectamos que es ropa/moda */}
                  { (titulo.toLowerCase().match(/camiseta|pantalon|vestido|zapatillas|ropa|moda|bolso|reloj|sudadera|hoodie|chaqueta|abrigo|jersey|top|complemento|gafas/)) && (
                    <div className="group relative bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-black transition-all">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tendencia Low Cost</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-slate-700 text-lg">Shein</span>
                        <span className="text-slate-900 font-bold text-sm">Estilo similar</span>
                      </div>
                      <a href={`https://www.shein.com/pdsearch/${encodeURIComponent(titulo)}`} 
                        target="_blank"
                        className="block w-full text-center py-2 bg-black text-white rounded-xl font-bold text-sm hover:invert transition-all">
                        Buscar en Shein
                      </a>
                    </div>
                  )}

                  {/* TARJETA EBAY: Para reacondicionados/segunda mano */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 border-dashed">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-lg">eBay</span>
                        <span className="text-[10px] text-blue-500 font-bold">REACONDICIONADO</span>
                      </div>
                      <span className="text-blue-600 font-bold text-sm">Mejor para Tech</span>
                    </div>
                    <a href={`https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(titulo)}`} 
                      target="_blank"
                      className="block w-full text-center py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                      Ver en eBay
                    </a>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center italic mt-4">
                    *Estimación basada en ahorro medio. Los precios pueden variar según disponibilidad.
                  </p>
                </div>
              </div>
              
              {/* Caja de Suscripción */}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}