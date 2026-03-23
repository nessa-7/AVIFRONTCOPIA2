import { useEffect, useState } from "react";
import "./Programas.css"

const Programas = () => {

  const PROGRAMAS_API = import.meta.env.VITE_API_PROGRAMAS

  const [programas, setProgramas] = useState([]);
  const [nivelFiltro, setNivelFiltro] = useState("");

  useEffect(() => {
    fetch(`${PROGRAMAS_API}`)
      .then(res => res.json())
      .then(data => setProgramas(data))
      .catch(err => console.error(err));
  }, []);

  const normalizarTexto = (texto) =>
    String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const programasFiltrados = programas.filter((p) => {
    if (!nivelFiltro) return true;

    const nivelPrograma = normalizarTexto(p.nivel);
    const nivelSeleccionado = normalizarTexto(nivelFiltro);

    return nivelPrograma === nivelSeleccionado;
  });

  return (
    <main className="programas">
      <h2>PROGRAMAS CENTRO DE TELEINFORMATICA Y PRODUCCIÓN INDUSTRIAL</h2>

      <div className="programas-filters">
        <select
          id="programasNivelFiltro"
          className="programas-btnnivel"
          value={nivelFiltro}
          onChange={(e) => setNivelFiltro(e.target.value)}
        >
          <option value="">Todos los niveles</option>
          <option value="tecnico">Técnico</option>
          <option value="tecnologo">Tecnólogo</option>
        </select>
      </div>

      <div className="avi-grid">
        {programasFiltrados.map((p) => (
          <div className="avi-card" key={p.idPROGRAMA}>
            
            <span className="nivel">{p.nivel}</span>

            <h3>{p.nombre}</h3>

            <p className="descripcion">{p.descripcion}</p>

          </div>
        ))}
      </div>
    </main>
  );
};

export default Programas;