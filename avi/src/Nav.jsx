import {Link} from 'react-router-dom'
import { useAuth } from "./context/AuthContext";
import Swal from 'sweetalert2'
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import PerfilPopup from './PerfilPopup';

function Nav(){

    const {logout} = useAuth();
    const navigate = useNavigate();

    const salir = () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Se cerrará la sesión actual.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#39a900",
            cancelButtonColor: "#ca0e0e",
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate("/");
            }
        });
    };



    const [mostrarPerfil, setMostrarPerfil] = useState(false);

    const usuario = {
        nombre_completo: localStorage.getItem("nombre"),
        email: localStorage.getItem("email"),
    };


    return(
        <div>
            <nav>

                <Link to="/">Inicio 
                    <img src="/logoAVI.png" alt="AVI Logo" className="logo-img" style={{height:"50px", width: "auto"}}></img>
                </Link>

                <div className='nav-left'>
                    <Link to="/bienvenidatest">Test</Link>
                    <Link to="/programas">Programas</Link>


                    <button
                        onClick={() => setMostrarPerfil(true)}
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            border: "2px solid #7b2cbf",
                            padding: "0",
                            cursor: "pointer",
                            overflow: "hidden",
                            background: "transparent"
                        }}
                        >
                            {/*
                        <img
                            src={usuario.foto || "/placeholder.svg"}
                            alt="Perfil"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                         */}
                        </button>

                    {mostrarPerfil && (
                        <PerfilPopup
                        usuario={usuario}
                        onClose={() => setMostrarPerfil(false)}
                        />
                    )}
                    
                </div>

                
                    
            </nav>
        </div>
    )
}



export default Nav