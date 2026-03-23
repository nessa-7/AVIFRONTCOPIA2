import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Perfil.css";
import { useAuth } from "./context/AuthContext";

function EditarPerfil() {
  const navigate = useNavigate();
  const PERFIL_API = import.meta.env.VITE_API_PERFILASPIRANTE;
  const PERFIL_API_FALLBACK =
    import.meta.env.VITE_API_PERFIL ||
    (PERFIL_API ? PERFIL_API.replace("/perfilaspirante", "/perfil") : "");
  const { token, guardarFoto, logout } = useAuth();

  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState({
    nombre_completo: false,
    email: false,
    telefono: false,
    barrio: false,
    direccion: false,
    ocupacion: false,
    institucion: false,
  });
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("[EditarPerfil] token:", token);
    console.log("[EditarPerfil] PERFIL_API:", PERFIL_API);

    if (!token) {
      setError("No hay token de sesión activo. Por favor, inicia sesión.");
      logout();
      navigate("/login");
      return;
    }

    if (!PERFIL_API) {
      setError("No se encontró la ruta del perfil en la configuración.");
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    const normalizar = (recurso) => {
  // soporta TODAS las posibles respuestas del backend
  const perfil =
    recurso?.data ||
    recurso?.usuario ||
    recurso?.perfil ||
    recurso;

  if (!perfil || typeof perfil !== "object") {
    console.warn("Perfil inválido:", recurso);
    return {
      idASPIRANTE: "",
      nombre_completo: "",
      email: "",
      telefono: "",
      barrio: "",
      direccion: "",
      ocupacion: "",
      institucion: "",
      foto: "",
    };
  }

  return {
    idASPIRANTE: perfil.idASPIRANTE ?? perfil.id ?? "",
    nombre_completo: perfil.nombre_completo ?? perfil.nombre ?? "",
    email: perfil.email ?? "",
    telefono: perfil.telefono ?? "",
    barrio: perfil.barrio ?? "",
    direccion: perfil.direccion ?? "",
    ocupacion: perfil.ocupacion ?? "",
    institucion: perfil.institucion ?? "",
    foto: perfil.foto ?? "",
  };
};

    fetch(`${PERFIL_API}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        console.log("[EditarPerfil] status", res.status, res.ok);
        if (res.ok) {
          return res.json();
        }
        if (res.status === 401) {
          throw new Error("Token inválido o expirado. Inicia sesión nuevamente.");
        }
        if (res.status === 403) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.mensaje || "No tienes permisos para esta acción.");
        }
        throw new Error(`Error ${res.status} al cargar el perfil.`);
      })
      .then((data) => {
        if (!data) throw new Error("No hay datos de usuario.");
        const usuarioNormalizado = normalizar(data);
        setUsuario(usuarioNormalizado);
        if (usuarioNormalizado.foto) guardarFoto(usuarioNormalizado.foto);
      })
      .catch(async (error) => {
        console.error("Perfil error:", error);

        if (error.message.includes("No tienes permisos") && PERFIL_API_FALLBACK) {
          const fallbackRes = await fetch(`${PERFIL_API_FALLBACK}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            const usuarioNormalizado = normalizar(fallbackData);
            setUsuario(usuarioNormalizado);
            if (usuarioNormalizado.foto) guardarFoto(usuarioNormalizado.foto);
            return;
          }

          if (fallbackRes.status === 401 || fallbackRes.status === 403) {
            logout();
            navigate("/login");
            setError("No tienes permisos para acceder al perfil. Inicia sesión nuevamente.");
            return;
          }

          throw new Error(`Error ${fallbackRes.status} en fallback`);
        }

        setError(error.message);
        if (error.message.includes("Token inválido") || error.message.includes("No tienes permisos")) {
          logout();
          navigate("/login");
        }
      })
      .finally(() => setCargando(false));
  }, [token, PERFIL_API, guardarFoto, logout, navigate]);

  const toggleEditar = (campo) => {
    setEditando({
      nombre_completo: false,
      email: false,
      telefono: false,
      barrio: false,
      [campo]: !editando[campo],
    });
  };

  const handleChange = (e) => {
    setUsuario((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const subirFoto = () => {
    if (!window.cloudinary) return;
    setSubiendoFoto(true);

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "doeyxhpn3",
        uploadPreset: "perfiles-app",
        sources: ["local"],
        folder: "imagen de perfil",
        maxFiles: 1,
      },
      async (error, result) => {
        if (error) {
          alert("Error al subir la foto");
          setSubiendoFoto(false);
          return;
        }

        if (result?.event !== "success") return;

        const url = result.info.secure_url;
        const res = await fetch(`${PERFIL_API}/editar`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ foto: url }),
        });

        if (!res.ok) {
          alert("No se pudo guardar la foto en el perfil");
          setSubiendoFoto(false);
          return;
        }

        const data = await res.json();
        const fotoPerfil = data?.data?.foto || url;
        setUsuario((prev) => ({ ...prev, foto: fotoPerfil }));
        guardarFoto(fotoPerfil);
        setSubiendoFoto(false);
      }
    );

    widget.open();
  };

  const guardarCambios = async () => {
    if (!usuario) return;
    setGuardando(true);

    const res = await fetch(`${PERFIL_API}/editar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(usuario),
    });

    if (res.ok) {
      const data = await res.json();
      setUsuario(data.data || usuario);
      alert("Datos actualizados correctamente");
      setEditando({
        nombre_completo: false,
        email: false,
        telefono: false,
        barrio: false,
      });
    } else {
      alert("Error al actualizar los datos");
    }

    setGuardando(false);
  };

  const volver = () => window.history.back();

  if (cargando) {
    return (
      <section className="perfil-page">
        <div className="editar-perfil-container">
          <p>Cargando perfil...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="perfil-page">
        <div className="editar-perfil-container">
          <div className="perfil-card" style={{ padding: "20px", borderRadius: "12px", background: "#ffe6e6" }}>
            <h2>Error cargando perfil</h2>
            <p>{error}</p>
            <button className="btn-volver" onClick={volver}>
              Volver
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!usuario) {
    return (
      <section className="perfil-page">
        <div className="editar-perfil-container">
          <p>No se encontraron datos de usuario.</p>
        </div>
      </section>
    );
  }

  const lapizStyle = { fontSize: "0.8rem", marginLeft: "5px", cursor: "pointer" };

  const camposPerfil = [
  { key: "idASPIRANTE", label: "IDENTIFICACIÓN", editable: false },
  { key: "nombre_completo", label: "NOMBRE COMPLETO", editable: true },
  { key: "email", label: "EMAIL", editable: true },
  { key: "telefono", label: "TELÉFONO", editable: true },
  { key: "barrio", label: "BARRIO", editable: true },
  { key: "direccion", label: "DIRECCIÓN", editable: true },
  { key: "ocupacion", label: "OCUPACIÓN", editable: false },
  { key: "institucion", label: "INSTITUCIÓN", editable: false },
];

  return (
    <section className="perfil-page">
      <div className="editar-perfil-container">
        <div className="editar-header">
          <button className="btn-volver" onClick={volver}>
            Volver
          </button>
          <h1>Mi Perfil</h1>
        </div>

        <div className="perfil-card">
          <div className="perfil-card-header">
            <img
              src={usuario.foto || "/placeholder-user.jpg"}
              alt="Foto de perfil"
              className="perfil-card-foto"
              style={{
                cursor: "pointer",
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
              onClick={subirFoto}
              title="Haz clic para cambiar la foto"
            />

            <div className="perfil-card-info">
              <h2>{usuario.nombre_completo || "Sin nombre"}</h2>
              <span className="perfil-badge">Aspirante</span>
            </div>
          </div>

          <div className="perfil-datos">
            {camposPerfil.map((campo) => (
              <div className="dato-item" key={campo.key}>
                <span className="dato-label">{campo.label}</span>
                <br />

                {editando[campo.key] ? (
                  campo.key === "idASPIRANTE" ? (
                    <span className="dato-valor">{usuario[campo.key] || "---"}</span>
                  ) : (
                    <input
                      type={campo.key === "email" ? "email" : "text"}
                      name={campo.key}
                      value={usuario[campo.key] || ""}
                      onChange={handleChange}
                    />
                  )
                ) : (
                  <span className="dato-valor">{usuario[campo.key] || "---"}</span>
                )}

                {campo.editable && (
                  <button
                    className="btn-editar-campo"
                    onClick={() => toggleEditar(campo.key)}
                  >
                    {editando[campo.key] ? "Cancelar" : "✎"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            className="btn-guardar"
            onClick={guardarCambios}
            disabled={guardando || subiendoFoto}
            style={{ fontSize: "12px", padding: "4px 8px", height: "28px", minWidth: "60px" }}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default EditarPerfil;
