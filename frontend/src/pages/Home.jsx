import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const API_URL = "http://localhost:8000/api";

// --- LA FUNCIÓN MAESTRA ---
const generarSlug = (texto) => {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize("NFD")               // 1. Separa acentos
    .replace(/[\u0300-\u036f]/g, "") // 2. Borra acentos
    .replace(/[^a-z0-9]+/g, '-')     // 3. Símbolos a guiones
    .replace(/-+/g, '-')             // 4. Quita guiones dobles
    .replace(/^-+|-+$/g, '');        // 5. Limpia extremos
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [cargando, setCargando] = useState(false);
  const [tendencias, setTendencias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/tendencias`)
      .then(res => res.json())
      .then(data => setTendencias(data))
      .catch(err => console.error("Error cargando tendencias:", err));
  }, []);

  const manejarAnalisis = async () => {
  if (!url) return;
  setCargando(true);
  try {
    const resp = await fetch(`${API_URL}/analizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await resp.json();

    if (!resp.ok || data.error) {
      alert(`Error: ${data.detail || data.error || "No se pudo analizar"}`);
      setCargando(false);
      return;
    }
    
    const slug = generarSlug(data.datos_web.titulo);
    navigate(`/analisis/${slug}`, { state: { resultado: data } });
  } catch (error) {
    alert("El servidor no responde. ¿Está el Backend encendido?");
  } finally {
    setCargando(false);
  }
};
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-indigo-600 mb-4">El Decisor</h1>
          <p className="text-lg text-slate-600">Tu analista de mercado inteligente.</p>
        </header>

        <div className="bg-white shadow-2xl rounded-3xl p-8 mb-16 border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              className="flex-1 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-400 text-lg"
              placeholder="Pega el link aquí..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={manejarAnalisis}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all"
              disabled={cargando}
            >
              {cargando ? 'Analizando...' : '¡Decidir!'}
            </button>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-8">Tendencias de la comunidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tendencias.map((item, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/analisis/${generarSlug(item.titulo)}`)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              >
                <h3 className="font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-600">{item.titulo}</h3>
                <p className="text-sm text-slate-400 mt-2">Veredicto {item.resultado_ia.veredicto_valor}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}