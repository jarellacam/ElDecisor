import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnalisisDetalle from './pages/AnalisisDetalle';
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
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;