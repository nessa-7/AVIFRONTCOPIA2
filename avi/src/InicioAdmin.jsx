import "./InicioAdmin.css";
import Estadisticas from "./Estadisticas";
import ProgramasAdmin from "./ProgramasAdmin";
import AspirantesGet from "./AspirantesGet";
import AprendizGet from "./AprendizGet";
import AdminGet from "./AdminGet";
import { useAuth } from "./context/AuthContext";

function InicioAdmin({ vistaActiva, setVistaActiva }) {
  const mostrarVistaInterna = vistaActiva !== "dashboard";

  const { nombre } = useAuth()
  
  const renderVista = () => {
    if (vistaActiva === "estadisticas") return <Estadisticas />;
    if (vistaActiva === "programas") return <ProgramasAdmin />;
    if (vistaActiva === "aspirantes") return <AspirantesGet />;
    if (vistaActiva === "aprendices") return <AprendizGet />;
    if (vistaActiva === "admins") return <AdminGet />;
    return null;
  };

  return (
    <main className="dash-main" style={{padding: "20px"}}>
      {!mostrarVistaInterna && (
        <>
          <header className="dash-header">
            <div>
              <h2>Hi, {nombre}</h2>
              <p>Let's look at your daily activity overview.</p>
            </div>
            <div className="header-right">
              <span className="search-pill">Search for healthy metrics</span>
              <button type="button" className="notify-btn" title="Notificaciones">
                <svg className="notify-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 9a6 6 0 1 1 12 0v5l2 2H4l2-2z"></path>
                  <path d="M10 19a2 2 0 0 0 4 0"></path>
                </svg>
              </button>
            </div>
          </header>

          <section className="hero-row">
            <article className="hero-left">
              <h3>
                Your Fitness Journey
                <br />
                Starts Here!
              </h3>
              <p>
                Try Email Finder. Build and leads database easily. Just clicks faster with our
                efficient email Finder system.
              </p>

              <div className="store-buttons">
                <span>AppStore</span>
                <span>Google Play</span>
              </div>

              <div className="hero-stats">
                <div>
                  <strong>+20M+</strong>
                  <small>Users</small>
                </div>
                <div>
                  <strong>+120+</strong>
                  <small>Happy Clients</small>
                </div>
                <div>
                  <strong>80+</strong>
                  <small>5-Star Reviews</small>
                </div>
              </div>

              <div className="hero-sparkles">
                <span className="s1">*</span><span className="s2">*</span><span className="s3">*</span>
                <span className="s4">*</span><span className="s5">*</span><span className="s6">*</span>
                <span className="s7">*</span><span className="s8">*</span><span className="s9">*</span>
                <span className="s10">*</span><span className="s11">*</span><span className="s12">*</span>
                <span className="s13">*</span><span className="s14">*</span><span className="s15">*</span>
                <span className="s16">*</span><span className="s17">*</span><span className="s18">*</span>
              </div>

              <img src="/logoAVI.png" alt="Mascota" className="hero-cat" />
            </article>

            <article className="hero-right">
              <h4 className="hyd-card-title">Aspirantes Registrados</h4>
              <p className="hyd-title">Numero De Aspirantes Registrados En Todo El Mes</p>

              <div className="hyd-layout">
                <div className="hyd-message">215 usuarios registrados como aspirantes</div>

                <div>
                  <div className="asp-icon-wrap">
                    <svg className="asp-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="8" r="4"></circle>
                      <path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path>
                    </svg>
                    <span className="asp-plus">+</span>
                  </div>
                  <div className="asp-count">
                    <span className="asp-count-number">215</span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="admin-grid">
            <article className="admin-card mini-card purple">
              <button
                type="button"
                className="mini-card-btn"
                onClick={() => setVistaActiva("estadisticas")}
              >
                <div className="mini-card-head"><span className="mini-dot">*</span> Estadisticas</div>
                <p className="mini-card-sub">Ver estadisticas</p>
                <div className="mini-wave"><span></span></div>
              </button>
            </article>

            <article className="admin-card mini-card cyan">
              <button
                type="button"
                className="mini-card-btn"
                onClick={() => setVistaActiva("programas")}
              >
                <div className="mini-card-head"><span className="mini-dot">*</span> Programas</div>
                <p className="mini-card-sub">Ver programas</p>
                <div className="mini-bars">
                  <span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
              </button>
            </article>

            <article className="admin-card mini-card yellow">
              <button
                type="button"
                className="mini-card-btn"
                onClick={() => setVistaActiva("aspirantes")}
              >
                <div className="mini-card-head">
                  <span className="mini-dot">*</span> Gestionar Aspirante
                </div>
                <p className="mini-card-sub">Ver aspirantes</p>
                <div className="mini-metric"><strong>215</strong><small>Aspirantes</small></div>
              </button>
            </article>

            <article className="admin-card mini-card cyan">
              <button
                type="button"
                className="mini-card-btn"
                onClick={() => setVistaActiva("aprendices")}
              >
                <div className="mini-card-head">
                  <span className="mini-dot">*</span> Gestionar Aprendiz
                </div>
                <p className="mini-card-sub">Ver aprendices</p>
                <div className="mini-bars">
                  <span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
              </button>
            </article>

            <article className="admin-card mini-card purple">
              <button
                type="button"
                className="mini-card-btn"
                onClick={() => setVistaActiva("admins")}
              >
                <div className="mini-card-head">
                  <span className="mini-dot">*</span> Gestionar Administrador
                </div>
                <p className="mini-card-sub">Ver administradores</p>
                <div className="mini-wave"><span></span></div>
              </button>
            </article>
          </section>
        </>
      )}

      {mostrarVistaInterna && <div className="dash-inner-page">{renderVista()}</div>}
    </main>
  );
}

export default InicioAdmin;
