import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Test.css";
import { useAuth } from "./context/AuthContext";
import Avatar3D from "./components/Avatar3D";


// 🔊 Función para hablar en el test principal
const speak = (text, setSpeaking, setEmotion) => {
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "es-ES";
  utter.pitch = 1.1;
  utter.rate = 1;

  const voices = window.speechSynthesis.getVoices();

  const femaleVoice =
    voices.find(v =>
      v.lang.includes("es") &&
      (
        v.name.includes("Maria") ||
        v.name.includes("Helena") ||
        v.name.includes("Sabina") ||
        v.name.includes("Female")
      )
    ) ||
    voices.find(v => v.lang.includes("es"));

  if (femaleVoice) utter.voice = femaleVoice;

  utter.onstart = () => {
    setSpeaking(true);
    setEmotion("talking");
  };

  utter.onend = () => {
    setSpeaking(false);
    setEmotion("neutral");
  };

  window.speechSynthesis.speak(utter);
};


export default function TestRIASEC({ pretestScores, sessionId, reporteId }) {

  const { id, token } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BACKEND;

  const fetchAuth = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    });
  };

  // Test RIASEC siempre es el test 1
  const [testId] = useState(1);

  const [preguntaId, setPreguntaId] = useState(null);

  const [scores, setScores] = useState(
    pretestScores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  );

  const [question, setQuestion] = useState(null);
  const [count, setCount] = useState(0);



  if (!token) {
    return (
      <div className="test-riasec-container">
        <div className="loading-screen">
          <h2>Necesitas iniciar sesión</h2>
          <p>Inicia sesión para continuar con el test.</p>
        </div>
      </div>
    );
  }

  const [speaking, setSpeaking] = useState(false);
  const [emotion, setEmotion] = useState("neutral");


  const [loading, setLoading] = useState(false);
  const micRecognitionRef = useRef(null);
  const [listeningMic, setListeningMic] = useState(false);
  const [micError, setMicError] = useState("");

  const normalizeText = (value = "") =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const handleSpeechAnswer = (transcript) => {
    if (!transcript || !question) return;

    const normalizedTranscript = normalizeText(transcript);
    const match = options.find((opt) =>
      normalizeText(opt.label)
        .split(" ")
        .some((word) => normalizedTranscript.includes(word))
    );

    if (match) {
      answerQuestion(match.value);
      setMicError("");
    } else {
      setMicError("No se entendió tu respuesta. Intenta decir una de las opciones.");
    }
  };

  const startListeningForAnswer = () => {
    if (listeningMic || loading || !question) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Tu navegador no soporta dictado por voz.");
      return;
    }

    const recognition =
      micRecognitionRef.current || new SpeechRecognition();
    recognition.lang = "es-CO";
    recognition.interimResults = false;
    recognition.continuous = false;
    micRecognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      handleSpeechAnswer(transcript);
      recognition.stop();
    };

    recognition.onstart = () => setListeningMic(true);
    recognition.onend = () => setListeningMic(false);
    recognition.onerror = () => {
      setListeningMic(false);
      setMicError("No se pudo escuchar tu voz. Intenta nuevamente.");
    };

    setMicError("");
    recognition.start();
  };

  useEffect(() => {
    return () => {
      micRecognitionRef.current?.abort?.();
    };
  }, []);

  const [isFinishing, setIsFinishing] = useState(false);




  // TRAER PRIMERA PREGUNTA

  useEffect(() => {
    if (testId && sessionId) {
      getQuestion(testId);
    }
  }, [testId, sessionId]);


const getQuestion = async (currentTestId, currentScores = scores) => {
    try {

       setLoading(true);

      const res = await fetchAuth(`${API}/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: currentTestId,
          riasec_scores: currentScores,
          session_id: sessionId
        })
      });

      const data = await res.json();

      setPreguntaId(data.idPREGUNTAS);

      setQuestion({
        question: data.descripcion,
        category: data.perfilesRIASEC
      });

      setLoading(false); 

    } catch (error) {
      console.log("Error getQuestion:", error);
    }
  };


  const answerQuestion = async (value) => {

    try {

      await fetchAuth(`${API}/answer`, {
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


      if (newCount < 18) {

        getQuestion(testId, updatedScores);

      } else {

        finishTest(updatedScores);

      }

    } catch (error) {
      console.log("Error answerQuestion:", error);
    }
  };


 const finishTest = async (finalScores) => {

  setIsFinishing(true);
  setLoading(true);

  speak(
    "Excelente, hemos terminado tu test vocacional.",
    setSpeaking,
    setEmotion
  );

  try {
    const res = await fetchAuth(`${API}/finish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reporteId,
        riasec_scores: finalScores
      })
    });

    const result = await res.json();

    setTimeout(() => {
      navigate("/resultado", {
        state: { result }
      });
    }, 2000);

  } catch (error) {
    console.log("Error finishTest:", error);
    setLoading(false);
    setIsFinishing(false);
  }
};

  const options = [
    { label: "Me encanta", value: 5, className: "riasec-option-encanta" },
    { label: "Me gusta", value: 4, className: "riasec-option-gusta" },
    { label: "Neutral", value: 3, className: "riasec-option-neutral" },
    { label: "No me gusta", value: 2, className: "riasec-option-nomegusta" },
    { label: "Odio esto", value: 1, className: "riasec-option-odio" }
  ];


  useEffect(() => {
    if (!question?.question) return;

    speak(question.question, setSpeaking, setEmotion);
  }, [question]);


  if (isFinishing) {
  return (
    <div className="test-riasec-container">
      <div className="loading-screen">
        <h2>Analizando tus resultados...</h2>
        <p>Estamos identificando tus perfiles vocacionales predominantes </p>
        <div className="spinner"></div>
      </div>
    </div>
  );
}



  return (
  <div className="test-riasec-container">

    <div className="test-riasec-layout">

      <div className="test-riasec-avatar-pane">
        <Avatar3D emotion={emotion} speaking={speaking} />
      </div>


      <div className="test-riasec-content-pane">

        <div className="test-riasec-header">

          <span className="question-counter">
            Pregunta {Math.min(count + 1, 18)} de 18
          </span>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(count / 18) * 100}%` }}
            />
          </div>

        </div>


        <div className="test-riasec-question-container">

          {loading ? (

              <div className="loading-container">
                <div className="spinner"></div>
                <p>
                  {isFinishing
                    ? "Analizando tus resultados finales..."
                    : "Cargando siguiente pregunta..."}
                </p>
              </div>

            ) : question && (

            <>
              <p className="test-riasec-question">
                {question.question}
              </p>

              {options.map(opt => (
                <button
                  key={opt.value}
                  className={`test-riasec-option-btn ${opt.className}`}
                  onClick={() => answerQuestion(opt.value)}
                  disabled={loading}
                >
                  {opt.label}
                </button>
              ))}
              <div className="test-riasec-actions">
                <button
                  type="button"
                  className={`test-riasec-mic-btn ${listeningMic ? "is-listening" : ""}`}
                  onClick={startListeningForAnswer}
                  aria-label="Responder con voz"
                  disabled={loading || !question}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 4a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3z"></path>
                    <path d="M5 11a7 7 0 0 0 14 0"></path>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                  </svg>
                </button>
                {micError && <span className="mic-error">{micError}</span>}
              </div>
            </>

          )}

        </div>
      </div>

    </div>

  </div>
);
}