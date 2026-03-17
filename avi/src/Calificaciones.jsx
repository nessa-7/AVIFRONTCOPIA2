import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Calificaciones.css";

const rankingSlots = [
  {
    title: "Primer lugar",
    slot: "first",
    accent: "#f0bc33",
    description: "Elige el programa que mas te interesó.",
    rank: 2
  },
  {
    title: "Segundo lugar",
    slot: "second",
    accent: "#68ff5d",
    description: "La opcion que estaria justo despues de tu favorito.",
    rank: 1
  },
  {
    title: "Tercer lugar",
    slot: "third",
    accent: "#ffb2cf",
    description: "Una alternativa que tambien te llama la atencion.",
    rank: 0
  },
];

function Calificaciones() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const recommendedPrograms = result?.resultadoIA?.recommendations ?? [];
  const programOptions = recommendedPrograms.length
    ? recommendedPrograms
    : [];

  const [selected, setSelected] = useState({
    first: "",
    second: "",
    third: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  // No hay selección automática: el usuario debe escoger.
  const getFilteredOptions = (slotKey) => {
    return programOptions.filter((program) => {
      return (
        program.name === selected[slotKey] ||
        !Object.keys(selected).some(
          (key) => key !== slotKey && selected[key] === program.name
        )
      );
    });
  };

  const handleSelect = (slotKey, value) => {
    setSelected((prev) => ({ ...prev, [slotKey]: value }));
  };

  const canSave =
    !!selected.first &&
    !!selected.second &&
    !!selected.third &&
    new Set(Object.values(selected)).size === 3;

  const submitRanking = async () => {
    if (!canSave) {
      alert("Selecciona tres programas distintos antes de guardar.");
      return;
    }

    const payloadRankings = [
      { slot: "first", value: selected.first, ranking: 2 },
      { slot: "second", value: selected.second, ranking: 1 },
      { slot: "third", value: selected.third, ranking: 0 },
    ];

    const rankings = payloadRankings
      .map((item) => {
        const program = recommendedPrograms.find((p) => p.name === item.value);
        if (!program) return null;

        const idValue = program.idRECOMENDACION ?? program.id ?? null;
        const idRECOMENDACION = Number.isInteger(Number(idValue))
          ? Number(idValue)
          : null;

        const programaId = Number.isInteger(Number(program.programaId))
          ? Number(program.programaId)
          : Number.isInteger(Number(program.idPROGRAMA))
            ? Number(program.idPROGRAMA)
            : null;

        const reporteId = Number.isInteger(Number(program.reporteId))
          ? Number(program.reporteId)
          : Number.isInteger(Number(result?.reporte?.idREPORTE))
            ? Number(result.reporte.idREPORTE)
            : null;

        const seeded = {
          ranking: item.ranking,
          nombre: program.name,
          programaId,
          reporteId,
        };

        if (idRECOMENDACION !== null) seeded.idRECOMENDACION = idRECOMENDACION;

        return seeded;
      })
      .filter(Boolean);

    console.log('submitRanking rankings=', rankings);

    if (rankings.length !== 3) {
      setApiError(
        "No se pueden determinar todos los idRECOMENDACION. Vuelve a generar resultados."
      );
      return;
    }

    setIsSaving(true);
    setApiError("");

    try {
      const API =
        import.meta.env.VITE_API_BACKEND ||
        "https://avibackcopia2-production.up.railway.app/api/test";
      const url = `${API.replace(/\/$/, "")}/ranking`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankings }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo guardar.");
      }

      Swal.fire({
        icon: "success",
        title: "Listo",
        text: "Excelente, tu proceso vocacional ha finalizado.",
        confirmButtonText: "Ir a inicio",
      }).then(() => {
        navigate("/inicioaspirante");
      });
    } catch (error) {
      console.error(error);
      setApiError(error.message || "Error enviando ranking.");
    } finally {
      setIsSaving(false);
    }
  };

  const goToResults = () => {
    navigate("/resultado", { state: { result } });
  };

  const hasRecommendations = recommendedPrograms.length > 0;

  return (
    <section className="calificaciones-page">
      <div className="calificaciones__glow calificaciones__glow--top"></div>
      <div className="calificaciones__glow calificaciones__glow--bottom"></div>

      <div className="calificaciones-panel">
        <header className="calificaciones-header">
          <p className="calificaciones-header__eyebrow"></p>
          <h1>Define el orden de tu preferencia</h1>
          <p>
            En las siguientes casillas selecciona los programas de tu interes y decide cual ira
            en primer, segundo y tercer lugar según tus metas.
          </p>
          <p className="calificaciones-result-note">
            {hasRecommendations
              ? "Aquí puedes ordenar los programas que el test te recomendo."
              : "Sin resultados disponibles."}
          </p>
        </header>

        <div className="calificaciones-list">
          {rankingSlots.map((item) => (
            <div
              key={item.title}
              className="calificacion-card"
              style={{
                borderColor: item.accent,
                border: `${item.accent} 1px solid`,
              }}
            >
              <div className="calificacion-card__head">
                <span className="calificacion-card__indicator" style={{ background: item.accent }}>
                  {item.title.split(" ")[0][0]}
                </span>
                <div>
                  <p className="calificacion-card__title">{item.title}</p>
                  <small>{item.description}</small>
                </div>
              </div>

              <label className="calificacion-card__select">
                <select
                  value={selected[item.slot] || ""}
                  onChange={(e) => handleSelect(item.slot, e.target.value)}
                  disabled={isSaving}
                >
                  <option value="">-- Seleccione un programa --</option>
                  {getFilteredOptions(item.slot).map((program) => {
                    const selectedName = selected[item.slot];
                    const isSelectedByOther =
                      program.name !== selectedName &&
                      Object.keys(selected).some(
                        (key) => key !== item.slot && selected[key] === program.name
                      );
                    return (
                      <option key={program.name} value={program.name} disabled={isSelectedByOther}>
                        {program.name}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>
          ))}
        </div>

        {apiError && <p className="calificaciones-error">{apiError}</p>}

        <div className="calificaciones-footer">
          <button
            type="button"
            className="calificaciones-footer__btn"
            onClick={submitRanking}
            disabled={!canSave || isSaving}
          >
            {isSaving ? "Terminando..." : "Terminar"}
          </button>

          
        </div>
      </div>
    </section>
  );
}

export default Calificaciones;