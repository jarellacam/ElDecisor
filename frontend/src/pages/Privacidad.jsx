import React from 'react';

const Privacidad = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
      <h1>Política de Privacidad - El Decisor</h1>
      <p><strong>Última actualización:</strong> 11 de febrero de 2026</p>

      <section>
        <h2>1. Información que recopilamos</h2>
        <p><strong>URLs de productos:</strong> Cuando utilizas la extensión "El Decisor", enviamos la URL del producto que estás visualizando a nuestros servidores para procesar el análisis de IA.</p>
        <p><strong>Emails:</strong> Recopilamos tu correo electrónico solo si te suscribes voluntariamente a nuestras alertas de precio.</p>
      </section>

      <section>
        <h2>2. Uso de Permisos</h2>
        <ul>
          <li><strong>activeTab:</strong> Se usa para obtener la URL de la pestaña actual tras la acción del usuario.</li>
          <li><strong>storage:</strong> Se utiliza para guardar temporalmente el estado de tus análisis.</li>
        </ul>
      </section>

      <section>
        <h2>3. Seguridad de los datos</h2>
        <p>No vendemos ni compartimos tus datos con terceros. Toda la comunicación se realiza de forma segura mediante HTTPS.</p>
      </section>

      <section>
        <h2>4. Contacto</h2>
        <p>Si tienes dudas sobre tu privacidad, puedes contactarnos en: <strong>[TU_EMAIL@EJEMPLO.COM]</strong></p>
      </section>

      <div style={{ marginTop: '40px' }}>
        <a href="/" style={{ color: '#4F46E5', fontWeight: 'bold' }}>← Volver al inicio</a>
      </div>
    </div>
  );
};

export default Privacidad;