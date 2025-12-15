
export default function Estadisticas() {
  return (
    <div>
      <h1 id="tituloestadisticas">Estadísticas de Tests</h1>

    <div id="stats-cards" className="cards">
      <div className="card">
        <div className="card-number">45</div>
        <div className="label-small">Tests Realizados</div>
        <div className="label-title">Hoy</div>
      </div>

      <div className="card">
        <div className="card-number" >1240</div>
        <div className="label-small">Tests Realizados</div>
        <div className="label-title">Este Mes</div>
      </div>

      <div className="card">
        <div className="card-number" >8956</div>
        <div className="label-small">Tests Realizados</div>
        <div className="label-title">Total</div>
      </div>
    </div>

    <h1 id="tituloestadisticas">Programas Más Recomendados</h1>

    <div id="recommended-programs" className="program-section">

      <div className="program-list">
        <div className="program-item">
          <div className="percent">35%</div>
          <div>Programa A</div>
        </div>

        <div className="program-item">
          <div className="percent">25%</div>
          <div>Programa B</div>
        </div>

        <div className="program-item">
          <div className="percent">20%</div>
          <div>Programa C</div>
        </div>

        <div className="program-item">
          <div className="percent">20%</div>
          <div>Programa D</div>
        </div>
      </div>
    </div>
  </div>
  );
}