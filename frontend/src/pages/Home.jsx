import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, TrendingUp, AlertTriangle, ArrowRight, X, HelpCircle, ShieldCheck, Zap } from 'lucide-react';
import '../index.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // CAMBIO: Usamos ruta relativa para conectar con el backend en Vercel
    fetch('/api/tendencias')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTendencias(data); })
      .catch(err => console.log("Error tendencias", err));
  }, []);

  const manejarAnalisis = async (e) => {
    e.preventDefault();
    if (!url) return;
    setCargando(true);
    setError(null);

    try {
      // CAMBIO: Usamos ruta relativa /api/analizar
      const response = await fetch('/api/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Error al conectar");

      if (data.slug) {
        navigate(`/analisis/${data.slug}`, { state: { resultado: data } });
      } else {
        throw new Error("ID inválido");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col font-sans relative">
      
      {/* --- MODAL CÓMO FUNCIONA --- */}
      {mostrarTutorial && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-slide-up">
            <button 
              onClick={() => setMostrarTutorial(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X size={28} />
            </button>
            
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <HelpCircle className="text-indigo-600" /> ¿Cómo funciona ElDecisor?
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-indigo-100 p-3 rounded-xl h-fit text-indigo-600"><Search size={24}/></div>
                <div>
                  <h3 className="font-bold text-slate-800">1. Pega el enlace</h3>
                  <p className="text-sm text-slate-500">Copia la URL de Amazon, Shein o Temu y pégala en nuestro buscador.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-amber-100 p-3 rounded-xl h-fit text-amber-600"><Zap size={24}/></div>
                <div>
                  <h3 className="font-bold text-slate-800">2. La IA Analiza</h3>
                  <p className="text-sm text-slate-500">Nuestro algoritmo lee las reseñas ocultas, verifica el vendedor y detecta fraudes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-green-100 p-3 rounded-xl h-fit text-green-600"><ShieldCheck size={24}/></div>
                <div>
                  <h3 className="font-bold text-slate-800">3. Decide seguro</h3>
                  <p className="text-sm text-slate-500">Recibe un veredicto claro: "¿Es una estafa?", "¿Vale la pena?" y alternativas baratas.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setMostrarTutorial(false)}
              className="w-full mt-8 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-transform active:scale-95"
            >
              ¡Entendido, quiero probarlo!
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧠</span>
          <span className="font-black text-xl text-slate-800 tracking-tight">ElDecisor.com</span>
        </div>
        <button 
          onClick={() => setMostrarTutorial(true)} 
          className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          ¿Cómo funciona?
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full mt-10 md:mt-20 mb-20">
        
        <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black tracking-wider mb-6">
          IA v2.0 ACTIVA • ANÁLISIS EN TIEMPO REAL
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          No compres con los ojos cerrados.  <br/>
          <span className="text-indigo-600">Compra con Rayos X.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed">
          Análisis forense de cualquier producto en segundos. 
          La letra pequeña, ahora en negrita.
        </p>

        {/* BUSCADOR */}
        <div className="w-full max-w-2xl relative group">
          <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          
          <form onSubmit={manejarAnalisis} className="relative flex items-center bg-white p-2 rounded-2xl shadow-xl border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
            <div className="pl-4 text-slate-400">
              <Search size={24} />
            </div>
            <input 
              type="text" 
              placeholder="Pega aquí el enlace del producto..." 
              className="w-full p-4 bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-300"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              type="submit"
              disabled={cargando}
              className={`bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 hover:bg-indigo-700 active:scale-95 ${cargando ? 'opacity-80 cursor-wait' : ''}`}
            >
              {cargando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <span>Analizar</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* --- BOTÓN DE DESCARGA EXTENSIÓN --- */}
        <div className="mt-12 animate-pulse hover:animate-none transition-all">
          <p className="text-sm text-slate-400 font-bold mb-3 uppercase tracking-wider">
            ¿Compras mucho en Amazon?
          </p>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); alert("¡Pronto disponible en la Chrome Store! De momento usa la versión local."); }}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 shadow-xl hover:bg-slate-800 hover:scale-105 transition-all mx-auto w-fit"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" className="w-6 h-6" alt="Chrome" />
            Instalar el Vigilante Gratis
          </a>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 animate-pulse">
            <AlertTriangle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        {/* TENDENCIAS */}
        {tendencias.length > 0 && (
          <div className="mt-20 w-full text-left">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-indigo-600" />
              <h3 className="font-black text-slate-800 text-lg">Analizado recientemente</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {tendencias.map((item) => (
                <Link key={item.id} to={`/analisis/${item.slug}`} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.datos_web?.titulo || "Producto"}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    item.analisis_ia?.veredicto_valor === 'alto' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.analisis_ia?.veredicto_valor?.toUpperCase() || "N/A"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="p-6 text-center text-slate-400 text-sm font-medium">
        <p>© 2026 El Decisor IA. Analizamos, tú decides.</p>
      </footer>
    </div>
  );
}