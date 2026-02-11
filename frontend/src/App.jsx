import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnalisisDetalle from './pages/AnalisisDetalle';
import Privacidad from './pages/privacidad'; // <--- 1. Importamos la nueva página
import { HelmetProvider } from 'react-helmet-async'; 

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Página principal: Buscador + Tendencias */}
          <Route path="/" element={<Home />} />
          
          {/* Página de Detalle: Análisis individual con SEO dinámico */}
          <Route path="/analisis/:slug" element={<AnalisisDetalle />} />

          {/* 2. Añadimos la ruta de Privacidad para Google */}
          <Route path="/privacidad" element={<Privacidad />} />
          
          {/* Opcional: Ruta 404 por si alguien escribe mal una URL */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;