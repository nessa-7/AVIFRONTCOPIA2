import { useState } from "react";
import "./PreTest.css";
import TestRIASEC from "./TestRIASEC";

export default function Pretest() {
  const [startTest, setStartTest] = useState(false);

  const questions = [
    {
      type: "text",
      text: "¿Qué querías ser cuando eras niño/a y por qué?",
    },
    {
      type: "text",
      text: "Si tuvieras que elegir una actividad para hacer durante 4 horas seguidas sin aburrirte, ¿cuál sería?",
    },
    {
      type: "options",
      text: "¿Qué tipo de problemas disfrutas resolver más?",
      options: [
        "Técnicos o mecánicos",
        "Científicos o de investigación",
        "Creativos o artísticos",
        "Personales o sociales",
        "Comerciales o estratégicos",
        "Administrativos u organizativos",
      ],
    },
    {
      type: "options",
      text: "En un trabajo ideal, ¿qué valoras más?",
      options: [
        "Estabilidad y orden",
        "Libertad creativa",
        "Impacto en otras personas",
        "Liderar proyectos",
        "Descubrir cosas nuevas",
        "Trabajar con herramientas o tecnología",
      ],
    },
    {
      type: "options",
      text: "Cuando trabajas en equipo, ¿qué rol sueles asumir naturalmente?",
      options: [
        "El que organiza",
        "El que propone ideas nuevas",
        "El que analiza datos",
        "El que ejecuta tareas prácticas",
        "El que motiva y guía",
        "El que cuida el ambiente y apoya",
      ],
    },
  ];

  const [answers, setAnswers] = useState(
    Array(questions.length).fill("")
  );

  const handleChange = (i, value) => {
    const updated = [...answers];
    updated[i] = value;
    setAnswers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Respuestas:", answers);
    setStartTest(true);
  };

  if (startTest) {
    return <TestRIASEC pretestAnswers={answers} />;
  }

  return (
    <div className="pretest-container">
      <h1>Responde las siguientes preguntas</h1>

      <form onSubmit={handleSubmit} className="pretest-form">
        {questions.map((q, i) => (
          <div key={i} className="pretest-question">
            <p>{i + 1}. {q.text}</p>

            {/* Preguntas abiertas */}
            {q.type === "text" && (
              <textarea
                value={answers[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder="Escribe tu respuesta..."
                required
                rows={4}
              />
            )}

            {/* Preguntas con opciones */}
            {q.type === "options" &&
              q.options.map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name={`question-${i}`}
                    value={option}
                    checked={answers[i] === option}
                    onChange={() => handleChange(i, option)}
                    required
                  />
                  {option}
                </label>
              ))}
          </div>
        ))}

        <button type="submit">Iniciar Test Vocacional</button>
      </form>
    </div>
  );
}
