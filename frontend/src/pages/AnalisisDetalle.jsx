import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import '../index.css';
// 1. IMPORTAMOS LA UTILIDAD DE AFILIADOS
import { generateAffiliateLink } from '../utils/affiliate';

export default function AnalisisDetalle() {
  const { state } = useLocation();
  const { slug } = useParams();
  
  const [resultado, setResultado] = useState(state?.resultado || null);
  const [cargando, setCargando] = useState(!state?.resultado);
  const [error, setError] = useState(false);

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
          url: resultado.datos_web.url, 
          slug: slug
        })
      });

      if(res.ok) {
        alert("¡Genial! El Vigilante te avisará si detecta una bajada de precio. 🕵️‍♂️");
        setEmail('');
      } else {
        alert("Hubo un error al guardar tu suscripción.");
      }
    } catch(err) { 
      alert("Error de conexión.");
    } finally {
      setEnviandoEmail(false);
    }
  };

  if (cargando) return <div className="p-20 text-center font-bold">Analizando con IA...</div>;
  if (error || !resultado) return <div className="p-20 text-center">Producto no encontrado.</div>;

  const titulo = resultado?.datos_web?.titulo || "";
  const precio = resultado?.datos_web?.precio || "";
  const urlOriginal = resultado?.datos_web?.url || "";

  // 2. GENERAMOS LOS LINKS MONETIZADOS
  const linkOriginalMonetizado = generateAffiliateLink(urlOriginal);
  const linkTemuMonetizado = generateAffiliateLink(`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(titulo)}`);
  const linkSheinMonetizado = generateAffiliateLink(`https://www.shein.com/pdsearch/${encodeURIComponent(titulo)}`);
  const linkEbayMonetizado = `https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(titulo)}`; // eBay no lo tenemos en utils aún

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pb-40 font-sans">
      <Helmet>
        <title>Análisis: {titulo} | El Decisor</title>
        <meta name="description" content={`Descubre si ${titulo} es seguro, su precio real y alternativas más baratas.`} />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-indigo-600 font-bold mb-8 inline-block hover:underline">← Volver al buscador</Link>

        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          
          <header className="mb-10">
            <div className="flex items-start justify-between gap-4 mb-4">
               <h1 className="text-3xl md:text-4xl font-black text-slate-800">{titulo}</h1>
               <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("¡Enlace copiado! 🔗"); }} className="p-3 bg-slate-100 rounded-full">🔗</button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
               <span className="text-2xl font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                 {precio !== "No detectado" ? precio : "Precio Variable"}
               </span>
               <span className={`px-4 py-2 rounded-xl font-bold text-white text-sm ${resultado.analisis_ia.veredicto_valor === 'alto' ? 'bg-green-500' : 'bg-amber-500'}`}>
                 VEREDICTO: {resultado.analisis_ia.veredicto_valor?.toUpperCase()}
               </span>
               
               {/* BOTÓN DE COMPRA PRINCIPAL (Amazon) */}
               <a href={linkOriginalMonetizado} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
                 Ver oferta original 
               </a>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-12">
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

            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-50 shadow-xl">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <span className="text-2xl">🔥</span>
                  <h3 className="font-black text-slate-800">Caza del Chollo</h3>
                </div>

                <div className="space-y-4">
                  {/* TEMU MONETIZADO */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Alternativa Directa</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-slate-700 text-lg">Temu</span>
                      <span className="text-orange-600 font-bold text-sm">Ahorro IA</span>
                    </div>
                    <a href={linkTemuMonetizado} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 bg-[#ff6900] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-shadow">
                      Ver Precio en Temu
                    </a>
                  </div>

                  {/* SHEIN MONETIZADO (Si aplica) */}
                  {(titulo.toLowerCase().match(/camiseta|pantalon|vestido|zapatillas|ropa|moda|bolso/)) && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tendencia Low Cost</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-slate-700 text-lg">Shein</span>
                      </div>
                      <a href={linkSheinMonetizado} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 bg-black text-white rounded-xl font-bold text-sm hover:invert transition-all">
                        Buscar en Shein
                      </a>
                    </div>
                  )}

                  {/* EBAY */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 border-dashed">
                    <span className="font-black text-slate-700 text-lg">eBay</span>
                    <a href={linkEbayMonetizado} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm mt-2">
                      Ver en eBay
                    </a>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center italic mt-4">
                    Como afiliados, podríamos recibir una comisión por tus compras.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}