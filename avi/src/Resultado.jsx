import { useNavigate } from "react-router-dom";




const Resultado = () => {

  const navigate = useNavigate()

  function verprogramas() {
    navigate("/programas");
  }

  function irtest() {
    navigate("/bienvenidatest");
  }

  return (
    <>
      {/* Contenido principal */}
      <main className="resultados">
        <section className="resumen">
          <h2>Tu perfil se alinea con:</h2>
          <div className="programa">
            <h3 className="programa-nombre">Tecnólogo en Análisis y Desarrollo de Software</h3>
            <p className="descripcion">
              Según tus respuestas, tienes una alta afinidad por el pensamiento lógico,
              la resolución de problemas y el trabajo en equipo.
            </p>
          </div>
        </section>

        <section className="sugerencias">
          <h2>También podrías considerar:</h2>
          <ul>
            <li>📘 Técnico en Programación de Software</li>
            <li>🛠️ Técnico en Mantenimiento de Equipos de Cómputo</li>
            <li>🔧 Operario en Ensamble de Productos Electrónicos</li>
          </ul>
        </section>

        <section className="acciones">
            <button type="button" className="nav-link register-btn" onClick={verprogramas}>Ver más programas</button>
          
            <button type="button" onClick={irtest}>Volver a intentar</button>
          
        </section>
      </main>
    </>
  );
};

export default Resultado;
