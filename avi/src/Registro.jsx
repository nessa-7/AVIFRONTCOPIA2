import Swal from 'sweetalert2'
import { useState } from "react";

function Registro() {

  const REGISTROASPIRANTES_API = import.meta.env.VITE_API_REGISTROASPIRANTES

  const [idASPIRANTE, setId] = useState("");
  const [nombre_completo, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPass] = useState("");

  async function registrarAspirante(event) {
        event.preventDefault();

        const idEntero = parseInt(idASPIRANTE)

        const respuesta = await fetch(`${REGISTROASPIRANTES_API}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({idASPIRANTE: idEntero, nombre_completo, email, telefono, password }),
        });

        if (respuesta.ok){

          Swal.fire({
            icon: "success",
            title: "¡Registro exitoso!",
            text: "Tu cuenta ha sido creada correctamente",
            confirmButtonColor: "#39a900",
          }).then(() => {
            window.location.href = "/login"
          })

        }else{

          Swal.fire({
            icon: "error",
            title: "Error en el registro",
            confirmButtonColor: "#39a900",
          })

        }
  }


  return (
    <>   
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Crear Cuenta</h1>
            <p>Regístrate para acceder al test vocacional AVI</p>
          </div>

          <form className="auth-form" onSubmit={registrarAspirante}>
            <div className="form-group">
              <label htmlFor="identificacion">Número de Identificación *</label>
              <input type="text" id="identificacion" name="identificacion" required onChange={(event)=> setId(event.target.value)}/>
            </div>

            <div className="form-group">
              <label htmlFor="nombreCompleto">Nombre Completo *</label>
              <input type="text" id="nombreCompleto" name="nombreCompleto" required onChange={(event)=> setNombre(event.target.value)}/>
            </div>

            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico *</label>
              <input type="email" id="correo" name="correo" required onChange={(event)=> setEmail(event.target.value)}/>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input type="tel" id="telefono" name="telefono" required onChange={(event)=> setTelefono(event.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input type="password" id="password" name="password" required onChange={(event)=> setPass(event.target.value)}/>
              <div className="password-requirements">
                <small>La contraseña debe tener:</small>
                <ul>
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos un número</li>
                  <li>Al menos un carácter especial</li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required />
            </div>

            <button type="submit" className="auth-button">Registrarse</button>
          </form>

          <div className="auth-footer">
            <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a></p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Registro;
