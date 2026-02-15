import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Test.css";

export default function TestRIASEC({ pretestScores }) {

  const navigate = useNavigate();

  const [sessionId] = useState(() => crypto.randomUUID());

  const [scores, setScores] = useState(
    pretestScores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  );

  const [question, setQuestion] = useState(null);
  const [count, setCount] = useState(0);

  const API = import.meta.env.VITE_API_OPENAI;

  useEffect(() => {
    if (pretestScores) {
      setScores(pretestScores);
    }
  }, [pretestScores]);

  const getQuestion = async () => {
    const res = await fetch(`${API}/next-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        riasec_scores: scores,
        session_id: sessionId
      })
    });

    const data = await res.json();
    setQuestion(data);
  };

  const answerQuestion = async (value) => {
    const res = await fetch(`${API}/update-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: question.category,
        answer: value,
        riasec_scores: scores
      })
    });

    const data = await res.json();
    setScores(data.updated_scores);

    setCount(prev => {
      const newCount = prev + 1;

      if (newCount < 10) {
        getQuestion();
      } else {
        getResult(data.updated_scores);
      }

      return newCount;
    });
  };

  const getResult = async (finalScores) => {
    const res = await fetch(`${API}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalScores)
    });

    const data = await res.json();

    // 👉 Navegar a Resultado
    navigate("/resultado", {
      state: { result: data }
    });
  };

  const options = [
    { label: "😍 Me encanta", value: 5 },
    { label: "🙂 Me gusta", value: 4 },
    { label: "😐 Neutral", value: 3 },
    { label: "🙁 No me gusta", value: 2 },
    { label: "😡 Odio esto", value: 1 }
  ];

  useEffect(() => {
    getQuestion();
  }, []);

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

          {options.map((opt) => (
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
