import { useEffect, useState } from "react";

function AdminGet() {

  const VITE_API_GETADMINS = import.meta.env.VITE_API_GETADMINS
  
  const API = VITE_API_GETADMINS;

  const [admins, setAdmins] = useState([]);

  const obtenerAdmins = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setAdmins(data);
  };

  useEffect(() => {
    obtenerAdmins();
  }, []);


  const eliminarAdmin = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este administrador?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    obtenerAdmins();
  };

  const actualizarAdmin = (id) => {
    window.location.href = `/editar/${id}`;
  };

  return (
  

<div className="asp-container">
      <div className="asp-header">
        <h2>Administradores</h2>
        <button className="btn-nuevo">+ Nuevo Admin</button>
      </div>

      <input
        className="asp-search"
        placeholder="Buscar por nombre o email"
      />

      <div className="asp-list">
        {admins.map((a) => (
          <div key={a.idADMIN} className="asp-card">
            <div className="asp-avatar">
              {a.nombre.charAt(0)}
            </div>

            <div className="asp-info">
              <h3>{a.nom}</h3>
              <span className="asp-puesto">Administrador</span>

              <p>🌟 {a.nombre}</p>
              <p>📧 {a.email}</p>

              
            </div>

            <div className="asp-actions">
              <button
                className="icon editar"
                onClick={() => actualizarAdmin(a.idADMIN)}
              >
                ✏️
              </button>

              <button className="icon bloquear">🔒</button>

              <button
                className="icon eliminar"
                onClick={() => eliminarAdmin(a.idADMIN)}
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
export default AdminGet