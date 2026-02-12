import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Mail, ArrowLeft, Fingerprint, FileText, CheckCircle } from 'lucide-react';
import '../index.css';

const Policy = () => {
  return (
    <div className="min-h-screen bg-slate-50 bg-grain flex flex-col font-sans text-slate-900 relative overflow-hidden">
      
      {/* ATMÓSFERA ANIMADA (Consistente con el Home) */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-100 rounded-full blur-[120px] opacity-40 animate-blob-slow"></div>
      </div>

      {/* NAV COMPACTO */}
      <nav className="h-16 flex items-center px-6 md:px-12 border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg group-hover:bg-indigo-600 transition-colors">
            <Fingerprint className="text-white" size={18} />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">EL <span className="text-indigo-600">DECISOR</span></span>
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 w-full relative z-10">
        
        {/* HEADER DE LA POLÍTICA */}
        <div className="text-center mb-20 animate-reveal">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-indigo-100">
            <Shield size={12} /> Privacidad Blindada
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">
            POLÍTICA DE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">PRIVACIDAD</span>
          </h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            Última actualización: 11 de febrero, 2026
          </p>
        </div>

        {/* CONTENIDO EN TARJETAS */}
        <div className="space-y-8">
          
          {/* SECCIÓN 1 */}
          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-reveal delay-100 opacity-0">
            <div className="flex items-center gap-4 mb-6 text-indigo-600">
              <div className="p-3 bg-indigo-50 rounded-2xl"><Eye size={24} /></div>
              <h2 className="text-2xl font-black tracking-tight uppercase">1. Información que recopilamos</h2>
            </div>
            <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p><strong>URLs de productos:</strong> Al usar la extensión, enviamos la URL activa a nuestros nodos forenses para procesar el análisis de veracidad mediante IA.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p><strong>Emails:</strong> Tu correo solo se almacena si activas voluntariamente la vigilancia de precios. Jamás lo usaremos para spam.</p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2 */}
          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-reveal delay-200 opacity-0">
            <div className="flex items-center gap-4 mb-6 text-slate-900">
              <div className="p-3 bg-slate-900 text-white rounded-2xl"><Lock size={24} /></div>
              <h2 className="text-2xl font-black tracking-tight uppercase">2. Uso de Permisos</h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-start">
                <CheckCircle className="text-indigo-600 mt-1 shrink-0" size={18} />
                <div>
                  <span className="font-black text-xs uppercase tracking-widest block mb-1">activeTab</span>
                  <p className="text-xs text-slate-500 font-bold">Obtención de URL para iniciar el escaneo forense.</p>
                </div>
              </li>
              <li className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-start">
                <CheckCircle className="text-indigo-600 mt-1 shrink-0" size={18} />
                <div>
                  <span className="font-black text-xs uppercase tracking-widest block mb-1">storage</span>
                  <p className="text-xs text-slate-500 font-bold">Guardado local de tus estados de análisis recientes.</p>
                </div>
              </li>
            </ul>
          </section>

          {/* SECCIÓN 3 */}
          <section className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl animate-reveal delay-300 opacity-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-600 rounded-2xl"><Shield size={24} /></div>
                <h2 className="text-2xl font-black tracking-tight uppercase italic">3. Seguridad Total</h2>
              </div>
              <p className="text-indigo-100 font-medium leading-relaxed">
                Tus datos no son una mercancía. No vendemos ni compartimos información con terceros. Todo el tráfico viaja cifrado bajo protocolos SSL de grado militar.
              </p>
            </div>
          </section>

          {/* CONTACTO */}
          <div className="text-center pt-10 animate-reveal delay-500 opacity-0">
            <div className="inline-flex flex-col items-center gap-4">
              <Mail className="text-indigo-600" size={32} />
              <p className="text-slate-500 font-bold">¿Dudas sobre tus datos?</p>
              <a href="mailto:soporte@eldecisor.com" className="text-xl font-black text-slate-900 hover:text-indigo-600 transition-colors underline decoration-indigo-200 underline-offset-8">
                soporte@eldecisor.com
              </a>
            </div>
          </div>

          <div className="pt-20 text-center">
            <Link to="/" className="inline-flex items-center gap-2 font-black text-sm uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={16} /> Volver al Centro de Control
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-10 bg-white border-t border-slate-100 text-center relative z-10 font-bold uppercase text-[9px] tracking-[0.4em] text-slate-300">
         El Decisor IA • Protegiendo tu huella digital
      </footer>
    </div>
  );
};

export default Policy;