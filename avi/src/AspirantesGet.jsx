import { useEffect, useState } from "react";

function AspirantesGet() {

   const VITE_API_GETASPIRANTES = import.meta.env.VITE_API_GETASPIRANTES
  
  const API = VITE_API_GETASPIRANTES;

  const [aspirantes, setAspirantes] = useState([]);
  

  const obtenerAspirantes = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setAspirantes(data);
  };

  useEffect(() => {
    obtenerAspirantes();
  }, []);

  const toggleBloqueo = async (id, estadoActual) => {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bloqueado: !estadoActual })
    });
    obtenerAspirantes();
  };

  const eliminarAspirante = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este aspirante?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    obtenerAspirantes();
  };

  const actualizarAspirante = (id) => {
    window.location.href = `/editar/${id}`;
  };

  return (
    <div className="tabla-container">
      <h2 className="tituloasp">Lista de Aspirantes</h2>

      <table className="tabla-aspirantes">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nombre </th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Ver Reportes</th>
            <th>Bloqueado/desbloqueado</th>
            <th>Actualizar</th>
            <th>Eliminar</th>
          </tr>
        </thead>

        <tbody>
          {aspirantes.map((a) => (
            <tr key={a.idASPIRANTE}>
              <td>{a.idASPIRANTE}</td>
              <td>{a.nombre_completo}</td>
              <td>{a.email}</td>
              <td>{a.telefono}</td>

              <td>
                <button
                  className="btn-reportes"
                  onClick={() => verReportes(a.idASPIRANTE)}
                >
                  Ver Reportes
                </button>
              </td>

              <td>
                <button
                  className={a.bloqueado ? "btn-desbloquear" : "btn-bloquear"}
                  onClick={() => toggleBloqueo(a.idASPIRANTE, a.bloqueado)}
                >
                  {a.bloqueado ? "Desbloquear" : "Bloquear"}
                </button>
              </td>

              <td>
                <button className="btn-modificar" onClick={() => actualizarAspirante(a.idASPIRANTE)}>
                  modificar
                </button>
              </td>

              <td>
                <button className="btn-eliminar" onClick={() => eliminarAspirante(a.idASPIRANTE)}>
                  eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default AspirantesGet