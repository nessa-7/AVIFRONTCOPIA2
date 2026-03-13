import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Aspirante.css";
import { useAuth } from "./context/AuthContext";

function AdminGet() {

  const API = import.meta.env.VITE_API_GETADMINS;
  const REGISTROADMINS_API = import.meta.env.VITE_API_REGISTROADMINS;

  const { nombre, token } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

  const [nuevoAdmin, setNuevoAdmin] = useState({
    idADMIN: "",
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // fetch con token automático
  const fetchAuth = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const obtenerAdmins = async () => {
    const res = await fetchAuth(API);
    const data = await res.json();
    setAdmins(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (token) {
      obtenerAdmins();
    }
  }, [token]);

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

    await fetchAuth(`${API}/${admin.idADMIN}/status`, {
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
    setNuevoAdmin((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const registrarNuevoAdmin = async (e) => {

    e.preventDefault();

    if (!/^\d{6,}$/.test(nuevoAdmin.idADMIN)) {
      Swal.fire("Error", "El ID debe tener minimo 6 digitos", "error");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(nuevoAdmin.email)) {
      Swal.fire("Error", "Correo electronico invalido", "error");
      return;
    }

    if (nuevoAdmin.password.length < 8) {
      Swal.fire("Error", "La contraseña debe tener minimo 8 caracteres", "error");
      return;
    }

    if (nuevoAdmin.password !== nuevoAdmin.confirmPassword) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    setGuardandoNuevo(true);

    try {

      const respuesta = await fetchAuth(REGISTROADMINS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idADMIN: parseInt(nuevoAdmin.idADMIN),
          nombre: nuevoAdmin.nombre,
          email: nuevoAdmin.email,
          password: nuevoAdmin.password,
        }),
      });

      if (!respuesta.ok) throw new Error();

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
          <h1 className="tituloadmin">{nombre}</h1>

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

      </div>
    </div>
  );
}

export default AdminGet;