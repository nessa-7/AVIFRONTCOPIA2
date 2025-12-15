function Mapa() {
  return (
    <div>
      <section className="mapa">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127558.93675643497!2d-76.67032502107222!3d2.4346597180690104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e30059e6a5931bb%3A0x3a8b57a83729be94!2sCENTRO%20DE%20TELEINFORM%C3%81TICA%20Y%20PRODUCCI%C3%93N%20INDUSTRIAL!5e0!3m2!1ses-419!2sco!4v1753072976090!5m2!1ses-419!2sco"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa CTPI"
        ></iframe>
      </section>

      <hr />
      <br />

      <section>
        <div className="container">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Centro de Teleinformática y Producción Industrial (CTPI)
            </h1>
            <br />
            <h2>
              Dentro de nuestro centro encontrarás ambientes donde se llevan a cabo
              cada uno de nuestros programas
            </h2>
            <br />

            <div className="neon-box">
              <div id="container-info">
                <ul>
                  <li>Encuentra tu vocación</li>
                  <li>Descubre tu ambiente</li>
                  <li>Construye tu futuro</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Mapa;
