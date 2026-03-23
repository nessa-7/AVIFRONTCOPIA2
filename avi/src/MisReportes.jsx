import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import "./MisReportes.css"
import { div } from "three/src/nodes/math/OperatorNode.js";

function MisReportes() {

  const API = import.meta.env.VITE_API_REPORTES;
  const { token } = useAuth();

  const [reportes, setReportes] = useState([]);

useEffect(() => {
  if (token) {
    traer();
  }
}, [token]);


async function traer() {

  try {

    const respuesta = await fetch(
      `${API}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        }
      }
    );

    const res = await respuesta.json();
    console.log(res);

    setReportes(res);

  } catch (error) {
    console.error(error);
  }
}

  return (
    <div className="mis-reportes-container">
  <div className="reportes-container">
    <h2 className="titulo">MIS REPORTES</h2>

    {reportes.map((reporte) => (
      <div key={reporte.idREPORTE} className="reporte-card">
        <div className="reporte-main">
          <p className="fecha">
            {new Date(reporte.Fecha).toLocaleDateString()}
          </p>

          <h4 className="seccion-titulo">Recomendaciones</h4>

          {reporte.recomendaciones.map((rec) => (
            <div key={rec.idRECOMENDACION} className="recomendacion-card">
              <p><strong>{rec.nombre}</strong></p>
              <p>{rec.descripcion}</p>
            </div>
          ))}
        </div>

        <aside className="riasec-side">
          <h4 className="riasec-title">RIASEC</h4>
          {(() => {
            const riasecMap = {
              REALISTA: { score: Number(reporte.puntajeR) || 0, color: '#68cde9', text: 'Práctico, manual, orientado a resultados.' },
              INVESTIGADOR: { score: Number(reporte.puntajeI) || 0, color: '#ef9cdcf8', text: 'Analítico, curioso, aprende con investigación.' },
              ARTISTA: { score: Number(reporte.puntajeA) || 0, color: '#5af27d', text: 'Creativo, expresivo, innovación estética.' },
              SOCIAL: { score: Number(reporte.puntajeS) || 0, color: '#c06adcf2', text: 'Empático, colaborador, ayuda a otros.' },
              EMPRENDEDOR: { score: Number(reporte.puntajeE) || 0, color: '#f2ef5ae7', text: 'Líder, persuasivo, toma iniciativa.' },
              CONVENCIONAL: { score: Number(reporte.puntajeC) || 0, color: '#ef8d6ff7', text: 'Organizado, metódico, datos y normas.' },
            };

            const riasecSorted = Object.entries(riasecMap)
              .map(([key, value]) => ({ key, ...value }))
              .sort((a, b) => b.score - a.score);

            const [top1, top2] = riasecSorted;
            const maxScore = Math.max(...riasecSorted.map((item) => item.score), 1);

           
            return (
              <>
                <div className="riasec-summary">
                  <p className="riasec-principal">
                    Tu perfil principal es <strong>{top1?.key || 'N/A'}</strong> {top2 ? `con tendencia ${top2.key}` : ''}
                  </p>
                  <p>
                    {reporte.explicacion}
                  </p>
                </div>

                <div className="riasec-bars">
                  {riasecSorted.map((item, index) => (
                    <div key={item.key} className={`riasec-bar-row ${index < 2 ? 'riasec-top' : ''}`}>
                      <div className="riasec-rank">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}</div>
                      <div className="riasec-label">{item.key}</div>
                      <div className="riasec-bar-track">
                        <div
                          className="riasec-bar-fill"
                          style={{ width: `${Math.round((item.score / maxScore) * 100)}%`, backgroundColor: item.color }}
                          title={`${item.key}: ${item.score}`}
                        />
                      </div>
                      <div className="riasec-score">{item.score}</div>
                      <div className="riasec-desc">{item.text}</div>
                    </div>
                  ))}
                </div>

              </>
            );
          })()}
        </aside>
      </div>
    ))}

    </div>
</div>
  );
}

export default MisReportes;
