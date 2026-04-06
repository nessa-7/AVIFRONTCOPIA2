import { useEffect, useRef, useState, useCallback } from "react";
import {
  Chart,
  BarController, BarElement,
  DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  RadarController, RadialLinearScale,
  BubbleController,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
} from "chart.js";
import { useAuth } from "./context/AuthContext";
import "./DashboardAnalitica.css";

Chart.register(
  BarController, BarElement,
  DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  RadarController, RadialLinearScale,
  BubbleController,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
);

const PROGRAM_COLORS = [
  "#7C3AED","#0D9488","#2563EB","#D97706",
  "#DC2626","#16A34A","#DB2777","#0891B2",
  "#EA580C","#4F46E5","#059669","#9333EA",
];

const TREND_STYLES = {
  "Alta":       { bg: "rgba(13,148,136,0.18)",  text: "#0D9488" },
  "Media-Alta": { bg: "rgba(37,99,235,0.18)",   text: "#2563EB" },
  "Media":      { bg: "rgba(124,58,237,0.18)",  text: "#7C3AED" },
  "Media-Baja": { bg: "rgba(217,119,6,0.18)",   text: "#D97706" },
  "Baja":       { bg: "rgba(220,38,38,0.18)",   text: "#DC2626" },
};

function getTrendStyle(t) {
  return TREND_STYLES[t] || { bg: "rgba(100,100,100,0.18)", text: "#888" };
}

function colorFor(idx) { return PROGRAM_COLORS[idx % PROGRAM_COLORS.length]; }

function alphaColor(hex, alpha) {
  alpha = alpha * 0.55; // Saturated a bit more as requested (0.35 -> 0.55)
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function useDashboardData() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [apiActive, setApiActive] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API = import.meta.env.VITE_API_DASHBOARD || "http://localhost:4000/api/admin/dashboard";
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setApiActive(true);
      setLastSync(new Date());
    } catch (e) {
      setError(e.message);
      setApiActive(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, lastSync, apiActive, refetch: fetchData };
}

const tooltipRef = { current: null };

function showTooltip(e, content) {
  const el = tooltipRef.current;
  if (!el) return;
  el.innerHTML = content;
  el.style.display = "block";
  el.style.opacity = "1";
  positionTooltip(e, el);
}

function hideTooltip() {
  const el = tooltipRef.current;
  if (el) { el.style.opacity = "0"; setTimeout(() => { if (el) el.style.display = "none"; }, 150); }
}

function positionTooltip(e, el) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = el.offsetWidth || 230, h = el.offsetHeight || 120;
  let x = e.clientX + 14, y = e.clientY + 14;
  if (x + w > vw - 8) x = e.clientX - w - 14;
  if (y + h > vh - 8) y = e.clientY - h - 14;
  el.style.left = x + "px";
  el.style.top  = y + "px";
}

function makeTooltipContent({ programa, demanda, trimestre, tendencia, confianza }) {
  const ts = getTrendStyle(tendencia);
  return `
    <div class="chart-tip-title">${programa}</div>
    <div class="chart-tip-row"><span>Demanda</span><strong>${demanda?.toFixed ? demanda.toFixed(1) : demanda}</strong></div>
    <div class="chart-tip-row"><span>Trimestre</span><strong>${trimestre}</strong></div>
    <div class="chart-tip-row">
      <span>Tendencia</span>
      <strong style="color:${ts.text}">${tendencia}</strong>
    </div>
    ${confianza !== undefined ? `<div class="chart-tip-row"><span>Confianza</span><strong>${(confianza * 100).toFixed(0)}%</strong></div>` : ""}
  `;
}

export default function DashboardAnalitica() {
  const { nombre } = useAuth();
  const { data, loading, error, lastSync, apiActive, refetch } = useDashboardData();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPeriod, setSelectedPeriod] = useState("ultima");
  const [selectedProgram, setSelectedProgram] = useState(null); // nombre del programa
  const [spinning, setSpinning] = useState(false);

  // Refs para cada gráfica
  const refBarH   = useRef(null); // 1. Ranking horizontal
  const refDonut  = useRef(null); // 2. Doughnut
  const refArea   = useRef(null); // 3. Área / evolución
  const refBarG   = useRef(null); // 4. Barras agrupadas
  const refRadar  = useRef(null); // 5. Radar
  const refMultiL = useRef(null); // 6. Líneas múltiples
  const refBubble = useRef(null); // 8. Bubble / Scatter (Moved)
  const refStack  = useRef(null); // 9. Barras apiladas
  const refCol    = useRef(null); // 10. Columnas simples

  const chartInstances = useRef({});

  //    Datos filtrados por periodo                                         
  const filteredData = (() => {
    if (!data) return [];
    if (selectedPeriod === "ultima") return data.predicciones_ultima || [];
    return (data.historial || []).filter(p => p.trimestre === selectedPeriod);
  })();

  // Programas únicos en orden consistente con colores
  const programsList = (() => {
    if (!data) return [];
    const seen = new Set();
    const result = [];
    (data.historial || []).forEach(p => {
      if (!seen.has(p.programa)) {
        seen.add(p.programa);
        result.push(p.programa);
      }
    });
    return result;
  })();

  const programColorMap = Object.fromEntries(programsList.map((prog, i) => [prog, colorFor(i)]));

  
  const baseClickOpts = (datasets, labels, trimestre) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1600, easing: "easeOutElastic" },
    hover: { mode: 'nearest', intersect: true },
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false }
    }
  });

  function buildBarColors(labels, programas, opacity = 1) {
    return labels.map(l => {
      const base = programColorMap[l] || "#7C3AED";
      if (!selectedProgram) return alphaColor(base, opacity);
      return l === selectedProgram ? alphaColor(base, 1) : alphaColor(base, 0.2);
    });
  }

  
  function destroyChart(key) {
    if (chartInstances.current[key]) {
      chartInstances.current[key].destroy();
      chartInstances.current[key] = null;
    }
  }

  
  useEffect(() => {
    const canvas = refBarH.current;
    if (!canvas || !filteredData.length) { destroyChart("barH"); return; }
    destroyChart("barH");

    const sorted = [...filteredData].sort((a,b) => b.demanda - a.demanda);
    const labels = sorted.map(p => p.programa);
    const values = sorted.map(p => p.demanda);
    const maxV = Math.max(...values);

    const bgColors = labels.map((l, i) => {
      const base = programColorMap[l] || colorFor(i);
      if (selectedProgram && l !== selectedProgram) return alphaColor(base, 0.18);
      return values[i] === maxV ? base : alphaColor(base, 0.85);
    });

    const chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Demanda", data: values, backgroundColor: bgColors, borderRadius: 7, barThickness: 26 }]
      },
      options: {
        ...baseClickOpts(),
        indexAxis: "y",
        scales: {
          x: { beginAtZero: true, ticks: { color: "#8a7a9c", font: { size: 11 } }, grid: { color: "rgba(142,71,212,0.08)" } },
          y: { ticks: { color: "#5c4a7a", font: { size: 11, weight: "600" } }, grid: { display: false } }
        },
        plugins: {
          ...baseClickOpts().plugins,
          datalabels: undefined
        },
        onClick(evt, elements) {
          if (!elements.length) { setSelectedProgram(null); hideTooltip(); return; }
          const idx = elements[0].index;
          const prog = sorted[idx];
          const newSel = selectedProgram === prog.programa ? null : prog.programa;
          setSelectedProgram(newSel);
          if (newSel) {
            showTooltip(evt.native, makeTooltipContent({
              programa: prog.programa, demanda: prog.demanda,
              trimestre: prog.trimestre, tendencia: prog.tendencia, confianza: prog.confianza
            }));
          } else hideTooltip();
        }
      }
    });
    chartInstances.current.barH = chart;

    return () => destroyChart("barH");
  }, [filteredData, selectedProgram, activeTab]);

  
  useEffect(() => {
    const canvas = refDonut.current;
    if (!canvas || !filteredData.length) { destroyChart("donut"); return; }
    destroyChart("donut");

    const labels = filteredData.map(p => p.programa);
    const values = filteredData.map(p => p.demanda);
    const total = values.reduce((a, b) => a + b, 0);
    const bgColors = labels.map((l, i) => {
      const base = programColorMap[l] || colorFor(i);
      if (selectedProgram && l !== selectedProgram) return alphaColor(base, 0.18);
      return base;
    });

    const chart = new Chart(canvas, {
      type: "doughnut",
      data: { labels, datasets: [{ data: values, backgroundColor: bgColors, borderWidth: 0, hoverBorderWidth: 3, hoverBorderColor: "#fff" }] },
      options: {
        ...baseClickOpts(),
        cutout: "68%",
        onClick(evt, elements) {
          if (!elements.length) { setSelectedProgram(null); hideTooltip(); return; }
          const idx = elements[0].index;
          const prog = filteredData[idx];
          const pct = ((prog.demanda / total) * 100).toFixed(1);
          const newSel = selectedProgram === prog.programa ? null : prog.programa;
          setSelectedProgram(newSel);
          if (newSel) {
            showTooltip(evt.native, makeTooltipContent({
              programa: prog.programa, demanda: prog.demanda,
              trimestre: prog.trimestre, tendencia: prog.tendencia, confianza: prog.confianza
            }) + `<div class="chart-tip-row"><span>Participación</span><strong>${pct}%</strong></div>`);
          } else hideTooltip();
        }
      }
    });
    chartInstances.current.donut = chart;
    return () => destroyChart("donut");
  }, [filteredData, selectedProgram, activeTab]);

  
  useEffect(() => {
    const canvas = refArea.current;
    if (!canvas || !data?.evolucion_trimestral?.length) { destroyChart("area"); return; }
    destroyChart("area");

    const evol = data.evolucion_trimestral;
    const labels = evol.map(e => e.trimestre);
    const values = evol.map(e => e.demanda_promedio);

    const chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Demanda promedio",
          data: values,
          borderColor: "#7C3AED",
          backgroundColor: "rgba(124,58,237,0.18)",
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#7C3AED",
          pointHoverRadius: 7,
        }]
      },
      options: {
        ...baseClickOpts(),
        scales: {
          x: { ticks: { color: "#8a7a9c" }, grid: { color: "rgba(142,71,212,0.08)" } },
          y: { beginAtZero: false, ticks: { color: "#8a7a9c" }, grid: { color: "rgba(142,71,212,0.08)" } }
        },
        onClick(evt, elements) {
          if (!elements.length) { hideTooltip(); return; }
          const idx = elements[0].index;
          const e = evol[idx];
          showTooltip(evt.native, `
            <div class="chart-tip-title">Evolución ${e.trimestre}</div>
            <div class="chart-tip-row"><span>Promedio demanda</span><strong>${e.demanda_promedio.toFixed(2)}</strong></div>
            <div class="chart-tip-row"><span>Máxima</span><strong>${e.demanda_maxima.toFixed(1)}</strong></div>
            <div class="chart-tip-row"><span>Mínima</span><strong>${e.demanda_minima.toFixed(1)}</strong></div>
            <div class="chart-tip-row"><span>Predicciones</span><strong>${e.total_predicciones}</strong></div>
          `);
        }
      }
    });
    chartInstances.current.area = chart;
    return () => destroyChart("area");
  }, [data, selectedPeriod, activeTab]);

  
  useEffect(() => {
    const canvas = refBarG.current;
    if (!canvas || !data?.historial?.length) { destroyChart("barG"); return; }
    destroyChart("barG");

    const periodos = [...new Set(data.historial.map(p => p.trimestre))].sort();
    const progs = programsList.slice(0, 8); // máx 8 para no sobrecargar

    const datasets = progs.map((prog, i) => {
      const base = programColorMap[prog] || colorFor(i);
      const isSelected = selectedProgram && prog !== selectedProgram;
      return {
        label: prog,
        data: periodos.map(t => {
          const found = data.historial.find(p => p.trimestre === t && p.programa === prog);
          return found ? found.demanda : 0;
        }),
        backgroundColor: isSelected ? alphaColor(base, 0.15) : alphaColor(base, 0.85),
        borderColor: isSelected ? alphaColor(base, 0.2) : base,
        borderWidth: 1,
        borderRadius: 4,
      };
    });

    const chart = new Chart(canvas, {
      type: "bar",
      data: { labels: periodos, datasets },
      options: {
        ...baseClickOpts(),
        scales: {
          x: { ticks: { color: "#8a7a9c", font: { size: 10 } }, grid: { color: "rgba(142,71,212,0.08)" } },
          y: { beginAtZero: true, ticks: { color: "#8a7a9c" }, grid: { color: "rgba(142,71,212,0.08)" } }
        },
        plugins: { ...baseClickOpts().plugins, legend: { display: false } },
        onClick(evt, elements) {
          if (!elements.length) { setSelectedProgram(null); hideTooltip(); return; }
          const { datasetIndex, index } = elements[0];
          const prog = progs[datasetIndex];
          const periodoLabel = periodos[index];
          const demanda = datasets[datasetIndex].data[index];
          const rec = data.historial.find(p => p.programa === prog && p.trimestre === periodoLabel);
          const newSel = selectedProgram === prog ? null : prog;
          setSelectedProgram(newSel);
          if (newSel && rec) {
            showTooltip(evt.native, makeTooltipContent({
              programa: prog, demanda, trimestre: periodoLabel,
              tendencia: rec.tendencia, confianza: rec.confianza
            }));
          } else hideTooltip();
        }
      }
    });
    chartInstances.current.barG = chart;
    return () => destroyChart("barG");
  }, [data, selectedProgram, activeTab]);

  
  useEffect(() => {
    const canvas = refRadar.current;
    if (!canvas || !filteredData.length) { destroyChart("radar"); return; }
    destroyChart("radar");

    const labels = filteredData.map(p => p.programa.length > 12 ? p.programa.slice(0,12)+"…" : p.programa);
    const values = filteredData.map(p => p.demanda);
    const max = Math.max(...values);
    const normalized = values.map(v => (v / max) * 100);

    const chart = new Chart(canvas, {
      type: "radar",
      data: {
        labels,
        datasets: [{
          label: "Demanda normalizada",
          data: normalized,
          borderColor: "#0D9488",
          backgroundColor: "rgba(13,148,136,0.18)",
          borderWidth: 2,
          pointBackgroundColor: filteredData.map((p,i) => {
            if (!selectedProgram) return programColorMap[p.programa] || colorFor(i);
            return p.programa === selectedProgram ? (programColorMap[p.programa] || colorFor(i)) : "rgba(100,100,100,0.3)";
          }),
          pointRadius: 5,
        }]
      },
      options: {
        ...baseClickOpts(),
        scales: {
          r: {
            beginAtZero: true, max: 100,
            ticks: { color: "#8a7a9c", backdropColor: "rgba(255,255,255,0.7)", font: { size: 9 } },
            grid: { color: "rgba(142,71,212,0.08)" },
            angleLines: { color: "rgba(142,71,212,0.08)" },
            pointLabels: { color: "#5c4a7a", font: { size: 9.5, weight: "600" } }
          }
        },
        onClick(evt, elements) {
          if (!elements.length) { hideTooltip(); return; }
          const idx = elements[0].index;
          const prog = filteredData[idx];
          showTooltip(evt.native, makeTooltipContent({
            programa: prog.programa, demanda: prog.demanda,
            trimestre: prog.trimestre, tendencia: prog.tendencia, confianza: prog.confianza
          }));
          setSelectedProgram(prev => prev === prog.programa ? null : prog.programa);
        }
      }
    });
    chartInstances.current.radar = chart;
    return () => destroyChart("radar");
  }, [filteredData, selectedProgram, activeTab]);

  
  useEffect(() => {
    const canvas = refMultiL.current;
    if (!canvas || !data?.historial?.length) { destroyChart("multiL"); return; }
    destroyChart("multiL");

    const periodos = [...new Set(data.historial.map(p => p.trimestre))].sort();
    const progs = programsList.slice(0, 8);

    const datasets = progs.map((prog, i) => {
      const base = programColorMap[prog] || colorFor(i);
      const isSelected = selectedProgram && prog !== selectedProgram;
      return {
        label: prog,
        data: periodos.map(t => {
          const f = data.historial.find(p => p.trimestre === t && p.programa === prog);
          return f ? f.demanda : null;
        }),
        borderColor: isSelected ? alphaColor(base, 0.18) : base,
        backgroundColor: "transparent",
        borderWidth: isSelected ? 1 : (selectedProgram && prog === selectedProgram ? 3.5 : 2),
        tension: 0.4,
        pointRadius: isSelected ? 2 : 4,
        pointBackgroundColor: isSelected ? alphaColor(base, 0.18) : base,
        spanGaps: true,
      };
    });

    const chart = new Chart(canvas, {
      type: "line",
      data: { labels: periodos, datasets },
      options: {
        ...baseClickOpts(),
        scales: {
          x: { ticks: { color: "#8a7a9c", font: { size: 10 } }, grid: { color: "rgba(142,71,212,0.08)" } },
          y: { beginAtZero: false, ticks: { color: "#8a7a9c" }, grid: { color: "rgba(142,71,212,0.08)" } }
        },
        plugins: { ...baseClickOpts().plugins, legend: { display: false } },
        onClick(evt, elements) {
          if (!elements.length) { setSelectedProgram(null); hideTooltip(); return; }
          const { datasetIndex, index } = elements[0];
          const prog = progs[datasetIndex];
          const periodoLabel = periodos[index];
          const demanda = datasets[datasetIndex].data[index];
          const rec = data.historial.find(p => p.programa === prog && p.trimestre === periodoLabel);
          const newSel = selectedProgram === prog ? null : prog;
          setSelectedProgram(newSel);
          if (newSel && rec) {
            showTooltip(evt.native, makeTooltipContent({
              programa: prog, demanda, trimestre: periodoLabel,
              tendencia: rec.tendencia, confianza: rec.confianza
            }));
          } else hideTooltip();
        }
      }
    });
    chartInstances.current.multiL = chart;
    return () => destroyChart("multiL");
  }, [data, selectedProgram, activeTab]);

  //    8. Bubble / Scatter                                                
  useEffect(() => {
    const canvas = refBubble.current;
    if (!canvas || !data?.historial?.length) { destroyChart("bubble"); return; }
    destroyChart("bubble");

    const labels = [...new Set(data.historial.map(h => h.programa))];
    const datasets = labels.map(prog => {
      const pData = data.historial.filter(h => h.programa === prog);
      const histPoints = pData.map(h => ({ x: h.trimestre, y: h.demanda, c: h.confianza }));
      const color = programColorMap[prog] || "#8e47d4";
      const isSel = selectedProgram && prog !== selectedProgram;
      return {
        label: prog,
        data: histPoints.map(p => ({ x: p.confianza * 100, y: p.demanda, r: 8 })),
        backgroundColor: isSel ? alphaColor(color, 0.1) : alphaColor(color, 0.8),
        borderColor: color,
        borderWidth: isSel ? 0 : 2,
        hoverRadius: 12
      };
    });

    const chart = new Chart(canvas, {
      type: "bubble",
      data: { datasets },
      options: {
        ...baseClickOpts(),
        scales: {
          x: { 
            title: { display: true, text: "Confianza (%)", color: "#8a7a9c" },
            ticks: { color: "#8a7a9c" }, 
            grid: { color: "rgba(142,71,212,0.08)" } 
          },
          y: { 
            title: { display: true, text: "Demanda", color: "#8a7a9c" },
            beginAtZero: true, 
            ticks: { color: "#8a7a9c" }, 
            grid: { color: "rgba(142,71,212,0.08)" } 
          }
        },
        onClick(evt, elements) {
          if (!elements.length) { setSelectedProgram(null); hideTooltip(); return; }
          const dsIdx = elements[0].datasetIndex;
          const progName = datasets[dsIdx].label;
          const newSel = selectedProgram === progName ? null : progName;
          setSelectedProgram(newSel);
          if (newSel) {
            const dataPt = data.historial.find(h => h.programa === progName);
             showTooltip(evt.native, makeTooltipContent({
               programa: progName, demanda: dataPt.demanda,
               trimestre: dataPt.trimestre, tendencia: dataPt.tendencia, confianza: dataPt.confianza
             }));
          } else hideTooltip();
        }
      }
    });
    chartInstances.current.bubble = chart;
    return () => destroyChart("bubble");
  }, [data, selectedProgram, activeTab]);

  //    9. Barras apiladas                                                 
  useEffect(() => {
    const canvas = refStack.current;
    if (!canvas || !data?.historial?.length) { destroyChart("stack"); return; }
    destroyChart("stack");

    const periodos = [...new Set(data.historial.map(p => p.trimestre))].sort();
    const progs = programsList.slice(0, 8);

    const datasets = progs.map((prog, i) => {
      const base = programColorMap[prog] || colorFor(i);
      const isSelected = selectedProgram && prog !== selectedProgram;
      return {
        label: prog,
        data: periodos.map(t => {
          const f = data.historial.find(p => p.trimestre === t && p.programa === prog);
          return f ? f.demanda : 0;
        }),
        backgroundColor: isSelected ? alphaColor(base, 0.15) : base,
        borderWidth: 0,
        stack: "s1",
      };
    });

    const chart = new Chart(canvas, {
      type: "bar",
      data: { labels: periodos, datasets },
      options: {
        ...baseClickOpts(),
        scales: {
          x: { stacked: true, ticks: { color: "#8a7a9c", font: { size: 10 } }, grid: { color: "rgba(142,71,212,0.08)" } },
          y: { stacked: true, ticks: { color: "#8a7a9c" }, grid: { color: "rgba(142,71,212,0.08)" } }
        },
        plugins: { ...baseClickOpts().plugins, legend: { display: false } },
        onClick(evt, elements) {
          if (!elements.length) { setSelectedProgram(null); hideTooltip(); return; }
          const { datasetIndex, index } = elements[0];
          const prog = progs[datasetIndex];
          const t = periodos[index];
          const demanda = datasets[datasetIndex].data[index];
          const rec = data.historial.find(p => p.programa === prog && p.trimestre === t);
          const newSel = selectedProgram === prog ? null : prog;
          setSelectedProgram(newSel);
          if (newSel && rec) {
            showTooltip(evt.native, makeTooltipContent({
              programa: prog, demanda, trimestre: t,
              tendencia: rec.tendencia, confianza: rec.confianza
            }));
          } else hideTooltip();
        }
      }
    });
    chartInstances.current.stack = chart;
    return () => destroyChart("stack");
  }, [data, selectedProgram, activeTab]);

  //    10. Columnas simples                                               
  useEffect(() => {
    const canvas = refCol.current;
    if (!canvas || !filteredData.length) { destroyChart("col"); return; }
    destroyChart("col");

    const sorted = [...filteredData].sort((a,b) => b.demanda - a.demanda);
    const labels = sorted.map(p => p.programa.length > 14 ? p.programa.slice(0,14)+"…" : p.programa);
    const values = sorted.map(p => p.demanda);
    const maxV = Math.max(...values);
    const minV = Math.min(...values);

    const bgColors = sorted.map((p, i) => {
      if (selectedProgram && p.programa !== selectedProgram) return alphaColor(programColorMap[p.programa] || colorFor(i), 0.18);
      if (p.demanda === maxV) return "#7C3AED";
      if (p.demanda === minV) return "#DC2626";
      return programColorMap[p.programa] || colorFor(i);
    });

    const chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Demanda", data: values, backgroundColor: bgColors, borderRadius: 8, barThickness: 30 }]
      },
      options: {
        ...baseClickOpts(),
        scales: {
          x: { ticks: { color: "#8a7a9c", font: { size: 10 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: "#8a7a9c" }, grid: { color: "rgba(142,71,212,0.08)" } }
        },
        onClick(evt, elements) {
          if (!elements.length) { setSelectedProgram(null); hideTooltip(); return; }
          const idx = elements[0].index;
          const prog = sorted[idx];
          const newSel = selectedProgram === prog.programa ? null : prog.programa;
          setSelectedProgram(newSel);
          if (newSel) {
            showTooltip(evt.native, makeTooltipContent({
              programa: prog.programa, demanda: prog.demanda,
              trimestre: prog.trimestre, tendencia: prog.tendencia, confianza: prog.confianza
            }));
          } else hideTooltip();
        }
      }
    });
    chartInstances.current.col = chart;
    return () => destroyChart("col");
  }, [filteredData, selectedProgram, activeTab]);

  //    Cleanup global al desmontar                                        
  useEffect(() => {
    return () => Object.keys(chartInstances.current).forEach(k => {
      if (chartInstances.current[k]) { chartInstances.current[k].destroy(); chartInstances.current[k] = null; }
    });
  }, []);

  // Click fuera de gráficas: limpiar tooltip
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("canvas")) hideTooltip();
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  //    Refresh handler                                                    
  const handleRefresh = async () => {
    setSpinning(true);
    await refetch();
    setTimeout(() => setSpinning(false), 700);
  };

  //    Leyenda de programas                                               
  const ProgramLegend = () => (
    <div className="da-legend-container">
      <div className="prog-legend scroll-enabled">
        {programsList.map((prog, i) => (
          <button
            key={prog}
            className={`prog-legend-item${selectedProgram === prog ? " active" : ""}${selectedProgram && selectedProgram !== prog ? " muted" : ""}`}
            onClick={() => setSelectedProgram(prev => prev === prog ? null : prog)}
          >
            <span className="prog-legend-dot" style={{ background: programColorMap[prog] || colorFor(i) }} />
            <span className="prog-legend-label">{prog.length > 22 ? prog.slice(0,22)+"…" : prog}</span>
          </button>
        ))}
        {programsList.length === 0 && <span className="da-empty-legend">Sin programas disponibles</span>}
      </div>
    </div>
  );

  //    Render                                                             
  const kpis = data?.kpis;
  const periodos = data?.periodos || [];
  const prediccionesCount = data?.predicciones_ultima?.length || 0;

  if (loading && !data) {
    return (
      <div className="da-loading">
        <div className="da-spinner-lg" />
        <p>Cargando datos del dashboard</p>
      </div>
    );
  }

  return (
    <div className="da-root" onClick={(e) => { if (!e.target.closest("canvas")) hideTooltip(); }}>

      {/* Tooltip custom */}
      <div
        ref={tooltipRef}
        className="chart-custom-tooltip"
        style={{ display: "none", opacity: 0 }}
      />

      {/*    Header                                                */}
      <div className="da-header">
        <div className="da-header-left">
          <div className="da-header-icon"></div>
          <div>
            <h1 className="da-header-title">Dashboard de Demanda</h1>
            <p className="da-header-sub">Análisis predictivo de programas · SENA CTPI</p>
          </div>
        </div>
        <div className="da-header-right">
          {/* Badge estado */}
          <div className={`da-status-badge${apiActive ? " active" : " inactive"}`}>
            <span className={`da-status-dot${apiActive ? " pulse" : ""}`} />
            {apiActive ? "Activo" : "Sin conexión"}
          </div>
          {/* Última actualización */}
          {lastSync && (
            <span className="da-last-sync">
              Actualizado: {lastSync.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {/* Botón refrescar */}
          <button
            className="da-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            <span className={`da-refresh-icon${spinning || loading ? " spin" : ""}`}></span>
            {loading ? "Cargando…" : "Refrescar"}
          </button>
        </div>
      </div>

      {/*     Error                                                  */}
      {error && (
        <div className="da-error-bar">
          ️ Error conectando al backend: {error}
        </div>
      )}

      {/*     Tabs                                                   */}
      <div className="da-tabs">
        <button
          className={`da-tab${activeTab === "dashboard" ? " active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`da-tab${activeTab === "predicciones" ? " active" : ""}`}
          onClick={() => setActiveTab("predicciones")}
        >
          Predicciones
          <span className="da-tab-badge">{prediccionesCount}</span>
        </button>
      </div>

      {/*                                  TAB: DASHBOARD            */}
      {activeTab === "dashboard" && (
        <>
          {/* KPI Cards   NO cambian con filtros */}
          <div className="da-kpi-grid">
            <div className="da-kpi-card accent-violet">
              
              <div>
                <div className="da-kpi-label">Demanda máxima</div>
                <div className="da-kpi-value">{kpis ? Math.round(kpis.demanda_maxima) : " "}</div>
              </div>
            </div>
            <div className="da-kpi-card accent-teal">
              
              <div>
                <div className="da-kpi-label">Mayor demanda</div>
                <div className="da-kpi-value da-kpi-value--sm">{kpis?.programa_mayor_demanda || " "}</div>
              </div>
            </div>
            <div className="da-kpi-card accent-red">
              
              <div>
                <div className="da-kpi-label">Menor demanda</div>
                <div className="da-kpi-value da-kpi-value--sm">{kpis?.programa_menor_demanda || " "}</div>
              </div>
            </div>
            <div className="da-kpi-card accent-blue">
              
              <div>
                <div className="da-kpi-label">Recomendación</div>
                <div className="da-kpi-value da-kpi-value--xs">{kpis?.recomendacion_ia || " "}</div>
              </div>
            </div>
            <div className="da-kpi-card accent-amber">
              
              <div>
                <div className="da-kpi-label">Último trimestre</div>
                <div className="da-kpi-value">{kpis?.trimestre_actual || ""}</div>
              </div>
            </div>
          </div>

          {/* Filtro de periodo */}
          <div className="da-pills-row">
            <span className="da-pills-label">Periodo:</span>
            <button
              className={`da-pill da-pill--ultima${selectedPeriod === "ultima" ? " active" : ""}`}
              onClick={() => setSelectedPeriod("ultima")}
            >
               Última predicción
            </button>
            {periodos.map(p => (
              <button
                key={p}
                className={`da-pill${selectedPeriod === p ? " active" : ""}`}
                onClick={() => setSelectedPeriod(p)}
              >
                {p}
              </button>
            ))}
            {selectedProgram && (
              <span className="da-prog-badge">
                 {selectedProgram.length > 20 ? selectedProgram.slice(0,20)+"…" : selectedProgram}
                <button onClick={() => setSelectedProgram(null)} className="da-prog-badge-x"></button>
              </span>
            )}
          </div>

          {/* Leyenda de programas */}
          <ProgramLegend />

          {/* Grid de gráficas */}
          <div className="da-charts-grid">

            {/* 1. Ranking horizontal  full width */}
            <div className="da-card da-card--full">
              <div className="da-card-header">
                <h3>Ranking de Demanda por Programa</h3>
                {selectedProgram && <span className="da-card-badge"> {selectedProgram}</span>}
              </div>
              {filteredData.length === 0
                ? <div className="da-no-data">Sin datos para este periodo</div>
                : <div style={{ position:"relative", width:"100%", height: "240px" }}>
                    <canvas ref={refBarH} />
                  </div>
              }
            </div>

            {/* 2. Doughnut */}
            <div className="da-card">
              <div className="da-card-header"><h3>Distribución de Demanda</h3></div>
              {filteredData.length === 0
                ? <div className="da-no-data">Sin datos</div>
                : <>
                    <div style={{ position:"relative", width:"100%", height: "220px" }}>
                      <canvas ref={refDonut} />
                    </div>
                    <div className="da-donut-legend">
                      {filteredData.map((p, i) => {
                        const total = filteredData.reduce((s, x) => s + x.demanda, 0);
                        const pct = ((p.demanda / total) * 100).toFixed(1);
                        const isSel = selectedProgram && p.programa !== selectedProgram;
                        return (
                          <div key={p.programa} className={`da-donut-legend-item${isSel ? " muted" : ""}`}>
                            <span className="da-donut-dot" style={{ background: programColorMap[p.programa] || colorFor(i) }} />
                            <span>{p.programa.length > 15 ? p.programa.slice(0,15)+"…" : p.programa}</span>
                            <strong>{pct}%</strong>
                          </div>
                        );
                      })}
                    </div>
                  </>
              }
            </div>

            {/* 10. Columnas simples */}
            <div className="da-card">
              <div className="da-card-header"><h3>Comparación Rápida</h3></div>
              {filteredData.length === 0
                ? <div className="da-no-data">Sin datos</div>
                : <div style={{ position:"relative", width:"100%", height: "260px" }}>
                    <canvas ref={refCol} />
                  </div>
              }
            </div>

            {/* 3. Área evolutiva  full width */}
            <div className="da-card da-card--full">
              <div className="da-card-header"><h3>Evolución Histórica de Demanda Promedio</h3></div>
              {!data?.evolucion_trimestral?.length
                ? <div className="da-no-data">Sin datos de evolución</div>
                : <div style={{ position:"relative", width:"100%", height: "220px" }}>
                    <canvas ref={refArea} />
                  </div>
              }
            </div>

            {/* 6. Líneas múltiples  full width */}
            <div className="da-card da-card--full">
              <div className="da-card-header"><h3>Trayectoria por Programa (todas las predicciones)</h3></div>
              {!data?.historial?.length
                ? <div className="da-no-data">Sin historial</div>
                : <div style={{ position:"relative", width:"100%", height: "240px" }}>
                    <canvas ref={refMultiL} />
                  </div>
              }
            </div>

            {/* 4. Barras agrupadas */}
            <div className="da-card da-card--full">
              <div className="da-card-header"><h3>Barras Agrupadas por Trimestre</h3></div>
              {!data?.historial?.length
                ? <div className="da-no-data">Sin historial</div>
                : <div style={{ position:"relative", width:"100%", height: "240px" }}>
                    <canvas ref={refBarG} />
                  </div>
              }
            </div>

            {/* 5. Radar */}
            <div className="da-card">
              <div className="da-card-header"><h3>Radar Comparativo</h3></div>
              {filteredData.length === 0
                ? <div className="da-no-data">Sin datos</div>
                : <div style={{ position:"relative", width:"100%", height: "280px" }}>
                    <canvas ref={refRadar} />
                  </div>
              }
            </div>

            {/* 8. Bubble (Moved to Gauge position) */}
            <div className="da-card">
              <div className="da-card-header"><h3>Demanda vs Confianza</h3></div>
              {!data?.historial?.length
                ? <div className="da-no-data">Sin historial</div>
                : <div style={{ position:"relative", width:"100%", height: "280px" }}>
                    <canvas ref={refBubble} />
                  </div>
              }
            </div>

            {/* 9. Barras apiladas */}
            <div className="da-card da-card--full">
              <div className="da-card-header"><h3>Composición de Demanda Total por Trimestre</h3></div>
              {!data?.historial?.length
                ? <div className="da-no-data">Sin historial</div>
                : <div style={{ position:"relative", width:"100%", height: "240px" }}>
                    <canvas ref={refStack} />
                  </div>
              }
            </div>

          </div>
        </>
      )}

      {/*  TAB: PREDICCIONES IA  */}
      {activeTab === "predicciones" && (
        <div className="da-pred-container">

          {/* Cards de predicción */}
          <div className="da-pred-cards-grid">
            {(data?.predicciones_ultima || []).map((pred, i) => {
              const ts = getTrendStyle(pred.tendencia);
              const isSel = selectedProgram && pred.programa !== selectedProgram;
              return (
                <div
                  key={pred.id || i}
                  className={`da-pred-card${selectedProgram === pred.programa ? " selected" : ""}${isSel ? " muted" : ""}`}
                  onClick={() => setSelectedProgram(prev => prev === pred.programa ? null : pred.programa)}
                  style={{ borderColor: selectedProgram === pred.programa ? (programColorMap[pred.programa] || colorFor(i)) : undefined }}
                >
                  <div className="da-pred-card-color-bar" style={{ background: programColorMap[pred.programa] || colorFor(i) }} />
                  <div className="da-pred-card-body">
                    <h4 className="da-pred-card-title">{pred.programa}</h4>
                    <div className="da-pred-card-nivel">{pred.nivel}</div>
                    <div className="da-pred-card-demand">{pred.demanda.toFixed(1)}</div>
                    <div className="da-pred-card-label">demanda proyectada</div>
                    <div className="da-pred-card-meta">
                      <span className="da-trend-badge" style={{ background: ts.bg, color: ts.text }}>
                        {pred.tendencia}
                      </span>
                      <span className="da-pred-trimestre">{pred.trimestre}</span>
                    </div>
                    <div className="da-pred-card-conf">
                      Confianza: <strong>{(pred.confianza * 100).toFixed(0)}%</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabla detallada */}
          <div className="da-card da-card--full" style={{ marginTop: "1.5rem" }}>
            <div className="da-card-header">
              <h3>Tabla Detallada de Predicciones</h3>
              {selectedProgram && (
                <span className="da-card-badge">
                   {selectedProgram}
                  <button onClick={() => setSelectedProgram(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"inherit",marginLeft:"4px" }}></button>
                </span>
              )}
            </div>
            <div className="da-table-wrap">
              <table className="da-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Programa</th>
                    <th>Trimestre</th>
                    <th>Demanda</th>
                    <th>Tendencia</th>
                    <th>Confianza</th>
                    <th>Proporción</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.predicciones_ultima || []).map((pred, i) => {
                    const ts = getTrendStyle(pred.tendencia);
                    const maxD = Math.max(...(data?.predicciones_ultima || []).map(p => p.demanda)) || 1;
                    const pct = (pred.demanda / maxD) * 100;
                    const isSel = selectedProgram && pred.programa !== selectedProgram;
                    return (
                      <tr
                        key={pred.id || i}
                        className={`da-table-row${selectedProgram === pred.programa ? " row-selected" : ""}${isSel ? " row-muted" : ""}`}
                        onClick={() => setSelectedProgram(prev => prev === pred.programa ? null : pred.programa)}
                      >
                        <td className="da-table-num">{i + 1}</td>
                        <td>
                          <div className="da-table-prog">
                            <span className="da-table-dot" style={{ background: programColorMap[pred.programa] || colorFor(i) }} />
                            {pred.programa}
                          </div>
                        </td>
                        <td>{pred.trimestre}</td>
                        <td><strong>{pred.demanda.toFixed(2)}</strong></td>
                        <td>
                          <span className="da-trend-badge" style={{ background: ts.bg, color: ts.text }}>
                            {pred.tendencia}
                          </span>
                        </td>
                        <td>{(pred.confianza * 100).toFixed(0)}%</td>
                        <td>
                          <div className="da-mini-bar-bg">
                            <div
                              className="da-mini-bar-fill"
                              style={{ width: `${pct}%`, background: programColorMap[pred.programa] || colorFor(i) }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
