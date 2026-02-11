import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnalisisDetalle from './pages/AnalisisDetalle';
import Policy from './pages/Policy'; 
import { HelmetProvider } from 'react-helmet-async'; 

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Página principal */}
          <Route path="/" element={<Home />} />
          
          {/* Detalle del análisis */}
          <Route path="/analisis/:slug" element={<AnalisisDetalle />} />

          {/* Ruta de privacidad (el path sigue siendo /privacidad) */}
          <Route path="/privacidad" element={<Policy />} />
          
          {/* Catch-all para errores 404 */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;