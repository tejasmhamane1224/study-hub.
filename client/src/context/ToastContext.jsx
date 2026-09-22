import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, title = '') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, type, message, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 4200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, title = 'Mission Accomplished') => addToast('success', msg, title),
    error: (msg, title = 'Telemetry Warning') => addToast('error', msg, title),
    info: (msg, title = 'Station Notice') => addToast('info', msg, title),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Fixed Cosmic Toast Viewport */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.92, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, scale: 0.9, filter: 'blur(4px)', transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="pointer-events-auto bg-[#08080C]/90 border border-white/15 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(255,255,255,0.05)] backdrop-blur-2xl flex items-start gap-3.5 relative overflow-hidden"
            >
              {/* Subtle top laser border */}
              <div 
                className={`absolute top-0 left-0 right-0 h-[2px] ${
                  t.type === 'success' ? 'bg-emerald-400/80 shadow-[0_0_8px_#34d399]' :
                  t.type === 'error' ? 'bg-rose-400/80 shadow-[0_0_8px_#fb7185]' :
                  'bg-cyan-400/80 shadow-[0_0_8px_#38bdf8]'
                }`} 
              />

              {/* Icon Container */}
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  t.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                  'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                }`}
              >
                {t.type === 'success' && <CheckCircle2 size={18} />}
                {t.type === 'error' && <AlertCircle size={18} />}
                {t.type === 'info' && <Info size={18} />}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                    {t.title}
                  </span>
                  <Sparkles size={10} className="text-white/30" />
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug break-words">
                  {t.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
