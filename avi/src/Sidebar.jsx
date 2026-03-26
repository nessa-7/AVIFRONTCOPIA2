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
            className={`rail-icon ${vistaActiva === "analisis" ? "active" : ""}`}
            onClick={() => setVistaActiva("analisis")}
            title="Análisis de datos"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 20V9"></path>
              <path d="M12 20V5"></path>
              <path d="M19 20V12"></path>
            </svg>
          </button>


{/*          
          <button
            type="button"
            className={`rail-icon ${vistaActiva === "estadisticas" ? "active" : ""}`}
            onClick={() => setVistaActiva("estadisticas")}
            title="Estadisticas"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 2v4"/><path d="M12 2v4"/><path d="M16 2v4"/><rect width="16" height="18" x="4" y="4" rx="2"/><path d="M8 10h6"/><path d="M8 14h8"/><path d="M8 18h5"/>
            </svg>
          </button>
*/}
          

          <button
            type="button"
            className={`rail-icon ${vistaActiva === "programas" ? "active" : ""}`}
            onClick={() => setVistaActiva("programas")}
            title="Programas"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>            </svg>
          </button>

          <button
            type="button"
            className={`rail-icon ${vistaActiva === "aspirantes" ? "active" : ""}`}
            onClick={() => setVistaActiva("aspirantes")}
            title="Aspirantes"
          >
            <svg className="rail-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 21a6 6 0 0 0-12 0"/><circle cx="12" cy="11" r="4"/><rect width="18" height="18" x="3" y="3" rx="2"/>
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
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M6.376 18.91a6 6 0 0 1 11.249.003"/><circle cx="12" cy="11" r="4"/>
            </svg>
          </button>


          <button type="button" className="logout-btn rail-avatar" onClick={salir} title="Cerrar sesion">
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
