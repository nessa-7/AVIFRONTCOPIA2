import { useEffect, useState } from "react";
import "./Aspirante.css";

function AspirantesGet() {
  const API = import.meta.env.VITE_API_GETASPIRANTES;

  const [aspirantes, setAspirantes] = useState([]);

  const obtenerAspirantes = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setAspirantes(data);
  };

  useEffect(() => {
    obtenerAspirantes();
  }, []);

  const eliminarAspirante = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este aspirante?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    obtenerAspirantes();
  };

  const actualizarAspirante = (id) => {
    window.location.href = `/editar/${id}`;
  };

  return (
    <div className="asp-container">
      <div className="asp-header">
        <h2>Aspirantes</h2>
        <button className="btn-nuevo">+ Nuevo Aspirante</button>
      </div>

      <input
        className="asp-search"
        placeholder="Buscar por nombre o email"
      />

      <div className="asp-list">
        {aspirantes.map((a) => (
          <div key={a.idASPIRANTE} className="asp-card">
            <div className="asp-avatar">
              {a.nombre_completo.charAt(0)}
            </div>

            <div className="asp-info">
              <h3>{a.nombre_completo}</h3>
              <span className="asp-puesto">Aspirante</span>

              <p>📧 {a.email}</p>
              <p>📞 {a.telefono}</p>

              <div className="asp-tags">
                <span className="tag pendiente">Ver reportes</span>
              </div>
            </div>

            <div className="asp-actions">
              <button
                className="icon editar"
                onClick={() => actualizarAspirante(a.idASPIRANTE)}
              >
                ✏️
              </button>

              <button className="icon bloquear">🔒</button>

              <button
                className="icon eliminar"
                onClick={() => eliminarAspirante(a.idASPIRANTE)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AspirantesGet;
