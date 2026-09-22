import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, Copy, Check, Trash2, 
  ArrowDown, CornerDownLeft, Brain, Orbit, Lightbulb 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { renderFormattedContent } from '../utils/mathRenderer';
import { useToast } from '../context/ToastContext';

const QUICK_PROMPTS = [
  { label: 'Summarize Core Concepts', icon: Orbit, query: 'Summarize the core concepts of this subject with high-yield bullet points.' },
  { label: 'Step-by-Step Breakdown', icon: Brain, query: 'Break down the most difficult concept in this topic step-by-step with an intuitive example.' },
  { label: '5-Question Practice Quiz', icon: Sparkles, query: 'Generate a 5-question multiple choice practice quiz with detailed answer keys.' },
  { label: 'Formula & Equation Cheatsheet', icon: Lightbulb, query: 'List all essential mathematical formulas, definitions, and theorems with their variables explained.' },
];

const AiAssistant = () => {
  const toast = useToast();
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Greetings! I am your AI Cognitive Tutor. Ask me any conceptual questions, request practice problems, or paste complex formulas.' }
  ]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  const chatRef = useRef(null);
  const textareaRef = useRef(null);

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

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, asking]);

  const handleScroll = () => {
    if (!chatRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 180);
  };

  const askQuestion = async (q) => {
    const queryText = q.trim();
    if (!queryText || asking) return;
    
    const userMsg = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setAsking(true);

    try {
      const res = await api.post(`/ai/chat`, { question: queryText });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.answer || 'No answer generated.' }]);
    } catch (err) {
      const errMsg = err.response?.data?.msg || err.message;
      setMessages(prev => [...prev, { role: 'ai', content: `Communication Error: ${errMsg}` }]);
      toast.error('Failed to establish neural link with AI Tutor.', 'Telemetry Alert');
    } finally {
      setAsking(false);
    }
  };

  const handleAskSubmit = (e) => {
    e.preventDefault();
    askQuestion(question);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setQuestion(e.target.value);
    // Auto-expand textarea height up to 140px
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleCopy = (content, index) => {
    try {
      navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      toast.success('Cognitive response copied to clipboard.', 'Copied');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error('Unable to access system clipboard.');
    }
  };

  const handleClearChat = () => {
    setMessages([
      { role: 'ai', content: 'Workspace chat reset. Ready for your next study inquiry.' }
    ]);
    toast.info('Chat session history cleared for this view.', 'Telemetry Reset');
  };

  return (
    <div className="h-[calc(100vh-100px)] max-w-5xl mx-auto flex flex-col pb-4">
      {/* Top Header Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-4 px-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Bot size={22} className="text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">AI Cognitive Tutor</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20 uppercase tracking-widest">
                Gemini 2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Quantum context memory // 8192 token synthesis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
            title="Clear current view"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </motion.div>

      {/* Main Chat Container */}
      <div className="flex-1 stealth-card p-4 sm:p-5 flex flex-col min-h-0 relative overflow-hidden shadow-2xl">
        {/* Messages Viewport */}
        <div 
          ref={chatRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar mb-4 p-4 sm:p-6 bg-black/80 rounded-2xl border border-white/10 flex flex-col gap-6 scroll-smooth relative z-10"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 26 }}
                key={i} 
                className={`max-w-[90%] sm:max-w-[82%] p-5 rounded-2xl text-sm md:text-base leading-relaxed relative group ${
                  msg.role === 'user' 
                    ? 'bg-white text-black self-end rounded-br-sm font-medium shadow-[0_4px_20px_rgba(255,255,255,0.15)]' 
                    : 'bg-[#0E0E12] text-slate-200 border border-white/10 self-start rounded-bl-sm shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
                }`}
              >
                {/* Header Tag for AI */}
                {msg.role === 'ai' && (
                  <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/5 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Sparkles size={12} />
                      <span>COGNITIVE SYNTHESIS</span>
                    </span>
                    <button
                      onClick={() => handleCopy(msg.content, i)}
                      className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Formatted Content with LaTeX Math Renderer */}
                <div 
                  className={`prose prose-sm sm:prose max-w-none prose-p:leading-relaxed ${
                    msg.role === 'user' 
                      ? 'prose-p:text-black font-medium' 
                      : 'prose-invert prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10 prose-headings:text-white'
                  }`} 
                  dangerouslySetInnerHTML={{ __html: msg.role === 'ai' ? renderFormattedContent(msg.content) : msg.content }} 
                />
              </motion.div>
            ))}

            {/* AI Thinking Animation */}
            {asking && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                key="typing"
                className="bg-[#0E0E12] border border-white/10 self-start p-4 rounded-2xl rounded-bl-sm flex items-center gap-3 text-xs font-mono text-slate-400"
              >
                <div className="dot-flashing ml-3 before:bg-cyan-400 after:bg-cyan-400 bg-cyan-400"></div>
                <span className="ml-4 tracking-wider uppercase text-[11px]">Computing Neural Solution...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Scroll to Bottom Button */}
          {showScrollBottom && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="absolute bottom-6 right-6 z-30 p-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white shadow-xl backdrop-blur-md transition-all cursor-pointer"
              title="Scroll to bottom"
            >
              <ArrowDown size={16} />
            </motion.button>
          )}
        </div>

        {/* Quick Prompt Cosmic Chips */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 mb-3 z-10">
          {QUICK_PROMPTS.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                onClick={() => askQuestion(chip.query)}
                disabled={asking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Icon size={12} className="text-cyan-400" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form with Multi-line Textarea */}
        <form onSubmit={handleAskSubmit} className="flex gap-2 relative z-10 p-2 bg-[#0A0A0E] rounded-2xl border border-white/15 shadow-xl">
          <textarea 
            ref={textareaRef}
            rows={1}
            placeholder="Ask a question or paste problem text (Shift+Enter for newline)..." 
            required
            value={question}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-white px-3 py-2 focus:outline-none placeholder-slate-500 focus:ring-0 text-sm md:text-base resize-none custom-scrollbar leading-relaxed"
          />
          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit" 
            disabled={asking || !question.trim()}
            className="w-11 h-11 self-end rounded-xl bg-white hover:bg-slate-200 text-black flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-white cursor-pointer shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            title="Send query (Enter)"
          >
            <Send size={16} className={asking ? "opacity-40 animate-pulse" : ""} />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
