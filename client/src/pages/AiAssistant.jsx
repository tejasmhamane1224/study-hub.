import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader } from 'lucide-react';
import api from '../services/api';
import { renderFormattedContent } from '../utils/mathRenderer';

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Tutor. How can I help you study today?' }
  ]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/ai/history/general');
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

  const askQuestion = async (q) => {
    if (!q.trim()) return;
    
    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setAsking(true);

    try {
      const res = await api.post(`/ai/chat`, { question: q });
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

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Bot size={28} className="text-cyan-400"/> General AI Tutor</h2>
        <span className="text-xs font-bold px-3 py-1.5 bg-blue-900/30 text-cyan-400 rounded-full uppercase tracking-wide border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          Gemini Powered
        </span>
      </div>

      <div className="flex-1 glass-card shadow-sm p-4 sm:p-6 flex flex-col min-h-0 relative">
        <div 
          ref={chatRef}
          className="flex-1 overflow-y-auto custom-scrollbar mb-6 p-4 sm:p-6 bg-black/20 rounded-3xl border border-white/5 shadow-inner flex flex-col gap-6"
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

        <form onSubmit={handleAskSubmit} className="flex gap-3 relative z-10">
          <input 
            type="text" 
            placeholder="Ask me anything..." 
            required
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="glass-input flex-1 py-4 px-6 text-base rounded-full border-white/20 focus:border-cyan-400 focus:bg-white/10"
          />
          <button 
            type="submit" 
            disabled={asking}
            className="btn-glow px-6 py-4 disabled:opacity-70 text-base rounded-full"
          >
            <Send size={22} className={asking ? "opacity-50" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
