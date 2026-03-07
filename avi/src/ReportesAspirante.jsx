import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./MisReportes.css";

function ReportesAspirante() {
  const { id } = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const API = import.meta.env.VITE_API_REPORTES;

  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombreAspirante, setNombreAspirante] = useState(
    location.state?.nombreAspirante || ""
  );

  useEffect(() => {
    if (!token || !id) return;
    traerReportes();
  }, [token, id]);

  async function traerReportes() {
    try {
      setLoading(true);
      const apiTodos = API.replace(/\/misreportes\/?$/, "/todos");
      const respuesta = await fetch(apiTodos, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo obtener reportes");
      }

      const data = await respuesta.json();
      const todos = Array.isArray(data) ? data : [];
      const filtrados = todos.filter(
        (reporte) =>
          Number(reporte.aspiranteId) === Number(id) ||
          Number(reporte.aspirante?.idASPIRANTE) === Number(id)
      );
      setReportes(filtrados);
      if (!location.state?.nombreAspirante && filtrados[0]?.aspirante?.nombre_completo) {
        setNombreAspirante(filtrados[0].aspirante.nombre_completo);
      }
    } catch (error) {
      console.error(error);
      setReportes([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reportes-container">
      <h2 className="titulo">
        Reportes de {nombreAspirante || `Aspirante #${id}`}
      </h2>

      {loading && <p>Cargando reportes...</p>}

      {!loading && reportes.length === 0 && (
        <p>Este aspirante aun no tiene reportes registrados.</p>
      )}

      {!loading &&
        reportes.map((reporte) => (
          <div key={reporte.idREPORTE} className="reporte-card">
            <p className="fecha">{new Date(reporte.Fecha).toLocaleDateString()}</p>

            <h4 className="seccion-titulo">Puntajes RIASEC</h4>
            <div className="puntajes-grid">
              <div className="puntaje-box">R: {reporte.puntajeR}</div>
              <div className="puntaje-box">I: {reporte.puntajeI}</div>
              <div className="puntaje-box">A: {reporte.puntajeA}</div>
              <div className="puntaje-box">S: {reporte.puntajeS}</div>
              <div className="puntaje-box">E: {reporte.puntajeE}</div>
              <div className="puntaje-box">C: {reporte.puntajeC}</div>
            </div>

            <h4 className="seccion-titulo">Recomendaciones</h4>

            {reporte.recomendaciones?.length ? (
              reporte.recomendaciones.map((rec) => (
                <div key={rec.idRECOMENDACION} className="recomendacion-card">
                  <p><strong>{rec.nombre || rec.programa?.nombre || "Programa recomendado"}</strong></p>
                  <p>{rec.descripcion || rec.programa?.descripcion || "Sin descripcion disponible"}</p>
                </div>
              ))
            ) : (
              <p>Sin recomendaciones para este reporte.</p>
            )}
          </div>
        ))}
    </div>
  );
}

export default ReportesAspirante;
