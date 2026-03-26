import { useEffect, useRef, useState } from "react";
import "./Aspirante.css";
import Swal from "sweetalert2"
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function AspiranteGet() {

const API = import.meta.env.VITE_API_GETASPIRANTES;
const REGISTROASPIRANTES_API = import.meta.env.VITE_API_REGISTROASPIRANTES;
const hoy = new Date().toISOString().split("T")[0];
const initialNuevoForm = {
  idASPIRANTE: "",
  nombre_completo: "",
  fechaNacimiento: "",
  email: "",
  telefono: "",
  barrio: "",
  direccion: "",
  ocupacion: "",
  institucion: "",
  password: ""
};

const [aspirantes,setAspirantes] = useState([]);
const [busqueda,setBusqueda] = useState("");
const [pagina,setPagina] = useState(1);
const [porPagina,setPorPagina] = useState(10);

const [modalDetalle,setModalDetalle] = useState(null);
const [modalEditar,setModalEditar] = useState(null);
const [modalNuevo,setModalNuevo] = useState(false);
const [nuevoForm, setNuevoForm] = useState(initialNuevoForm);
const [guardandoNuevo, setGuardandoNuevo] = useState(false);
const [editForm, setEditForm] = useState({
  nombre_completo: "",
  email: "",
  telefono: "",
  direccion: "",
  barrio: ""
});
const [guardandoEdicion, setGuardandoEdicion] = useState(false);
const [subiendoExcel, setSubiendoExcel] = useState(false);
const excelInputRef = useRef(null);

const { nombre, token } = useAuth();

const fetchAuth = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  });
};

const formatearFecha = (valor) => {
  if (!valor) return "";
  const fechaTexto = String(valor).includes("T")
    ? String(valor).split("T")[0]
    : String(valor).slice(0, 10);

  const partes = fechaTexto.split("-");
  if (partes.length !== 3) return fechaTexto;
  const [anio, mes, dia] = partes;
  return `${dia}/${mes}/${anio}`;
};


useEffect(() => {
  if (token) {
    obtenerAspirantes();
  }
}, [token])

const obtenerAspirantes = async ()=>{
 const res = await fetchAuth(API)
 const data = await res.json()
 setAspirantes(data)
}


const aspirantesFiltrados = aspirantes.filter(a =>

 a.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
 a.idASPIRANTE.toString().includes(busqueda)

)

const inicio = (pagina-1)*porPagina
const fin = inicio + porPagina

const aspirantesPagina = aspirantesFiltrados.slice(inicio,fin)

const totalPaginas = Math.ceil(aspirantesFiltrados.length / porPagina)

const navigate = useNavigate()

function IrReportes(idAspirante, nombreAspirante){
  navigate(`/reportesporasp/${idAspirante}`, {
    state: { nombreAspirante }
  })
}


const confirmarEstado = async (asp) => {

  const accion = asp.activo ? "deshabilitar" : "habilitar"

  const result = await Swal.fire({

  title:`¿Seguro que deseas ${accion} este aspirante?`,
  icon:"warning",
  showCancelButton:true,
  confirmButtonText:"Si",
  cancelButtonText:"Cancelar"

  })

  if(result.isConfirmed){

  await fetchAuth(`${API}/${asp.idASPIRANTE}/status`,{
  method:"PATCH",
  headers:{ "Content-Type":"application/json"},
  body:JSON.stringify({activo:!asp.activo})
  })

  obtenerAspirantes()

  Swal.fire("Actualizado","","success")

  }

}

const abrirModalNuevo = () => {
  setNuevoForm(initialNuevoForm);
  setModalNuevo(true);
}

const cerrarModalNuevo = () => {
  setModalNuevo(false);
  setNuevoForm(initialNuevoForm);
}

const handleNuevoChange = (e) => {
  const { name, value } = e.target;
  setNuevoForm((prev) => {
    if (name === "ocupacion" && value !== "Colegio" && value !== "Universidad") {
      return { ...prev, ocupacion: value, institucion: "" };
    }
    return { ...prev, [name]: value };
  });
}

const registrarNuevoAspirante = async (e) => {
  e.preventDefault();

  if (!REGISTROASPIRANTES_API) {
    Swal.fire("Error", "Falta VITE_API_REGISTROASPIRANTES en .env", "error");
    return;
  }

  if (!/^\d{8,}$/.test(nuevoForm.idASPIRANTE)) {
    Swal.fire("Error", "La identificacion debe tener minimo 8 numeros", "error");
    return;
  }

  if (!/^\d{10}$/.test(nuevoForm.telefono)) {
    Swal.fire("Error", "El telefono debe tener exactamente 10 digitos", "error");
    return;
  }

  if (!/\S+@\S+\.\S+/.test(nuevoForm.email)) {
    Swal.fire("Error", "Correo electronico invalido", "error");
    return;
  }

  const correoNuevo = nuevoForm.email.trim().toLowerCase();
  const correoYaExiste = aspirantes.some(
    (a) => String(a.email || "").trim().toLowerCase() === correoNuevo
  );
  if (correoYaExiste) {
    Swal.fire("Error", "Ese correo ya esta registrado", "error");
    return;
  }

  const requiereInstitucion =
    nuevoForm.ocupacion === "Colegio" || nuevoForm.ocupacion === "Universidad";

  if (requiereInstitucion && !nuevoForm.institucion.trim()) {
    Swal.fire("Error", "La institucion es obligatoria para estudiantes", "error");
    return;
  }

  setGuardandoNuevo(true);

  try {
    const res = await fetchAuth(REGISTROASPIRANTES_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idASPIRANTE: parseInt(nuevoForm.idASPIRANTE, 10),
        nombre_completo: nuevoForm.nombre_completo,
        fechaNacimiento: nuevoForm.fechaNacimiento,
        email: nuevoForm.email,
        telefono: nuevoForm.telefono,
        barrio: nuevoForm.barrio,
        direccion: nuevoForm.direccion,
        ocupacion: nuevoForm.ocupacion,
        institucion: requiereInstitucion ? nuevoForm.institucion : null,
        password: nuevoForm.password
      })
    });

    if (!res.ok) {
      let mensaje = "No se pudo registrar el aspirante";
      try {
        const data = await res.json();
        if (data?.mensaje) mensaje = data.mensaje;
      } catch {
        // Si el backend no devuelve JSON, conservar mensaje por defecto.
      }
      Swal.fire("Error", mensaje, "error");
      return;
    }

    Swal.fire("Exito", "Aspirante registrado correctamente", "success");
    cerrarModalNuevo();
    await obtenerAspirantes();
  } catch (error) {
    Swal.fire("Error", "Error de conexion con el servidor", "error");
  } finally {
    setGuardandoNuevo(false);
  }
}

const abrirModalEditar = (asp) => {
  setModalEditar(asp);
  setEditForm({
    nombre_completo: asp.nombre_completo || "",
    email: asp.email || "",
    telefono: asp.telefono || "",
    direccion: asp.direccion || "",
    barrio: asp.barrio || ""
  });
}

const handleEditChange = (e) => {
  const { name, value } = e.target;
  setEditForm((prev) => ({ ...prev, [name]: value }));
}

const guardarEdicionAspirante = async (e) => {
  e.preventDefault();
  if (!modalEditar) return;

  const correoEditado = editForm.email.trim().toLowerCase();
  const correoEnOtro = aspirantes.some(
    (a) =>
      Number(a.idASPIRANTE) !== Number(modalEditar.idASPIRANTE) &&
      String(a.email || "").trim().toLowerCase() === correoEditado
  );
  if (correoEnOtro) {
    Swal.fire("Error", "Ese correo ya pertenece a otro aspirante", "error");
    return;
  }

  setGuardandoEdicion(true);
  try {
    const res = await fetchAuth(`${API}/${modalEditar.idASPIRANTE}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });

    if (!res.ok) {
      throw new Error("No se pudo actualizar");
    }

    Swal.fire("Actualizado", "Datos del aspirante guardados", "success");
    setModalEditar(null);
    await obtenerAspirantes();
  } catch {
    Swal.fire("Error", "No se pudo guardar la edicion", "error");
  } finally {
    setGuardandoEdicion(false);
  }
}

const leerArchivoExcel = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsArrayBuffer(file);
  });

const esFechaISOValida = (fechaISO) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return false;
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const dt = new Date(anio, mes - 1, dia);
  return (
    dt.getFullYear() === anio &&
    dt.getMonth() === mes - 1 &&
    dt.getDate() === dia
  );
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

  const normalizarFechaExcel = (valorFecha) => {
    if (typeof valorFecha === "number" && Number.isFinite(valorFecha)) {
      const parsed = XLSX.SSF.parse_date_code(valorFecha);
      if (parsed?.y && parsed?.m && parsed?.d) {
        const anio = String(parsed.y);
        const mes = String(parsed.m).padStart(2, "0");
        const dia = String(parsed.d).padStart(2, "0");
        return `${anio}-${mes}-${dia}`;
      }
    }

    const valor = String(valorFecha || "").trim();
    if (!valor) return "";
    const soloFecha = valor.split(" ")[0];

    if (soloFecha.includes("/")) {
      const partes = soloFecha.split("/");
      if (partes.length === 3) {
        let a = partes[0];
        let b = partes[1];
        let c = partes[2];

        // Si el anio viene al inicio: yyyy/mm/dd
        if (a.length === 4) {
          const anio = a;
          const mes = b.padStart(2, "0");
          const dia = c.padStart(2, "0");
          return `${anio}-${mes}-${dia}`;
        }

        // Anio al final, puede venir en 2 o 4 digitos
        let anio = c;
        if (anio.length === 2) {
          anio = Number(anio) >= 50 ? `19${anio}` : `20${anio}`;
        }

        const n1 = Number(a);
        const n2 = Number(b);
        let dia = "";
        let mes = "";

        // Heuristica: si la primera parte > 12 => dd/mm/yyyy, si no => mm/dd/yyyy
        if (n1 > 12 && n2 <= 12) {
          dia = a.padStart(2, "0");
          mes = b.padStart(2, "0");
        } else {
          mes = a.padStart(2, "0");
          dia = b.padStart(2, "0");
        }

        return `${anio}-${mes}-${dia}`;
      }
    }

    if (soloFecha.includes("-")) {
      const partes = soloFecha.split("-");
      if (partes.length === 3) {
        if (partes[0].length === 4) return soloFecha;
        const dia = partes[0].padStart(2, "0");
        const mes = partes[1].padStart(2, "0");
        const anio = partes[2].slice(0, 4);
        return `${anio}-${mes}-${dia}`;
      }
    }

    return soloFecha;
  };

  const normalizarIdExcel = (valorId) => {
    const raw = String(valorId || "").trim();
    if (!raw) return "";
    if (/^\d+(\.0+)?$/.test(raw)) {
      return String(Math.trunc(Number(raw)));
    }
    if (/^\d+E\+\d+$/i.test(raw)) {
      return String(Math.trunc(Number(raw)));
    }
    return raw.replace(/\D/g, "");
  };

  const ocupacion = tomar("ocupacion", "Ocupacion");
  const institucion = tomar("institucion", "Institucion");
  return {
    idASPIRANTE: normalizarIdExcel(tomar("idASPIRANTE", "ID", "id", "identificacion")),
    nombre_completo: tomar("nombre_completo", "nombre", "Nombre", "nombre completo"),
    fechaNacimiento: normalizarFechaExcel(
      tomar("fechaNacimiento", "fecha_nacimiento", "FechaNacimiento", "Fecha")
    ),
    email: tomar("email", "Email", "correo", "correo_electronico"),
    telefono: tomar("telefono", "Telefono", "celular"),
    barrio: tomar("barrio", "Barrio"),
    direccion: tomar("direccion", "Direccion"),
    ocupacion,
    institucion:
      ocupacion === "Colegio" || ocupacion === "Universidad" ? institucion : null,
    password: tomar("password", "Password", "contrasena", "clave")
  };
};

const validarFilaExcel = (fila) => {
  if (!/^\d{8,}$/.test(fila.idASPIRANTE)) return "ID invalido (minimo 8 digitos)";
  if (Number(fila.idASPIRANTE) > 2147483647) return "ID fuera de rango (max 2147483647)";
  if (!fila.nombre_completo) return "Nombre requerido";
  if (!fila.fechaNacimiento) return "Fecha de nacimiento requerida";
  if (!esFechaISOValida(fila.fechaNacimiento)) return "La fecha de nacimiento no es valida";
  if (!/\S+@\S+\.\S+/.test(fila.email)) return "Email invalido";
  if (!/^\d{10}$/.test(fila.telefono)) return "Telefono invalido (10 digitos)";
  if (!fila.barrio) return "Barrio requerido";
  if (!fila.direccion) return "Direccion requerida";
  if (!fila.ocupacion) return "Ocupacion requerida";
  if ((fila.ocupacion === "Colegio" || fila.ocupacion === "Universidad") && !fila.institucion) {
    return "Institucion requerida para estudiantes";
  }
  if (!fila.password || fila.password.length < 8) return "Password invalido (minimo 8 caracteres)";
  return "";
};

const subirExcelAspirantes = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!REGISTROASPIRANTES_API) {
    Swal.fire("Error", "Falta VITE_API_REGISTROASPIRANTES en .env", "error");
    e.target.value = "";
    return;
  }

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
    const correosExistentes = new Set(
      aspirantes.map((a) => String(a.email || "").trim().toLowerCase()).filter(Boolean)
    );

    for (let i = 0; i < rows.length; i++) {
      const fila = normalizarFilaExcel(rows[i]);
      const errorValidacion = validarFilaExcel(fila);
      if (errorValidacion) {
        errores.push(`Fila ${i + 2}: ${errorValidacion}`);
        continue;
      }

      const correoFila = String(fila.email || "").trim().toLowerCase();
      if (correosExistentes.has(correoFila)) {
        errores.push(`Fila ${i + 2}: el correo ya esta registrado`);
        continue;
      }

      try {
        const res = await fetchAuth(REGISTROASPIRANTES_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...fila,
            idASPIRANTE: parseInt(fila.idASPIRANTE, 10)
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
        correosExistentes.add(correoFila);
      } catch {
        errores.push(`Fila ${i + 2}: error de conexion`);
      }
    }

    await obtenerAspirantes();

    if (!errores.length) {
      Swal.fire("Exito", `Se registraron ${exitos} aspirantes`, "success");
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
}



return (

<div className="contenedordelista">

<div className="table-controls">

 <div className="buttonsañadir">

    <h1 className="tituloadmin">{nombre}</h1>    
        <div className="botonesañadir">
              <button
                onClick={abrirModalNuevo}
                className="btn-add"
                >
                + Nuevo Aspirante
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
                onChange={subirExcelAspirantes}
                />
        </div>
  </div>
 
</div>


<div className="table-container">

<div className="top-header">

  <h2>Lista de Aspirantes</h2>

  <div className="top-actions">

    <select
    value={porPagina}
    onChange={(e)=>setPorPagina(Number(e.target.value))}
    >

    <option value={10}>10</option>
    <option value={50}>50</option>
    <option value={100}>100</option>

    </select>

    <input
    className="search"
    placeholder="Buscar por id o nombre"
    value={busqueda}
    onChange={(e)=>setBusqueda(e.target.value)}
    />

  </div>

</div>



<table className="tablalista">

<thead>
<tr>

<th>Foto</th>
<th>ID</th>
<th>Nombre</th>
<th>Email</th>
<th>Estado</th>
<th>Acciones</th>

</tr>
</thead>

<tbody>

{aspirantesPagina.map((asp)=>(
<tr key={asp.idASPIRANTE}>

<td>

{asp.foto ?

<img src={asp.foto} className="foto"/>

:

<div className="avatar">
{asp.nombre_completo.charAt(0)}
</div>

}

</td>

<td>{asp.idASPIRANTE}</td>

<td>{asp.nombre_completo}</td>

<td>{asp.email}</td>

<td>

<span
className={asp.activo ? "estado activo clickable" : "estado inactivo clickable"}
onClick={() => confirmarEstado(asp)}
>

{asp.activo ? "Habilitado" : "Deshabilitado"}

</span>

</td>

<td>

<button
className="details-btn"
onClick={()=>setModalDetalle(asp)}
>
Detalles
</button>

<button
className="edit-btn"
onClick={()=>abrirModalEditar(asp)}
>
Editar
</button>

{/*
<button
className="report-btn"
onClick={()=>IrReportes(asp.idASPIRANTE, asp.nombre_completo)}
>
Ver Reportes
</button>
*/}


</td>

</tr>
))}

</tbody>

</table>

<div className="pagination">

<button
disabled={pagina===1}
onClick={()=>setPagina(pagina-1)}
>
Previous
</button>

{[...Array(totalPaginas)].map((_,i)=>(

<button
key={i}
className={pagina===i+1 ? "active-page" : ""}
onClick={()=>setPagina(i+1)}
>

{i+1}

</button>

))}

<button
disabled={pagina===totalPaginas}
onClick={()=>setPagina(pagina+1)}
>
Next
</button>

</div>


{/* MODAL DETALLES */}

{modalDetalle && (
  <div className="asp-modal" onClick={() => setModalDetalle(null)}>
  <div className="modal-content" onClick={(e) => e.stopPropagation()}>

  <div className="modal-header">

  <div className="modal-title">
  Detalles del aspirante
  </div>

  <div
  className="modal-close"
  onClick={()=>setModalDetalle(null)}
  >
  ✕
  </div>

  </div>

  <div className="modal-field">
  <b>ID:</b> {modalDetalle.idASPIRANTE}
  </div>

  <div className="modal-field">
  <b>Nombre:</b> {modalDetalle.nombre_completo}
  </div>

  <div className="modal-field">
  <b>Fecha nacimiento:</b> {formatearFecha(modalDetalle.fechaNacimiento)}
  </div>

  <div className="modal-field">
  <b>Email:</b> {modalDetalle.email}
  </div>

  <div className="modal-field">
  <b>Telefono:</b> {modalDetalle.telefono}
  </div>

  <div className="modal-field">
  <b>Barrio:</b> {modalDetalle.barrio}
  </div>

  <div className="modal-field">
  <b>Direccion:</b> {modalDetalle.direccion}
  </div>

  <div className="modal-field">
  <b>Ocupacion:</b> {modalDetalle.ocupacion}
  </div>

  <div className="modal-field">
  <b>Institucion:</b> {modalDetalle.institucion || "No registrada"}
  </div>

  </div>
  </div>


)}

{/* DRAWER NUEVO ASPIRANTE */}

{modalNuevo && (
<div className="drawer-overlay" onClick={cerrarModalNuevo}>
<aside className="asp-drawer" onClick={(e)=>e.stopPropagation()}>
  <div className="asp-drawer-header">
    <h3>Nuevo Aspirante</h3>
    <button className="asp-drawer-close" onClick={cerrarModalNuevo}>✕</button>
  </div>

  <form className="asp-drawer-form" onSubmit={registrarNuevoAspirante}>
    <label>ID</label>
    <input
      name="idASPIRANTE"
      value={nuevoForm.idASPIRANTE}
      onChange={handleNuevoChange}
      className="asp-drawer-input"
      required
    />

    <label>Nombre completo</label>
    <input
      name="nombre_completo"
      value={nuevoForm.nombre_completo}
      onChange={handleNuevoChange}
      className="asp-drawer-input"
      required
    />

    <label>Fecha de nacimiento</label>
    <input
      type="date"
      max={hoy}
      name="fechaNacimiento"
      value={nuevoForm.fechaNacimiento}
      onChange={handleNuevoChange}
      className="asp-drawer-input"
      required
    />

    <label>Correo</label>
    <input
      type="email"
      name="email"
      value={nuevoForm.email}
      onChange={handleNuevoChange}
      className="asp-drawer-input"
      required
    />

    <label>Telefono</label>
    <input
      name="telefono"
      value={nuevoForm.telefono}
      onChange={handleNuevoChange}
      className="asp-drawer-input"
      required
    />

    <label>Barrio</label>
    <input
      name="barrio"
      value={nuevoForm.barrio}
      onChange={handleNuevoChange}
      className="asp-drawer-input"
      required
    />

    <label>Direccion</label>
    <input
      name="direccion"
      value={nuevoForm.direccion}
      onChange={handleNuevoChange}
      className="asp-drawer-input"
      required
    />

    <label>Ocupacion</label>
    <select
      name="ocupacion"
      value={nuevoForm.ocupacion}
      onChange={handleNuevoChange}
      className="asp-drawer-input"
      required
    >
      <option value="">Selecciona una opcion</option>
      <option value="Colegio">Estudia en colegio</option>
      <option value="Universidad">Estudia en universidad</option>
      <option value="Trabajo">Trabaja</option>
      <option value="Ninguno">No estudia ni trabaja</option>
    </select>

    {(nuevoForm.ocupacion === "Colegio" || nuevoForm.ocupacion === "Universidad") && (
      <>
        <label>Institucion</label>
        <input
          name="institucion"
          value={nuevoForm.institucion}
          onChange={handleNuevoChange}
          className="asp-drawer-input"
          required
        />
      </>
    )}

    <label>Contraseña</label>
    <input
      type="password"
      name="password"
      value={nuevoForm.password}
      onChange={handleNuevoChange}
      className="asp-drawer-input"
      required
      minLength={8}
    />

    <div className="asp-drawer-actions">
      <button type="button" className="asp-btn-cancel" onClick={cerrarModalNuevo}>
        Cancelar
      </button>
      <button type="submit" className="asp-btn-save" disabled={guardandoNuevo}>
        {guardandoNuevo ? "Guardando..." : "Guardar aspirante"}
      </button>
    </div>
  </form>
</aside>
</div>
)}

{/* MODAL EDITAR */}

{modalEditar && (

<div className="asp-modal" onClick={()=>setModalEditar(null)}>

<div className="modal-content edit-modal-content" onClick={(e)=>e.stopPropagation()}>
<form onSubmit={guardarEdicionAspirante}>

<div className="modal-header">
<div className="modal-title">Editar Aspirante</div>
<div
className="modal-close"
onClick={()=>setModalEditar(null)}
>
✕
</div>
</div>

<label>Nombre completo</label>
<input
className="edit-modal-input"
name="nombre_completo"
value={editForm.nombre_completo}
onChange={handleEditChange}
required
/>
<label>Email</label>
<input
className="edit-modal-input"
name="email"
type="email"
value={editForm.email}
onChange={handleEditChange}
required
/>
<label>Telefono</label>
<input
className="edit-modal-input"
name="telefono"
value={editForm.telefono}
onChange={handleEditChange}
required
/>
<label>Direccion</label>
<input
className="edit-modal-input"
name="direccion"
value={editForm.direccion}
onChange={handleEditChange}
required
/>
<label>Barrio</label>
<input
className="edit-modal-input"
name="barrio"
value={editForm.barrio}
onChange={handleEditChange}
required
/>

<div className="edit-modal-actions">
<button type="submit" className="edit-save-btn" disabled={guardandoEdicion}>
{guardandoEdicion ? "Guardando..." : "Guardar"}
</button>

<button type="button" className="edit-cancel-btn" onClick={()=>setModalEditar(null)}>
Cancelar
</button>
</div>

</form>
</div>

</div>

)}

</div>

</div>
)

}

export default AspiranteGet
