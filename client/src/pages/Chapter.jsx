import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Upload, Zap, ClipboardList, Bot, Send, ArrowLeft, Loader, X } from 'lucide-react';
import api from '../services/api';
import { renderFormattedContent } from '../utils/mathRenderer';

const Chapter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizHtml, setQuizHtml] = useState(null);
  
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! Upload your study material and ask me any questions about it!' }
  ]);
  const [question, setQuestion] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [asking, setAsking] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, [id]);

  const loadHistory = async () => {
    try {
      const res = await api.get(`/ai/history/${id}`);
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('History load error:', err);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      await api.post(`/pdf/upload/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('PDF uploaded successfully! You can now ask questions.');
    } catch (err) {
      alert('PDF Upload Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async (q) => {
    if (!q.trim()) return;
    
    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setAsking(true);

    try {
      const res = await api.post(`/ai/ask/${id}`, { question: q });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.answer || 'No answer' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setAsking(false);
    }
  };

  const handleAskSubmit = (e) => {
    e.preventDefault();
    askQuestion(question);
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    setQuizData(null);
    setUserAnswers({});
    setQuizSubmitted(false);
    setScore(0);
    try {
      const res = await api.post(`/ai/quiz/${id}`);
      if (res.data && res.data.questions) {
        setQuizData(res.data.questions);
      } else {
        throw new Error("Invalid format received");
      }
    } catch (err) {
      alert('Error generating quiz: ' + err.message);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleOptionSelect = (qIndex, optIndex) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const submitQuiz = () => {
    if (!quizData) return;
    let newScore = 0;
    quizData.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) newScore++;
    });
    setScore(newScore);
    setQuizSubmitted(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-bold">Chapter Editor</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="btn-glass w-full"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Material Side */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card shadow-sm p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><FileText size={20} /> Study Material</h3>
            <p className="text-sm text-slate-400 mb-4">Upload a PDF to power the AI Tutor. The AI will learn the contents of the file.</p>
            
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <input 
                type="file" 
                accept="application/pdf" 
                required 
                onChange={e => setFile(e.target.files[0])}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 transition-all"
              />
              <button 
                type="submit" 
                disabled={uploading || !file}
                className="btn-glow w-full"
              >
                {uploading ? <Loader className="animate-spin" size={18} /> : <><Upload size={18} /> Upload & Process PDF</>}
              </button>
            </form>
          </div>

          <div className="glass-card shadow-sm p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Zap size={20} /> Generate Quiz</h3>
            <p className="text-sm text-slate-400 mb-4">Test your knowledge based on the uploaded material.</p>
            <button 
              onClick={handleGenerateQuiz} 
              disabled={generatingQuiz}
              className="btn-glass w-full"
            >
              {generatingQuiz ? <Loader className="animate-spin" size={18} /> : <><ClipboardList size={18} /> Generate Quiz</>}
            </button>
          </div>
        </div>

        {/* AI Tutor Side */}
        <div className="lg:col-span-2 glass-card shadow-sm p-4 sm:p-6 flex flex-col h-[600px] relative">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white"><Bot size={24} className="text-cyan-400" /> AI Tutor</h3>
            <span className="text-xs font-bold px-3 py-1.5 bg-blue-900/30 text-cyan-400 rounded-full uppercase tracking-wide border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">Gemini Powered</span>
          </div>

          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto custom-scrollbar mb-4 p-4 sm:p-6 bg-black/20 rounded-3xl border border-white/5 shadow-inner flex flex-col gap-6"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`animate-slide-up max-w-[85%] p-5 rounded-3xl text-sm md:text-base leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] border border-cyan-400/30 self-end rounded-br-sm' 
                  : 'bg-white/10 text-slate-100 border border-white/10 backdrop-blur-xl self-start rounded-bl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-cyan-400 prose-code:text-cyan-300 prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10" dangerouslySetInnerHTML={{ __html: msg.role === 'ai' ? renderFormattedContent(msg.content) : msg.content }} />
              </div>
            ))}
            {asking && (
              <div className="animate-slide-up bg-white/5 text-white border border-white/10 backdrop-blur-xl self-start p-6 rounded-3xl rounded-bl-sm shadow-sm flex items-center gap-6">
                <div className="dot-flashing ml-3"></div>
              </div>
            )}
          </div>

          <form onSubmit={handleAskSubmit} className="flex gap-3 mb-3 relative z-10">
            <input 
              type="text" 
              placeholder="Ask a question about the chapter..." 
              required
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="glass-input flex-1 py-3 px-6 text-base rounded-full border-white/20 focus:border-cyan-400 focus:bg-white/10"
            />
            <button 
              type="submit" 
              disabled={asking}
              className="btn-glow px-6 py-3 disabled:opacity-70 text-base rounded-full"
            >
              <Send size={20} className={asking ? "opacity-50" : ""} />
            </button>
          </form>

          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => askQuestion('Summarize the key points of this chapter.')} className="text-xs font-semibold px-3 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-900/40 dark:hover:bg-teal-900/60 dark:text-teal-300 rounded-full transition-colors">Summarize Key Points</button>
            <button type="button" onClick={() => askQuestion('Explain the most difficult concept in simple terms.')} className="text-xs font-semibold px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-300 rounded-full transition-colors">Explain Concept</button>
            <button type="button" onClick={() => askQuestion('Create 3 flashcards for this material.')} className="text-xs font-semibold px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-full transition-colors">Generate Flashcards</button>
          </div>
        </div>
      </div>

      {/* Interactive Quiz Area */}
      {quizData && (
        <div className="mt-8 glass-card shadow-sm overflow-hidden border border-white/10">
          <div className="bg-white/5 border-b border-white/10 p-5 flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-white"><ClipboardList className="text-cyan-400"/> Practice Quiz</h3>
            <button onClick={() => setQuizData(null)} className="text-slate-400 hover:text-red-400 transition-colors"><X size={24} /></button>
          </div>
          <div className="p-6 md:p-8">
            {quizData.map((q, qIndex) => (
              <div key={qIndex} className="mb-8 last:mb-0">
                <h4 className="text-lg font-medium text-white mb-4">{qIndex + 1}. {q.question}</h4>
                <div className="flex flex-col gap-3">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = userAnswers[qIndex] === optIndex;
                    const isCorrect = quizSubmitted && optIndex === q.correctIndex;
                    const isWrong = quizSubmitted && isSelected && optIndex !== q.correctIndex;
                    
                    let btnClass = "text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ";
                    if (quizSubmitted) {
                      if (isCorrect) btnClass += "bg-teal-500/20 border-teal-500/50 text-teal-100";
                      else if (isWrong) btnClass += "bg-red-500/20 border-red-500/50 text-red-100";
                      else btnClass += "bg-white/5 border-white/5 opacity-50";
                    } else {
                      btnClass += isSelected 
                        ? "bg-cyan-500/20 border-cyan-400/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20";
                    }

                    return (
                      <button 
                        key={optIndex}
                        disabled={quizSubmitted}
                        onClick={() => handleOptionSelect(qIndex, optIndex)}
                        className={btnClass}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <span className="text-teal-400">✓ Correct</span>}
                        {quizSubmitted && isWrong && <span className="text-red-400">✗ Incorrect</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
              {quizSubmitted ? (
                <div className="text-xl font-bold text-white">
                  Score: <span className={score === quizData.length ? "text-teal-400" : "text-cyan-400"}>{score} / {quizData.length}</span>
                </div>
              ) : (
                <div />
              )}
              
              {!quizSubmitted && (
                <button 
                  onClick={submitQuiz}
                  disabled={Object.keys(userAnswers).length !== quizData.length}
                  className="btn-glow px-8 py-3 disabled:opacity-50 disabled:grayscale"
                >
                  Submit Answers
                </button>
              )}
              {quizSubmitted && (
                <button onClick={() => setQuizData(null)} className="btn-glass px-6 py-3">
                  Close Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chapter;
