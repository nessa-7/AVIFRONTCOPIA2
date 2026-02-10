import { useEffect, useState } from "react";
import "./Perfil.css";
import { useAuth } from "./context/AuthContext";


function EditarPerfil() {
    const PERFIL_API = import.meta.env.VITE_API_PERFILASPIRANTE;


    const [usuario, setUsuario] = useState(null);
    const [reportes, setReportes] = useState([]);

    const { token } = useAuth();


    async function obtenerPerfil() {

        const respuesta = await fetch(`${PERFIL_API}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        const data = await respuesta.json();

        console.log("DATA:", data);

        setUsuario(data);
    }



    useEffect(() => {
        if (token) {
            obtenerPerfil();
        }
    }, [token]);


    function volver() {
        router.back();
    }


if (!usuario) return <p>Cargando perfil...</p>;


return (
    <section className="perfil-page">
        <div className="editar-perfil-container">

            <div className="editar-header">
            <button className="btn-volver" onClick={volver}>
                ← Volver
            </button>
            <h1>Mi Perfil</h1>
            </div>
            


            <div className="perfil-card">

                <div className="perfil-card-header">
                    {/* 
                <img
                src={usuario?.foto || "/placeholder-user.jpg"}
                alt="Foto de perfil"
                className="perfil-card-foto"
                /> */}
                <div className="perfil-card-info">
                <h2>{usuario.nombre_completo || "Sin nombre"}</h2>
                <span className="perfil-badge">Aspirante</span>
                </div>
            </div>

            <div className="perfil-datos">
                <div className="dato-item">
                <span className="dato-label">Identificación</span>
                <span className="dato-valor">{usuario?.idASPIRANTE || "---"}</span>
                </div>
                <div className="dato-item">
                <span className="dato-label">Nombre completo</span>
                <span className="dato-valor">{usuario?.nombre_completo || "---"}</span>
                </div>
                <div className="dato-item">
                <span className="dato-label">Correo electrónico</span>
                <span className="dato-valor">{usuario?.email || "---"}</span>
                </div>
                <div className="dato-item">
                <span className="dato-label">Teléfono</span>
                <span className="dato-valor">{usuario?.telefono || "---"}</span>
                </div>
            </div>
                
            </div>


            <h2>Mis Reportes</h2>


            <div className="reportes-grid">
                {reportes.length === 0 ? (
                    <p>No tienes reportes generados.</p>
                ) : (
                reportes.map((rep, i) => (
                    <div key={i} className="reporte-card">
                        <p><strong>Fecha:</strong> {rep.fecha}</p>
                        <p><strong>Recomendaciones:</strong> {rep.programas}</p>
                    </div>
                ))
                )}
            </div>
        </div>
    </section>
        
    )
}

export default EditarPerfil