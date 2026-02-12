import { useState } from "react";
import "./PreTest.css";
import { useNavigate } from "react-router-dom";
import TestRIASEC from "./TestRIASEC";


export default function Pretest() {
  const [startTest, setStartTest] = useState(false);
  const [scores, setScores] = useState({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });

  const navigate = useNavigate;

  const questions = [
    {
      text: "Disfruto arreglar cosas, usar herramientas o resolver problemas técnicos",
      profiles: ["R", "I"],
    },
    {
      text: "Me gusta crear cosas originales como dibujos, música o diseños",
      profiles: ["A", "I"],
    },
    {
      text: "Prefiero ayudar a las personas y trabajar en equipo",
      profiles: ["S", "E"],
    },
    {
      text: "Me siento cómodo liderando grupos o tomando decisiones importantes",
      profiles: ["E", "C"],
    },
    {
      text: "Disfruto organizar información y seguir procesos ordenados",
      profiles: ["C", "R"],
    },
  ];

  const [answers, setAnswers] = useState(Array(questions.length).fill(3));

  const handleChange = (i, value) => {
    const updated = [...answers];
    updated[i] = value;
    setAnswers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    questions.forEach((q, i) => {
      q.profiles.forEach((p) => {
        newScores[p] += answers[i];
      });
    });

    setScores(newScores);
    setStartTest(true);
  };

  // Las etiquetas que se mostrarán en el slider
  const labels = [
    "Odio esto",
    "No me gusta",
    "Neutral",
    "Me gusta",
    "Me encanta",
  ];

    if (startTest) {
    return <TestRIASEC pretestScores={scores} />;
    }


  return (
    <div className="pretest-container">
      <h1>Responde las siguientes preguntas</h1>

      <form onSubmit={handleSubmit} className="pretest-form">
        {questions.map((q, i) => (
          <div key={i} className="pretest-question">
            <p>
              {i + 1}. {q.text}
            </p>

            <input
              type="range"
              min="1"
              max="5"
              value={answers[i]}
              onChange={(e) => handleChange(i, Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #d5b3ff ${((answers[i] - 1) / 4) * 100}%, #cee2ff ${((answers[i] - 1) / 4) * 100}%)`,
              }}
            />
            <div className="slider-labels">
              {labels.map((label, index) => (
                <span
                  key={index}
                  className={answers[i] === index + 1 ? "active" : ""}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        ))}

        <button type="submit">Iniciar Test Vocacional</button>
      </form>
    </div>
  );
}
