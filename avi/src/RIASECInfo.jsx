import React, { useState } from "react";
import "./RIASECInfo.css";

/* ICONO BASE SVG */
const Icon = ({ d }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

export default function RIASECInfo() {
  const [active, setActive] = useState("R");

  const types = {
    R: {
      title: "Realista",
      icon: <Icon d="M14.7 6.3l3 3L8 19H5v-3L14.7 6.3z" />,
      desc: "Personas que prefieren actividades prácticas, trabajar con herramientas, maquinaria o tecnología.",
      examples: "Ejemplos: mecánica, mantenimiento, electrónica, construcción."
    },
    I: {
      title: "Investigativo",
      icon: <Icon d="M10 2a8 8 0 105.3 14.1l4.3 4.3" />,
      desc: "Personas curiosas que disfrutan analizar, investigar y resolver problemas complejos.",
      examples: "Ejemplos: ciencia, programación, análisis de datos."
    },
    A: {
      title: "Artístico",
      icon: <Icon d="M12 20h9M4 20h8l8-16H8L4 20z" />,
      desc: "Personas creativas que disfrutan expresarse mediante el arte, el diseño o la creación.",
      examples: "Ejemplos: diseño gráfico, música, ilustración, cine."
    },
    S: {
      title: "Social",
      icon: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z" />,
      desc: "Personas que disfrutan ayudar, enseñar o trabajar directamente con otras personas.",
      examples: "Ejemplos: educación, psicología, orientación, trabajo social."
    },
    E: {
      title: "Emprendedor",
      icon: <Icon d="M3 7h18M3 12h18M3 17h18" />,
      desc: "Personas con iniciativa que disfrutan liderar proyectos o tomar decisiones.",
      examples: "Ejemplos: negocios, liderazgo, ventas, administración."
    },
    C: {
      title: "Convencional",
      icon: <Icon d="M3 3h18v18H3zM7 7h10M7 11h10M7 15h6" />,
      desc: "Personas organizadas que prefieren trabajar con datos y procesos estructurados.",
      examples: "Ejemplos: contabilidad, gestión administrativa, logística."
    }
  };



        const steps = [
        {
          title: "Interpretación de intereses",
          desc: "Cada respuesta del test se relaciona con uno de los seis tipos de personalidad del modelo RIASEC."
        },
        {
          title: "Construcción del perfil",
          desc: "El sistema combina los tipos con mayor puntuación para construir un perfil vocacional dominante (por ejemplo: I-A-S)."
        },
        {
          title: "Relación con áreas de estudio",
          desc: "Cada perfil RIASEC se relaciona con áreas profesionales y programas de formación que comparten características similares."
        },
        {
          title: "Generación de recomendaciones",
          desc: "A partir de estas relaciones, la aplicación puede recomendar programas de formación que se ajustan mejor a los intereses del usuario."
        }
        ];

        const [currentStep, setCurrentStep] = useState(0);

        const nextStep = () => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
        };

        const prevStep = () => {
        setCurrentStep((prev) =>
            prev === 0 ? steps.length - 1 : prev - 1
        );
        };


  return (
    <div className="riasec-container">

      {/* GRID SUPERIOR */}
      <div className="riasec-grid">

        <section className="card riasec-model">
          <h1>Modelo Vocacional RIASEC</h1>
          <p>
            El modelo RIASEC es una teoría de orientación vocacional desarrollada
            por el psicólogo John L. Holland. Esta teoría permite identificar los
            intereses profesionales de una persona y relacionarlos con entornos
            educativos o laborales compatibles.
          </p>
          <div className="Ri-top-cat">
              <img src="/avihuh.png" alt="Mascota AVI" />
            </div>

        </section>

        <section className="card riasec-types">
          <h1>Tipos de personalidad vocacional</h1>

          <div className="riasec-hexagon">
            {["R","I","A","S","E","C"].map(k => (
              <button
                key={k}
                className={`hex ${k.toLowerCase()} ${active === k ? "active" : ""}`}
                onClick={() => setActive(k)}
              >
                {k}
              </button>
            ))}
          </div>

        <div className={`type-card type-${active}`}>            <div className="type-icon">{types[active].icon}</div>
            <h3>{types[active].title} ({active})</h3>
            <p>{types[active].desc}</p>
            <span>{types[active].examples}</span>
          </div>
        </section>

      </div>


      {/* STEPPER ALGORITMO */}
    <section className="riasec-steps-card">

      <h1 className="h13">¿Cómo utilizamos el modelo RIASEC en AVI?</h1>



  <div className="steps-header">
    <button className="step-nav" onClick={prevStep}>
      ‹
    </button>

    <div className="step-title">
      {currentStep + 1}. {steps[currentStep].title}
    </div>

    <button className="step-nav" onClick={nextStep}>
       ›
    </button>
  </div>

  <div className="step-content">
    <p>{steps[currentStep].desc}</p>
  </div>

  <div className="steps-bar">
    <div
      className="steps-bar-fill"
      style={{
        width: `${((currentStep + 1) / steps.length) * 100}%`
      }}
    />
  </div>

</section>
{/* REFERENCIA */}
<section className="reference-card">

  <div className="reference-header">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
    <h3>Referencia teórica</h3>
  </div>

  <p className="ref-muted">Basado en el documento público:</p>

  <p className="riasec-ref-text">
    "Inventario de Preferencias Profesionales para Jóvenes (IPPJ)" basado
    en la teoría vocacional RIASEC desarrollada por John L. Holland.
    El documento se utiliza como base teórica para instrumentos de
    orientación vocacional.
  </p>

  <p className="riasec-ref-link">
    Consulta el documento completo en:
    <a
      href="https://educacion.gob.ec/wp-content/uploads/downloads/2017/04/Inventario-de-Preferencias-Profesionales-para-Jo%CC%81venesIPPJ.pdf"
      target="_blank"
      rel="noopener noreferrer"
    >
      Inventario de Preferencias Profesionales para Jóvenes (IPPJ)
    </a>
  </p>

</section>
    </div>
  );
}