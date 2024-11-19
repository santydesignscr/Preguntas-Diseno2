import React, { useState, useEffect } from 'react';
import preguntas from './preguntas.json'; 

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [randomizedOptions, setRandomizedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const selectUniformQuestions = (allQuestions, totalQuestions = 50) => {
    const questionsByCategory = allQuestions.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    }, {});

    const categories = Object.keys(questionsByCategory);
    const questionsPerCategory = Math.floor(totalQuestions / categories.length);
    const remainder = totalQuestions % categories.length;

    let selectedQuestions = [];

    categories.forEach((category, index) => {
      const categoryQuestions = questionsByCategory[category];
      const numQuestionsToSelect = questionsPerCategory + (index < remainder ? 1 : 0);
      const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
      selectedQuestions = [...selectedQuestions, ...shuffled.slice(0, numQuestionsToSelect)];
    });

    return shuffleArray(selectedQuestions);
  };

  const generateRandomizedOptions = (questions) => {
    const randomized = {};
    questions.forEach(question => {
      randomized[question.id] = shuffleArray(question.options);
    });
    return randomized;
  };

const fetchQuestions = () => {
  try {
    setLoading(true);
    setError(null);
    
    // Usa el archivo JSON importado directamente
    const selectedQuestions = selectUniformQuestions(preguntas);
    setQuestions(selectedQuestions);
    setRandomizedOptions(generateRandomizedOptions(selectedQuestions));
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswerSelect = (questionId, answer) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (currentAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const startNewTest = async () => {
    await fetchQuestions();
    setCurrentAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const getResultsByCategory = () => {
    const resultsByCategory = {};
    questions.forEach(q => {
      if (!resultsByCategory[q.category]) {
        resultsByCategory[q.category] = {
          total: 0,
          correct: 0
        };
      }
      resultsByCategory[q.category].total++;
      if (currentAnswers[q.id] === q.correctAnswer) {
        resultsByCategory[q.category].correct++;
      }
    });
    return resultsByCategory;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader"></div>
          <p>Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px' }}>
          {error}. Por favor, intenta recargar la página.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', padding: '20px' }}>Test de Conocimientos</h1>
        <div style={{ padding: '20px' }}>
          {!showResults ? (
            <>
              {questions.map((q, index) => (
                <div key={q.id} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>{q.category}</div>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                    {index + 1}. {q.question}
                  </div>
                  <div>
                    {randomizedOptions[q.id]?.map((option) => (
                      <div key={option} style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            checked={currentAnswers[q.id] === option}
                            onChange={() => handleAnswerSelect(q.id, option)}
                            style={{ marginRight: '8px' }}
                          />
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button 
                onClick={handleSubmit}
                disabled={Object.keys(currentAnswers).length !== questions.length}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: Object.keys(currentAnswers).length !== questions.length ? '#d1d5db' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: Object.keys(currentAnswers).length !== questions.length ? 'not-allowed' : 'pointer'
                }}
              >
                Finalizar Test
              </button>
            </>
          ) : (
            <div>
              <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '16px' }}>
                Tu calificación total: {score.toFixed(2)}%
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Resultados por categoría:</h3>
                {Object.entries(getResultsByCategory()).map(([category, stats]) => (
                  <div key={category} style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '500' }}>{category}</div>
                    <div style={{ fontSize: '14px' }}>
                      Correctas: {stats.correct} de {stats.total} 
                      ({((stats.correct / stats.total) * 100).toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>

              <div>
                {questions.map((q, index) => (
                  <div key={q.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>{q.category}</div>
                    <div style={{ fontWeight: '600' }}>{index + 1}. {q.question}</div>
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ color: currentAnswers[q.id] === q.correctAnswer ? '#16a34a' : '#dc2626' }}>
                        Tu respuesta: {currentAnswers[q.id] || 'Sin respuesta'}
                      </div>
                      <div style={{ color: '#16a34a' }}>
                        Respuesta correcta: {q.correctAnswer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={startNewTest}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '16px'
                }}
              >
                Iniciar Nuevo Test
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .loader {
          border: 4px solid #f3f3f3;
          border-radius: 50%;
          border-top: 4px solid #3b82f6;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QuizApp;
