import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { renderFormattedContent } from '../utils/mathRenderer';

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Tutor. How can I help you study today?' }
  ]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const chatRef = useRef(null);

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
    loadHistory();
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, asking]);

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
    <div className="h-[calc(100vh-120px)] max-w-4xl mx-auto flex flex-col pb-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6 px-2"
      >
        <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight text-white">
          <Bot size={32} className="text-slate-300 p-1.5 bg-white/10 rounded-xl border border-white/10"/> 
          AI Tutor
        </h2>
        <span className="text-[10px] font-bold px-3 py-1 bg-white/10 text-slate-300 rounded-full uppercase tracking-wider border border-white/5 flex items-center gap-1.5">
          <Sparkles size={12} /> Pro
        </span>
      </motion.div>

      <div className="flex-1 stealth-card p-4 sm:p-6 flex flex-col min-h-0 relative overflow-hidden shadow-2xl">
        <div 
          ref={chatRef}
          className="flex-1 overflow-y-auto custom-scrollbar mb-6 p-4 sm:p-6 bg-[#000] rounded-2xl border border-white/5 flex flex-col gap-6 scroll-smooth relative z-10"
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

        <form onSubmit={handleAskSubmit} className="flex gap-3 relative z-10 p-2 bg-[#111] rounded-2xl border border-white/10">
          <input 
            type="text" 
            placeholder="Ask anything..." 
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
      </div>
    </div>
  );
};

export default AiAssistant;
