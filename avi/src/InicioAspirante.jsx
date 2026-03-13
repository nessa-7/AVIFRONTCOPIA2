import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import "./InicioAspirante.css";
import { useAuth } from "./context/AuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


function InicioAspirante(){
    
    const navigate = useNavigate()
    const { id, token } = useAuth()
    const [cantidadAspirantes, setCantidadAspirantes] = useState("")
    const [testsCompletados, setTestsCompletados] = useState(null)

    const VITE_API_CANTIDAD_ASPIRANTES=import.meta.env.VITE_API_CANTIDAD_ASPIRANTES
    const VITE_API_TEST_COMPLETADOS_ASPIRANTE =
      import.meta.env.VITE_API_TEST_COMPLETADOS_ASPIRANTE
    const VITE_API_REPORTES = import.meta.env.VITE_API_REPORTES
    const API_TOP_PROGRAMAS = import.meta.env.VITE_API_PROGRAMAS_RECOMENDADOS
    const [programasTop, setProgramasTop] = useState([])
    const meses = 3
    const [mejorPrograma, setMejorPrograma] = useState(null)
    const [programasRecomendados, setProgramasRecomendados] = useState(null)
    
    function irProgramas() {
        navigate("/programas");
    }

    function irComoFunciona() {
        navigate("/comofuncionatest");
    }

    function irRiasecInfo() {
        navigate("/riasecinfo");
    }

    function irMisResultados() {
        navigate("/misreportes");
    }

    useEffect(() => {
      fetch(VITE_API_CANTIDAD_ASPIRANTES)
        .then((response) => response.json())
        .then((data) => {
          const valor =
            typeof data === "number"
              ? data
              : typeof data?.total === "number"
              ? data.total
              : typeof data?.cantidad === "number"
              ? data.cantidad
              : ""
          setCantidadAspirantes(valor)
        })
    }, [VITE_API_CANTIDAD_ASPIRANTES])

    useEffect(() => {
      if (!VITE_API_TEST_COMPLETADOS_ASPIRANTE || !id) return

      const endpoint = VITE_API_TEST_COMPLETADOS_ASPIRANTE.replace(
        ":id",
        String(id)
      )

      fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
        .then((response) => response.json())
        .then((data) => {
          const valor =
            typeof data === "number"
              ? data
              : typeof data?.total === "number"
              ? data.total
              : typeof data?.cantidad === "number"
              ? data.cantidad
              : typeof data?.data === "number"
              ? data.data
              : typeof data?.data?.total === "number"
              ? data.data.total
              : ""
          setTestsCompletados(valor)
        })
    }, [VITE_API_TEST_COMPLETADOS_ASPIRANTE, id, token])

    useEffect(() => {
      if (!VITE_API_REPORTES || !token) return

      fetch(VITE_API_REPORTES, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          const reportes = Array.isArray(data) ? data : []
          if (reportes.length === 0) {
            setMejorPrograma(null)
            setProgramasRecomendados(null)
            return
          }

          const ordenados = [...reportes].sort((a, b) => {
            const fechaA = new Date(a?.Fecha || a?.fecha || a?.createdAt || 0)
            const fechaB = new Date(b?.Fecha || b?.fecha || b?.createdAt || 0)
            return fechaB - fechaA
          })

          const ultimo = ordenados[0]
          const primerPrograma = ultimo?.recomendaciones?.[0]?.nombre
          setMejorPrograma(primerPrograma || null)

          const totalRecomendados = reportes.reduce((acc, rep) => {
            const cantidad = Array.isArray(rep?.recomendaciones)
              ? rep.recomendaciones.length
              : 0
            return acc + cantidad
          }, 0)

          if (totalRecomendados > 0) {
            setProgramasRecomendados(totalRecomendados)
          } else if (reportes.length > 0) {
            setProgramasRecomendados(reportes.length * 3)
          } else {
            setProgramasRecomendados(null)
          }
        })
    }, [VITE_API_REPORTES, token])

    useEffect(() => {
      async function getProgramasTop() {
        const res = await fetch(`${API_TOP_PROGRAMAS}?limit=5&meses=${meses}`)
        const json = await res.json()
        setProgramasTop(json.data || [])
      }

      if (API_TOP_PROGRAMAS) {
        getProgramasTop()
      }
    }, [API_TOP_PROGRAMAS, meses])

    const programasBarData = {
      labels: programasTop.map((p) => p.programa),
      datasets: [
        {
          label: "Recomendaciones",
          data: programasTop.map((p) => p.total),
          backgroundColor: "#6ac7dc",
          borderRadius: 6,
          barThickness: 26,
        },
      ],
    }

  return (
    <section className="bv-page">
      <div className="bv-wrap">
        <section className="bv-top-dash">
          
          <article className="bv-top-hero">
            <div className="bv-top-copy">
              <h2>BIENVENIDO A AVI</h2>
              <p>
                Descubre tus habilidades y encuentra la carrera ideal para ti
                mediante nuestro test vocacional inteligente.
              </p>
              <button type="button" onClick={irComoFunciona}>Comenzar Test Vocacional</button>
            </div>
            <div className="bv-top-cat">
              <img src="/logoAVI.png" alt="Mascota AVI" />
            </div>
          </article>

          <div className="bv-top-stats">
            <button type="button" className="bv-top-stat" onClick={irMisResultados}>
              <strong>{testsCompletados ?? "Realiza el test"}</strong>
              <small>Tests completados</small>
            </button>
            <button type="button" className="bv-top-stat" onClick={irRiasecInfo}>
              <strong>RIASEC</strong>
              <small>Modelo Vocacional</small>
            </button>
            
            <button type="button" className="bv-top-stat" onClick={irMisResultados}>
              <strong>{programasRecomendados ?? "Realiza el test"}</strong>
              <small>Programas recomendados</small>
            </button>
            <button type="button" className="bv-top-stat" onClick={irMisResultados}>
              <strong>{mejorPrograma ?? "Realiza el test"}</strong>
              <small>Mejor Programa para ti</small>
            </button>
          </div>

          <section className="bv-bottom-grid">
            <article className="bv-progress-card">
              <h3>Programas más recomendados</h3>
              <div className="bv-bars-chart">
                <Bar
                  data={programasBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y",
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, precision: 0 },
                      },
                    },
                  }}
                />
              </div>
            </article>

            <div className="bv-right-stack">
              <article className="bv-asp-card">
                <div className="bv-asp-content">
                  <strong>{cantidadAspirantes}</strong>
                  <p>Personas activas que iniciaron el proceso.</p>
                </div>
              </article>
              <article className="bv-program-card">
                <h4>Sugerencias rápidas</h4>
                <ul>
                  <li>Termina el test vocacional</li>
                  <li>Explora tus resultados</li>
                  <li>Califica tus programas favoritos</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="bv-program-strip">
      
          </section>
        </section>
      </div>
    </section>
  )
}

export default InicioAspirante




