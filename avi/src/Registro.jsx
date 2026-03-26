import Swal from "sweetalert2";
import { useState } from "react";
import "./Registro.css";

function Registro() {
  const REGISTROASPIRANTES_API = import.meta.env.VITE_API_REGISTROASPIRANTES;

  const [idASPIRANTE, setId] = useState("");
  const [nombre_completo, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [barrio, setBarrio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  
  const hoy = new Date().toISOString().split("T")[0];
  const pasoInfo = {
    1: {
      titulo: "Datos de Cuenta",
      descripcion: "Completa tu información básica para crear tu cuenta",
    },
    2: {
      titulo: "Perfil Personal",
      descripcion: "Cuéntanos tu ocupación y datos de ubicación",
    },
    3: {
      titulo: "Seguridad",
      descripcion: "Configura tu contraseña para finalizar el registro",
    },
  };

  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  function validarPaso1() {
    if (!idASPIRANTE || !nombre_completo || !email || !fechaNacimiento || !telefono) {
      Swal.fire("Error", "Completa todos los campos del paso 1", "error");
      return false;
    }

    if (!/^\d{8,}$/.test(idASPIRANTE)) {
      Swal.fire("Error", "La identificación debe tener mínimo 8 números", "error");
      return false;
    }

    if (!/^\d{10}$/.test(telefono)) {
      Swal.fire("Error", "El teléfono debe tener exactamente 10 dígitos", "error");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Swal.fire("Error", "Correo electrónico inválido", "error");
      return false;
    }

    return true;
  }

  function validarPaso2() {
    if (!barrio || !direccion || !ocupacion) {
      Swal.fire("Error", "Completa todos los campos del paso 2", "error");
      return false;
    }

    if ((ocupacion === "Colegio" || ocupacion === "Universidad") && !institucion) {
      Swal.fire("Error", "Debes ingresar el nombre de la institución", "error");
      return false;
    }

    return true;
  }

  function validarPaso3() {
    if (!password || !confirmPassword) {
      Swal.fire("Error", "Completa los campos de contraseña", "error");
      return false;
    }

    if (!Object.values(validations).every(Boolean)) {
      Swal.fire("Error", "La contraseña no cumple con todos los requisitos", "error");
      return false;
    }

    if (password !== confirmPassword) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return false;
    }

    if (!aceptaTerminos) {
      Swal.fire("Error", "Debes aceptar los términos y condiciones", "error");
      return false;
    }

    return true;
  }

  function siguientePaso() {
    if (step === 1 && !validarPaso1()) return;
    if (step === 2 && !validarPaso2()) return;
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function pasoAnterior() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function registrarAspirante(event) {
    event.preventDefault();

    if (!validarPaso1() || !validarPaso2() || !validarPaso3()) return;

    const respuesta = await fetch(`${REGISTROASPIRANTES_API}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idASPIRANTE: parseInt(idASPIRANTE),
        nombre_completo,
        fechaNacimiento,
        email,
        telefono,
        barrio,
        direccion,
        ocupacion,
        institucion:
          ocupacion === "Colegio" || ocupacion === "Universidad" ? institucion : null,
        password,
      }),
    });

    if (respuesta.ok) {
      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Tu cuenta ha sido creada correctamente",
        confirmButtonColor: "#7a3fca",
      }).then(() => {
        window.location.href = "/login";
      });
    } else {
      Swal.fire("Error", "Error en el registro", "error");
    }
  }



  function mostrarTerminos() {
  Swal.fire({
    title: "Términos y Condiciones",
    html: `
      <p>
        Al registrarte en AVI, aceptas que tus datos serán tratados de acuerdo
        con las políticas de privacidad vigentes.
      </p>
      <ol style="text-align:left">
        <li style="margin: 15px;">
          <b>Uso de la información:</b> Los datos recolectados se usarán
          exclusivamente para fines académicos y de orientación vocacional.
        </li>
        <li style="margin: 15px;">
          <b>Veracidad:</b> El usuario se compromete a suministrar información real.
        </li>
        <li style="margin: 15px;">
          <b>Seguridad:</b> Nos comprometemos a proteger tu información personal.
        </li>
      </ol>
    `,
    confirmButtonText: "ENTENDIDO",
    confirmButtonColor: "#7a3fca",
  });
}
  
  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-steps" aria-label="Pasos de registro">
          <div className={`step-item ${step >= 1 ? "active" : ""}`}>
            <span>1</span>
            <small>Datos de cuenta</small>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step >= 2 ? "active" : ""}`}>
            <span>2</span>
            <small>Perfil personal</small>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step >= 3 ? "active" : ""}`}>
            <span>3</span>
            <small>Seguridad</small>
          </div>
        </div>

        <div className="auth-header">
          <h1>{pasoInfo[step].titulo}</h1>
          <p>Paso {step} de 3 - {pasoInfo[step].descripcion}</p>
        </div>

        <form className="auth-form" onSubmit={registrarAspirante}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label>Número de Identificación *</label>
                <input type="text" value={idASPIRANTE} onChange={(e) => setId(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Nombre Completo *</label>
                <input type="text" value={nombre_completo} onChange={(e) => setNombre(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label htmlFor="fechaNacimiento">Fecha de nacimiento *</label>
                <input
                  type="date"
                  max={hoy}
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Teléfono *</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label>Barrio *</label>
                <input type="text" value={barrio} onChange={(e) => setBarrio(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Dirección *</label>
                <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
              </div>

              <div className="form-group">
                <label>¿A qué te dedicas actualmente? *</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="ocupacion"
                      value="Colegio"
                      checked={ocupacion === "Colegio"}
                      onChange={(e) => setOcupacion(e.target.value)}
                    />
                    Estudio en colegio
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="ocupacion"
                      value="Universidad"
                      checked={ocupacion === "Universidad"}
                      onChange={(e) => setOcupacion(e.target.value)}
                    />
                    Estudio en universidad
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="ocupacion"
                      value="Trabajo"
                      checked={ocupacion === "Trabajo"}
                      onChange={(e) => setOcupacion(e.target.value)}
                    />
                    Trabajo
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="ocupacion"
                      value="Ninguno"
                      checked={ocupacion === "Ninguno"}
                      onChange={(e) => setOcupacion(e.target.value)}
                    />
                    No estudio ni trabajo
                  </label>
                </div>
              </div>

              {(ocupacion === "Colegio" || ocupacion === "Universidad") && (
                <div className="form-group">
                  <label>Nombre de la institución *</label>
                  <input
                    type="text"
                    value={institucion}
                    onChange={(e) => setInstitucion(e.target.value)}
                    placeholder="Ej: Colegio XYZ / Universidad ABC"
                  />
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-group">
                <label>Contraseña *</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPass(e.target.value)}
                  />
                  <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye-closed-icon lucide-eye-closed"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg"
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    )
                  }
                  </span>
                </div>

                <ul className="password-requirements">
                  <li className={validations.length ? "ok" : ""}>Mínimo 8 caracteres</li>
                  <li className={validations.uppercase ? "ok" : ""}>Una letra mayúscula</li>
                  <li className={validations.number ? "ok" : ""}>Un número</li>
                  <li className={validations.special ? "ok" : ""}>Un carácter especial</li>
                </ul>
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña *</label>
                <div className="password-input">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span className="eye" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye-closed-icon lucide-eye-closed"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg"
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    )}
                  </span>
                </div>
              </div>

              {/* TÉRMINOS */}
              <div className="terminos-container">
                <label className="terminos-label">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                  />
                  <span className="terminos-texto">
                    Acepto los{" "}
                    <span className="terminos-link" onClick={mostrarTerminos}>
                      términos y condiciones
                    </span>
                  </span>
                </label>
              </div>
            </>
          )}

          <div className="wizard-actions">
            {step > 1 && (
              <button type="button" className="auth-button auth-button-secondary" onClick={pasoAnterior}>
                Atrás
              </button>
            )}

            {step < 3 && (
              <button type="button" className="auth-button" onClick={siguientePaso}>
                Siguiente
              </button>
            )}

            {step === 3 && (
              <button type="submit" className="auth-button">
                Registrarse
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default Registro;