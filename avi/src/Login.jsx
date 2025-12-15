import Swal from 'sweetalert2'

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "./context/AuthContext";

function Login() {

     const LOGINASPIRANTE_API = import.meta.env.VITE_API_LOGINASPIRANTE

    const navigate = useNavigate();

    const [id, setId] = useState("");
    const [pass, setPass] = useState("");

    const {guardarToken} = useAuth();
    const {guardarNombre} = useAuth(); 
    const {guardarRol} = useAuth();


    async function Ingresar(event) {
        event.preventDefault();

        const idEntero = parseInt(id)

        const respuesta = await fetch(`${LOGINASPIRANTE_API}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: idEntero, pass }),
        });

        const data = await respuesta.json();
        console.log(data)

        
        
        if (data.mensaje==="Credenciales incorrectas") {
            Swal.fire({
                icon: "error",
                title: "Datos incorrectos",
                confirmButtonColor: "#39a900",
            })
            return
        }

        if (!respuesta.ok) {
            Swal.fire({
                icon: "error",
                title: "Error al iniciar sesion",
                confirmButtonColor: "#39a900",
            })
            return
        }

            guardarToken(data.token);
            guardarNombre(data.usuario.nombre_completo);
            guardarRol(data.rol)

            console.log(data.usuario.nombre_completo);

            console.log(data.rol)

        if (respuesta.ok) {

            Swal.fire({
                icon: "success",
                title: "¡Bienvenido a AVI!",
                confirmButtonColor: "#39a900",
            }).then(() => {
                    navigate("/BienvenidaTest")
            })

        } 

    }


    return (
        <section className="auth-section">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Iniciar Sesión</h1>
                    <p>Accede a tu cuenta para continuar con el test vocacional</p>
                </div>

                <form id="loginForm" className="auth-form" onSubmit={Ingresar}>
                    <div className="form-group">
                        <label htmlFor="identificacion">Número de Identificación</label>
                        <input type="text" id="identificacion" name="identificacion" required onChange={(event)=> setId(event.target.value)}/>
                        <span className="error-message" id="identificacion-error"></span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" id="password" name="password" required onChange={(event)=> setPass(event.target.value)}/>
                        <span className="error-message" id="password-error"></span>
                    </div>

                    <button type="submit" className="auth-button" >Ingresar</button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes cuenta? <a href="/registro" className="loader-link">Regístrate aquí</a></p>
                </div>
            </div>
        </section>
    );
}

export default Login;