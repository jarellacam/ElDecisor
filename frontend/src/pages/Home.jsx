import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, TrendingUp, AlertTriangle, ArrowRight, X, 
  HelpCircle, ShieldCheck, Zap, Cpu, Globe, Fingerprint, ScanEye, Binary, MonitorSmartphone, ExternalLink 
} from 'lucide-react';
import '../index.css';

const DATOS_PRUEBA = {
  datos_web: { 
    titulo: "Sony WH-1000XM5 Auriculares Inalámbricos", 
    precio: "349,00 €", 
    url: "https://amazon.es/dp/B095C2QLK2" 
  },
  analisis_ia: {
    nombre_producto: "Sony WH-1000XM5",
    puntos_clave: ["✅ Cancelación líder", "✅ 30h de batería", "❌ No plegable", "❌ Precio Premium"],
    veredicto: "Compra Recomendada",
    resumen: "La referencia absoluta en silencio y calidad sonora para viajeros y audiófilos.",
    veredicto_valor: "alto",
    metricas: [
      { subject: 'Calidad', A: 95 },
      { subject: 'Precio', A: 60 },
      { subject: 'Fiabilidad', A: 90 },
      { subject: 'Opiniones', A: 95 },
      { subject: 'Popularidad', A: 85 },
    ]
  },
  slug: "sony-wh-1000xm5-dummy"
};

const FRASES_CARGA = [
    "Inicializando protocolos forenses IA...",
    "Estableciendo conexión con nodos globales...",
    "Escaneando metadatos ocultos del vendedor...",
    "Analizando patrones lingüísticos en reseñas...",
    "Verificando historial de precios en bases de datos...",
    "Generando veredicto de compra..."
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [cargando, setCargando] = useState(false);
  const [fraseIndex, setFraseIndex] = useState(0);
  const navigate = useNavigate();

  // 🛠️ Cambiar a 'false' para conectar con el backend real en main.py
  const MODO_DISENO = true; 

  useEffect(() => {
    let interval;
    if (cargando) {
        interval = setInterval(() => setFraseIndex((p) => (p + 1) % FRASES_CARGA.length), 800);
    }
    return () => clearInterval(interval);
  }, [cargando]);

  const manejarAnalisis = async (e) => {
    e.preventDefault();
    if (!url) return;
    setCargando(true);

    if (MODO_DISENO) {
      // Simulación para pruebas de interfaz
      setTimeout(() => {
        setCargando(false);
        navigate(`/analisis/${DATOS_PRUEBA.slug}`, { state: { resultado: DATOS_PRUEBA } });
      }, 3000);
    } else {
      // 🚀 CONEXIÓN REAL CON EL BACKEND
      try {
        const response = await fetch('/api/analizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await response.json();
        
        if (data.slug) {
          navigate(`/analisis/${data.slug}`, { state: { resultado: data } });
        } else {
          alert("Error en el escaneo forense. Revisa la URL.");
        }
      } catch (error) {
        console.error("Fallo de conexión con la API:", error);
        alert("La API no responde. Verifica que el backend esté desplegado.");
      } finally {
        setCargando(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-slate-900 relative overflow-hidden bg-grain">
      
      {/* ATMÓSFERA ANIMADA */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-blob"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-violet-50 rounded-full blur-[120px] opacity-60 animate-blob-slow"></div>
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg"><Fingerprint className="text-white" size={18} /></div>
            <span className="font-black text-xl tracking-tighter uppercase italic">EL <span className="text-indigo-600 transition-colors">DECISOR</span></span>
          </div>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link to="/privacidad" className="hover:text-indigo-600 transition-colors">Seguridad de Datos</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10 md:pt-14 pb-20 w-full text-center relative z-10">
        
        {/* HERO SECTION */}
        <div className="animate-reveal">
          <div className="inline-flex items-center gap-3 bg-slate-900 text-white px-4 py-1.5 rounded-full mb-8 shadow-xl">
            <Zap size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">IA Forense v2.4 Activa</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-[8.5rem] font-black tracking-tighter leading-[0.82] text-slate-900 mb-8 animate-reveal delay-100">
          NO SOLO COMPRES.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600">DECIDE.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium mb-12 animate-reveal delay-200 leading-snug">
          Analizamos la letra pequeña por ti para que compres con certeza total.
        </p>

        {/* BUSCADOR */}
        <div className="max-w-4xl mx-auto mb-10 animate-reveal delay-300 relative min-h-[120px]">
          {!cargando ? (
            <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl border border-slate-100 group focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                <form onSubmit={manejarAnalisis} className="flex flex-col md:flex-row items-center gap-2">
                    <div className="flex-1 flex items-center gap-4 pl-6 w-full text-left">
                        <Search className="text-slate-300" size={24} />
                        <input type="text" placeholder="Pega el enlace de Amazon, Temu o Shein..." className="w-full py-3 bg-transparent outline-none font-bold text-lg text-slate-700" value={url} onChange={(e) => setUrl(e.target.value)} />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-indigo-600 hover:bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl transition-all">ANALIZAR <ArrowRight size={20} className="inline ml-2"/></button>
                </form>
            </div>
          ) : (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-indigo-500/30 text-white flex flex-col items-center gap-6 relative overflow-hidden min-h-[160px]">
                <div className="absolute inset-0 w-full h-full"><div className="w-full h-1 bg-scan-line absolute top-0 left-0"></div></div>
                <div className="bg-indigo-600/20 p-4 rounded-full animate-pulse"><ScanEye size={40} className="text-indigo-400" /></div>
                <div className="font-mono text-sm md:text-lg font-bold tracking-widest text-indigo-100 uppercase">
                    <Binary size={20} className="inline mr-2 text-indigo-500" /> {FRASES_CARGA[fraseIndex]}
                </div>
            </div>
          )}
        </div>

        {/* --- EXTENSIÓN HOOK --- */}
        <div className="max-w-4xl mx-auto mb-24 animate-reveal delay-500">
          <div className="bg-indigo-600 rounded-[3rem] p-6 md:p-8 text-white flex flex-col md:flex-row items-center gap-8 text-left relative overflow-hidden shadow-2xl shadow-indigo-100 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
            <div className="flex-1 z-10">
              <h4 className="text-2xl font-black mb-2 flex items-center gap-2">
                <MonitorSmartphone size={24} /> ¿Cansado de copiar enlaces?
              </h4>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-4">
                Instala nuestra extensión oficial y analiza productos directamente desde Amazon, Temu y Shein sin salir de la tienda.
              </p>
              <a 
                href="https://chromewebstore.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-sm hover:bg-slate-900 hover:text-white transition-all shadow-lg active:scale-95"
              >
                Añadir a Chrome Gratis <ExternalLink size={16}/>
              </a>
            </div>
            <div className="hidden md:flex w-32 h-32 bg-white/20 rounded-[2rem] items-center justify-center border border-white/30 backdrop-blur-sm shadow-xl z-10">
               <Fingerprint size={60} className="text-white" />
            </div>
          </div>
        </div>

        {/* --- RECUADROS DE CONFIANZA (Trust Grid) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 animate-reveal delay-500">
          <TrustCard 
            icon={<Cpu size={30}/>} 
            title="IA Forense" 
            desc="Modelos de lenguaje analizan sintaxis y patrones para identificar reseñas manipuladas."
            color="indigo"
          />
          <TrustCard 
            icon={<Globe size={30}/>} 
            title="Global Scan" 
            desc="Monitorización de precios en tiempo real comparando el histórico en ecosistemas globales."
            color="slate"
          />
          <TrustCard 
            icon={<ShieldCheck size={30}/>} 
            title="Privacidad" 
            desc="Protocolos de cifrado de grado militar. Tus búsquedas son 100% privadas y anónimas."
            color="blue"
          />
        </div>
      </main>

      <footer className="mt-auto py-10 bg-slate-900 text-white text-center relative z-10 font-bold uppercase text-[10px] tracking-[0.4em]">
         El Decisor Engine v2.4 • {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function TrustCard({ icon, title, desc, color }) {
  return (
    <div className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 text-left relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
      <div className={`relative z-10 w-14 h-14 mb-6 rounded-2xl flex items-center justify-center bg-slate-900 text-white shadow-lg group-hover:bg-indigo-600 transition-colors duration-500`}>
        {icon}
      </div>
      <h4 className="relative z-10 font-black text-xl uppercase mb-3 tracking-tight">{title}</h4>
      <p className="relative z-10 text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}