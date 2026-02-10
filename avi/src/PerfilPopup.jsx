import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./Perfil.css";


function PerfilPopup( {onClose }) {
    const navigate = useNavigate();
    const { logout, nombre, email } = useAuth();

    function irAEditar() {
        navigate("/editar-perfil");
        onClose();
    }


    function salir() {
        logout();
        navigate("/");
    }


    return (
    <div className="perfil-overlay">
        <div className="perfil-popup">
            <div className="perfil-header">
                <span>{email}</span>
                <button onClick={onClose}>✕</button>
            </div>


            <div className="perfil-body">
                <div className="avatar">👤</div>
                <h2>¡Hola, {nombre || "Aspirante"}!</h2>


                <button className="btn-editar" onClick={irAEditar}>
                Editar Perfil
                </button>
            </div>


            <div className="perfil-footer">
                <button className="btn-logout" onClick={salir}>
                Cerrar Sesión
                </button>
            </div>
        </div>
    </div>
    );
}


export default PerfilPopup;