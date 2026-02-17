import { useLocation, useNavigate } from "react-router-dom";
import "./Resultado.css"
import "./Mapa.css";



function Resultado() {
  const location = useLocation();
  const results = location.state?.result;

  if (!results) {
    return <p>No se encontraron resultados.</p>;
  }

  const descargarApp = () => {
    window.location.href = "https://play.google.com/store";
  };


  const navigate = useNavigate()

  function verprogramas() {
    navigate("/programas");
  }

  function irtest() {
    navigate("/bienvenidatest");
  }

  return (
  <div className="resultado-container">
    <div className="resultado-card">
      <h1 className="resultado-title">
        RESULTADOS DEL TEST VOCACIONAL
      </h1>

      {/*<h2 className="section-title">Perfiles Dominantes</h2>
      <ul className="profile-list">
        {results.top_profiles.map((profile, index) => (
          <li key={index} className="profile-item">
            <span>{profile.profile}</span>
            <span>{profile.score} puntos</span>
          </li>
        ))}
      </ul>*/}

      <h2 className="section-title"></h2>

      {results.recommended_programs.length > 0 ? (
        <ul className="program-list">
          {results.recommended_programs.map((program, index) => (
            <li key={index} className="program-item">
              <div className="program-name">{program.name}</div>
              <div className="program-reason">{program.reason}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-results">
          No se encontraron programas recomendados.
        </p>
      )}


      <section className="acciones">
            <button type="button" className="nav-link register-btn" onClick={verprogramas}>Ver más programas</button>
          
            <button type="button" onClick={irtest}>Volver a intentar</button>
          
        </section>
    

    <div className="contenidomapa">

        <h1 className="titulo">Si deseas conocer más información de estos programas visita nuestro mapa de CTPI</h1>

        <div className="layout">

          {/* COLUMNA IZQUIERDA */}
          <div className="col-izquierda">

            <video 
              src="/video.mp4" 
              controls 
              loop 
              className="video"
            />

            <button 
              className="btn-descargar" 
              onClick={descargarApp}
            >
              Descargar Aplicación
            </button>

          </div>

          {/* COLUMNA DERECHA */}
          <div className="col-derecha">

            <div className="card-blanca">
              <img 
                src="/aplicacion.png" 
                alt="Aplicación móvil" 
                className="imagen"
              />
            </div>

          </div>

        </div>

      </div>
      </div>
  </div>
);
}

export default Resultado;