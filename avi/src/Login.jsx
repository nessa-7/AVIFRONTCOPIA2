import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import "./Login.css";

function Login() {
  const LOGINASPIRANTE_API = import.meta.env.VITE_API_LOGINASPIRANTE;
  const LOGINADMINS_API = import.meta.env.VITE_API_LOGINADMINS;

  const navigate = useNavigate();

  const [rolSeleccionado, setRolSeleccionado] = useState("aspirante");
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { guardarToken, guardarNombre, guardarRol, guardarEmail, guardarId, guardarFoto } = useAuth();

  async function Ingresar(e) {
    e.preventDefault();

    const endpoint =
      rolSeleccionado === "aspirante" ? LOGINASPIRANTE_API : LOGINADMINS_API;

    const respuesta = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: parseInt(id),
        pass,
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok || data.mensaje === "Credenciales incorrectas") {
      Swal.fire({
        icon: "error",
        title: "Datos incorrectos",
        confirmButtonColor: "#7b2cbf",
      });
      return;
    }

    guardarToken(data.token);
    guardarRol(data.rol);
    guardarId(data.id);

    if (rolSeleccionado === "aspirante") {
      guardarNombre(data.usuario.nombre_completo);
      guardarEmail(data.usuario.email);
      guardarId(data.usuario.idASPIRANTE);
      guardarFoto(data.usuario.foto);
    } else {
      guardarNombre(data.usuario.nombre);
    }

    Swal.fire({
      icon: "success",
      title: "Bienvenido a AVI",
      confirmButtonColor: "#7b2cbf",
    }).then(() => {
      navigate(rolSeleccionado === "aspirante" ? "/inicioaspirante" : "/inicioadmin");
    });
  }

  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-top">
          <h1>Bienvenido De Nuevo</h1>
          <br /> 
        </div>

        <div className="login-content">
          <div className="login-card">
            <div className="login-badge-row">
              <span></span>
              <div className="login-badge" aria-hidden="true">
                <svg className="lock-icon" viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="10" rx="2"></rect>
                  <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
                </svg>
              </div>
              <span></span>
            </div>

            <div className="role-switch">
              <button
                className={rolSeleccionado === "aspirante" ? "active" : ""}
                onClick={() => setRolSeleccionado("aspirante")}
                type="button"
              >
                Aspirante
              </button>
              <button
                className={rolSeleccionado === "admin" ? "active" : ""}
                onClick={() => setRolSeleccionado("admin")}
                type="button"
              >
                Administrador
              </button>
            </div>

            <div className="login-description">
              {rolSeleccionado === "aspirante" ? (
                <p>
                  Ingresa como <strong>aspirante</strong> para conocer las recomendaciones
                  que nuestro test vocacional tiene para ti.
                </p>
              ) : (
                <p>
                  Ingresa como <strong>administrador</strong> para visualizar estadisticas,
                  gestionar usuarios y administrar la plataforma.
                </p>
              )}
            </div>

            <form onSubmit={Ingresar} className="login-form">
              <div className="input-wrap">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 6h18v12H3z"></path>
                    <path d="m4 7 8 6 8-6"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Numero de identificacion"
                  required
                  onChange={(e) => setId(e.target.value)}
                />
              </div>

              <div className="password-field input-wrap">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="8" cy="16" r="3"></circle>
                    <path d="M11 16h10"></path>
                    <path d="M18 16v-3"></path>
                    <path d="M15 16v-2"></path>
                    <path d="M8 13V9a4 4 0 0 1 7.5-2"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contrasena"
                  required
                  onChange={(e) => setPass(e.target.value)}
                />
                <button
                  type="button"
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M3 3l18 18"></path>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
{/*
              <div className="forgot-wrap">
                <button type="button" className="forgot-btn">
                  Olvidaste tu contraseña?
                </button>
              </div>
*/}

              <button type="submit" className="login-btn">
                Iniciar Sesion
              </button>

              <div className={`aspirante-extra ${rolSeleccionado === "aspirante" ? "" : "is-hidden"}`}>
                <div className="separator-row" aria-hidden="true">
                  <span></span>
                  <small>o</small>
                  <span></span>
                </div>

                <button
                  type="button"
                  className="create-account-btn"
                  onClick={() => navigate("/registro")}
                  tabIndex={rolSeleccionado === "aspirante" ? 0 : -1}
                >
                  Crear cuenta
                </button>
              </div>
            </form>
          </div>

          <div className="login-visual">
            <div className="login-visual-circle">
              <img src="/logoAVI.png" alt="Mascota AVI" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
