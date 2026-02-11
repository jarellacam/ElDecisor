import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import '../index.css';
// IMPORTANTE: El path ahora apunta a helpers/links
import { generateAffiliateLink } from '../helpers/links';

export default function AnalisisDetalle() {
  const { state } = useLocation();
  const { slug } = useParams();
  
  const [resultado, setResultado] = useState(state?.resultado || null);
  const [cargando, setCargando] = useState(!state?.resultado);
  const [error, setError] = useState(false);

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
          setError(true);
          setCargando(false);
        });
    }
  }, [slug, resultado]);

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-bold text-indigo-600">Analizando con IA...</div>;
  if (error || !resultado) return <div className="min-h-screen flex items-center justify-center font-bold">Producto no encontrado.</div>;

  const titulo = resultado?.datos_web?.titulo || "";
  const precio = resultado?.datos_web?.precio || "";
  const urlOriginal = resultado?.datos_web?.url || "";

  // DETERMINAR TIENDA DE ORIGEN
  const esAmazon = urlOriginal.toLowerCase().includes('amazon');
  const esShein = urlOriginal.toLowerCase().includes('shein');
  const esTemu = urlOriginal.toLowerCase().includes('temu');

  // GENERAR LINKS MONETIZADOS
  const linkPrincipal = generateAffiliateLink(urlOriginal);
  const linkSearchTemu = generateAffiliateLink(`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(titulo)}`);
  const linkSearchShein = generateAffiliateLink(`https://www.shein.com/pdsearch/${encodeURIComponent(titulo)}`);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pb-40 font-sans">
      <Helmet>
        <title>Análisis: {titulo} | El Decisor</title>
        <meta name="description" content={`Análisis de IA para ${titulo}. ¿Vale la pena o es una estafa?`} />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-indigo-600 font-bold mb-8 inline-block hover:underline">← Volver al buscador</Link>

        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6">{titulo}</h1>

            <div className="flex flex-wrap items-center gap-4">
               <span className="text-2xl font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                 {precio !== "No detectado" ? precio : "Consultar Precio"}
               </span>
               
               <a 
                 href={linkPrincipal} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
               >
                 VER EN {esAmazon ? 'AMAZON' : esShein ? 'SHEIN' : esTemu ? 'TEMU' : 'LA TIENDA'} 🚀
               </a>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Veredicto de la IA</h3>
                <p className="text-xl text-slate-700 italic leading-relaxed">"{resultado.analisis_ia.resumen_ejecutivo}"</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800">Puntos Clave</h3>
                {resultado.analisis_ia.puntos_clave?.map((punto, i) => (
                  <div key={i} className="flex gap-3 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-green-500 font-bold">✓</span>
                    <p className="text-slate-600">{punto}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-50 shadow-xl">
                <h3 className="font-black text-slate-800 mb-6 border-b pb-4">Comparar en otras tiendas</h3>
                <div className="space-y-4">
                  {!esTemu && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-slate-700">Temu</span>
                        <span className="text-orange-600 font-bold text-xs">Más barato</span>
                      </div>
                      <a href={linkSearchTemu} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 bg-[#ff6900] text-white rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all">
                        Buscar Chollo en Temu
                      </a>
                    </div>
                  )}

                  {!esShein && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-slate-700">Shein</span>
                      </div>
                      <a href={linkSearchShein} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 bg-black text-white rounded-xl font-bold text-sm shadow-sm hover:invert transition-all">
                        Buscar en Shein 👗
                      </a>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 text-center italic leading-tight mt-4">
                    Como afiliado, recibo una pequeña comisión por las compras realizadas a través de estos enlaces.
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