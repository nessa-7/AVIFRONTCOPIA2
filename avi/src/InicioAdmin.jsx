import { useEffect, useMemo, useState, useCallback } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./InicioAdmin.css";

import { useAuth } from "./context/AuthContext";

import ProgramasAdmin from "./ProgramasAdmin";
import AspirantesGet from "./AspirantesGet";
import AprendizGet from "./AprendizGet";
import AdminGet from "./AdminGet";
import Estadisticas from "./Estadisticas";
import AprendicesIA from "./AprendicesIA";

const aspirantesLabelCandidates = [
  "mes",
  "Mes",
  "mesNombre",
  "nombreMes",
  "periodo",
  "label",
  "nombre",
  "fecha",
  "month",
];
const aspirantesValueCandidates = [
  "cantidad",
  "Cantidad",
  "total",
  "Total",
  "contador",
  "contadorAspirantes",
  "valor",
  "numero",
  "count",
  "aspirantes",
  "numeroAspirantes",
];
const testsProgramCandidates = [
  "programa",
  "Programa",
  "nombrePrograma",
  "programName",
  "program",
  "nombre",
];
const testsLevelCandidates = [
  "nivel",
  "Nivel",
  "tipo",
  "tipoPrograma",
  "modalidad",
  "programaNivel",
  "nivelPrograma",
];
const testsValueCandidates = [
  "completados",
  "Completados",
  "cantidad",
  "Cantidad",
  "total",
  "Total",
  "tests",
  "Tests",
  "valor",
  "Valor",
  "contador",
];
const nivelProgramCandidates = [
  "programa",
  "Programa",
  "nombrePrograma",
  "program",
  "nombre",
];
const nivelLevelCandidates = [
  "nivel",
  "Nivel",
  "tipo",
  "tipoPrograma",
  "modalidad",
];

function detectField(rows, candidates) {
  if (!rows?.length) return null;
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    for (const candidate of candidates) {
      if (Object.prototype.hasOwnProperty.call(row, candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

const MESES_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function extractList(payload) {
  if (!payload) return [];
  // if it's already an array
  if (Array.isArray(payload)) return payload;
  
  // if it has .data that is an array
  if (Array.isArray(payload.data)) return payload.data;
  
  // if it has .data.meses, .data.programas, etc.
  if (payload.data && typeof payload.data === "object") {
    const nested =
      payload.data.meses ??
      payload.data.programas ??
      payload.data.niveles ??
      payload.data.lista ??
      payload.data;
    if (Array.isArray(nested)) return nested;
  }
  
  // special case for programas-nivel which returns {tecnicos: [], tecnologos: []}
  if (payload.tecnicos || payload.tecnologos) {
    const ts = Array.isArray(payload.tecnicos) ? payload.tecnicos.map(p => ({ ...p, nivel: "TÃ©cnico" })) : [];
    const tg = Array.isArray(payload.tecnologos) ? payload.tecnologos.map(p => ({ ...p, nivel: "TecnÃ³logo" })) : [];
    return [...ts, ...tg];
  }
  
  // other common keys
  if (Array.isArray(payload.meses)) return payload.meses;
  if (Array.isArray(payload.programas)) return payload.programas;
  if (Array.isArray(payload.niveles)) return payload.niveles;
  
  return [];
}

function toNumber(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatNumber(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("es-CO") : "0";
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

async function fetchJson(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("InicioAdmin fetch error:", error?.message);
    return null;
  }
}

function InicioAdmin({ vistaActiva, setVistaActiva }) {
  const mostrarVistaInterna = vistaActiva !== "dashboard";
  const { nombre } = useAuth();

  // Endpoints for charts (Series)
  const API_ESTADISTICAS_MENSUAL = import.meta.env.VITE_API_ESTADISTICAS_MENSUAL;
  const API_PROGRAMAS_RECOMENDADOS = import.meta.env.VITE_API_PROGRAMAS_RECOMENDADOS;
  const API_PROGRAMAS_NIVEL = import.meta.env.VITE_API_PROGRAMAS_NIVEL;
  const API_PROGRAMA_MENSUAL = import.meta.env.VITE_API_PROGRAMA_MENSUAL;

  // Endpoints for KPIs (Counters)
  const API_CANTIDAD_ASPIRANTES = import.meta.env.VITE_API_CANTIDAD_ASPIRANTES;
  const API_TEST_COMPLETADOS = import.meta.env.VITE_API_TEST_COMPLETADOS;

    const [aspirantesRows, setAspirantesRows] = useState([]); // Will use Monthly Tests as activity proxy
    const [testsRows, setTestsRows] = useState([]);           // Will use Top Programs list
    const [nivelesRows, setNivelesRows] = useState([]);       // Will use Programs by Level
  const [programasNivelData, setProgramasNivelData] = useState({
    tecnicos: [],
    tecnologos: [],
  });
  const [selectedTecnicoProgram, setSelectedTecnicoProgram] = useState(null);
  const [selectedTecnologoProgram, setSelectedTecnologoProgram] = useState(null);
  const [selectedTecnologoId, setSelectedTecnologoId] = useState(null);
  const [showTecnicoList, setShowTecnicoList] = useState(false);
  const [showTecnologoList, setShowTecnologoList] = useState(false);
  const [tecnologoEvolucion, setTecnologoEvolucion] = useState([]);
  const [tecnologoYear, setTecnologoYear] = useState(new Date().getFullYear());
  const [loadingTecnologoEvolucion, setLoadingTecnologoEvolucion] = useState(false);
  const [tecnologoEvolucionError, setTecnologoEvolucionError] = useState(null);
    const [totalAspirantes, setTotalAspirantes] = useState(0);
    const [totalTests, setTotalTests] = useState(0);

  const [loadingIndicadores, setLoadingIndicadores] = useState(true);
  const [indicadoresError, setIndicadoresError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoadingIndicadores(true);
      setIndicadoresError(null);
      try {
        const [aspMensualRes, testsProgRes, nivelesRes, aspTotalRes, testsTotalRes] = await Promise.all([
          API_ESTADISTICAS_MENSUAL ? fetchJson(API_ESTADISTICAS_MENSUAL) : Promise.resolve(null),
          API_PROGRAMAS_RECOMENDADOS ? fetchJson(API_PROGRAMAS_RECOMENDADOS) : Promise.resolve(null),
          API_PROGRAMAS_NIVEL ? fetchJson(API_PROGRAMAS_NIVEL) : Promise.resolve(null),
          API_CANTIDAD_ASPIRANTES ? fetchJson(API_CANTIDAD_ASPIRANTES) : Promise.resolve(null),
          API_TEST_COMPLETADOS ? fetchJson(API_TEST_COMPLETADOS) : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        // Map Monthly Tests to Aspirantes Chart (since backend doesn't have aspirantes per month yet, we show activity)
        const mensualData = extractList(aspMensualRes);
        setAspirantesRows(mensualData.map((val, i) => ({ mes: MESES_LABELS[i], total: val })));

        // Map Top Programs to Tests Chart
        setTestsRows(extractList(testsProgRes));

        // Map Programs by Level to Doughnut
        setNivelesRows(extractList(nivelesRes));
        const nivelesPayload = nivelesRes?.data ?? nivelesRes ?? {};
        setProgramasNivelData({
          tecnicos: Array.isArray(nivelesPayload.tecnicos) ? nivelesPayload.tecnicos : [],
          tecnologos: Array.isArray(nivelesPayload.tecnologos) ? nivelesPayload.tecnologos : [],
        });

        // Set KPI Totals
        setTotalAspirantes(aspTotalRes?.total ?? aspTotalRes?.data?.total ?? 0);
        setTotalTests(testsTotalRes?.total ?? testsTotalRes?.data?.total ?? 0);

        if (!aspMensualRes && !testsProgRes && !nivelesRes) {
          setIndicadoresError("No se pudieron conectar las APIs de indicadores.");
        }
      } catch (error) {
        if (!isMounted) return;
        setIndicadoresError("No se pudo cargar la informaciÃ³n de indicadores.");
      } finally {
        if (isMounted) setLoadingIndicadores(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [API_ESTADISTICAS_MENSUAL, API_PROGRAMAS_RECOMENDADOS, API_PROGRAMAS_NIVEL, API_CANTIDAD_ASPIRANTES, API_TEST_COMPLETADOS]);

  const aspirantesSeries = useMemo(() => {
    return aspirantesRows.map((row) => ({
      label: String(row.mes ?? "â€”"),
      value: toNumber(row.total ?? 0),
    })).filter(e => e.value > 0 || aspirantesRows.length <= 12);
  }, [aspirantesRows]);


  const aspirantesTotal = useMemo(() => aspirantesSeries.reduce((sum, entry) => sum + entry.value, 0), [aspirantesSeries]);
  const aspirantesMax = useMemo(
    () => Math.max(...aspirantesSeries.map((entry) => entry.value), 1),
    [aspirantesSeries]
  );
  const latestAspirante = aspirantesSeries.length ? aspirantesSeries[aspirantesSeries.length - 1] : null;

  const testsProgramField = useMemo(() => detectField(testsRows, testsProgramCandidates), [testsRows]);
  const testsValueField = useMemo(() => detectField(testsRows, testsValueCandidates), [testsRows]);
  const testsAggregatedByProgram = useMemo(() => {
    const map = {};
    const programKey = testsProgramField ?? "programa";
    const valorKey = testsValueField ?? "total";
    for (const row of testsRows) {
      if (!row || typeof row !== "object") continue;
      const label = String(
        (row[programKey] ?? row.programa ?? row.nombre ?? "Programa") ?? "Programa"
      );
      const value = toNumber(
        row[valorKey] ??
          row.completados ??
          row.tests ??
          row.cantidad ??
          row.valor ??
          row.count ??
          row.total ??
          0
      );
      map[label] = (map[label] || 0) + value;
    }
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [testsRows, testsProgramField, testsValueField]);

  const testsSortedPrograms = useMemo(() => {
    return [...testsAggregatedByProgram].sort((a, b) => b.value - a.value);
  }, [testsAggregatedByProgram]);

  const testsMaxValue = testsSortedPrograms[0]?.value || 1;

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showTestsList, setShowTestsList] = useState(false);

  useEffect(() => {
    if (!testsSortedPrograms.length) {
      setSelectedProgram(null);
      return;
    }
    setSelectedProgram((prev) => {
      if (prev?.label) {
        const match = testsSortedPrograms.find((item) => item.label === prev.label);
        if (match) return { label: match.label, value: match.value };
      }
      const first = testsSortedPrograms[0];
      return { label: first.label, value: first.value };
    });
  }, [testsSortedPrograms]);

  const orderedPrograms = useMemo(() => {
    if (!testsSortedPrograms.length) return [];
    if (!selectedProgram?.label) return [...testsSortedPrograms];
    const match = testsSortedPrograms.find((item) => item.label === selectedProgram.label);
    if (!match) return [...testsSortedPrograms];
    return [match, ...testsSortedPrograms.filter((item) => item.label !== match.label)];
  }, [testsSortedPrograms, selectedProgram]);

  const handleProgramSelect = useCallback((program) => {
    if (!program) return;
    setSelectedProgram({ label: program.label, value: program.value });
  }, []);

  const handleTestsBarClick = useCallback(
    (_, elements) => {
      const [first] = elements;
      if (!first) return;
      const program = orderedPrograms[first.index];
      handleProgramSelect(program);
    },
    [orderedPrograms, handleProgramSelect]
  );

  const testsBarData = useMemo(() => {
    const entries = orderedPrograms.length ? orderedPrograms : testsSortedPrograms;
    const labels = entries.map((item) =>
      item.label.length > 22 ? `${item.label.slice(0, 22)}…` : item.label
    );
    const values = entries.map((item) => item.value);
    const backgroundColor = entries.map((item) =>
      selectedProgram?.label === item.label ? "#f0bc33" : "#2fb1b8"
    );
    const hoverBackgroundColor = entries.map((item) =>
      selectedProgram?.label === item.label ? "#f5ce6a" : "#2fb1b8"
    );
    return {
      labels: labels.length ? labels : ["Sin datos"],
      datasets: [
        {
          label: "Veces elegido",
          data: values.length ? values : [0],
          backgroundColor: backgroundColor.length ? backgroundColor : ["#2fb1b8"],
          hoverBackgroundColor: hoverBackgroundColor.length ? hoverBackgroundColor : ["#2fb1b8"],
          borderRadius: 6,
          barThickness: 20,
        },
      ],
    };
  }, [orderedPrograms, testsSortedPrograms, selectedProgram]);

  const testsTotal = useMemo(() => {
    return testsAggregatedByProgram.reduce((sum, program) => sum + program.value, 0);
  }, [testsAggregatedByProgram]);

  const nivelProgramField = useMemo(() => detectField(nivelesRows, nivelProgramCandidates), [nivelesRows]);
  const nivelLevelField = useMemo(() => detectField(nivelesRows, nivelLevelCandidates), [nivelesRows]);
  const nivelValueField = useMemo(() => detectField(nivelesRows, testsValueCandidates), [nivelesRows]);

  const programasPorNivel = useMemo(() => {
    return nivelesRows.reduce((acc, row) => {
      if (!row || typeof row !== "object") return acc;
      const nivel =
        String(
          (nivelLevelField ? row[nivelLevelField] : row.nivel ?? row.tipo ?? "General") ?? "General"
        );
      const programa = String(
        (nivelProgramField ? row[nivelProgramField] : row.programa ?? row.nombre ?? "Programa") ?? "Programa"
      );
      acc[nivel] = acc[nivel] || [];
      if (!acc[nivel].includes(programa)) acc[nivel].push(programa);
      return acc;
    }, {});
  }, [nivelesRows, nivelProgramField, nivelLevelField]);

  const programasNivelTotal = useMemo(
    () => Object.values(programasPorNivel).reduce((sum, lista) => sum + (lista?.length || 0), 0),
    [programasPorNivel]
  );
  const nivelesConDatos = Object.keys(programasPorNivel).length;

  const doughnutColors = ["#8e47d4", "#f0bc33", "#2fb1b8", "#de61c7", "#72c6a6", "#ff8c64"];

  const obtenerPrograma = (row) =>
    String(
      (nivelProgramField ? row[nivelProgramField] : row.programa ?? row.nombre ?? "Programa") ?? "Programa"
    );
  const obtenerValorNivel = (row) =>
    toNumber(
      row[nivelValueField] ??
        row.completados ??
        row.tests ??
        row.cantidad ??
        row.total ??
        row.valor ??
        row.count ??
        row.completo ??
        1
    );

const mapProgramList = (rows) =>
  rows
    .map((row) => ({
      programa: obtenerPrograma(row),
      total: obtenerValorNivel(row),
      id: row.idPROGRAMA ?? row.programaId ?? row.id ?? null,
    }))
    .filter((entry) => entry.programa);

  const tecnicoPrograms = useMemo(() => {
    return mapProgramList(programasNivelData.tecnicos || []).sort((a, b) => b.total - a.total);
  }, [programasNivelData.tecnicos, nivelProgramField, nivelValueField]);

  const orderedTecnicoPrograms = useMemo(() => {
    if (!tecnicoPrograms.length) return [];
    if (!selectedTecnicoProgram?.programa) return [...tecnicoPrograms];
    const match = tecnicoPrograms.find((program) => program.programa === selectedTecnicoProgram.programa);
    if (!match) return [...tecnicoPrograms];
    return [match, ...tecnicoPrograms.filter((program) => program.programa !== match.programa)];
  }, [tecnicoPrograms, selectedTecnicoProgram]);

  useEffect(() => {
    if (!tecnicoPrograms.length) {
      setSelectedTecnicoProgram(null);
      return;
    }
    setSelectedTecnicoProgram((prev) => {
      if (prev?.programa) {
        const match = tecnicoPrograms.find((program) => program.programa === prev.programa);
        if (match) return prev;
      }
      const first = tecnicoPrograms[0];
      return { programa: first.programa, total: first.total };
    });
  }, [tecnicoPrograms]);

  const handleTecnicoProgramSelect = useCallback((program) => {
    if (!program) return;
    setSelectedTecnicoProgram({ programa: program.programa, total: program.total });
  }, []);

  const handleTecnicoBarClick = useCallback(
    (_, elements) => {
      const [first] = elements;
      if (!first) return;
      const program = orderedTecnicoPrograms[first.index];
      handleTecnicoProgramSelect(program);
    },
      [orderedTecnicoPrograms, handleTecnicoProgramSelect]
    );

  const testsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { color: "#6a5a80", font: { size: 10 } },
        grid: { display: false },
      },
      x: {
        ticks: { color: "#6a5a80", font: { size: 10 } },
        grid: { color: "rgba(47,177,184,0.2)" },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => `${formatNumber(context.parsed.y ?? 0)} tests` } },
    },
  };

  const tecnicoBarData = useMemo(() => {
    const source = orderedTecnicoPrograms.length ? orderedTecnicoPrograms : tecnicoPrograms;
    const labels = source.map((program) =>
      program.programa.length > 22 ? `${program.programa.slice(0, 22)}...` : program.programa
    );
    const values = source.map((program) => program.total);
    const backgroundColor = source.map((program) =>
      selectedTecnicoProgram?.programa === program.programa ? "#f0bc33" : "#8e47d4"
    );
    const hoverColors = source.map((program) =>
      selectedTecnicoProgram?.programa === program.programa ? "#f5ce6a" : "#a178d6"
    );
    return {
      labels: labels.length ? labels : ["Sin datos"],
      datasets: [
        {
          label: "Programas tÃ©cnicos",
          data: values.length ? values : [0],
          backgroundColor: backgroundColor.length ? backgroundColor : ["#8e47d4"],
          hoverBackgroundColor: hoverColors.length ? hoverColors : ["#a178d6"],
          borderRadius: 6,
          barThickness: 18,
        },
      ],
    };
  }, [orderedTecnicoPrograms, tecnicoPrograms, selectedTecnicoProgram]);

  const tecnicoProgramMax = useMemo(() => {
    if (!tecnicoPrograms.length) return 1;
    return Math.max(...tecnicoPrograms.map((program) => program.total), 1);
  }, [tecnicoPrograms]);

  const tecnologoPrograms = useMemo(() => {
    return mapProgramList(programasNivelData.tecnologos || []).sort((a, b) => b.total - a.total);
  }, [programasNivelData.tecnologos, nivelProgramField, nivelValueField]);

  const orderedTecnologoPrograms = useMemo(() => {
    if (!tecnologoPrograms.length) return [];
    if (!selectedTecnologoProgram?.programa) return [...tecnologoPrograms];
    const match = tecnologoPrograms.find((program) => program.programa === selectedTecnologoProgram.programa);
    if (!match) return [...tecnologoPrograms];
    return [match, ...tecnologoPrograms.filter((program) => program.programa !== match.programa)];
  }, [tecnologoPrograms, selectedTecnologoProgram]);

  useEffect(() => {
    if (!orderedTecnologoPrograms.length) {
      setSelectedTecnologoProgram(null);
      return;
    }
    setSelectedTecnologoProgram((prev) => {
      if (prev?.programa) {
        const match = orderedTecnologoPrograms.find((program) => program.programa === prev.programa);
        if (match) return prev;
      }
      const first = orderedTecnologoPrograms[0];
      return { ...first };
    });
  }, [orderedTecnologoPrograms]);

  useEffect(() => {
    setSelectedTecnologoId(selectedTecnologoProgram?.id ?? null);
  }, [selectedTecnologoProgram]);

  useEffect(() => {
    if (!API_PROGRAMA_MENSUAL) {
      setTecnologoEvolucion([]);
      setTecnologoEvolucionError(null);
      return;
    }
    if (!selectedTecnologoId) {
      setTecnologoEvolucion([]);
      return;
    }
    let isMounted = true;
    setLoadingTecnologoEvolucion(true);
    setTecnologoEvolucionError(null);
    fetchJson(`${API_PROGRAMA_MENSUAL}?programaId=${selectedTecnologoId}&year=${tecnologoYear}`)
      .then((data) => {
        if (!isMounted) return;
        setTecnologoEvolucion(data?.data?.meses ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
        setTecnologoEvolucion([]);
        setTecnologoEvolucionError("No se pudieron cargar los datos de evolucion.");
      })
      .finally(() => {
        if (isMounted) setLoadingTecnologoEvolucion(false);
      });
    return () => {
      isMounted = false;
    };
  }, [API_PROGRAMA_MENSUAL, selectedTecnologoId, tecnologoYear]);

  const handleTecnologoProgramSelect = useCallback((program) => {
    if (!program) return;
    setSelectedTecnologoProgram({ programa: program.programa, total: program.total });
  }, []);

  const handleTecnologoChartClick = useCallback(
    (_, elements) => {
      const [first] = elements;
      if (!first) return;
      const program = orderedTecnologoPrograms[first.index];
      handleTecnologoProgramSelect(program);
    },
    [handleTecnologoProgramSelect, orderedTecnologoPrograms]
  );

  const tecnologoYearOptions = [new Date().getFullYear(), new Date().getFullYear() - 1];
  const handleTecnologoSelectChange = useCallback(
    (event) => {
      const value = event.target.value;
      const match = orderedTecnologoPrograms.find((program) => program.programa === value);
      if (match) handleTecnologoProgramSelect(match);
    },
    [orderedTecnologoPrograms, handleTecnologoProgramSelect]
  );
  const handleTecnologoYearChange = useCallback((event) => {
    setTecnologoYear(Number(event.target.value));
  }, []);

  const tecnologoLineData = useMemo(() => {
    const values = tecnologoEvolucion.length === 12 ? tecnologoEvolucion : Array(12).fill(0);
    return {
      labels: MESES_LABELS,
      datasets: [
        {
          label: selectedTecnologoProgram?.programa ?? "Tecnologo",
          data: values,
          borderColor: "#8e47d4",
          backgroundColor: "rgba(142,71,212,0.25)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#8e47d4",
        },
      ],
    };
  }, [tecnologoEvolucion, selectedTecnologoProgram]);

  const tecnologoLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6a5a80", font: { size: 10 } },
        grid: { color: "rgba(142,71,212,0.2)" },
      },
      x: {
        ticks: { color: "#6a5a80", font: { size: 10 } },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => `${formatNumber(context.parsed.y ?? 0)} tests` } },
    },
  };

  const tecnologoProgramMax = useMemo(() => {
    if (!tecnologoPrograms.length) return 1;
    return Math.max(...tecnologoPrograms.map((program) => program.total), 1);
  }, [tecnologoPrograms]);

  const tecnologoBarData = useMemo(() => {
    const source = orderedTecnologoPrograms.length ? orderedTecnologoPrograms : tecnologoPrograms;
    const labels = source.map((program) =>
      program.programa.length > 22 ? `${program.programa.slice(0, 22)}...` : program.programa
    );
    const values = source.map((program) => program.total);
    const backgroundColor = source.map((program) =>
      selectedTecnologoProgram?.programa === program.programa ? "#f0bc33" : "#2fb1b8"
    );
    const hoverBackgroundColor = source.map((program) =>
      selectedTecnologoProgram?.programa === program.programa ? "#f5ce6a" : "#2fb1b8"
    );
    return {
      labels: labels.length ? labels : ["Sin datos"],
      datasets: [
        {
          label: "Programas tecnologos",
          data: values.length ? values : [0],
          backgroundColor: backgroundColor.length ? backgroundColor : ["#2fb1b8"],
          hoverBackgroundColor: hoverBackgroundColor.length ? hoverBackgroundColor : ["#2fb1b8"],
          borderRadius: 6,
          barThickness: 18,
        },
      ],
    };
  }, [orderedTecnologoPrograms, tecnologoPrograms, selectedTecnologoProgram]);

  const tecnologoBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { color: "#6a5a80", font: { size: 10 } },
        grid: { display: false },
      },
      x: {
        ticks: { color: "#6a5a80", font: { size: 10 } },
        grid: { color: "rgba(47,177,184,0.2)" },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => `${formatNumber(context.parsed.y ?? 0)} tests` } },
    },
  };

  const heroStats = [
    {
      label: "Aspirantes registrados",
      value: totalAspirantes,
    },
    {
      label: "Tests completados",
      value: totalTests,
    },
    {
      label: `Programas (${nivelesConDatos || 1} niveles)`,
      value: nivelesRows.length,
    },
  ];

  const showLoadingIndicadores = loadingIndicadores && !indicadoresError;
  const heroAspirantesLabel = latestAspirante?.label ?? "Mes vigente";
  const heroAspirantesValue = latestAspirante?.value ?? 0;
  const aspirantesMessage = aspirantesSeries.length
    ? `Último mes registrado (${heroAspirantesLabel}): ${formatNumber(heroAspirantesValue)} aspirantes.`
    : "Sin datos de aspirantes por el momento.";

  const renderVista = () => {
    if (vistaActiva === "estadisticas") return <AprendicesIA />;
    if (vistaActiva === "programas") return <ProgramasAdmin />;
    if (vistaActiva === "aspirantes") return <AspirantesGet />;
    if (vistaActiva === "aprendices") return <AprendizGet />;
    if (vistaActiva === "admins") return <AdminGet />;
    return null;
  };

  return (
    <main className="dash-main" style={{ padding: "20px" }}>
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
                Administrador
                <br />
                Realiza Tus 
                <br />
                Procesos Aquí!
              </h3>
              <p>
                Supervisa tests, programas y aspirantes desde un solo tablero, con resúmenes preparados para el equipo administrativo.
              </p>

             
              <div className="hero-stats">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <strong>{formatNumber(stat.value)}</strong>
                    <small>{stat.label}</small>
                  </div>
                ))}
              </div>

              <div className="hero-sparkles" aria-hidden="true">
                {Array.from({ length: 18 }, (_, i) => (
                  <span key={i} className={`s${i + 1}`}>*</span>
                ))}
              </div>

              <img src="/logoAVI.png" alt="Mascota" className="hero-cat" />
            </article>

            <article className="hero-right">
              <div>
                <h4 className="hyd-card-title">Aspirantes Registrados</h4>
                <p className="hyd-title">Cantidad de personas que se han registrado en el sistema</p>
              </div>

              <div className="hyd-layout">
                <div className="hyd-message">
                  <span className="asp-count-number">{formatNumber(totalAspirantes)}</span>
                </div>

                <div>
                  <div className="asp-icon-wrap">
                    <svg className="asp-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="8" r="4"></circle>
                      <path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path>
                    </svg>
                    <span className="asp-plus">+</span>
                  </div>
                  
                </div>
              </div>
            </article>
          </section>

          {indicadoresError && (
            <div className="indicador-error-banner">{indicadoresError}</div>
          )}

          <section className="indicadores-grid">
            <article className="indicador-card">
              <header className="indicador-header">
                <div>
                  <p className="indicador-kicker">Programas</p>
                  <h4>Tecnicos</h4>
                </div>
                <span className="indicador-badge">
                  {tecnicoPrograms.length ? `${tecnicoPrograms.length} programas` : "Sin datos"}
                </span>
              </header>
              {showLoadingIndicadores ? (
                <p className="indicador-state">Cargando datos tecnicos...</p>
              ) : tecnicoPrograms.length ? (
                <>
                  <div className="chart-wrapper chart-wrapper--compact">
                    <Bar
                      data={tecnicoBarData}
                      options={testsBarOptions}
                      onClick={handleTecnicoBarClick}
                    />
                  </div>
                  <div className="selected-program-banner">
                    {selectedTecnicoProgram ? (
                      <>
                        <div>
                          <strong>{selectedTecnicoProgram.programa}</strong>
                          <span>
                            {formatNumber(selectedTecnicoProgram.total)} tests completados
                          </span>
                        </div>
                        <button
                          type="button"
                          className="selected-program-clear"
                          onClick={() => setShowTecnicoList((prev) => !prev)}
                        >
                          {showTecnicoList ? "Ocultar detalles" : "Ver todos"}
                        </button>
                      </>
                    ) : (
                      <span className="selected-program-prompt">
                        Selecciona un programa tecnico para resaltarlo.
                      </span>
                    )}
                  </div>
                  {showTecnicoList && (
                    <div className="tests-programs">
                      {orderedTecnicoPrograms.map((program) => {
                        const isActive = selectedTecnicoProgram?.programa === program.programa;
                        return (
                          <div
                            className={`tests-program${isActive ? " tests-program--active" : ""}`}
                            key={`${program.programa}-${program.total}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isActive}
                            onClick={() => handleTecnicoProgramSelect(program)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleTecnicoProgramSelect(program);
                              }
                            }}
                          >
                            <span className="tests-program-name">{program.programa}</span>
                            <span className="tests-program-value">
                              {formatNumber(program.total)} tests
                            </span>
                            <div className="tests-program-bar">
                              <span
                                style={{
                                  width: `${(program.total / tecnicoProgramMax) * 100}%`,
                                }}
                              ></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p className="indicador-state">No hay programas tecnicos disponibles.</p>
              )}
            </article>

            <article className="indicador-card">
              <header className="indicador-header">
                <div>
                  <p className="indicador-kicker">Tests</p>
                  <h4>Tests más elegidos</h4>
                  
                </div>
                <span className="indicador-badge">
                  {testsTotal ? `${formatNumber(testsTotal)} totales` : "Sin datos"}
                </span>
              </header>
              {showLoadingIndicadores ? (
                <p className="indicador-state">Cargando tests...</p>
              ) : testsSortedPrograms.length ? (
                <>
                  <div className="chart-wrapper chart-wrapper--compact">
                    <Bar data={testsBarData} options={testsBarOptions} onClick={handleTestsBarClick} />
                  </div>
                  <div className="selected-program-banner">
                    {selectedProgram ? (
                      <>
                        <div>
                          <strong>{selectedProgram.label}</strong>
                          <span>{formatNumber(selectedProgram.value)} veces elegidos</span>
                        </div>
                        <button
                          type="button"
                          className="selected-program-clear"
                          onClick={() => setShowTestsList((prev) => !prev)}
                        >
                          {showTestsList ? "Ocultar detalles" : "Ver todos"}
                        </button>
                      </>
                    ) : (
                      <span className="selected-program-prompt">
                        Selecciona un programa (técnico o tecnólogo) para resaltarlo.
                      </span>
                    )}
                  </div>
                  {showTestsList && (
                    <div className="tests-programs">
                      {testsSortedPrograms.slice(0, 8).map((program) => {
                        const isActive = selectedProgram?.label === program.label;
                        return (
                          <div
                            key={program.label}
                            className={`tests-program${isActive ? " tests-program--active" : ""}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isActive}
                            onClick={() => handleProgramSelect(program)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleProgramSelect(program);
                              }
                            }}
                          >
                            <span className="tests-program-name">{program.label}</span>
                            <span className="tests-program-value">
                              {formatNumber(program.value)} veces
                            </span>
                            <div className="tests-program-bar">
                              <span
                                style={{
                                  width: `${(program.value / testsMaxValue) * 100}%`,
                                }}
                              ></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p className="indicador-state">No hay datos de tests elegidos.</p>
              )}
            </article>

            <article className="indicador-card">
              <header className="indicador-header">
                <div>
                  <p className="indicador-kicker">Programas</p>
                  <h4>Tecnologos</h4>
                </div>
                <span className="indicador-badge">
                  {tecnologoPrograms.length ? `${tecnologoPrograms.length} programas` : "Sin datos"}
                </span>
              </header>
              {showLoadingIndicadores ? (
                <p className="indicador-state">Cargando niveles...</p>
              ) : tecnologoPrograms.length ? (
                <>
                  <div className="chart-wrapper chart-wrapper--compact">
                    <Bar
                      data={tecnologoBarData}
                      options={tecnologoBarOptions}
                      onClick={handleTecnologoChartClick}
                    />
                  </div>
                  <div className="selected-program-banner">
                    {selectedTecnologoProgram ? (
                      <>
                        <div>
                          <strong>{selectedTecnologoProgram.programa}</strong>
                          <span>
                            {formatNumber(selectedTecnologoProgram.total)} tests completados
                          </span>
                        </div>
                        <button
                          type="button"
                          className="selected-program-clear"
                          onClick={() => setShowTecnologoList((prev) => !prev)}
                        >
                          {showTecnologoList ? "Ocultar detalles" : "Ver todos"}
                        </button>
                      </>
                    ) : (
                      <span className="selected-program-prompt">
                        Selecciona un programa Tecnólogo para resaltarlo.
                      </span>
                    )}
                  </div>
                  {showTecnologoList && (
                    <div className="programas-nivel">
                      <div className="programas-nivel-block" key="tecnologos">
                        <div className="programas-nivel-header">
                          <strong>Tecnologos</strong>
                          <span>{tecnologoPrograms.length} programas</span>
                        </div>
                        <div className="tests-programs">
                          {orderedTecnologoPrograms.map((entry) => {
                            const isActive = selectedTecnologoProgram?.programa === entry.programa;
                            return (
                              <div
                                className={`tests-program${isActive ? " tests-program--active" : ""}`}
                                key={`tecnologo-${entry.programa}`}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isActive}
                                onClick={() => handleTecnologoProgramSelect(entry)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    handleTecnologoProgramSelect(entry);
                                  }
                                }}
                              >
                                <span className="tests-program-name">{entry.programa}</span>
                                <span className="tests-program-value">
                                  {formatNumber(entry.total)} tests
                                </span>
                                <div className="tests-program-bar">
                                  <span
                                    style={{
                                      width: `${(entry.total / tecnologoProgramMax) * 100}%`,
                                    }}
                                  ></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="indicador-state">No hay programas tecnologos disponibles.</p>
              )}
            </article>
          </section>

          {/* Mini-control cards removed per request */}
        </>
      )}

      {mostrarVistaInterna && <div className="dash-inner-page">{renderVista()}</div>}
    </main>
  );
}

export default InicioAdmin;