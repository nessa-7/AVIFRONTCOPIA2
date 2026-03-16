import { useEffect, useRef, useState } from "react";
import "./Aspirante.css";
import Swal from "sweetalert2";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function AprendizGet() {
  const API_APRENDICES = import.meta.env.VITE_API_GETAPRENDICES;
  const API_PROGRAMAS = import.meta.env.VITE_API_GETPROGRAMAS;

  const initialNuevoForm = {
    idAPRENDIZ: "",
    tipoDocumento: "",
    nombre: "",
    apellidos: "",
    programaId: "",
    horas_inasistidas: "0",
    estado: true
  };

  const [aprendices, setAprendices] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalNuevo, setModalNuevo] = useState(false);

  const [nuevoForm, setNuevoForm] = useState(initialNuevoForm);
  const [editForm, setEditForm] = useState({
    tipoDocumento: "",
    nombre: "",
    apellidos: "",
    programaId: "",
    horas_inasistidas: "",
    estado: true
  });

  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [subiendoExcel, setSubiendoExcel] = useState(false);
  const excelInputRef = useRef(null);

  const { nombre: nombreAdmin, token } = useAuth();

  const navigate = useNavigate();

  const fetchAuth = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    });
  };


  const obtenerAprendices = async () => {
    const res = await fetchAuth(API_APRENDICES);
    const data = await res.json();
    setAprendices(Array.isArray(data) ? data : []);
  };

  const obtenerProgramas = async () => {
    const res = await fetchAuth(API_PROGRAMAS);
    const data = await res.json();
    setProgramas(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (token) {
      obtenerAprendices();
      obtenerProgramas();
    }
  }, [token]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, porPagina]);

  const aprendicesFiltrados = aprendices.filter((a) => {
    const texto = busqueda.toLowerCase().trim();
    if (!texto) return true;

    const nombreCompleto = `${a.nombre || ""} ${a.apellidos || ""}`.toLowerCase();
    const documento = String(a.idAPRENDIZ || "");

    return (
      nombreCompleto.includes(texto) ||
      documento.includes(texto)
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(aprendicesFiltrados.length / porPagina));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  const fin = inicio + porPagina;
  const aprendicesPagina = aprendicesFiltrados.slice(inicio, fin);

  const confirmarEstado = async (aprendiz) => {
    const accion = aprendiz.estado ? "deshabilitar" : "habilitar";

    const result = await Swal.fire({
      title: `Seguro que deseas ${accion} este aprendiz?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetchAuth(`${API_APRENDICES}/${aprendiz.idAPRENDIZ}/estado`, {        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: !aprendiz.estado })
      });

      if (!res.ok) throw new Error("No se pudo cambiar el estado");
      await obtenerAprendices();
      Swal.fire("Actualizado", "", "success");
    } catch {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const abrirModalNuevo = () => {
    setNuevoForm(initialNuevoForm);
    setModalNuevo(true);
  };

  const cerrarModalNuevo = () => {
    setModalNuevo(false);
    setNuevoForm(initialNuevoForm);
  };

  const handleNuevoChange = (e) => {
    const { name, value } = e.target;
    setNuevoForm((prev) => ({ ...prev, [name]: name === "estado" ? value === "true" : value }));
  };

  const validarAprendiz = (fila) => {
    if (!/^\d{6,}$/.test(String(fila.idAPRENDIZ || ""))) {
      return "Documento invalido (minimo 6 digitos)";
    }
    if (!fila.tipoDocumento) return "Tipo de documento requerido";
    if (!fila.nombre) return "Nombre requerido";
    if (!fila.apellidos) return "Apellidos requeridos";
    if (!fila.programaId || Number(fila.programaId) <= 0) return "Programa requerido";
    if (fila.horas_inasistidas === "" || Number(fila.horas_inasistidas) < 0) {
      return "Horas inasistidas invalidas";
    }
    return "";
  };

  const registrarNuevoAprendiz = async (e) => {
    e.preventDefault();

    const error = validarAprendiz(nuevoForm);
    if (error) {
      Swal.fire("Error", error, "error");
      return;
    }

    setGuardandoNuevo(true);
    try {
      const res = await fetchAuth(API_APRENDICES, {        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idAPRENDIZ: Number(nuevoForm.idAPRENDIZ),
          tipoDocumento: nuevoForm.tipoDocumento,
          nombre: nuevoForm.nombre,
          apellidos: nuevoForm.apellidos,
          programaId: Number(nuevoForm.programaId),
          horas_inasistidas: Number(nuevoForm.horas_inasistidas || 0),
          estado: Boolean(nuevoForm.estado)
        })
      });

      if (!res.ok) {
        let mensaje = "No se pudo registrar el aprendiz";
        try {
          const body = await res.json();
          mensaje = body?.mensaje || body?.error || mensaje;
        } catch {
          // no-op
        }
        Swal.fire("Error", mensaje, "error");
        return;
      }

      Swal.fire("Exito", "Aprendiz registrado correctamente", "success");
      cerrarModalNuevo();
      await obtenerAprendices();
    } catch {
      Swal.fire("Error", "Error de conexion con el servidor", "error");
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const abrirModalEditar = (aprendiz) => {
    setModalEditar(aprendiz);
    setEditForm({
      tipoDocumento: aprendiz.tipoDocumento || "",
      nombre: aprendiz.nombre || "",
      apellidos: aprendiz.apellidos || "",
      programaId: String(aprendiz.programaId || ""),
      horas_inasistidas: String(aprendiz.horas_inasistidas ?? ""),
      estado: Boolean(aprendiz.estado)
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: name === "estado" ? value === "true" : value }));
  };

  const guardarEdicionAprendiz = async (e) => {
    e.preventDefault();
    if (!modalEditar) return;

    const error = validarAprendiz({
      ...editForm,
      idAPRENDIZ: modalEditar.idAPRENDIZ
    });
    if (error) {
      Swal.fire("Error", error, "error");
      return;
    }

    setGuardandoEdicion(true);
    try {
      const res = await fetchAuth(`${API_APRENDICES}/${modalEditar.idAPRENDIZ}`, {        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoDocumento: editForm.tipoDocumento,
          nombre: editForm.nombre,
          apellidos: editForm.apellidos,
          programaId: Number(editForm.programaId),
          horas_inasistidas: Number(editForm.horas_inasistidas || 0),
          estado: Boolean(editForm.estado)
        })
      });

      if (!res.ok) throw new Error("No se pudo actualizar");

      Swal.fire("Actualizado", "Datos del aprendiz guardados", "success");
      setModalEditar(null);
      await obtenerAprendices();
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

  const normalizarTexto = (texto) => {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD") // separa letras y tildes
      .replace(/[\u0300-\u036f]/g, "") // elimina tildes
      .replace(/\s+/g, " ") // espacios dobles
      .trim();
  };

  const normalizarFilaExcel = (row) => {
  const tomar = (...claves) => {
    for (const clave of claves) {
      if (row[clave] !== undefined && row[clave] !== null && String(row[clave]).trim() !== "") {
        return String(row[clave]).trim();
      }
    }
    return "";
  };

  const normalizarId = (valor) => {
    const raw = String(valor || "").trim();
    if (!raw) return "";
    if (/^\d+(\.0+)?$/.test(raw)) return String(Math.trunc(Number(raw)));
    if (/^\d+E\+\d+$/i.test(raw)) return String(Math.trunc(Number(raw)));
    return raw.replace(/\D/g, "");
  };

  const normalizarNumero = (valor, fallback = "0") => {
    const raw = String(valor || "").trim();
    if (!raw) return fallback;
    const n = Number(raw.replace(",", "."));
    if (!Number.isFinite(n)) return fallback;
    return String(Math.max(0, Math.trunc(n)));
  };

  const estadoRaw = tomar("estado", "Estado", "activo", "Activo").toLowerCase();
  const estado = ["true", "1", "si", "s", "activo", "habilitado"].includes(estadoRaw);

  return {
    idAPRENDIZ: normalizarId(tomar("idAPRENDIZ", "ID", "id", "identificacion")),
    tipoDocumento: tomar("tipoDocumento", "TipoDocumento", "tipo_documento"),
    nombre: tomar("nombre", "Nombre"),
    apellidos: tomar("apellidos", "Apellidos"),
    programaNombre: tomar("programa", "Programa", "nombrePrograma"),
    horas_inasistidas: normalizarNumero(
      tomar("horas_inasistidas", "HorasInasistidas", "horas")
    ),
    estado
  };
};

  const subirExcelAprendices = async (e) => {
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

    const idsExistentes = new Set(
      aprendices.map((a) => String(a.idAPRENDIZ))
    );

    // mapa nombre normalizado -> idPrograma
    const programasPorNombre = new Map(
      programas.map((p) => [
        normalizarTexto(p.nombre),
        p.idPROGRAMA
      ])
    );

    for (let i = 0; i < rows.length; i++) {

      const fila = normalizarFilaExcel(rows[i]);

      const programaId = programasPorNombre.get(
        normalizarTexto(fila.programaNombre)
      );

      if (!programaId) {
        errores.push(
          `Fila ${i + 2}: programa "${fila.programaNombre}" no existe`
        );
        continue;
      }

      fila.programaId = programaId;

      const errorValidacion = validarAprendiz(fila);

      if (errorValidacion) {
        errores.push(`Fila ${i + 2}: ${errorValidacion}`);
        continue;
      }

      if (idsExistentes.has(String(fila.idAPRENDIZ))) {
        errores.push(`Fila ${i + 2}: el documento ya existe`);
        continue;
      }

      try {

        const res = await fetchAuth(API_APRENDICES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idAPRENDIZ: Number(fila.idAPRENDIZ),
            tipoDocumento: fila.tipoDocumento,
            nombre: fila.nombre,
            apellidos: fila.apellidos,
            programaId: Number(programaId),
            horas_inasistidas: Number(fila.horas_inasistidas || 0),
            estado: Boolean(fila.estado)
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
        idsExistentes.add(String(fila.idAPRENDIZ));

      } catch {

        errores.push(`Fila ${i + 2}: error de conexion`);

      }

    }

    await obtenerAprendices();

    if (!errores.length) {

      Swal.fire(
        "Exito",
        `Se registraron ${exitos} aprendices`,
        "success"
      );

    } else {

      Swal.fire({
        icon: exitos ? "warning" : "error",
        title: `Registrados: ${exitos} | Errores: ${errores.length}`,
        text: errores.slice(0, 3).join(" | ")
      });

    }

  } catch {

    Swal.fire(
      "Error",
      "No se pudo procesar el archivo Excel",
      "error"
    );

  } finally {

    setSubiendoExcel(false);
    e.target.value = "";

  }
};


  return (
    <div className="contenedordelista">
      <div className="table-controls">
        <div className="buttonsañadir">
          <h1 className="tituloadmin">{nombreAdmin}</h1>
          <div className="botonesañadir">
            <button onClick={abrirModalNuevo} className="btn-add">
              + Nuevo Aprendiz
            </button>

            <button
              className="btn-excel"
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
              onChange={subirExcelAprendices}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="top-header">
          <h2>Lista de Aprendices</h2>

          <div className="top-actions">
            <select value={porPagina} onChange={(e) => setPorPagina(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <input
              className="search"
              placeholder="Buscar por id o nombre"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <table className="tablalista">
          <thead>
            <tr>
              {/*<th>Foto</th>*/}
              <th>ID</th>
              <th>Nombre</th>
              <th>Programa</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {aprendicesPagina.map((aprendiz) => (
              <tr key={aprendiz.idAPRENDIZ}>
              {/*  <td>
                  <div className="avatar">{(aprendiz.nombre || "?").charAt(0)}</div>
                </td>
              */}
                <td>{aprendiz.idAPRENDIZ}</td>
                <td>{`${aprendiz.nombre || ""} ${aprendiz.apellidos || ""}`.trim()}</td>
                <td>{aprendiz.programa?.nombre || `Programa ${aprendiz.programaId || ""}`}</td>
                <td>
                  <span
                    className={aprendiz.estado ? "estado activo clickable" : "estado inactivo clickable"}
                    onClick={() => confirmarEstado(aprendiz)}
                  >
                    {aprendiz.estado ? "Habilitado" : "Deshabilitado"}
                  </span>
                </td>
                <td>
                  <button className="details-btn" onClick={() => setModalDetalle(aprendiz)}>
                    Detalles
                  </button>

                  <button className="edit-btn" onClick={() => abrirModalEditar(aprendiz)}>
                    Editar
                  </button>

                  <button
                    className="report-btn"
                    onClick={() => navigate("/prediccion-aprendiz")}
                  >
                    Ver Prediccion
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={paginaSegura === 1} onClick={() => setPagina(paginaSegura - 1)}>
            Previous
          </button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={paginaSegura === i + 1 ? "active-page" : ""}
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
        <div className="asp-modal" onClick={() => setModalDetalle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Detalles del aprendiz</div>
              <div className="modal-close" onClick={() => setModalDetalle(null)}>
                X
              </div>
            </div>

            <div className="modal-field">
              <b>ID:</b> {modalDetalle.idAPRENDIZ}
            </div>
            <div className="modal-field">
              <b>Tipo documento:</b> {modalDetalle.tipoDocumento}
            </div>
            <div className="modal-field">
              <b>Nombre:</b> {modalDetalle.nombre}
            </div>
            <div className="modal-field">
              <b>Apellidos:</b> {modalDetalle.apellidos}
            </div>
            <div className="modal-field">
              <b>Programa:</b> {modalDetalle.programa?.nombre || "No asignado"}
            </div>
            <div className="modal-field">
              <b>Nivel:</b> {modalDetalle.programa?.nivel || "No registrado"}
            </div>
            <div className="modal-field">
              <b>Horas inasistidas:</b> {modalDetalle.horas_inasistidas}
            </div>
            <div className="modal-field">
              <b>Estado:</b> {modalDetalle.estado ? "Habilitado" : "Deshabilitado"}
            </div>
          </div>
        </div>
      )}

      {modalNuevo && (
        <div className="drawer-overlay" onClick={cerrarModalNuevo}>
          <aside className="asp-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="asp-drawer-header">
              <h3>Nuevo Aprendiz</h3>
              <button className="asp-drawer-close" onClick={cerrarModalNuevo}>
                X
              </button>
            </div>

            <form className="asp-drawer-form" onSubmit={registrarNuevoAprendiz}>
              <label>ID</label>
              <input
                name="idAPRENDIZ"
                value={nuevoForm.idAPRENDIZ}
                onChange={handleNuevoChange}
                className="asp-drawer-input"
                required
              />

              <label>Tipo de documento</label>
              <input
                name="tipoDocumento"
                value={nuevoForm.tipoDocumento}
                onChange={handleNuevoChange}
                className="asp-drawer-input"
                required
              />

              <label>Nombre</label>
              <input
                name="nombre"
                value={nuevoForm.nombre}
                onChange={handleNuevoChange}
                className="asp-drawer-input"
                required
              />

              <label>Apellidos</label>
              <input
                name="apellidos"
                value={nuevoForm.apellidos}
                onChange={handleNuevoChange}
                className="asp-drawer-input"
                required
              />

              <label>Programa</label>
              <select
                name="programaId"
                value={nuevoForm.programaId}
                onChange={handleNuevoChange}
                className="asp-drawer-input"
                required
              >
                <option value="">Selecciona una opcion</option>
                {programas.map((p) => (
                  <option key={p.idPROGRAMA} value={p.idPROGRAMA}>
                    {p.nombre} ({p.nivel})
                  </option>
                ))}
              </select>

              <label>Horas inasistidas</label>
              <input
                type="number"
                min={0}
                name="horas_inasistidas"
                value={nuevoForm.horas_inasistidas}
                onChange={handleNuevoChange}
                className="asp-drawer-input"
                required
              />

              <label>Estado</label>
              <select
                name="estado"
                value={String(nuevoForm.estado)}
                onChange={handleNuevoChange}
                className="asp-drawer-input"
              >
                <option value="true">Activo</option>
                <option value="false">Suspendido</option>
              </select>

              <div className="asp-drawer-actions">
                <button type="button" className="asp-btn-cancel" onClick={cerrarModalNuevo}>
                  Cancelar
                </button>
                <button type="submit" className="asp-btn-save" disabled={guardandoNuevo}>
                  {guardandoNuevo ? "Guardando..." : "Guardar aprendiz"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {modalEditar && (
        <div className="asp-modal" onClick={() => setModalEditar(null)}>
          <div className="modal-content edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={guardarEdicionAprendiz}>
              <div className="modal-header">
                <div className="modal-title">Editar Aprendiz</div>
                <div className="modal-close" onClick={() => setModalEditar(null)}>
                  X
                </div>
              </div>

              <label>Tipo de documento</label>
              <input
                className="edit-modal-input"
                name="tipoDocumento"
                value={editForm.tipoDocumento}
                onChange={handleEditChange}
                required
              />

              <label>Nombre</label>
              <input
                className="edit-modal-input"
                name="nombre"
                value={editForm.nombre}
                onChange={handleEditChange}
                required
              />

              <label>Apellidos</label>
              <input
                className="edit-modal-input"
                name="apellidos"
                value={editForm.apellidos}
                onChange={handleEditChange}
                required
              />

              <label>Programa</label>
              <select
                className="edit-modal-input"
                name="programaId"
                value={editForm.programaId}
                onChange={handleEditChange}
                required
              >
                <option value="">Seleccione un programa</option>
                {programas.map((p) => (
                  <option key={p.idPROGRAMA} value={p.idPROGRAMA}>
                    {p.nombre} ({p.nivel})
                  </option>
                ))}
              </select>

              <label>Horas inasistidas</label>
              <input
                className="edit-modal-input"
                type="number"
                min={0}
                name="horas_inasistidas"
                value={editForm.horas_inasistidas}
                onChange={handleEditChange}
                required
              />

              <label>Estado</label>
              <select
                className="edit-modal-input"
                name="estado"
                value={String(editForm.estado)}
                onChange={handleEditChange}
              >
                <option value="true">Activo</option>
                <option value="false">Suspendido</option>
              </select>

              <div className="edit-modal-actions">
                <button type="submit" className="edit-save-btn" disabled={guardandoEdicion}>
                  {guardandoEdicion ? "Guardando..." : "Guardar"}
                </button>

                <button type="button" className="edit-cancel-btn" onClick={() => setModalEditar(null)}>
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

export default AprendizGet;
