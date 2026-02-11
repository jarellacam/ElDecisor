import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ 
      marginTop: 'auto', 
      padding: '2rem', 
      borderTop: '1px solid #eee', 
      backgroundColor: '#fff',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <p style={{ fontWeight: 'bold', color: '#4F46E5', marginBottom: '1rem' }}>🕵️‍♂️ El Decisor</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '1rem' }}>
          <Link to="/" style={linkStyle}>Inicio</Link>
          <Link to="/privacidad" style={linkStyle}>Privacidad</Link>
          <a href="mailto:tu-email@ejemplo.com" style={linkStyle}>Contacto</a>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#999' }}>
          © {new Date().getFullYear()} El Decisor. Análisis de compras con IA.
        </p>
      </div>
    </footer>
  );
};

const linkStyle = {
  textDecoration: 'none',
  color: '#666',
  fontSize: '0.9rem'
};

export default Footer;