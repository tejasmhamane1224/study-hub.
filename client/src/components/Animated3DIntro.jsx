import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';

const Animated3DIntro = ({ 
  onEnter, 
  isEntering = false, 
  title = "STUDY HUB", 
  subtitle = "SPATIAL LEARNING ECOSYSTEM",
  buttonText = "INITIALIZE SYSTEM"
}) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ x: '0.00', y: '0.00' });

  useEffect(() => {
    // Fast, responsive loading progression
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        const delta = Math.floor(Math.random() * 14) + 10;
        return Math.min(100, prev + delta);
      });
    }, 30);

    const handleMouseMove = (e) => {
      const normX = ((e.clientX / window.innerWidth) * 2 - 1).toFixed(2);
      const normY = (-(e.clientY / window.innerHeight) * 2 + 1).toFixed(2);
      setMouseCoords({ x: normX, y: normY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleStart = () => {
    if (isEntering) return;
    onEnter();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between select-none p-6 md:p-10"
    >
      {/* Active Theory Style HUD Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: isEntering ? 0 : 1, 
          y: isEntering ? -30 : 0,
          filter: isEntering ? 'blur(10px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between font-mono text-xs text-slate-400 pointer-events-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
          <span className="text-white font-bold tracking-wider">{title}</span>
          <span className="text-slate-600 hidden sm:inline">// WEBGL_SYS.2.0</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden sm:inline">ACTIVE THEORY AESTHETIC</span>
          <span>•</span>
          <span className="text-white">60 FPS LOCKED</span>
        </div>
      </motion.header>

      {/* Center Interactive Portal Controls (Bruno Simon / Active Theory Style) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: isEntering ? 0 : 1, 
          scale: isEntering ? 1.25 : 1,
          filter: isEntering ? 'blur(20px)' : 'blur(0px)',
          y: isEntering ? -20 : 0
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center pointer-events-auto px-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM STANDBY // READY</span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]">
            {title}
          </h1>
          <p className="text-xs font-mono tracking-[0.3em] text-slate-400 uppercase mt-3">
            {subtitle}
          </p>
        </div>

        {/* Loading Progress or Start Button Gate */}
        <div className="w-full max-w-sm flex flex-col items-center">
          <AnimatePresence mode="wait">
            {!isReady ? (
              <motion.div 
                key="loading-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center gap-3 font-mono"
              >
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-75 ease-out shadow-[0_0_12px_#ffffff]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="w-full flex justify-between text-xs text-slate-500">
                  <span>LOADING 3D CORE</span>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="ready-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="w-full flex flex-col items-center gap-3"
              >
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isEntering}
                  className="group relative w-full py-4 px-8 bg-white text-black font-black text-xs sm:text-sm tracking-[0.25em] uppercase rounded-xl hover:bg-slate-200 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.35)] cursor-pointer disabled:opacity-90"
                >
                  {isEntering ? (
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="animate-spin text-black" />
                      <span>INITIALIZING...</span>
                    </div>
                  ) : (
                    <>
                      <Play size={16} className="fill-black group-hover:scale-110 transition-transform" />
                      <span>{buttonText}</span>
                    </>
                  )}
                </button>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  [ CLICK TO ENGAGE SPATIAL 3D ]
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Active Theory Style HUD Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isEntering ? 0 : 1, 
          y: isEntering ? 30 : 0,
          filter: isEntering ? 'blur(10px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between font-mono text-xs text-slate-500 pointer-events-auto"
      >
        <div>
          <span>POS_TRACK: </span>
          <span className="text-slate-300">X: {mouseCoords.x} / Y: {mouseCoords.y}</span>
        </div>
        <div className="hidden sm:block">
          <span>ACTIVE THEORY // WORK PROTOCOL</span>
        </div>
        <div>
          <span className="text-emerald-400">● SECURE SSL</span>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default Animated3DIntro;
