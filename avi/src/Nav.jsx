import { useAuth } from "./context/AuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PerfilPopup from "./PerfilPopup";
import "./Nav.css";

function Nav() {
  const { logout, foto, nombre, email } = useAuth();
  const navigate = useNavigate();

  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  function irInicio() {
    navigate("/inicioaspirante");
    setMenuAbierto(false);
  }

  function irResultados() {
    navigate("/misreportes");
    setMenuAbierto(false);
  }

  function irProgramas() {
    navigate("/programas");
    setMenuAbierto(false);
  }

  function irComoFunciona() {
    navigate("/comofuncionatest");
    setMenuAbierto(false);
  }

  function irRiasec(){
    navigate("/riasecinfo")
    setMenuAbierto(false);
  }

  const salir = () => {
    Swal.fire({
      title: "Estas seguro?",
      text: "Se cerrara la sesion actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#39a900",
      cancelButtonColor: "#ca0e0e",
      confirmButtonText: "Si, cerrar sesion",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/");
      }
    });
  };

  return (
    <div>
      <header className="bv-top-nav">
        <div className="bv-top-bar">
          <div className="bv-top-brand">
            <button type="button" className="bv-home-btn" onClick={irInicio} title="Inicio">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 10.5 12 3l9 7.5"></path>
                <path d="M6.5 9.8V20h11V9.8"></path>
                <path d="M10 20v-5h4v5"></path>
              </svg>
            </button>
            <span>AVI</span>
          </div>
          <button
            type="button"
            className="bv-menu-btn"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label={menuAbierto ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={menuAbierto}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div className={`bv-top-panel ${menuAbierto ? "is-open" : ""}`}>
          <nav className="bv-top-links">
            <button type="button" onClick={irComoFunciona}>
              Test vocacional
            </button>
            <button type="button" onClick={irResultados}>
              Resultados
            </button>
            <button type="button" onClick={irProgramas}>
              Conoce los Programas
            </button>
            <button type="button" onClick={irRiasec}>
              Conoce RIASEC
            </button>
          </nav>

          <div className="bv-top-user">
            <span>Hola, {nombre}</span>
          {/*  <button type="button" title="Notificaciones" aria-label="Notificaciones">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 18h12"></path>
                <path d="M9 18a3 3 0 0 0 6 0"></path>
                <path d="M7 18V11a5 5 0 0 1 10 0v7"></path>
              </svg>
              
            </button> */}
            <button
              type="button"
              onClick={() => setMostrarPerfil(true)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid #7b2cbf",
                padding: "0",
                cursor: "pointer",
                overflow: "hidden",
                background: "transparent"
              }}
              title="Perfil"
            >
              <img
                src={foto || "/placeholder-user.jpg"}
                alt="Perfil"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {mostrarPerfil && (
        <PerfilPopup
          usuario={{
            nombre_completo: nombre,
            email
          }}
          onClose={() => setMostrarPerfil(false)}
        />
      )}
    </div>
  );
}

export default Nav;
