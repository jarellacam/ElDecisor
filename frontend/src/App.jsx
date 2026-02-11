import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnalisisDetalle from './pages/AnalisisDetalle';
import Policy from './pages/Policy';
import Footer from './components/Footer'; 
import { HelmetProvider } from 'react-helmet-async'; 

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Usamos un div con flex para que el footer siempre esté abajo */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analisis/:slug" element={<AnalisisDetalle />} />
              <Route path="/privacidad" element={<Policy />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </div>

          <Footer /> {/*  */}
          
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;