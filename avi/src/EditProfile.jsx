import { useState, useEffect } from "react";


export default function EditProfile({ user, setUser, cerrar }) {
  const [datos, setDatos] = useState(user);
  const [nombreArchivo, setNombreArchivo] = useState(''); // Para mostrar el nombre del archivo

  // Inicializar widget de Cloudinary
  useEffect(() => {
    if (window.cloudinary) {
      const widgetCarga = window.cloudinary.createUploadWidget(
        {
          cloudName: 'doeyxhpn3', // Tu cloud name
          uploadPreset: 'perfiles-app', // Reemplaza con tu preset
          sources: ['local'],
          folder: 'imagen de perfil', // Carpeta para organizar en Cloudinary
          maxFiles: 1
        },
        (error, resultado) => {
          if (!error && resultado?.event === "success") {
            // Actualizar datos con la URL de Cloudinary
            setDatos({ ...datos, foto: resultado.info.secure_url });
            setNombreArchivo(resultado.info.original_filename);
          }
        }
      );

      // Conectar widget al botón que reemplazará el input file
      const btnSubir = document.getElementById('btn-subir-foto');
      if (btnSubir) {
        btnSubir.addEventListener('click', () => widgetCarga.open());
      }

      return () => {
        if (btnSubir) btnSubir.removeEventListener('click', () => widgetCarga.open());
      };
    }
  }, [datos]);

  function handleChange(e) {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value
    });
  }

  // ELIMINA la función cambiarFoto antigua (ya no la necesitas)

  function guardar() {
    setUser(datos);
    // Guardar también en localStorage (si lo necesitas)
    localStorage.setItem('user', JSON.stringify(datos));
    cerrar();
  }

  return (
    <div className="modal">
      <div className="modalBox">
        <h2>Editar perfil</h2>
        <div className="fotoBox">
          <img src={datos.foto} className="editFoto" />
          {/* Reemplaza el input file por un botón */}
          <button id="btn-subir-foto" className="btn-subir">
            Elegir archivo
          </button>
          {/* Mostrar nombre del archivo seleccionado */}
          {nombreArchivo && <span className="nombre-archivo">{nombreArchivo}</span>}
        </div>

        <label>Nombre</label>
        <input
          type="text"
          name="nombre"
          value={datos.nombre}
          onChange={handleChange}
        />

        <label>Correo</label>
        <input
          type="email"
          name="email"
          value={datos.email}
          onChange={handleChange}
        />

        <div className="acciones">
          <button onClick={guardar}>Guardar</button>
          <button className="cancelar" onClick={cerrar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}