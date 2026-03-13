import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Inicio.css"
import Chart from "chart.js/auto";

const teamMembers = [
  { name: "Vanessa Rodriguez", role: "Coordinación", variant: "lavender", jobTitle: "Full Stack Developer" },
  { name: "Cristian Castro", role: "Diseño UX", variant: "cyan", jobTitle: "Android & AR Developer" },
  { name: "Sofia Alzate", role: "Contenido", variant: "yellow", jobTitle: "Android & Backend Developer" },
  { name: "Brayan Duran", role: "Programación", variant: "lavender", jobTitle: "Data Analyst" },
  { name: "Nicol Rivera", role: "Analítica", variant: "cyan", jobTitle: "Frontend Developer" },
  { name: "Steven Pame", role: "Relaciones", variant: "yellow", jobTitle: "Android & Frontend Developer" },
  { name: "Alejandro Moreno", role: "Calidad", variant: "lavender", jobTitle: "Documentation Specialist" },
];

const services = [
  {
    title: "Test",
    copy: "Responde preguntas cortas para identificar tus intereses.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="4.5" width="12" height="15" rx="2"></rect>
        <path d="M9 9.5h6"></path>
        <path d="M9 13.5h6"></path>
        <path d="M10 17l1.3 1.3 2.7-2.7"></path>
      </svg>
    ),
    variant: "lavender",
  },
  {
    title: "Programas",
    copy: "Descubre rutas que combinan tus fortalezas y estilo de vida.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8h16"></path>
        <path d="M8 12h8"></path>
        <path d="M11 16h2"></path>
      </svg>
    ),
    variant: "cyan",
  },
  {
    title: "Mapa",
    copy: "Ubica sedes, fechas e itinerarios para acercarte al SENA.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v16"></path>
        <path d="M4 12h16"></path>
        <path d="M6 6l12 12"></path>
      </svg>
    ),
    variant: "yellow",
  },
];

export default function Inicio() {
  const navigate = useNavigate();

  function irRegistro() {
    navigate("/registro");
  }


  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const stepChart = useRef(null);

  async function handleSuggestionSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFormStatus(null);

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (!response.ok) throw new Error("No se pudo enviar la sugerencia.");
      setFormStatus({ type: "success", message: "Gracias por la sugerencia, te contactaremos pronto." });
      setFormState({ name: "", email: "", message: "" });
    } catch (error) {
      setFormStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!stepChart.current) return;
    const segmentLabelPlugin = {
      id: "segmentLabel",
      afterDatasetDraw(chartInstance) {
        const {
          ctx,
          data: { labels },
        } = chartInstance;

        ctx.save();
        chartInstance.getDatasetMeta(0).data.forEach((segment, index) => {
          const label = labels[index];
          const center = segment.getCenterPoint();

          ctx.font = "600 13px 'Segoe UI', sans-serif";
          ctx.fillStyle = "#1c1840";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, center.x, center.y);
        });

        ctx.restore();
      },
    };

    const stepInstance = new Chart(stepChart.current, {
      type: "doughnut",
      data: {
        labels: ["Inicio", "Registro", "Navegación"],
        datasets: [
          {
            data: [40, 30, 30],
            backgroundColor: ["#b9a2d8", "#2fb1b8", "#eab733"],
            borderColor: "#ffffff",
            borderWidth: 3,
          },
        ],
      },
      options: {
        cutout: "40%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
      plugins: [segmentLabelPlugin],
    });
    return () => stepInstance.destroy();
  }, []);



  return (
  <main className="landing-page">
    <section className="landing-shell">
        <div className="landing-hero">
          <span className="hero-star star-1">✦</span>
          <span className="hero-star star-2">✦</span>

          <div className="hero-copy">
            <p className="hero-kicker">* Plataforma de orientación vocacional</p>
            <h1>
              Bienvenido a AVI
              <br />
              Descubre Tu Perfil
              <br />
              Profesional
            </h1>
            <p className="hero-description">
              ¿Buscas estudiar un técnico o tecnólogo del SENA?
              <br />
              AVI evalúa tus talentos y te recomienda el programa más adecuado para ti.
            </p>

            <div className="hero-app-buttons">
              <button type="button" onClick={irRegistro}>
                Regístrate Ahora
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-cat-bg"></div>
            <img src="/logoAVI.png" alt="Mascota AVI" />
          </div>
        </div>
      </section>

      <section className="landing-reasons">
        <h2>Servicios de Aplicación</h2>
        <div className="reasons-grid services-grid">
          {services.map((service) => (
            <article className={`reason-card ${service.variant}`} key={service.title}>
              <div className="reason-header">
                <span className="reason-icon-glyph">{service.icon}</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-footer-headline">
        <h2>¿Cuales son los pasos del aspirante ?</h2>

        <section className="landing-steps">
          <div className="step-chart-card">
            <canvas ref={stepChart} aria-label="Pasos del aspirante"></canvas>
          </div>
        </section>
      </section>

      

      <section className="landing-team-suggestions">
        <div className="team-and-form">
          <div className="team-area">
            <h2>Miembros del equipo</h2>
            <div className="team-grid">
              {teamMembers.map((member) => (
                <article className={`team-card ${member.variant}`} key={member.name}>
                  <h3>{member.name}</h3>
                  <p className="team-job">{member.jobTitle}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="suggestion-section">
            <h2>Formulario de sugerencias</h2>
            <form className="suggestion-form" onSubmit={handleSuggestionSubmit}>
              <label>
                Nombre
                <input
                  name="name"
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>
              <label>
                Correo
                <input
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>
              <label>
                ¿Cómo podemos mejorar?
                <textarea
                  name="message"
                  rows="4"
                  value={formState.message}
                  onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
                  required
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar sugerencia"}
              </button>
            </form>
            {formStatus && (
              <p className={`suggestion-status ${formStatus.type}`}>{formStatus.message}</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

