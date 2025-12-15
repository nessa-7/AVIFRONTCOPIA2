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
    <div className="tabla-container">
      <h2 className="tituloasp">Lista de Administradores</h2>

      <table className="tabla-aspirantes">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nombre </th>
            <th>Email</th>
            <th>Actualizar</th>
            <th>Eliminar</th>
          </tr>
        </thead>

        <tbody>
          {admins.map((a) => (
            <tr key={a.idADMIN}>
              <td>{a.idADMIN}</td>
              <td>{a.nombre}</td>
              <td>{a.email}</td>

        

              <td>
                <button className="btn-modificar" onClick={() => actualizarAdmin(a.idADMIN)}>
                  modificar
                </button>
              </td>

              <td>
                <button className="btn-eliminar" onClick={() => eliminarAdmin(a.idADMIN)}>
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
export default AdminGet