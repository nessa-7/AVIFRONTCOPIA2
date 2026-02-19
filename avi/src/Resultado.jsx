import { useLocation, useNavigate } from "react-router-dom";
import "./Resultado.css"
import "./Mapa.css";



function Resultado() {
  const location = useLocation();
  const navigate = useNavigate();

  const results = location.state?.result;

  console.log("RESULTS EN RESULTADO:", results);

  if (!results) {
    return <p>No se encontraron resultados.</p>;
  }

  const recommendedPrograms =
  results?.resultadoIA?.recommendations || [];

  const descargarApp = () => {
    window.location.href = "https://play.google.com/store";
  };

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

        {recommendedPrograms.length > 0 ? (
          <ul className="program-list">
            {recommendedPrograms.map((program, index) => (
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
          <button
            type="button"
            className="nav-link register-btn"
            onClick={verprogramas}
          >
            Ver más programas
          </button>

          <button type="button" onClick={irtest}>
            Volver a intentar
          </button>
        </section>
      </div>
    </div>
  );
}

export default Resultado;