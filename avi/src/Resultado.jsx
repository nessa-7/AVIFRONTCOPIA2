
const Resultado = () => {
  
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
          <a href="/programas" className="nav-link loader-link">
            <button className="nav-link register-btn">Ver más programas</button>
          </a>
          <a href="/bienvenidatest" className="nav-link loader-link">
            <button>Volver a intentar</button>
          </a>
        </section>
      </main>
    </>
  );
};

export default Resultado;
