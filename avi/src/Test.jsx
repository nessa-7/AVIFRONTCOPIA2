import { useNavigate } from "react-router-dom";

function Test(){
    const Navigate = useNavigate();

    function terminarTest() {
        Navigate("/resultado");
    }

return(
    <div className="vocacional-form">
        <div className="container">
        <h2>Formulario Vocacional SENA</h2>

        <p>1. ¿Qué actividad disfrutas más?</p>
        <label><input type="radio" name="p1" value="tecnologia" required /> Programar o usar computadoras</label>
        <label><input type="radio" name="p1" value="salud" /> Ayudar a personas enfermas</label>
        <label><input type="radio" name="p1" value="administracion" /> Organizar eventos o proyectos</label>
        <label><input type="radio" name="p1" value="arte" /> Dibujar o diseñar</label>

        <p>2. ¿Qué materia te gusta más?</p>
        <label><input type="radio" name="p2" value="tecnologia" required /> Matemáticas</label>
        <label><input type="radio" name="p2" value="salud" /> Biología</label>
        <label><input type="radio" name="p2" value="administracion" /> Economía</label>
        <label><input type="radio" name="p2" value="arte" /> Arte</label>

        <p>3. ¿Cómo prefieres trabajar?</p>
        <label><input type="radio" name="p3" value="tecnologia" required /> Con tecnología</label>
        <label><input type="radio" name="p3" value="salud" /> Con personas</label>
        <label><input type="radio" name="p3" value="administracion" /> En equipo</label>
        <label><input type="radio" name="p3" value="arte" /> De forma creativa</label>

        <p>4. ¿Qué te gustaría aprender?</p>
        <label><input type="radio" name="p4" value="tecnologia" required /> Programación</label>
        <label><input type="radio" name="p4" value="salud" /> Primeros auxilios</label>
        <label><input type="radio" name="p4" value="administracion" /> Liderazgo</label>
        <label><input type="radio" name="p4" value="arte" /> Diseño gráfico</label>

        <p>5. ¿Qué te motiva más?</p>
        <label><input type="radio" name="p5" value="tecnologia" required /> Resolver problemas</label>
        <label><input type="radio" name="p5" value="salud" /> Ayudar a otros</label>
        <label><input type="radio" name="p5" value="administracion" /> Organizar y planear</label>
        <label><input type="radio" name="p5" value="arte" /> Crear cosas nuevas</label>

        <p>6. ¿Dónde te gustaría trabajar?</p>
        <label><input type="radio" name="p6" value="tecnologia" required /> Oficina tecnológica</label>
        <label><input type="radio" name="p6" value="salud" /> Hospital o clínica</label>
        <label><input type="radio" name="p6" value="administracion" /> Empresa</label>
        <label><input type="radio" name="p6" value="arte" /> Estudio creativo</label>

        <p>7. ¿Qué tipo de proyectos prefieres?</p>
        <label><input type="radio" name="p7" value="tecnologia" required /> Desarrollo de software</label>
        <label><input type="radio" name="p7" value="salud" /> Campañas de salud</label>
        <label><input type="radio" name="p7" value="administracion" /> Organización de eventos</label>
        <label><input type="radio" name="p7" value="arte" /> Exposiciones de arte</label>

        <p>8. ¿Qué te gustaría mejorar?</p>
        <label><input type="radio" name="p8" value="tecnologia" required /> Habilidades tecnológicas</label>
        <label><input type="radio" name="p8" value="salud" /> Empatía</label>
        <label><input type="radio" name="p8" value="administracion" /> Comunicación</label>
        <label><input type="radio" name="p8" value="arte" /> Creatividad</label>

        <p>9. ¿Qué te gustaría lograr?</p>
        <label><input type="radio" name="p9" value="tecnologia" required /> Crear una app</label>
        <label><input type="radio" name="p9" value="salud" /> Salvar vidas</label>
        <label><input type="radio" name="p9" value="administracion" /> Dirigir una empresa</label>
        <label><input type="radio" name="p9" value="arte" /> Exponer tus obras</label>

        <p>10. ¿Qué te representa mejor?</p>
        <label><input type="radio" name="p10" value="tecnologia" required /> Innovador/a</label>
        <label><input type="radio" name="p10" value="salud" /> Solidario/a</label>
        <label><input type="radio" name="p10" value="administracion" /> Organizado/a</label>
        <label><input type="radio" name="p10" value="arte" /> Creativo/a</label>

        <br />
        <button type="button" onClick={terminarTest}>Finalizar</button>
      </div>
    </div>
)
}

export default Test