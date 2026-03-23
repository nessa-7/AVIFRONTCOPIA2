import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./ComoFuncionaTest.css";

function ComoFuncionaTest() {
  const navigate = useNavigate();
  const { nombre } = useAuth();

  function iniciartest() {
    navigate("/pretest");
  }

  return (
    <section className="cft-page">
      <div className="cft-wrap">
        <div className="cft-heading" id="como-funciona-test">
          <h1>¿Cómo Funciona Nuestro Test Vocacional? </h1>
          <p>Descubre tu perfil en solo unos minutos</p>
        </div>

        <article className="cft-card">
         

          <div className="cft-steps">
            <div className="cft-step bv-step-1">
              <span className="cft-num">1</span>
              <h3>Responde preguntas clave</h3>
              <ul>
                <li>Cuentanos tus Intereses y habilidades</li>
                <li>Duracion aproximada: 5-10 minutos</li>
              </ul>
            </div>

            <div className="cft-step bv-step-2">
              <span className="cft-num">2</span>
              <h3>Analizamos tu perfil</h3>
              <ul>
                <li>Recibimos tus respuestas</li>
                <li>Resultado por perfil RIASEC</li>
                <li>Compatibilidad con programas</li>
              </ul>
            </div>

            <div className="cft-step bv-step-3">
              <span className="cft-num">3</span>
              <h3>Recibe tus programas recomendados</h3>
              <ul>
                <li>Recomendaciones personalizadas</li>
                <li>Programas de formación sugeridos</li>
              </ul>
            </div>
          </div>
        </article>

        <div className="cft-action">
          <button type="button" className="cft-start-btn" onClick={iniciartest}>
            Realizar Test Ahora
          </button>
        </div>
      </div>
    </section>
  );
}

export default ComoFuncionaTest;

