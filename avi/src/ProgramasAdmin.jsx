import { useEffect, useRef, useState } from "react";
import "./ProgramasAdmin.css";
import Swal from "sweetalert2";
import { useAuth } from "./context/AuthContext";
import * as XLSX from "xlsx";

function ProgramasAdmin() {
  const API = import.meta.env.VITE_API_PROGRAMAS;
  const API_CENTROS = import.meta.env.VITE_API_CENTROS;

  const initialNuevoForm = {
    nombre: "",
    nivel: "Ninguno",
    descripcion: "",
    modalidad: "",
    AR: "",
    centroId: "",
    activo: true
  };

  const [programas, setProgramas] = useState([]);
  const [centros, setCentros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalNuevo, setModalNuevo] = useState(false);

  const [nuevoForm, setNuevoForm] = useState(initialNuevoForm);
  const [editForm, setEditForm] = useState(initialNuevoForm);

  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [subiendoExcel, setSubiendoExcel] = useState(false);
  const excelInputRef = useRef(null);

  const { nombre, token } = useAuth();

  const fetchAuth = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
  };

  const obtenerProgramas = async () => {
    const res = await fetchAuth(API);
    const data = await res.json();
    setProgramas(Array.isArray(data) ? data : []);
  };

  const obtenerCentros = async () => {
    const res = await fetchAuth(API_CENTROS);
    const data = await res.json();
    setCentros(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (token) {
      obtenerProgramas();
      obtenerCentros();
    }
  }, [token]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, porPagina]);

  const programasFiltrados = programas.filter((p) => {
    const txt = busqueda.toLowerCase().trim();
    if (!txt) return true;

    return (
      String(p.idPROGRAMA || "").includes(txt) ||
      String(p.nombre || "").toLowerCase().includes(txt) ||
      String(p.nivel || "").toLowerCase().includes(txt) ||
      String(p.centro?.descripcion || "").toLowerCase().includes(txt)
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(programasFiltrados.length / porPagina));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  const fin = inicio + porPagina;
  const programasPagina = programasFiltrados.slice(inicio, fin);

  const validarPrograma = (fila) => {
    if (!String(fila.nombre || "").trim()) return "Nombre requerido";
    if (!String(fila.nivel || "").trim()) return "Nivel requerido";
    if (!String(fila.descripcion || "").trim()) return "Descripcion requerida";
    if (!fila.centroId || Number(fila.centroId) <= 0) return "Centro requerido";
    return "";
  };

  const confirmarEstado = async (programa) => {
    const accion = programa.activo ? "deshabilitar" : "habilitar";
    const result = await Swal.fire({
      title: `Seguro que deseas ${accion} este programa?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetchAuth(`${API}/${programa.idPROGRAMA}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !programa.activo })
      });
      if (!res.ok) throw new Error("No se pudo cambiar el estado");
      await obtenerProgramas();
      Swal.fire("Actualizado", "", "success");
    } catch {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const abrirModalNuevo = () => {
    setNuevoForm({
      ...initialNuevoForm,
      centroId: centros.length ? String(centros[0].idCENTRO) : ""
    });
    setModalNuevo(true);
  };

  const cerrarModalNuevo = () => {
    setModalNuevo(false);
    setNuevoForm(initialNuevoForm);
  };

  const handleNuevoChange = (e) => {
    const { name, value } = e.target;
    setNuevoForm((prev) => ({ ...prev, [name]: name === "activo" ? value === "true" : value }));
  };

  const registrarNuevoPrograma = async (e) => {
    e.preventDefault();

    const error = validarPrograma(nuevoForm);
    if (error) {
      Swal.fire("Error", error, "error");
      return;
    }

    setGuardandoNuevo(true);
    try {
      const res = await fetchAuth(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoForm.nombre.trim(),
          nivel: nuevoForm.nivel,
          descripcion: nuevoForm.descripcion.trim(),
          modalidad: nuevoForm.modalidad?.trim(),
          AR: nuevoForm.AR?.trim(),
          centroId: Number(nuevoForm.centroId),
          activo: Boolean(nuevoForm.activo)
        })
      });

      if (!res.ok) {
        let mensaje = "No se pudo registrar el programa";
        try {
          const body = await res.json();
          mensaje = body?.mensaje || body?.error || mensaje;
        } catch {
          // no-op
        }
        Swal.fire("Error", mensaje, "error");
        return;
      }

      Swal.fire("Exito", "Programa registrado correctamente", "success");
      cerrarModalNuevo();
      await obtenerProgramas();
    } catch {
      Swal.fire("Error", "Error de conexion con el servidor", "error");
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const abrirModalEditar = (programa) => {
    setModalEditar(programa);
    setEditForm({
      nombre: programa.nombre || "",
      nivel: programa.nivel || "Ninguno",
      descripcion: programa.descripcion || "",
      modalidad: programa.modalidad || "",
      AR: programa.AR || "",
      centroId: String(programa.centroId || ""),
      activo: Boolean(programa.activo)
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: name === "activo" ? value === "true" : value }));
  };

  const guardarEdicionPrograma = async (e) => {
    e.preventDefault();
    if (!modalEditar) return;

    const error = validarPrograma(editForm);
    if (error) {
      Swal.fire("Error", error, "error");
      return;
    }

    setGuardandoEdicion(true);
    try {
      const res = await fetchAuth(`${API}/${modalEditar.idPROGRAMA}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editForm.nombre.trim(),
          nivel: editForm.nivel,
          descripcion: editForm.descripcion.trim(),
          modalidad: editForm.modalidad?.trim() || null,
          AR: editForm.AR?.trim() || null,
          centroId: Number(editForm.centroId),
          activo: Boolean(editForm.activo)
        })
      });

      if (!res.ok) throw new Error("No se pudo actualizar");

      Swal.fire("Actualizado", "Datos del programa guardados", "success");
      setModalEditar(null);
      await obtenerProgramas();
    } catch {
      Swal.fire("Error", "No se pudo guardar la edicion", "error");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const leerArchivoExcel = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsArrayBuffer(file);
    });

  const normalizarFilaExcel = (row) => {
    const tomar = (...claves) => {
      for (const clave of claves) {
        if (row[clave] !== undefined && row[clave] !== null && String(row[clave]).trim() !== "") {
          return String(row[clave]).trim();
        }
      }
      return "";
    };

    const normalizarNumero = (valor, fallback = "") => {
      const raw = String(valor || "").trim();
      if (!raw) return fallback;
      const n = Number(raw.replace(",", "."));
      if (!Number.isFinite(n)) return fallback;
      return String(Math.max(0, Math.trunc(n)));
    };

    const normalizarTexto = (texto) => String(texto || "").toLowerCase().trim();

    const estadoRaw = tomar("activo", "Activo", "estado", "Estado").toLowerCase();
    const activo = ["true", "1", "si", "s", "activo", "habilitado"].includes(estadoRaw);

    const centroTexto = tomar(
      "centroId",
      "CentroId",
      "idCentro",
      "centro_id",
      "centro",
      "Centro",
      "nombreCentro",
      "centroNombre"
    );

    const centroId = normalizarNumero(centroTexto, "");

    return {
      nombre: tomar("nombre", "Nombre"),
      nivel: tomar("nivel", "Nivel", "tipo"),
      descripcion: tomar("descripcion", "Descripcion", "descripción"),
      modalidad: tomar("modalidad", "Modalidad"),
      AR: tomar("AR", "ar", "url", "realidad aumentada"),
      centroId,
      centroNombre: centroTexto,
      activo
    };
  };

  const subirExcelProgramas = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoExcel(true);
    try {
      const data = await leerArchivoExcel(file);
      const workbook = XLSX.read(data, { type: "array" });
      const primeraHoja = workbook.SheetNames[0];
      if (!primeraHoja) {
        Swal.fire("Error", "El archivo no tiene hojas", "error");
        return;
      }

      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[primeraHoja], {
        defval: "",
        raw: false
      });
      if (!rows.length) {
        Swal.fire("Error", "El archivo esta vacio", "error");
        return;
      }

      let exitos = 0;
      const errores = [];
      const centrosValidos = new Set(centros.map((c) => Number(c.idCENTRO)));
      const centrosPorNombre = new Map(
        centros.map((c) => [String(c.descripcion || "").toLowerCase().trim(), Number(c.idCENTRO)])
      );
      const nombresExistentes = new Set(
        programas.map((p) => String(p.nombre || "").trim().toLowerCase()).filter(Boolean)
      );

      for (let i = 0; i < rows.length; i++) {
        const fila = normalizarFilaExcel(rows[i]);

        let centroId = Number(fila.centroId);
        if (!Number.isFinite(centroId) || centroId <= 0) {
          const centroNombreBuscado = String(fila.centroNombre || fila.centroId || "").trim().toLowerCase();
          if (centroNombreBuscado) {
            centroId = centrosPorNombre.get(centroNombreBuscado) || 0;
          }
        }

        if (!centroId || !centrosValidos.has(centroId)) {
          errores.push(`Fila ${i + 2}: Centro no existe (centroId/centroNombre incorrecto)`);
          continue;
        }

        fila.centroId = String(centroId);

        const errorValidacion = validarPrograma(fila);
        if (errorValidacion) {
          errores.push(`Fila ${i + 2}: ${errorValidacion}`);
          continue;
        }

        const nombreNorm = String(fila.nombre || "").trim().toLowerCase();
        if (nombresExistentes.has(nombreNorm)) {
          errores.push(`Fila ${i + 2}: el nombre del programa ya existe`);
          continue;
        }

        try {
          const res = await fetchAuth(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: fila.nombre.trim(),
              nivel: fila.nivel,
              descripcion: fila.descripcion.trim(),
              modalidad: fila.modalidad || "",
              AR: fila.AR || "",
              centroId: Number(fila.centroId),
              activo: Boolean(fila.activo)
            })
          });

          if (!res.ok) {
            let mensajeError = "No se pudo registrar";
            try {
              const body = await res.json();
              mensajeError = body?.mensaje || body?.error || mensajeError;
            } catch {
              const txt = await res.text().catch(() => "");
              if (txt) mensajeError = txt.slice(0, 120);
            }
            errores.push(`Fila ${i + 2}: ${mensajeError}`);
            continue;
          }

          exitos++;
          nombresExistentes.add(nombreNorm);
        } catch {
          errores.push(`Fila ${i + 2}: error de conexion`);
        }
      }

      await obtenerProgramas();

      if (!errores.length) {
        Swal.fire("Exito", `Se registraron ${exitos} programas`, "success");
      } else {
        Swal.fire({
          icon: exitos ? "warning" : "error",
          title: `Registrados: ${exitos} | Errores: ${errores.length}`,
          text: errores.slice(0, 3).join(" | ")
        });
      }
    } catch {
      Swal.fire("Error", "No se pudo procesar el archivo Excel", "error");
    } finally {
      setSubiendoExcel(false);
      e.target.value = "";
    }
  };

  return (
    <div className="pm-wrapper">
      <div className="pm-controls">
        <div className="pm-controls-head">
          <h1 className="pm-admin-title">{nombre}</h1>
          <div className="pm-head-actions">
            <button onClick={abrirModalNuevo} className="pm-btn-add">
              + Nuevo Programa
            </button>
            <button
              className="pm-btn-excel"
              onClick={() => excelInputRef.current?.click()}
              disabled={subiendoExcel}
            >
              {subiendoExcel ? "Subiendo..." : "Upload Excel"}
            </button>
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={subirExcelProgramas}
            />
          </div>
        </div>
      </div>

      <div className="pm-table-box">
        
        <div className="pm-top-header">
          <h2>Lista de Programas</h2>

          <div className="pm-top-actions">
            <select value={porPagina} onChange={(e) => setPorPagina(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <input
              className="pm-search"
              placeholder="Buscar por id, nombre, nivel o centro"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <table className="pm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Nivel</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {programasPagina.map((p) => (
              <tr key={p.idPROGRAMA}>
                
                <td>{p.idPROGRAMA}</td>
                <td>{p.nombre}</td>
                <td>{p.nivel}</td>             
                <td>
                  <span
                    className={p.activo ? "pm-state pm-state-on" : "pm-state pm-state-off"}
                    onClick={() => confirmarEstado(p)}
                  >
                    {p.activo ? "Habilitado" : "Deshabilitado"}
                  </span>
                </td>
                <td>
                  <button className="pm-details-btn" onClick={() => setModalDetalle(p)}>
                    Detalles
                  </button>
                  <button className="pm-edit-btn" onClick={() => abrirModalEditar(p)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pm-pagination">
          <button disabled={paginaSegura === 1} onClick={() => setPagina(paginaSegura - 1)}>
            Previous
          </button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={paginaSegura === i + 1 ? "pm-active-page" : ""}
              onClick={() => setPagina(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={paginaSegura === totalPaginas}
            onClick={() => setPagina(paginaSegura + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {modalDetalle && (
        <div className="pm-modal" onClick={() => setModalDetalle(null)}>
          <div className="pm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-header">
              <div className="pm-modal-title">Detalles del programa</div>
              <div className="pm-modal-close" onClick={() => setModalDetalle(null)}>
                X
              </div>
            </div>
            <div className="pm-field"><b>ID:</b> {modalDetalle.idPROGRAMA}</div>
            <div className="pm-field"><b>Nombre:</b> {modalDetalle.nombre}</div>
            <div className="pm-field"><b>Nivel:</b> {modalDetalle.nivel}</div>
            <div className="pm-field"><b>Modalidad:</b> {modalDetalle.modalidad || "No especificado"}</div>
            <div className="pm-field"><b>URL AR:</b> {modalDetalle.AR ? <a href={modalDetalle.AR} target="_blank" rel="noreferrer">{modalDetalle.AR}</a> : "No registrado"}</div>
            <div className="pm-field">
              <b>Centro:</b> {modalDetalle.centro?.descripcion ||
              centros.find(c => c.idCENTRO === modalDetalle.centroId)?.descripcion ||
              "No asignado"}
            </div>            
            <div className="pm-field"><b>Descripcion:</b> {modalDetalle.descripcion || "Sin descripcion"}</div>
            <div className="pm-field"><b>Estado:</b> {modalDetalle.activo ? "Habilitado" : "Deshabilitado"}</div>
          </div>
        </div>
      )}

      {modalNuevo && (
        <div className="pm-drawer-overlay" onClick={cerrarModalNuevo}>
          <aside className="pm-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pm-drawer-header">
              <h3>Nuevo Programa</h3>
              <button className="pm-drawer-close" onClick={cerrarModalNuevo}>X</button>
            </div>

            <form className="pm-drawer-form" onSubmit={registrarNuevoPrograma}>
              <label>Nombre</label>
              <input
                name="nombre"
                value={nuevoForm.nombre}
                onChange={handleNuevoChange}
                className="pm-drawer-input"
                required
              />

              <label>Nivel</label>
              <select
                name="nivel"
                value={nuevoForm.nivel}
                onChange={handleNuevoChange}
                className="pm-drawer-input"
                required
              >
                <option value="Ninguno">Ninguno</option>
                <option value="Tecnico">Tecnico</option>
                <option value="Tecnologo">Tecnologo</option>
              </select>

              <label>Descripcion</label>
              <textarea
                name="descripcion"
                value={nuevoForm.descripcion}
                onChange={handleNuevoChange}
                className="pm-drawer-input"
                required
              />

              <label>Centro</label>
              <select
                name="centroId"
                value={nuevoForm.centroId}
                onChange={handleNuevoChange}
                className="pm-drawer-input"
                required
              >
                <option value="">Selecciona una opcion</option>
                {centros.map((c) => (
                  <option key={c.idCENTRO} value={c.idCENTRO}>{c.descripcion}</option>
                ))}
              </select>

              <label>Estado</label>
              <select
                name="activo"
                value={String(nuevoForm.activo)}
                onChange={handleNuevoChange}
                className="pm-drawer-input"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>

              <label>Modalidad</label>
              <input
                name="modalidad"
                value={nuevoForm.modalidad}
                onChange={handleNuevoChange}
                className="pm-drawer-input"
              />

              <label>URL Realidad Aumentada</label>
              <textarea
                name="AR"
                value={nuevoForm.AR}
                onChange={handleNuevoChange}
                className="pm-drawer-input"
              />

              <div className="pm-drawer-actions">
                <button type="button" className="pm-btn-cancel" onClick={cerrarModalNuevo}>
                  Cancelar
                </button>
                <button type="submit" className="pm-btn-save" disabled={guardandoNuevo}>
                  {guardandoNuevo ? "Guardando..." : "Guardar programa"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {modalEditar && (
        <div className="pm-modal" onClick={() => setModalEditar(null)}>
          <div className="pm-modal-content pm-edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={guardarEdicionPrograma}>
              <div className="pm-modal-header">
                <div className="pm-modal-title">Editar Programa</div>
                <div className="pm-modal-close" onClick={() => setModalEditar(null)}>X</div>
              </div>

              <label>Nombre</label>
              <input
                className="pm-edit-input"
                name="nombre"
                value={editForm.nombre}
                onChange={handleEditChange}
                required
              />

              <label>Nivel</label>
              <select
                className="pm-edit-input"
                name="nivel"
                value={editForm.nivel}
                onChange={handleEditChange}
                required
              >
                <option value="Ninguno">Ninguno</option>
                <option value="Tecnico">Tecnico</option>
                <option value="Tecnologo">Tecnologo</option>
              </select>

              <label>Descripcion</label>
              <textarea
                className="pm-edit-input"
                name="descripcion"
                value={editForm.descripcion}
                onChange={handleEditChange}
                required
              />

              <label>Modalidad</label>
              <input
                className="pm-edit-input"
                name="modalidad"
                value={editForm.modalidad}
                onChange={handleEditChange}
              />

              <label>URL Realidad Aumentada</label>
              <textarea
                className="pm-edit-input"
                name="AR"
                value={editForm.AR}
                onChange={handleEditChange}
              />

              <label>Centro</label>
              <select
                className="pm-edit-input"
                name="centroId"
                value={editForm.centroId}
                onChange={handleEditChange}
                required
              >
                <option value="">Seleccione un centro</option>
                {centros.map((c) => (
                  <option key={c.idCENTRO} value={c.idCENTRO}>{c.descripcion}</option>
                ))}
              </select>

              

              <div className="pm-edit-actions">
                <button type="submit" className="pm-edit-save-btn" disabled={guardandoEdicion}>
                  {guardandoEdicion ? "Guardando..." : "Guardar"}
                </button>
                <button type="button" className="pm-edit-cancel-btn" onClick={() => setModalEditar(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgramasAdmin;
