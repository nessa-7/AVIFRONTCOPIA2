import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Aspirante.css";
import { useAuth } from "./context/AuthContext";

function AdminGet() {
  const API = import.meta.env.VITE_API_GETADMINS;
  const REGISTROADMINS_API = import.meta.env.VITE_API_REGISTROADMINS;

  const { id, nombre } = useAuth()

  const [admins, setAdmins] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [nuevoAdmin, setNuevoAdmin] = useState({
    idADMIN: "",
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const obtenerAdmins = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setAdmins(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    obtenerAdmins();
  }, []);

  const confirmarEstado = async (admin) => {
    const accion = admin.activo ? "deshabilitar" : "habilitar";

    const result = await Swal.fire({
      title: `Seguro que deseas ${accion} este administrador?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    await fetch(`${API}/${admin.idADMIN}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !admin.activo }),
    });

    Swal.fire("Actualizado", "", "success");
    obtenerAdmins();
  };

  const abrirDrawerNuevo = () => {
    setNuevoAdmin({
      idADMIN: "",
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setModalNuevo(true);
  };

  const cerrarDrawerNuevo = () => {
    setModalNuevo(false);
  };

  const handleNuevoChange = (e) => {
    const { name, value } = e.target;
    setNuevoAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const registrarNuevoAdmin = async (e) => {
    e.preventDefault();

    if (!REGISTROADMINS_API) {
      Swal.fire("Error", "Falta VITE_API_REGISTROADMINS en .env", "error");
      return;
    }

    if (!/^\d{6,}$/.test(nuevoAdmin.idADMIN)) {
      Swal.fire("Error", "El ID debe tener minimo 6 digitos", "error");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(nuevoAdmin.email)) {
      Swal.fire("Error", "Correo electronico invalido", "error");
      return;
    }

    if (nuevoAdmin.password.length < 8) {
      Swal.fire("Error", "La contrasena debe tener minimo 8 caracteres", "error");
      return;
    }

    if (nuevoAdmin.password !== nuevoAdmin.confirmPassword) {
      Swal.fire("Error", "Las contrasenas no coinciden", "error");
      return;
    }

    setGuardandoNuevo(true);

    try {
      const respuesta = await fetch(REGISTROADMINS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idADMIN: parseInt(nuevoAdmin.idADMIN, 10),
          nombre: nuevoAdmin.nombre,
          email: nuevoAdmin.email,
          password: nuevoAdmin.password,
        }),
      });

      if (!respuesta.ok) throw new Error("error");

      Swal.fire("Exito", "Nuevo administrador registrado", "success");
      cerrarDrawerNuevo();
      await obtenerAdmins();
    } catch {
      Swal.fire("Error", "No se pudo registrar el administrador", "error");
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const adminsFiltrados = admins.filter((admin) => {
    const nombre = String(admin.nombre || "").toLowerCase();
    const email = String(admin.email || "").toLowerCase();
    const id = String(admin.idADMIN || "");
    return (
      nombre.includes(busqueda.toLowerCase()) ||
      email.includes(busqueda.toLowerCase()) ||
      id.includes(busqueda)
    );
  });

  const totalPaginas = Math.ceil(adminsFiltrados.length / porPagina);
  const inicio = (pagina - 1) * porPagina;
  const adminsPagina = adminsFiltrados.slice(inicio, inicio + porPagina);

  return (
    <div className="contenedordelista">
      <div className="table-controls">
        <div className="top-header">
          <h1 className="tituloadmin">Hola, {nombre}</h1>  
          <div className="top-actions">
            <button className="btn-add" onClick={abrirDrawerNuevo}>
              + Nuevo Administrador
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="top-header">
          <h2>Lista de Administradores</h2>
          <div className="top-actions">
            

            <input
              className="search"
              placeholder="Buscar por id, nombre o email"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        <table className="tablalista">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {adminsPagina.map((admin) => (
              <tr key={admin.idADMIN}>
                <td>{admin.idADMIN}</td>
                <td>{admin.nombre}</td>
                <td>{admin.email}</td>
                <td>
                  <span
                    className={admin.activo ? "estado activo" : "estado inactivo"}
                    onClick={() => confirmarEstado(admin)}
                  >
                    {admin.activo ? "Habilitado" : "Deshabilitado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
            Previous
          </button>

          {[...Array(totalPaginas || 1)].map((_, i) => (
            <button
              key={i}
              className={pagina === i + 1 ? "active-page" : ""}
              onClick={() => setPagina(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={pagina === (totalPaginas || 1)}
            onClick={() => setPagina(pagina + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {modalNuevo && (
        <div className="drawer-overlay" onClick={cerrarDrawerNuevo}>
          <aside className="asp-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="asp-drawer-header">
              <h3>Nuevo Administrador</h3>
              <button className="asp-drawer-close" onClick={cerrarDrawerNuevo}>
                X
              </button>
            </div>

            <form className="asp-drawer-form" onSubmit={registrarNuevoAdmin}>
              <label>ID</label>
              <input
                name="idADMIN"
                className="asp-drawer-input"
                value={nuevoAdmin.idADMIN}
                onChange={handleNuevoChange}
                required
              />

              <label>Nombre</label>
              <input
                name="nombre"
                className="asp-drawer-input"
                value={nuevoAdmin.nombre}
                onChange={handleNuevoChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                className="asp-drawer-input"
                value={nuevoAdmin.email}
                onChange={handleNuevoChange}
                required
              />

              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                className="asp-drawer-input"
                value={nuevoAdmin.password}
                onChange={handleNuevoChange}
                required
                minLength={8}
              />

              <label>Confirmar contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                className="asp-drawer-input"
                value={nuevoAdmin.confirmPassword}
                onChange={handleNuevoChange}
                required
                minLength={8}
              />

              <div className="asp-drawer-actions">
                <button type="button" className="asp-btn-cancel" onClick={cerrarDrawerNuevo}>
                  Cancelar
                </button>
                <button type="submit" className="asp-btn-save" disabled={guardandoNuevo}>
                  {guardandoNuevo ? "Guardando..." : "Guardar admin"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

export default AdminGet;
