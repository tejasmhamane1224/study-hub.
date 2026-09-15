import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Upload, Zap, ClipboardList, Bot, Send, ArrowLeft, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { renderFormattedContent } from '../utils/mathRenderer';

// Spotlight Effect Component with HUD
const SpotlightCard = ({ children, className = "" }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden group ${className}`}
    >
      {/* HUD Crosshairs */}
      <div className="absolute top-2 left-2 text-[10px] text-white/20 font-mono pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity z-40">+</div>
      <div className="absolute top-2 right-2 text-[10px] text-white/20 font-mono pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity z-40">+</div>
      <div className="absolute bottom-2 left-2 text-[10px] text-white/20 font-mono pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity z-40">+</div>
      <div className="absolute bottom-2 right-2 text-[10px] text-white/20 font-mono pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity z-40">+</div>
      
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-30"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

const Chapter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  
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

  const loadHistory = async () => {
    try {
      const res = await api.get(`/ai/history/${id}`);
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [id]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, asking]);

  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadStatus({ type: '', message: '' });
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await api.post(`/pdf/upload/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus({ 
        type: 'success', 
        message: res.data?.msg || 'PDF uploaded and parsed! AI Tutor is ready.' 
      });
      // Add a welcoming AI message acknowledging the upload
      setMessages(prev => [
        ...prev, 
        { role: 'ai', content: `I have analyzed **"${file.name}"**! Ask me any questions, summaries, or test quizzes about this material.` }
      ]);
    } catch (err) {
      const serverMsg = err.response?.data?.msg || err.response?.data?.error || err.message;
      setUploadStatus({ 
        type: 'error', 
        message: serverMsg || 'Upload failed. Please ensure the PDF is under 4.5MB.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleOptionSelect = (qIndex, optIndex) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const res = await api.post(`/quiz/generate/${id}`);
      const rawList = res.data?.quiz || res.data?.questions || (Array.isArray(res.data) ? res.data : []);
      if (rawList && rawList.length > 0) {
        setQuizData(rawList);
        setUserAnswers({});
        setQuizSubmitted(false);
        setScore(0);
        // Scroll down smoothly to reveal the interactive quiz
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 200);
      } else {
        alert('Could not parse quiz questions from this document. Please try again.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.msg || err.response?.data?.error || err.message;
      alert(serverMsg || 'Quiz generation failed');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const submitQuiz = () => {
    if (!quizData) return;
    let s = 0;
    quizData.forEach((q, i) => {
      const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correctAnswer;
      if (userAnswers[i] === correctIdx) s++;
    });
    setScore(s);
    setQuizSubmitted(true);
  };

  const askQuestion = async (q) => {
    if (!q.trim()) return;
    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setAsking(true);

    try {
      const res = await api.post(`/ai/chat/${id}`, { question: q });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.answer || 'No answer' }]);
    } catch (err) {
      const serverMsg = err.response?.data?.msg || err.response?.data?.error || err.message;
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${serverMsg}` }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6 border-b border-white/5 pb-4"
      >
        <h2 className="text-2xl font-bold tracking-tight text-white">Chapter Studio</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-medium text-sm border border-white/10"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Material Side */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <SpotlightCard className="stealth-card p-6">
            <h3 className="text-lg font-medium tracking-tight flex items-center gap-2 mb-2 text-white">
              <FileText size={18} className="text-slate-400" /> Study Material
            </h3>
            <p className="text-sm text-slate-500 mb-6">Upload a PDF to power the AI Tutor. The AI will learn the contents of the file.</p>
            
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <input 
                type="file" 
                accept="application/pdf" 
                required 
                onChange={e => setFile(e.target.files[0])}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/10 file:text-sm file:font-medium file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 transition-all focus:outline-none cursor-pointer"
              />
              <button 
                type="submit" 
                disabled={uploading || !file}
                className="btn-primary w-full disabled:opacity-50"
              >
                {uploading ? <Loader className="animate-spin" size={18} /> : <><Upload size={18} /> Upload PDF</>}
              </button>

              {uploadStatus.message && (
                <div className={`p-3 rounded-xl text-xs font-mono border ${
                  uploadStatus.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}>
                  {uploadStatus.message}
                </div>
              )}
            </form>
          </SpotlightCard>

          <SpotlightCard className="stealth-card p-6">
            <h3 className="text-lg font-medium tracking-tight flex items-center gap-2 mb-2 text-white">
              <Zap size={18} className="text-slate-400" /> Generate Quiz
            </h3>
            <p className="text-sm text-slate-500 mb-6">Test your knowledge based on the uploaded material.</p>
            <button 
              onClick={handleGenerateQuiz} 
              disabled={generatingQuiz}
              className="w-full px-4 py-3 bg-[#111] hover:bg-[#161616] text-white border border-white/10 rounded-xl transition-all font-medium flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {generatingQuiz ? <Loader className="animate-spin" size={18} /> : <><ClipboardList size={18} /> Generate Quiz</>}
            </button>
          </SpotlightCard>
        </div>

        {/* AI Tutor Side */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <SpotlightCard className="stealth-card p-4 sm:p-6 flex flex-col h-[600px] relative">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h3 className="text-lg font-medium tracking-tight flex items-center gap-2 text-white">
                <Bot size={20} className="text-slate-400" /> AI Tutor
              </h3>
              <span className="text-[10px] font-bold px-3 py-1 bg-white/10 text-slate-300 rounded-full uppercase tracking-wider border border-white/5">
                Context-Aware
              </span>
            </div>

            <div 
              ref={chatRef}
              className="flex-1 overflow-y-auto custom-scrollbar mb-4 p-4 sm:p-6 bg-[#000] rounded-2xl border border-white/5 flex flex-col gap-6 relative z-10"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    key={i} 
                    className={`max-w-[85%] p-5 rounded-2xl text-sm md:text-base leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-white text-black self-end rounded-br-sm font-medium' 
                        : 'bg-[#111] text-slate-300 border border-white/10 self-start rounded-bl-sm'
                    }`}
                  >
                    <div 
                      className={`prose prose-sm max-w-none prose-p:leading-relaxed ${msg.role === 'user' ? 'prose-p:text-black' : 'prose-invert prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10'}`} 
                      dangerouslySetInnerHTML={{ __html: msg.role === 'ai' ? renderFormattedContent(msg.content) : msg.content }} 
                    />
                  </motion.div>
                ))}
                {asking && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    key="typing"
                    className="bg-[#111] border border-white/10 self-start p-6 rounded-2xl rounded-bl-sm flex items-center gap-6"
                  >
                    <div className="dot-flashing ml-3 before:bg-slate-400 after:bg-slate-400 bg-slate-400"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); askQuestion(question); }} className="flex gap-3 relative z-10 p-2 bg-[#111] rounded-2xl border border-white/10 mb-3">
              <input 
                type="text" 
                placeholder="Ask questions about this chapter..." 
                required
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="flex-1 bg-transparent border-none text-white px-4 py-2 focus:outline-none placeholder-slate-500 focus:ring-0 text-base"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                disabled={asking}
                className="w-12 h-12 rounded-xl bg-white flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                <Send size={18} className={`text-black ${asking ? "opacity-50" : ""}`} />
              </motion.button>
            </form>

            <div className="flex gap-2 flex-wrap">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => askQuestion('Summarize the key points of this chapter.')} className="text-xs font-semibold px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-full transition-colors shadow-sm">Summarize Key Points</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => askQuestion('Explain the most difficult concept in simple terms.')} className="text-xs font-semibold px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-full transition-colors shadow-sm">Explain Concept</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => askQuestion('Create 3 flashcards for this material.')} className="text-xs font-semibold px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-full transition-colors shadow-sm">Generate Flashcards</motion.button>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>

      {/* Interactive Quiz Area */}
      <AnimatePresence>
        {quizData && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-8 stealth-card shadow-sm overflow-hidden border border-white/10"
          >
            <div className="bg-white/5 border-b border-white/10 p-5 flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-white"><ClipboardList className="text-white"/> Practice Quiz</h3>
              <button onClick={() => setQuizData(null)} className="text-slate-400 hover:text-red-400 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 md:p-8">
              {quizData.map((q, qIndex) => (
                <div key={qIndex} className="mb-8 last:mb-0">
                  <h4 className="text-lg font-medium text-white mb-4">{qIndex + 1}. {q.question}</h4>
                  <div className="flex flex-col gap-3">
                    {q.options?.map((opt, optIndex) => {
                      const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correctAnswer;
                      const isSelected = userAnswers[qIndex] === optIndex;
                      const isCorrect = quizSubmitted && optIndex === correctIdx;
                      const isWrong = quizSubmitted && isSelected && optIndex !== correctIdx;
                      
                      let btnClass = "text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ";
                      if (quizSubmitted) {
                        if (isCorrect) btnClass += "bg-emerald-500/20 border-emerald-500/40 text-emerald-200 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]";
                        else if (isWrong) btnClass += "bg-rose-500/20 border-rose-500/50 text-rose-200";
                        else btnClass += "bg-white/5 border-white/5 opacity-40 text-slate-400";
                      } else {
                        btnClass += isSelected 
                          ? "bg-white text-black font-medium border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-[1.01]" 
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
                          {quizSubmitted && isCorrect && <span className="text-white font-semibold animate-pulse">✓ Correct</span>}
                          {quizSubmitted && isWrong && <span className="text-red-400 font-semibold">✗ Incorrect</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                {quizSubmitted ? (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-xl font-bold text-white">
                    Score: <span className={score === quizData.length ? "text-white" : "text-white"}>{score} / {quizData.length}</span>
                  </motion.div>
                ) : (
                  <div />
                )}
                
                {!quizSubmitted && (
                  <motion.button 
                    whileHover={Object.keys(userAnswers).length === quizData.length ? { scale: 1.02 } : {}}
                    onClick={submitQuiz}
                    disabled={Object.keys(userAnswers).length !== quizData.length}
                    className="btn-glow px-8 py-3 disabled:opacity-50 disabled:grayscale transition-all"
                  >
                    Submit Answers
                  </motion.button>
                )}
                {quizSubmitted && (
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => setQuizData(null)} className="btn-glass px-6 py-3">
                    Close Quiz
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chapter;
