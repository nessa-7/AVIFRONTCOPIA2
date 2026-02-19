import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Test.css";
import { useAuth } from "./context/AuthContext";

export default function TestRIASEC({ pretestScores,  sessionId }) {

  const { id } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BACKEND;

  const [reporteId, setReporteId] = useState(null);
  const [testId, setTestId] = useState(null); 
  const [preguntaId, setPreguntaId] = useState(null);

  const [scores, setScores] = useState(
    pretestScores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  );

  const [question, setQuestion] = useState(null);
  const [count, setCount] = useState(0);


  // INICIAR TEST

  useEffect(() => {

    if (!id) return;

    const startTest = async () => {
      try {
        const res = await fetch(`${API}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aspiranteId: id
          })
        });

        if (!res.ok) {
          const text = await res.text();
          console.log("ERROR START:", text);
          return;
        }

        const data = await res.json();

        setReporteId(data.idREPORTE);
        setTestId(data.testId); 

      } catch (error) {
        console.log("Error startTest:", error);
      }
    };

    startTest();

  }, [id]);


  // CUANDO YA TENEMOS testId → TRAER PRIMERA PREGUNTA

  useEffect(() => {
    if (testId) {
      getQuestion(testId);
    }
  }, [testId]);


  const getQuestion = async (currentTestId) => {

    try {
      const res = await fetch(`${API}/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: currentTestId,
          riasec_scores: scores,
          session_id: sessionId
        })
      });

      const data = await res.json();

      setPreguntaId(data.idPREGUNTAS);
      setQuestion({
        question: data.descripcion,
        category: data.perfilesRIASEC
      });

    } catch (error) {
      console.log("Error getQuestion:", error);
    }
  };



  const answerQuestion = async (value) => {

    try {
      await fetch(`${API}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aspiranteId: id,
          preguntaId: preguntaId,
          valor: value,
          reporteId: reporteId
        })
      });

      const updatedScores = {
        ...scores,
        [question.category]: scores[question.category] + value
      };

      setScores(updatedScores);

      const newCount = count + 1;
      setCount(newCount);

      if (newCount < 10) {
        getQuestion(testId);
      } else {
        finishTest(updatedScores);
      }

    } catch (error) {
      console.log("Error answerQuestion:", error);
    }
  };




  const finishTest = async (finalScores) => {
  try {
    const res = await fetch(`${API}/finish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reporteId,
        riasec_scores: finalScores
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.log("❌ ERROR FINISH:", text);
      return;
    }

    const result = await res.json();

    console.log("RESULTADO RECIBIDO:", result);

    if (!result) {
      console.log("⚠️ El backend no devolvió resultado");
      return;
    }

    navigate("/resultado", {
      state: { result }
    });

  } catch (error) {
    console.log("Error finishTest:", error);
  }
};

  const options = [
    { label: "😍 Me encanta", value: 5 },
    { label: "🙂 Me gusta", value: 4 },
    { label: "😐 Neutral", value: 3 },
    { label: "🙁 No me gusta", value: 2 },
    { label: "😡 Odio esto", value: 1 }
  ];

  return (
    <div className="test-riasec-container">

      <div className="test-riasec-header">
        <span className="question-counter">
          Pregunta {Math.min(count + 1, 10)} de 10
        </span>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((count) / 10) * 100}%` }}
          />
        </div>
      </div>

      {question && (
        
        <div className="test-riasec-question-container">
          <p className="test-riasec-question">
            {question.question}
          </p>

          {options.map(opt => (
            <button
              key={opt.value}
              className="test-riasec-button"
              onClick={() => answerQuestion(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}