import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import "./MisReportes.css"

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
          <div className="riasec-hex">
            <div className="riasec-node r">
              <span className="riasec-letter">REALISTA</span>
              <span className="riasec-score">{reporte.puntajeR}</span>
            </div>
            <div className="riasec-node i">
              <span className="riasec-letter">INVESTIGADOR</span>

              <span className="riasec-score">{reporte.puntajeI}</span>
            </div>
            <div className="riasec-node a">
              <span className="riasec-letter">ARTISTA</span>
              <span className="riasec-score">{reporte.puntajeA}</span>
            </div>
            <div className="riasec-node s">
              <span className="riasec-letter">SOCIAL</span>
              <span className="riasec-score">{reporte.puntajeS}</span>
            </div>
            <div className="riasec-node e">
              <span className="riasec-letter">EMPRENDEDOR</span>
              <span className="riasec-score">{reporte.puntajeE}</span>
            </div>
            <div className="riasec-node c">
              <span className="riasec-letter">CONVENCIONAL</span>
              <span className="riasec-score">{reporte.puntajeC}</span>
            </div>
          </div>
        </aside>
      </div>
    ))}

    </div>
  );
}

export default MisReportes;
