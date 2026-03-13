import { useState } from "react";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Swal from "sweetalert2";
import InicioAdmin from "./InicioAdmin";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [vistaActiva, setVistaActiva] = useState("dashboard");

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
    <aside className="sidebar sidebar--full">
      <div className="dash-shell">
        <div className="dash-rail">
          <span className="rail-star">+</span>

          <button
            type="button"
            className={`rail-icon ${vistaActiva === "dashboard" ? "active" : ""}`}
            onClick={() => setVistaActiva("dashboard")}
            title="Inicio"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 10.5 12 3l9 7.5"></path>
              <path d="M6.5 9.8V20h11V9.8"></path>
              <path d="M10 20v-5h4v5"></path>
            </svg>
          </button>

          <button
            type="button"
            className={`rail-icon ${vistaActiva === "estadisticas" ? "active" : ""}`}
            onClick={() => setVistaActiva("estadisticas")}
            title="Estadisticas"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 20V9"></path>
              <path d="M12 20V5"></path>
              <path d="M19 20V12"></path>
            </svg>
          </button>

          <button
            type="button"
            className={`rail-icon ${vistaActiva === "programas" ? "active" : ""}`}
            onClick={() => setVistaActiva("programas")}
            title="Programas"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="5" width="16" height="14" rx="2"></rect>
              <path d="M8 9h8"></path>
              <path d="M8 13h8"></path>
            </svg>
          </button>

          <button
            type="button"
            className={`rail-icon ${vistaActiva === "aspirantes" ? "active" : ""}`}
            onClick={() => setVistaActiva("aspirantes")}
            title="Aspirantes"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="8" r="3"></circle>
              <path d="M4 19c0-3 2-5 5-5s5 2 5 5"></path>
              <circle cx="17" cy="9" r="2"></circle>
              <path d="M14.5 18c.4-1.8 1.7-3.2 3.5-3.8"></path>
            </svg>
          </button>

          <button
            type="button"
            className={`rail-icon ${vistaActiva === "aprendices" ? "active" : ""}`}
            onClick={() => setVistaActiva("aprendices")}
            title="Aprendices"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="8" cy="8" r="3"></circle>
              <path d="M3 19c0-3 2-5 5-5s5 2 5 5"></path>
              <path d="M15 7h6"></path>
              <path d="M15 12h6"></path>
            </svg>
          </button>

          <button
            type="button"
            className={`rail-icon ${vistaActiva === "admins" ? "active" : ""}`}
            onClick={() => setVistaActiva("admins")}
            title="Administradores"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l2.2 2.2 3.1-.4.8 3 2.7 1.6-1.6 2.7.4 3-3 .8L15.8 19 12 21l-2.2-2.2-3.1.4-.8-3-2.7-1.6 1.6-2.7-.4-3 3-.8L8.2 5 12 3z"></path>
              <circle cx="12" cy="12" r="2.3"></circle>
            </svg>
          </button>

          <img src="/logoAVI.png" alt="AVI" className="rail-avatar" />

          <button type="button" className="logout-btn" onClick={salir} title="Cerrar sesion">
            <svg className="logout-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 17l5-5-5-5"></path>
              <path d="M15 12H3"></path>
              <path d="M20 4v16"></path>
            </svg>
          </button>
        </div>

        <InicioAdmin vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
      </div>
    </aside>
  );
};

export default Sidebar;
