import { useState, useEffect, useRef } from "react";
import "./PreTest.css";
import TestRIASEC from "./TestRIASEC";
import { useAuth } from "./context/AuthContext";
import Avatar3D from "./components/Avatar3D";


// 🔊 Función global para hablar con voz femenina
const speak = (text, setSpeaking) => {
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "es-ES";
  utter.pitch = 1.1;
  utter.rate = 1;

      const voices = window.speechSynthesis.getVoices();

      const femaleVoice = voices.find(v =>
        v.lang.startsWith("es") &&
        v.name.toLowerCase().includes("female")
      ) ||
      voices.find(v =>
        v.lang.startsWith("es") &&
        (
          v.name.includes("Maria") ||
          v.name.includes("Helena") ||
          v.name.includes("Sabina")
        )
      ) ||
      voices.find(v => v.lang.startsWith("es"));

      if (femaleVoice) {
        utter.voice = femaleVoice;
      }

  utter.onstart = () => setSpeaking(true);
  utter.onend = () => setSpeaking(false);

  window.speechSynthesis.speak(utter);
};


export default function Pretest() {

  const API = import.meta.env.VITE_API_BACKEND;
  const { id, token } = useAuth();

  if (!token) {
    return (
      <div className="pretest-container">
        <div className="loading-screen">
          <h2>Necesitas iniciar sesión</h2>
          <p>Inicia sesión para continuar con el pretest.</p>
        </div>
      </div>
    );
  }

  const fetchAuth = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    });
  };

  const [startTest,setStartTest]=useState(false);
  const [pretestScores,setPretestScores]=useState(null);
  const [sessionId,setSessionId]=useState(null);
  const [reporteId,setReporteId]=useState(null);

  const [currentQuestion,setCurrentQuestion]=useState(0);
  const [answers,setAnswers]=useState([]);

  const [speaking,setSpeaking]=useState(false);

  const [error,setError] = useState("");


  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const [listeningMic, setListeningMic] = useState(false);

  const normalizeText = (value = "") =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const handleSpeechInput = (transcript) => {
    if (!transcript) return;
    const currentQuestionData = questions[currentQuestion];
    if (!currentQuestionData) return;

    if (currentQuestionData.type === "text") {
      handleChange(transcript);
      return;
    }

    const normalizedTranscript = normalizeText(transcript);
    const match = currentQuestionData.options?.find((opt) =>
      normalizeText(opt)
        .split(" ")
        .some((word) => normalizedTranscript.includes(word))
    );

    if (match) {
      handleChange(match);
    } else {
      setError("No se entendió tu respuesta. Intenta de nuevo.");
    }
  };

  const startMicrophone = () => {
    if (listeningMic || loading) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Tu navegador no soporta dictado por voz.");
      return;
    }

    const recognition =
      recognitionRef.current || new SpeechRecognition();
    recognition.lang = "es-CO";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      handleSpeechInput(transcript);
      recognition.stop();
    };
    recognition.onstart = () => {
      setListeningMic(true);
    };
    recognition.onend = () => {
      setListeningMic(false);
    };
    recognition.onerror = () => {
      setListeningMic(false);
      setError("No se pudo escuchar tu voz. Intenta de nuevo.");
    };

    setError("");
    recognition.start();
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
    };
  }, []);

  const questions=[

    {
      type:"text",
      text:"¿Qué querías ser cuando eras niño o niña y por qué?"
    },

    {
      type:"text",
      text:"Si tuvieras que elegir una actividad para hacer durante cuatro horas seguidas sin aburrirte, ¿cuál sería?"
    },

    {
      type:"options",
      text:"¿Qué tipo de problemas disfrutas resolver más?",
      options:[
        "Técnicos o mecánicos",
        "Científicos o de investigación",
        "Creativos o artísticos",
        "Personales o sociales",
        "Comerciales o estratégicos",
        "Administrativos u organizativos"
      ]
    },

    {
      type:"options",
      text:"En un trabajo ideal, ¿qué valoras más?",
      options:[
        "Estabilidad y orden",
        "Libertad creativa",
        "Impacto en otras personas",
        "Liderar proyectos",
        "Descubrir cosas nuevas",
        "Trabajar con herramientas o tecnología"
      ]
    },

    {
      type:"options",
      text:"Cuando trabajas en equipo, ¿qué rol sueles asumir naturalmente?",
      options:[
        "El que organiza",
        "El que propone ideas nuevas",
        "El que analiza datos",
        "El que ejecuta tareas prácticas",
        "El que motiva y guía",
        "El que cuida el ambiente y apoya"
      ]
    }

  ];


  // Inicializar respuestas
  useEffect(()=>{
    setAnswers(Array(questions.length).fill(""));
  },[]);



  // Avatar habla cada pregunta
  useEffect(() => {
    if (!questions[currentQuestion]) return;

    speak(questions[currentQuestion].text, setSpeaking);
  }, [currentQuestion]);


const handleChange=(value)=>{

  const updated=[...answers];
  updated[currentQuestion]=value;

  setAnswers(updated);
  setError("");

};



const nextQuestion=()=>{

  if(!answers[currentQuestion]){

    setError("Responde la pregunta antes de continuar");
    return;

  }

  setError("");
  setCurrentQuestion(prev => prev + 1);
};



const handleSubmit = async () => {

  // 👇 BLOQUEA si no es la última pregunta
  if (currentQuestion !== questions.length - 1) {
    return;
  }

  setLoading(true);
  setError("");

  try {

    const startRes = await fetchAuth(`${API}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aspiranteId: id })
    });

    if (!startRes.ok) {
      const errorText = await startRes.text();
      throw new Error(errorText);
    }

    const startData = await startRes.json();
    setReporteId(startData.reporteId);

    const res = await fetchAuth(`${API}/pretest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aspiranteId: id,
        answers,
        reporteId: startData.reporteId
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const data = await res.json();

    setPretestScores(data.scores);
    setSessionId(data.session_id);

    // 👇 pequeña pausa visual para que se vea natural
    setTimeout(() => {
      setStartTest(true);
      setLoading(false);
    }, 1500);

  } catch (error) {
    console.error("Error pretest:", error.message);
    setError("Presiona iniciar test vocacional nuevamente");
    setLoading(false);
  }
};



if(startTest){

    return(

    <TestRIASEC
    pretestScores={pretestScores}
    sessionId={sessionId}
    reporteId={reporteId}
    />

    );

}


if (loading) {
  return (
    <div className="pretest-container">
      <div className="loading-screen">
        <h2>Preparando tu test vocacional...</h2>
        <p>Estamos analizando tus respuestas </p>
        <div className="spinner"></div>
      </div>
    </div>
  );
}





const q=questions[currentQuestion];



return(

  <div className="pretest-container">

    <div className="pretest-layout">

      <div className="pretest-avatar-pane">

      <Avatar3D
      emotion="neutral"
      speaking={speaking}
      />

      </div>



      <div className="pretest-content-pane">

      <h1>Pretest Vocacional</h1>

      <p>
      Pregunta {currentQuestion+1} de {questions.length}
      </p>

      <form>

        <div className="pretest-question">

          <p>{q.text}</p>


          {q.type==="text" &&(

          <textarea

          value={answers[currentQuestion]||""}

          onChange={(e)=>handleChange(e.target.value)}

          rows={4}

          

        />

      )}



        {q.type==="options" &&

        q.options.map((opt,i)=>(

        <label key={i} className="option-label">

        <input
        type="radio"
        checked={answers[currentQuestion]===opt}
        onChange={()=>handleChange(opt)}
        
        />

        {opt}

        </label>

        ))

        }


      </div>


      {error && (
      <p style={{color:"#b00020", marginTop:"10px"}}>
      {error}
      </p>
      )}

      <div className="pretest-actions">
        {currentQuestion<questions.length-1?(
        <button
        className="botonpretest"
        type="button"
        onClick={nextQuestion}
        >
        Siguiente
        </button>
        ):( 
        <button type="button" className="botonpretest" onClick={handleSubmit}>
        Iniciar Test Vocacional
        </button>
        )}
        <button
          type="button"
          className={`pretest-mic-btn ${listeningMic ? "is-listening" : ""}`}
          onClick={startMicrophone}
          aria-label="Responder con voz"
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3z"></path>
            <path d="M5 11a7 7 0 0 0 14 0"></path>
            <line x1="12" y1="17" x2="12" y2="21"></line>
            <line x1="8" y1="21" x2="16" y2="21"></line>
          </svg>
        </button>
      </div>



      </form>

      </div>

    </div>

  </div>

  );

}