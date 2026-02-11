import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import '../index.css';

const MI_ID_AFILIADO = "PROXIMAMENTE";

export default function AnalisisDetalle() {
  const { state } = useLocation();
  const { slug } = useParams();
  
  const [resultado, setResultado] = useState(state?.resultado || null);
  const [cargando, setCargando] = useState(!state?.resultado);
  const [error, setError] = useState(false);
  
  const [email, setEmail] = useState('');
  const [suscrito, setSuscrito] = useState(false);

  useEffect(() => {
    if (!resultado) {
      fetch(`http://localhost:8000/api/analisis/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error("No encontrado");
          return res.json();
        })
        .then(data => {
          setResultado(data);
          setCargando(false);
        })
        .catch(() => {
          setError(true);
          setCargando(false);
        });
    }
  }, [slug, resultado]);

  const manejarSuscripcion = async () => {
    if (!email) return;
    try {
      const resp = await fetch('http://localhost:8000/api/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email, 
            url: resultado?.datos_web?.url, 
            slug 
        })
      });
      if (resp.ok) setSuscrito(true);
    } catch (err) {
      alert("Error al guardar la suscripción");
    }
  };

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-opacity-20 border-t-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Consultando a la IA...</p>
      </div>
    </div>
  );
  
  if (error || !resultado) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <h2 className="text-3xl font-black text-slate-800 mb-4">Análisis no encontrado</h2>
      <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">
        ← Volver al buscador
      </Link>
    </div>
  );

  const urlOriginal = resultado?.datos_web?.url || "";
  const tituloProducto = resultado?.datos_web?.titulo || "";
  
  const urlFinal = urlOriginal.includes('amazon') && MI_ID_AFILIADO !== "PROXIMAMENTE"
    ? `${urlOriginal}?tag=${MI_ID_AFILIADO}`
    : urlOriginal;

  return (
    <>
      <Helmet>
        <title>{tituloProducto} | El Decisor IA</title>
        <meta name="description" content={resultado?.analisis_ia?.resumen_ejecutivo} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans pb-40">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="text-indigo-600 font-bold mb-8 inline-flex items-center gap-2 hover:translate-x-[-4px] transition-transform underline">
            ← Volver al buscador
          </Link>
          
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 mb-16">
            <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div className="flex-1">
                <h2 className="text-4xl font-black text-slate-800 leading-tight mb-4">{tituloProducto}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  {resultado?.datos_web?.precio && resultado.datos_web.precio !== "No detectado" && (
                    <span className="text-2xl font-black text-indigo-600 bg-indigo-50 px-4 py-1 rounded-xl">
                      {resultado.datos_web.precio}
                    </span>
                  )}
                  <span className="bg-slate-100 text-slate-400 p-2 rounded text-xs break-all font-mono italic">
                    {urlOriginal}
                  </span>
                </div>
              </div>
              
              <div className={`px-8 py-4 rounded-3xl font-black text-white shadow-lg text-center min-w-[160px] ${
                resultado?.analisis_ia?.veredicto_valor === 'alto' ? 'bg-green-500 shadow-green-200' : 'bg-amber-500 shadow-amber-200'
              }`}>
                <span className="text-[10px] uppercase block opacity-80 mb-1 tracking-widest">Veredicto IA</span>
                <span className="text-xl"> {resultado?.analisis_ia?.veredicto_valor?.toUpperCase()}</span>
              </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-12">
              {/* COLUMNA IZQUIERDA: ANALISIS */}
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h3 className="text-indigo-600 font-black uppercase text-xs tracking-[0.2em] mb-4">Resumen de Valor</h3>
                  <p className="text-2xl text-slate-700 italic border-l-4 border-indigo-500 pl-6 leading-relaxed">
                    "{resultado?.analisis_ia?.resumen_ejecutivo}"
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-indigo-600 font-black uppercase text-xs tracking-[0.2em] mb-4">Puntos Clave</h3>
                  {resultado?.analisis_ia?.puntos_clave?.map((p, i) => (
                    <div key={i} className="flex gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <span className="text-green-500 font-bold text-xl">✓</span>
                      <p className="text-slate-700 font-medium leading-snug">{p}</p>
                    </div>
                  ))}
                </section>

                {/* RADAR DE CHOLLOS */}
                <section className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl mt-12">
                  <h3 className="text-2xl font-black mb-4">📉 ¿Esperas una bajada?</h3>
                  {!suscrito ? (
                    <div className="space-y-4">
                      <p className="opacity-90">Te avisaremos por email en cuanto baje de precio.</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="email" 
                          placeholder="tu@email.com" 
                          className="flex-1 px-6 py-4 rounded-2xl text-slate-800 outline-none"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <button onClick={manejarSuscripcion} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all">
                          AVISARME
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-white/10 rounded-2xl border-2 border-white/20">
                      <p className="text-xl font-bold">Radar activado</p>
                    </div>
                  )}
                </section>
              </div>

              {/* COLUMNA DERECHA: COMPARADOR MULTI-TIENDA */}
              <aside className="lg:col-span-1">
                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-xl h-fit sticky top-8">
                  <div className="flex items-center gap-2 mb-6 border-b pb-4">
                    <span className="text-2xl">📊</span>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight">Comparador Express</h4>
                  </div>

                  <div className="space-y-3">
                    {/* TIENDA ANALIZADA */}
                    <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 flex justify-between items-center mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase italic">Fuente Original</p>
                        <p className="font-bold text-slate-800 text-sm">Escaneada por IA</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-indigo-600">{resultado?.datos_web?.precio}</p>
                        <a href={urlFinal} target="_blank" className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold">VER OFERTA</a>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-bold uppercase text-center py-1">Alternativas Directas</p>

                    {/* BOTÓN TEMU */}
                    <a 
                      href={`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(tituloProducto)}`}
                      target="_blank"
                      className="flex items-center justify-between p-3 bg-[#ff6900] text-white rounded-xl hover:scale-[1.02] transition-transform shadow-md"
                    >
                      <span className="font-bold text-sm">Buscar en Temu</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-bold">LOW COST</span>
                    </a>

                    {/* BOTÓN SHEIN */}
                    <a 
                      href={`https://www.shein.com/pdsearch/${encodeURIComponent(tituloProducto)}`}
                      target="_blank"
                      className="flex items-center justify-between p-3 bg-black text-white rounded-xl hover:scale-[1.02] transition-transform shadow-md"
                    >
                      <span className="font-bold text-sm">Buscar en Shein</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-bold">MODA/HOGAR</span>
                    </a>

                    {/* BOTÓN PC COMPONENTES */}
                    <a 
                      href={`https://www.pccomponentes.com/buscar/?query=${encodeURIComponent(tituloProducto)}`}
                      target="_blank"
                      className="flex items-center justify-between p-3 bg-[#ffed00] text-black rounded-xl hover:scale-[1.02] transition-transform shadow-md"
                    >
                      <span className="font-bold text-sm">PC Componentes</span>
                      <span className="text-[10px] bg-black/5 px-2 py-0.5 rounded font-bold">TECH ESPAÑA</span>
                    </a>

                    {/* BOTÓN EBAY */}
                    <a 
                      href={`https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(tituloProducto)}`}
                      target="_blank"
                      className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-xl hover:scale-[1.02] transition-transform shadow-md"
                    >
                      <span className="font-bold text-sm">Buscar en eBay</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">OUTLET</span>
                    </a>

                    <p className="text-[9px] text-slate-400 text-center mt-6 leading-tight italic">
                      Los precios en otras tiendas pueden variar. Los enlaces se generan basándose en el título analizado.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÓN FLOTANTE MÓVIL */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="w-full max-w-md px-6 pointer-events-auto">
          <a 
            href={urlFinal}
            target="_blank"
            className={`flex items-center justify-between gap-4 w-full p-4 rounded-3xl font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95 border-b-4 border-black/20 ${
              urlOriginal.includes('amazon') ? "bg-orange-500" : "bg-indigo-600"
            }`}
          >
            <div className="flex flex-col items-start leading-none pl-2">
                <span className="text-[10px] uppercase opacity-70 mb-1 font-bold">Veredicto IA</span>
                <span className="text-sm tracking-tight">{resultado?.analisis_ia?.veredicto_valor?.toUpperCase()}</span>
            </div>
            <span className="flex-1 text-center text-lg border-l border-white/20 pl-4">
              {urlOriginal.includes('amazon') ? "COMPRAR AHORA " : "IR A LA WEB "}
            </span>
          </a>
        </div>
      </div>
    </>
  );
}