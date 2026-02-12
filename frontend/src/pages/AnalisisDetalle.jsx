import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import { ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, ExternalLink, Bell, Mail } from 'lucide-react';
import '../index.css';
import { generateAffiliateLink } from '../helpers/links';

export default function AnalisisDetalle() {
  const { state } = useLocation();
  const { slug } = useParams();
  const [resultado, setResultado] = useState(state?.resultado || null);
  const [cargando, setCargando] = useState(!state?.resultado);
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensajeSub, setMensajeSub] = useState(null);

  useEffect(() => {
    if (!resultado) {
      fetch(`/api/analisis/${slug}`).then(res => res.json()).then(data => { setResultado(data); setCargando(false); });
    }
  }, [slug, resultado]);

  const manejarSub = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
        setMensajeSub({ tipo: 'exito', texto: '¡Perfecto! Te avisaremos si detectamos bajadas.' });
        setEnviando(false);
        setEmail('');
    }, 1500);
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">EXTRAYENDO DATOS...</div>;

  const { datos_web, analisis_ia } = resultado;
  const puntosPositivos = analisis_ia.puntos_clave?.filter(p => !p.includes('❌')) || [];
  const puntosNegativos = analisis_ia.puntos_clave?.filter(p => p.includes('❌')) || [];
  const esRecomendado = analisis_ia.veredicto_valor === 'alto';

  // Lógica para detectar si el producto es ropa (para mostrar Shein)
  const esRopa = datos_web?.titulo?.toLowerCase().match(/(camiseta|vestido|pantalón|ropa|chaqueta|zapatos|moda|bolso|gafas|joya)/);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pb-40 font-sans">
      <Helmet><title>Análisis: {datos_web.titulo}</title></Helmet>

      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-indigo-600 font-bold mb-8 inline-flex items-center gap-2 hover:underline animate-reveal">← Volver</Link>

        {/* HEADER REVELADO */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 mb-8 animate-reveal-scale opacity-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-60"></div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex-1">{datos_web.titulo}</h1>
              <div className={`px-6 py-2 rounded-full font-black text-xs uppercase border animate-pulse-soft ${esRecomendado ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                  {esRecomendado ? <ThumbsUp size={16} className="inline mr-2"/> : <AlertTriangle size={16} className="inline mr-2"/>}
                  {analisis_ia.veredicto}
              </div>
          </div>
          <div className="mt-8 flex items-center gap-6">
              <span className="text-4xl font-black text-slate-900">{datos_web.precio}</span>
              <a href={generateAffiliateLink(datos_web.url)} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform flex items-center gap-2">VER OFERTA REAL <ExternalLink size={20}/></a>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-50 shadow-sm animate-reveal delay-100 opacity-0 italic text-xl text-slate-600 leading-relaxed">
                "{analisis_ia.resumen}"
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-green-50/50 p-8 rounded-[2rem] border border-green-100 animate-reveal delay-200 opacity-0">
                    <h3 className="font-black text-green-800 mb-6 flex items-center gap-2"><CheckCircle size={20}/> FORTALEZAS</h3>
                    <ul className="space-y-4 text-sm font-bold text-green-900">
                        {puntosPositivos.map((p, i) => <li key={i} className="flex items-start gap-3"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>{p.replace(/✅/g, '')}</li>)}
                    </ul>
                  </div>
                  <div className="bg-red-50/50 p-8 rounded-[2rem] border border-red-100 animate-reveal delay-300 opacity-0">
                    <h3 className="font-black text-red-800 mb-6 flex items-center gap-2"><ThumbsDown size={20}/> DEBILIDADES</h3>
                    <ul className="space-y-4 text-sm font-bold text-red-900">
                        {puntosNegativos.map((p, i) => <li key={i} className="flex items-start gap-3"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></span>{p.replace(/❌/g, '')}</li>)}
                    </ul>
                  </div>
              </div>
            </div>

            <aside className="lg:col-span-1 space-y-8 animate-reveal delay-500 opacity-0">
              {/* --- NUEVA SECCIÓN DE AFILIACIÓN PROFESIONAL --- */}
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="font-black text-slate-900 mb-6 border-b pb-4 uppercase tracking-tighter text-sm">Comparar Precios</h3>
                <div className="space-y-4">
                  
                  {/* BOTÓN TEMU */}
                  <a 
                    href={generateAffiliateLink(`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(datos_web.titulo)}`)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center py-4 bg-[#ff6900] text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-100 hover:scale-[1.02] transition-transform"
                  >
                    BUSCAR EN TEMU ⚡
                  </a>

                  {/* BOTÓN AMAZON */}
                  <a 
                    href={generateAffiliateLink(`https://www.amazon.es/s?k=${encodeURIComponent(datos_web.titulo)}`)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center py-4 bg-[#FF9900] text-black rounded-2xl font-black text-sm shadow-lg shadow-yellow-100 hover:scale-[1.02] transition-transform"
                  >
                    REVISAR EN AMAZON
                  </a>

                  {/* BOTÓN SHEIN (Condicional) */}
                  {esRopa && (
                    <a 
                      href={generateAffiliateLink(`https://www.shein.com/pdsearch/${encodeURIComponent(datos_web.titulo)}`)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full text-center py-4 bg-black text-white rounded-2xl font-black text-sm shadow-lg hover:scale-[1.02] transition-transform"
                    >
                      VER EN SHEIN 👗
                    </a>
                  )}

                  <p className="text-[10px] text-slate-400 font-bold text-center mt-4 italic">
                    💡 Consejo Pro: El mismo producto puede variar un 50% entre tiendas.
                  </p>
                </div>
              </div>

              {/* TARJETA DE SUSCRIPCIÓN EXISTENTE */}
              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <h3 className="font-black text-xl mb-3 flex items-center gap-3"><Bell className="text-yellow-400"/> ¿MUY CARO?</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">Nuestra IA rastrea el precio cada 24h. Te avisaremos de forma gratuita si detectamos una bajada.</p>
                <form onSubmit={manejarSub} className="space-y-4">
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/><input type="email" placeholder="tu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"/></div>
                  <button type="submit" disabled={enviando} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 disabled:opacity-50">{enviando ? 'GUARDANDO...' : 'VIGILAR PRECIO 📉'}</button>
                </form>
                {mensajeSub && <div className="mt-4 p-4 rounded-2xl bg-green-500/10 text-green-400 text-xs font-black text-center animate-reveal">{mensajeSub.texto}</div>}
              </div>
            </aside>
        </div>
      </div>
    </div>
  );
}