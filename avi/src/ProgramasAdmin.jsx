import { useEffect, useState } from "react";
import "./Programas.css";

function ProgramasAdmin() {

  const API = import.meta.env.VITE_API_PROGRAMAS;

  const [programas, setProgramas] = useState([]);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    tipo: "Técnico",
    descripcion: "",
    centroId: ""
  });

  const [centros, setCentros] = useState([]);


  // 🔥 Obtener programas
  const obtenerProgramas = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setProgramas(data);
  };


  // 🔥 Agregar programa
  const agregarPrograma = async () => {

    if (!nuevo.nombre || !nuevo.descripcion) return;

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nuevo.nombre,
            nivel: nuevo.tipo,
            descripcion: nuevo.descripcion,
            centroId: nuevo.centroId
        }),
    });


    obtenerProgramas();

    setNuevo({
        nombre: "",
        tipo: "Técnico",
        descripcion: "",
        centroId: 1
    });

  };

  // 🔥 Cambiar estado
  const cambiarEstado = async (id, activo) => {

    await fetch(`${API}/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    });

    obtenerProgramas();
  };



  const API_CENTROS = import.meta.env.VITE_API_CENTROS;

    const obtenerCentros = async () => {
        const res = await fetch(API_CENTROS);
        const data = await res.json();
        setCentros(data);
    };

    useEffect(() => {
        obtenerProgramas();
        obtenerCentros();
    }, []);


  return (
    <div className="contenido">
      <h1>Programas de Formación CTPI</h1>

      <br />

      {/* Agregar */}
      <div className="avi-card">
        <h3>Agregar Programa</h3>

        <input
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
        />

        <select
          value={nuevo.tipo}
          onChange={e => setNuevo({ ...nuevo, tipo: e.target.value })}
        >
          <option>Técnico</option>
          <option>Tecnólogo</option>
        </select>

        <select
            value={nuevo.centroId}
            onChange={e => setNuevo({ ...nuevo, centroId: Number(e.target.value) })}
            >

            {centros.map(c => (
                <option key={c.idCENTRO} value={c.idCENTRO}>
                {c.descripcion}
                </option>
            ))}
        </select>



        <textarea
          placeholder="Descripción"
          value={nuevo.descripcion}
          onChange={e => setNuevo({ ...nuevo, descripcion: e.target.value })}
        />

        <button className="btn-avi" onClick={agregarPrograma}>
          Agregar
        </button>
      </div>

      {/* Lista */}
      <div className="avi-grid">
        {programas.map((p) => (
          <div key={p.idPROGRAMA} className="avi-card">

            <h3>{p.nombre}</h3>
            <p><b>Tipo:</b> {p.nivel}</p>
            <p>{p.descripcion}</p>

            <p className={p.activo ? "estado-on" : "estado-off"}>
              {p.activo ? "✅ Habilitado" : "❌ Inhabilitado"}
            </p>

            <button onClick={() => cambiarEstado(p.idPROGRAMA, p.activo)}>
              {p.activo ? "Inhabilitar" : "Habilitar"}
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgramasAdmin;
